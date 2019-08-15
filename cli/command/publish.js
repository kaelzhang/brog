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
  sortChanged,
  bumpVersionAndCommit
} = require('../../src/upgrade')
const {publishAndTag} = require('../../src/publish')

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

    await bumpVersionAndCommit(changed, pc, workspace)
    await publishAndTag(changed, argv.__)
    await pushTags(changed)
  }
}
