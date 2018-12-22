const strains = [
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100'
]

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
  strain: strains[index % strains.length],
  selected: selected[index % selected.length]
}))
