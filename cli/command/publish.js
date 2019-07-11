// Publish the workspace

// 1. Publish
// brog publish -- [npm-publish-options]

const path = require('path')
const {Command} = require('../command')

const options = require('../options')
const {PackageCollection} = require('../../src/pkg')

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
    const pc = new PackageCollection({
      projects: argv.workspace.projects
    })

    await pc.process()
    console.log(pc.packages)
  }
}
