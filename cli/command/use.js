// Use some workstation

const path = require('path')
const {Command} = require('bin-tool')

const {workstation} = require('../../src/read-workstation')

module.exports = class StartCommand extends Command {
  get description () {
    return 'set the current workstation'
  }

  async run ({
    argv
  }) {
    const [name] = argv._
    if (!name) {
      throw new Error('name must be provided')
    }

    const current = workstation.currentName()
    if (current === name) {
      console.log(`"${name}" is already the current workstation`)
      process.exit(0)
    }

    await workstation.setCurrentName(name)
  }
}
