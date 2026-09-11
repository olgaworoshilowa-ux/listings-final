/** Prefix a site path so it still works on GitHub Pages (`/listings-final/...`). */
export function withBase(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
