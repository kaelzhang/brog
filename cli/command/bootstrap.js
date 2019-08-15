// Initialize workspace
// link dependencies

const path = require('path')
const {Command} = require('../command')

const options = require('../options')
const {PackageCollection} = require('../../src/pc')
const link = require('../../src/link')

module.exports = class StartCommand extends Command {
  get description () {
    return 'initialize and link projects'
  }

  constructor () {
    super()

    this.options = {
      cwd: options.cwd,
      workspace: options.workspace({
        useProjectWorkspace: true
      })
    }

    // brog bootstrap foo
    // brog bootstrap -w foo
    this.usage = `brog bootstrap <workspace>
brog bootstrap [options]`
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
