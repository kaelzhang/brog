// List all related repos

// npmw ls
// npmw ls <workspace>

const path = require('path')
const {Command} = require('bin-tool')
const chalk = require('chalk')

const {workspace} = require('../../src/workspace')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'list all workspaces'
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
    const ws = workspace.get(name)
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
    const names = await workspace.allNames()
    const current = workspace.currentName()

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
