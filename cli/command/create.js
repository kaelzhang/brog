// Publish the workspace

// 1. Publish
// npmw publish -- [npm-publish-options]

const path = require('path')
const {Command} = require('bin-tool')

const {workspace} = require('../../src/workspace')

module.exports = class CreateCommand extends Command {
  get description () {
    return 'create a workspace'
  }

  constructor () {
    super()

    this.options = {
      use: {
        type: 'boolean',
        description: 'create and use the workspace created just now'
      }
    }
  }

  async run ({
    argv
  }) {
    const [name] = argv._
    if (!name) {
      throw new Error('name must be provided')
    }

    const names = await workspace.allNames()
    if (names.includes(name)) {
      throw new Error(`name "${name}" already exists`)
    }

    await workspace.create(name)

    if (argv.use) {
      await workspace.setCurrentName(name)
    }
  }
}
