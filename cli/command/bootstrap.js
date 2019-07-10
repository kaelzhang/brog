// Initialize workspace
// link dependencies

const path = require('path')
const {Command} = require('bin-tool')

const options = require('../options')
const {PackageCollection} = require('../../src/pkg')
const link = require('../../src/link')

module.exports = class StartCommand extends Command {
  get description () {
    return 'initialize and link projects'
  }

  constructor () {
    super()

    this.options = {
      workspace: options.workspace({
        useProjectWorkspace: true
      })
    }

    this.usage = `npmw bootstrap <workspace>
npmw bootstrap [options]`
  }

  async run ({
    argv
  }) {
    const pc = new PackageCollection({
      projects: argv.workspace.projects
    })

    await pc.process()

    await link(pc)
  }
}
