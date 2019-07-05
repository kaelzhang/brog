// Publish the workstation

// 1. Publish
// npmw publish -- [npm-publish-options]

const path = require('path')
const {Command} = require('bin-tool')

const {workstation} = require('../../src/read-workstation')

module.exports = class CreateCommand extends Command {
  get description () {
    return 'create a workstation'
  }

  constructor (raw) {
    super(raw)

    this.options = {
      use: {
        type: 'boolean',
        description: 'create and use the workstation created just now'
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

    const names = await workstation.allNames()
    if (names.includes(name)) {
      throw new Error(`name "${name}" already exists`)
    }

    await workstation.create(name)

    if (argv.use) {
      await workstation.setCurrentName(name)
    }
  }
}
