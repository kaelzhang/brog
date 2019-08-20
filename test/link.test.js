const test = require('ava')
// const log = require('util').debuglog('brog')

const {PackageCollection} = require('../src/pc')
const {
  createProjects
} = require('./workspace')
const {
  link
} = require('../src/link')

test('bootstrap', async t => {
  const {
    projects,
    resolve
  } = await createProjects(['foo', 'bar', 'baz'])

  const pc = new PackageCollection({
    projects
  })

  await pc.process()
  await link(pc)

  const {equal} = require(resolve('foo'))
  t.is(equal(), true)
})
