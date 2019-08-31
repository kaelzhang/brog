// Publish the workspace

// 1. Publish
// brog publish -- [npm-publish-options]

const path = require('path')
const chalk = require('chalk')
const log = require('util').debuglog('brog')

const {Command} = require('../command')
const options = require('../options')

const {PackageCollection} = require('../../src/pc')
const {
  getChanged,
  addDependentsToChanged,
  sortChanged
} = require('../../src/changes')
const {
  commitChanges,
  pullLatest
} = require('../../src/sync')
const {
  bumpVersions,
  commitBumpVersions
} = require('../../src/upgrade')
const {
  publishAndTag,
  pushProjectTags
} = require('../../src/publish')
const {DOUBLE_SLASH} = require('../../src/constants')

module.exports = class StartCommand extends Command {
  get description () {
    return 'bump versions and npm publish'
  }

  constructor () {
    super()

    this.options = {
      cwd: options.cwd,
      workspace: options.workspace({
        useProjectWorkspace: true
      })
    }
  }

  async run ({
    argv
  }) {
    const {workspace} = argv
    const {projects} = workspace

    const changed = await getChanged(projects)

    if (changed.length === 0) {
      console.log(chalk.gray('no changes'))
      return
    }

    const pc = new PackageCollection({
      projects
    })

    await pc.process()

    addDependentsToChanged(changed, pc, workspace)
    sortChanged(changed, pc)

    const {
      NODE_DEBUG = ''
    } = process.env

    if (NODE_DEBUG.split(',').includes('brog')) {
      log('changed projects: %j', changed.map(change => {
        const cloned = {
          ...change
        }

        delete cloned.pkg

        return cloned
      }))
    }

    await commitChanges(changed)
    await pullLatest(changed)

    await bumpVersions(changed, pc)
    await commitBumpVersions(changed, pc, workspace)

    await publishAndTag(changed, argv[DOUBLE_SLASH])
    await pushProjectTags(changed)
  }
}
