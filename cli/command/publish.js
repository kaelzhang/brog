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

module.exports = class StartCommand extends Command {
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

    log('changed projects: %j', changed)

    const pc = new PackageCollection({
      projects
    })

    await pc.process()

    addDependentsToChanged(changed, pc, workspace)
    sortChanged(changed, pc)

    await bumpVersionAndCommit(changed, pc, workspace)
  }
}
