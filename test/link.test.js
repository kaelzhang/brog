const test = require('ava')
// const log = require('util').debuglog('brog')

const {PackageCollection} = require('../src/pc')
const {
  createProjects
} = require('./workspace')
const {
  link,
  linkPeers
} = require('../src/link')

const run = (title, runLink, callback) => {
  test(title, async t => {
    const {
      projects,
      resolve
    } = await createProjects(['foo', 'bar', 'baz'])

    const pc = new PackageCollection({
      projects
    })

    await pc.process(true)
    await runLink(pc)

    const foo = require(resolve('foo'))

    callback(t, foo)
  })
}

run(
  'bootstrap',
  pc => link(pc),
  (t, foo) => {
    t.is(foo.bazEqual(), true)
    t.is(foo.ignoreEqual(), false)
  }
)

run(
  'bootstrap with peers',
  async pc => {
    await link(pc)
    await linkPeers(pc)
  },
  (t, foo) => {
    t.is(foo.bazEqual(), true)
    t.is(foo.ignoreEqual(), true)
  }
)
