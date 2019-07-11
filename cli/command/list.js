// List all related repos

// brog ls
// brog ls <workspace>

const path = require('path')
const {Command} = require('../command')
const chalk = require('chalk')

const {workspaces} = require('../../src/workspace')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'list all workspaces or projects of a specified workspace'
  }

  constructor () {
    super()

    this.options = {
      workspace: options.optionalWorkspace
    }
  }

  async run ({
    cwd,
    argv
  }) {
    if (!argv.workspace) {
      return this._listAll()
    }

    return this._list(argv.workspace, cwd)
  }

  async _list (name, cwd) {
    const ws = workspaces.get(name)
    if (!ws) {
      throw new Error(`workspace "${name}" not found`)
    }

    const {projects} = ws

    console.log(`workspace "${name}":`)

    if (!projects.length) {
      console.log(`  ${chalk.cyan('<no projects>')}`)
    }

    for (const {path} of projects) {
      if (path === cwd) {
        console.log(`* ${chalk.green(path)}`)
      } else {
        console.log(`  ${path}`)
      }
    }
  }

  async _listAll () {
    const names = await workspaces.allNames()
    const current = workspaces.currentName()

    if (names.length === 0) {
      console.log(chalk.gray('<no workspaces>'))
      return
    }

    for (const name of names) {
      if (name === current) {
        console.log(`* ${chalk.green(name)}`)
      } else {
        console.log(`  ${name}`)
      }
    }
  }
}
