// Publish the workstation

// 1. Publish
// npmw publish -- [npm-publish-options]

const path = require('path')
const {Command} = require('bin-tool')

const options = require('../options')
const {PackageCollection} = require('../../src/pkg')

module.exports = class StartCommand extends Command {
  constructor (raw) {
    super(raw)

    this.options = {
      cwd: options.cwd,
      workstation: options.workstation({
        useProjectWorkstation: true,
        useCurrent: true
      })
    }
  }

  async run ({
    argv
  }) {
    const pc = new PackageCollection({
      projects: argv.workstation.projects
    })

    await pc.process()
    console.log(pc.packages)
  }
}
