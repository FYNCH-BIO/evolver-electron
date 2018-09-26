const strains = [
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'FL100',
  'MG1655',
  'MG1655',
  'MG1655',
  'MG1655',
  'MG1655',
  'MG1655',
  'MG1655',
  'MG1655',
  'MG1655'
]

const selected = [
  false,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
  true,
  false
]


export default Array.from({ length: 16 }).map((item, index) => ({
  vial: index,
  strain: strains[index % strains.length],
  selected: selected[index % selected.length]
}))
