/*!
=========================================================
* © 2022 Ronan LE MEILLAT for INTERNAL DEVELOPMENT
=========================================================
This website use:
- Vuejs v3
- Font Awesome
- And many others
*/
import * as jose from 'jose'
import { GetTokenSilentlyVerboseResponse } from '@auth0/auth0-spa-js'

import * as jwks from '../config/jwks.json'
const x509cert = `-----BEGIN CERTIFICATE-----\n${jwks.keys[0].x5c}\n-----END CERTIFICATE-----`
const algorithm = 'RS256'

export enum AUTH0_PERMISSION {
  add_short_url = "add:any_short_url",
  list_all_short_url = "list:all_short_url"
}

/**
 * @param token JWT token as string
 * @param issuer Auth0 domain. Optional, if not provided use jwks.domains
 * @param now Optional number of seconds from 01/01/1970 (Cloudflare Workers must get Date.now() in onPost/Get function otherwise 0 is returned)
 * @returns false if token is invalid or a valid JWTVerifyResult
 */
export const verifyToken = (
  token: string,
  issuer?: string,
  now?: number
): Promise<boolean | jose.JWTVerifyResult> => {
  issuer = issuer === undefined ? jwks.domain : issuer
  const _now = now === undefined ? Date.now() / 1000 : now
  return new Promise((resolve) => {
    jose.importX509(x509cert, algorithm).then((pubkey) => {
      jose
        .jwtVerify(token, pubkey)
        .then((jwt) => {
          if (
            jwt.payload !== undefined &&
            jwt.payload.iat !== undefined &&
            jwt.payload.exp !== undefined &&
            `https://${issuer}/` === jwt.payload.iss &&
            jwt.payload.iat < _now &&
            jwt.payload.exp > _now
          ) {
            resolve(jwt)
          } else {
            resolve(false)
          }
        })
        .catch(() => {
          resolve(false)
        })
    })
  })
}

export enum oAuthTokenType {
  // eslint-disable-next-line no-unused-vars
  access_token = 'access_token',
  // eslint-disable-next-line no-unused-vars
  id_token = 'id_token',
}
/**
 * Verify a token async, tokenType is 'access_token'|'id_token'
 * issuer is those in jwks.json
 * @param promisedTokens Promise wich is returning an object containing {id_token:string; access_token:string} | GetTokenSilentlyVerboseResponse
 * @param issuer Auth0 domain. Optional, if not provided use jwks.domains
 * @param now Optional number of seconds from 01/01/1970 (Cloudflare Workers must get Date.now() in onPost/Get function otherwise 0 is returnes)
 * @returns a promise containing a jose.JWTVerifyResult if valid or null
 */
export const verifyTokenAsync = (
  promisedTokens: Promise<GetTokenSilentlyVerboseResponse>,
  tokenType: oAuthTokenType,
  issuer?: string,
  now?: number
): Promise<jose.JWTVerifyResult> => {
  issuer = issuer === undefined ? jwks.domain : issuer
  now = now === undefined ? Date.now() / 1000 : now
  return new Promise((resolve, reject) => {
    promisedTokens.then((tokens: GetTokenSilentlyVerboseResponse) => {
      verifyToken(tokens[tokenType], issuer, now).then(
        (jwt: boolean | jose.JWTVerifyResult) => {
          if (typeof jwt !== 'boolean') {
            resolve(jwt as jose.JWTVerifyResult)
          } else {
            reject(Error('Token invalid'))
          }
        }
      )
    })
  })
}

/**
 *
 * @param claim string of the custom_claim ex: 'ip'
 * @param promisedTokens Promise wich is returning an object containing {id_token:string; access_token:string} | GetTokenSilentlyVerboseResponse
 * @param now number of seconds from 01/01/1970
 * @returns the claim : any
 */
export const getCustomClaim = (
  claim: string,
  promisedTokens: Promise<GetTokenSilentlyVerboseResponse>,
  now?: number
) => {
  return new Promise((resolve, reject) => {
    promisedTokens.then((tokens: GetTokenSilentlyVerboseResponse) => {
      verifyToken(tokens.access_token, jwks.domain, now).then(
        (jwt: boolean | jose.JWTVerifyResult) => {
          if (typeof jwt !== 'boolean') {
            resolve(
              (jwt as jose.JWTVerifyResult).payload[
                `${jwks.namespace}/${claim}`
              ]
            )
          } else {
            reject(Error('Token invalid'))
          }
        }
      )
    })
  })
}

