export const abr = value => {
  if (!value) return ''
  return `${value.slice(0, 3).toUpperCase()}`
}

export const ymd = obj => {
  if (!obj) return ''
  return `${obj.fullYear}-${obj.monthNumber}-${obj.day}`
}
