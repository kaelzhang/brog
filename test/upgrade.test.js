const test = require('ava')

const {PackageCollection} = require('../src/pc')
const {
  createProjects
} = require('./workspace')
const {
  change
} = require('./upgrade')
const {
  getChanged,
  addDependentsToChanged
} = require('../src/changes')
const {
  Workspace
} = require('../src/workspace')
const {
  commit
} = require('../src/git')
// const {
//   bumpVersions
// } = require('../src/upgrade')

test('upgrade: baz hasUncommittedChanges', async t => {
  const {
    projects,
    resolve
  } = await createProjects(['foo', 'bar', 'baz'])

  const c = await getChanged(projects)
  t.is(c.length, 0, 'should has no change')

  // foo -> bar, baz
  // bar -> baz
  const bazPath = resolve('baz')
  await change(bazPath)
  const cc = await getChanged(projects)

  t.is(cc.length, 1, 'one changed')
  t.is(cc[0].hasUncommitted, true, 'hasUncommitted')

  await commit(bazPath, 'change')

  const changed = await getChanged(projects)
  const pc = new PackageCollection({
    projects
  })

  await pc.process()

  const fakeWS = new Workspace(null, {
    projects
  })

  addDependentsToChanged(changed, pc, fakeWS)
  t.is(changed.length, 3)
})
