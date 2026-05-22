/**
 * 
 * @param url absolute path of asset (must begin with @/assets/)
 * @returns a vite transformed url string
 */
/**
 * Helper to resolve asset URLs using Vite's URL constructor pattern.
 * Converts absolute path aliases to relative paths suitable for Vite assets.
 * @param url - Absolute path of asset (must begin with @/assets/).
 * @returns A vite-transformed URL string.
 */
export function $require(url:string):string{
    return new URL(`../assets/${url.replace('@/assets/','')}`,import.meta.url).href
  }
