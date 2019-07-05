// List all related repos

// npmw ls
// npmw ls <workstation>

const path = require('path')
const {Command} = require('bin-tool')
const chalk = require('chalk')

const {workstation} = require('../../src/read-workstation')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'list all workstations'
  }

  constructor (raw) {
    super(raw)

    this.options = {
      workstation: options.optionalWorkstation
    }
  }

  async run ({
    cwd,
    argv
  }) {
    if (!argv.workstation) {
      return this._listAll()
    }

    return this._list(argv.workstation, cwd)
  }

  async _list (name, cwd) {
    const ws = workstation.get(name)
    if (!ws) {
      throw new Error(`workstation "${name}" not found`)
    }

    const {projects} = ws

    console.log(`workstation "${name}":`)

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
    const names = await workstation.allNames()
    const current = workstation.currentName()

    for (const name of names) {
      if (name === current) {
        console.log(`* ${chalk.green(name)}`)
      } else {
        console.log(`  ${name}`)
      }
    }
  }
}
