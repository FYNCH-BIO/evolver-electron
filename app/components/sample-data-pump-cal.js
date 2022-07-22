const selected = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
]


export default Array.from({ length: 16 }).map((item, index) => ({
  vial: index,
  selected: selected[index % selected.length],
  IN1: '--',
  IN2: '--',
  E: '--'
}))
