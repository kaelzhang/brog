// Initialize workstation
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

  constructor (raw) {
    super(raw)

    this.options = {
      workstation: options.workstation({
        useProjectWorkstation: true
      })
    }

    this.usage = `npmw bootstrap <workstation>
npmw bootstrap [options]`
  }

  async run ({
    argv
  }) {
    const pc = new PackageCollection({
      projects: argv.workstation.projects
    })

    await pc.process()

    await link(pc)
  }
}
