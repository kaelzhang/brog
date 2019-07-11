// Publish the workspace

// 1. Publish
// brog publish -- [npm-publish-options]

const path = require('path')
const chalk = require('chalk')

const {Command} = require('../command')
const options = require('../options')

const {PackageCollection} = require('../../src/pkg')
const {getChanged} = require('../../src/upgrade')

module.exports = class StartCommand extends Command {
  constructor () {
    super()

    this.options = {
      cwd: options.cwd,
      workspace: options.workspace({
        useProjectWorkspace: true,
        useCurrent: true
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
    // console.log(pc.packages)
  }
}
