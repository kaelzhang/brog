// Publish the workspace

// 1. Publish
// brog publish -- [npm-publish-options]

const path = require('path')
const {Command} = require('../command')

const {workspaces} = require('../../src/workspace')
const options = require('../options')

module.exports = class CreateCommand extends Command {
  get description () {
    return 'create a workspace'
  }

  constructor () {
    super()

    this.options = {
      name: options.name,
      use: {
        type: 'boolean',
        description: 'create and use the workspace created just now'
      }
    }
  }

  async run ({
    argv: {
      name,
      use
    }
  }) {
    const names = await workspaces.allNames()
    if (names.includes(name)) {
      throw new Error(`name "${name}" already exists`)
    }

    await workspaces.create(name)

    if (use) {
      await workspaces.setCurrentName(name)
    }
  }
}
