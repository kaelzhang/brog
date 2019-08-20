const test = require('ava')
const fs = require('fs-extra')
const {resolve} = require('test-fixture')()

const {Workspaces} = require('../src/workspace')

const root = resolve('.brog')
const ws = new Workspaces(root)

test.before(async () => {
  await fs.remove(root)
})

test.serial('allNames', async t => {
  const names = await ws.allNames()
  t.deepEqual(names, [], 'no root')

  await fs.ensureDir(root)

  t.deepEqual(await ws.allNames(), [], 'has root')
})

test.serial('create', async t => {
  await ws.create('foo')
  t.deepEqual(await ws.allNames(), [
    'foo'
  ])
})

test.serial('currentName', async t => {
  const name = ws.currentName()
  t.is(name)

  await ws.setCurrentName('foo')
  t.is(ws.currentName(), 'foo')
})

test.serial('workspace', async t => {
  t.is(ws.get('bar'))

  const foo = ws.get('foo')

  t.is(foo.name, 'foo')
  t.is(foo.toJSON(), 'foo')

  t.deepEqual([].concat(foo.projects), [])
  await foo.add(__dirname)

  t.is(foo.projectByPath(__dirname).path, __dirname)

  await foo.save()

  const foo2 = ws.get('foo')
  t.is(foo2.index(__dirname), 0)
  t.is(foo2.has(__dirname), true)

  foo2.remove(__dirname)
  foo2.remove(__dirname)

  t.deepEqual([].concat(foo2.projects), [])
})

test.serial('all', async t => {
  const foo = ws.get('foo')
  await foo.add(__dirname)
  await foo.save()

  await ws.create('bar')
  const bar = ws.get('bar')
  await bar.add(__dirname)
  await bar.save()

  await ws.create('baz')

  const wss = await ws.all({
    path: __dirname
  })

  t.is(wss.length, 2)

  t.deepEqual(wss.map(w => w.name).sort(), ['bar', 'foo'])
})
