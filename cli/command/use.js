// Use some workspace

const path = require('path')
const {Command} = require('../command')

const {workspaces} = require('../../src/workspace')

module.exports = class StartCommand extends Command {
  get description () {
    return 'set the current workspace'
  }

  async run ({
    argv
  }) {
    const [name] = argv._
    if (!name) {
      throw new Error('workspace must be provided')
    }

    const current = workspaces.currentName()
    if (current === name) {
      console.log(`"${name}" is already the current workspace`)
      process.exit(0)
    }

    await workspaces.setCurrentName(name)
  }
}
