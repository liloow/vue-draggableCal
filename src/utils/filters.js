export const abr = value => {
  if (!value) return ''
  return `${value.slice(0, 3).toUpperCase()}`
}
