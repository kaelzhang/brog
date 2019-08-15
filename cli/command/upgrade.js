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
  addDependentsToChanged
} = require('../../src/changes')
const {
  bumpVersions,
  commitBumpVersions
} = require('../../src/upgrade')
const {error} = require('../../src/error')

const checkChanges = changed => changed.forEach(({
  hasUncommitted,
  project
}, fail) => {
  if (hasUncommitted) {
    fail('HAS_UNCOMMITTED', project.path)
  }
})

module.exports = class StartCommand extends Command {
  get description () {
    return 'recursively bump versions'
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
    checkChanges(changed, this.fail)

    await bumpVersions(changed, pc)
    await commitBumpVersions(changed, pc, workspace)
  }
}