/**
 * @param authorizationHeader value part of the 'Authorization: Bearer edkOsdd…' header ex: 'Bearer edkOsdd…'
 * @returns null if it fails or the parsed token
 */
export const parseTokenFromAuthorizationHeader = (
  authorizationHeader: string | null
): string => {
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    const jwtToken: string = authorizationHeader.substring(
      7,
      authorizationHeader.length
    )
    return jwtToken
  }
  return ''
}

export const checkToken = (
  promisedTokens: Promise<GetTokenSilentlyVerboseResponse>
): void => {
  Promise.all([jose.importX509(x509cert, algorithm), promisedTokens]).then(
    (values) => {
      // const pubkey = values[0];
      const token = values[1]
      const accessToken: string = token.access_token
      // const id_token:string = token.id_token;
      return verifyToken(accessToken, jwks.domain, Date.now() / 1000)
    }
  )
}

const permissionIsPresent = (
  permissions: string[],
  requiredPermissions: string[]
): boolean => {
  let isAllowed = true
  requiredPermissions.forEach((requiredPermission) => {
    const permissionPosition: number = permissions.indexOf(requiredPermission)
    permissionPosition >= 0 && isAllowed
      ? (isAllowed = true)
      : (isAllowed = false)
  })
  return isAllowed
}
/**
 * @param token JWT token as string
 * @param issuer Auth0 domain
 * @param now number of seconds from 01/01/1970
 * @param permission string or array of strings
 * @returns true if user has required permission, false if not
 */
export const isAllowed = (
  token: string,
  issuer: string,
  now: number,
  permission: string | string[]
): Promise<boolean> => {
  let requiredPermissions: string[] = []
  if (typeof permission === 'string') {
    // permission is a string not a string array
    requiredPermissions.push(permission)
  } else {
    requiredPermissions = permission
  }
  return new Promise((resolve) => {
    verifyToken(token, issuer, now).then(
      (jwt: boolean | jose.JWTVerifyResult) => {
        if (typeof jwt !== 'boolean') {
          if (jwt.payload.permissions !== undefined) {
            const permissions: string[] = jwt.payload.permissions as string[]
            resolve(permissionIsPresent(permissions, requiredPermissions))
          }
        } else {
          resolve(jwt)
        }
      }
    )
  })
}

/**
 * Verify if a permission is present in the access token
 * issuer is those in jwks.json
 * @param promisedTokens Promise wich is returning an object containing {id_token:string; access_token:string} | GetTokenSilentlyVerboseResponse
 * @param permission single permission or array of need permissions
 * @param issuer Auth0 domain. Optional, if not provided use jwks.domains
 * @param now Optional number of seconds from 01/01/1970 (Cloudflare Workers must get Date.now() in onPost/Get function otherwise 0 is returnes)
 * @returns a promise containing true if all the permissions are present or false
 */
export const isAllowedAsync = (
  promisedTokens: Promise<GetTokenSilentlyVerboseResponse>,
  permission: string | string[],
  issuer?: string,
  now?: number
): Promise<boolean> => {
  issuer = issuer === undefined ? jwks.domain : issuer
  now = now === undefined ? Date.now() / 1000 : now
  let requiredPermissions: string[] = []
  if (typeof permission === 'string') {
    // permission is a string not a string array
    requiredPermissions.push(permission)
  } else {
    requiredPermissions = permission
  }
  return new Promise((resolve, reject) => {
    if (promisedTokens) {
      verifyTokenAsync(promisedTokens, oAuthTokenType.access_token, issuer, now).then(
        (jwt) => {
          if (jwt.payload.permissions !== undefined) {
            const permissions: string[] = jwt.payload.permissions as string[]
            resolve(permissionIsPresent(permissions, requiredPermissions))
          } else {
            reject(Error('Token invalid'))
          }
        }
      )
    } else {
      reject(Error('promisedTokens is null'))
    }
  })
}
