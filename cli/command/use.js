// Use some workspace

const path = require('path')
const {Command} = require('../command')

const {workspaces} = require('../../src/workspace')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'set the current workspace'
  }

  constructor () {
    super()

    this.options = {
      name: options.name
    }
  }

  async run ({
    argv: {name}
  }) {
    const current = workspaces.currentName()

    if (current === name) {
      // This is not harmful, so do not throw
      console.warn(`"${name}" is already the current workspace`)
      process.exit(0)
    }

    await workspaces.setCurrentName(name)
  }
}
