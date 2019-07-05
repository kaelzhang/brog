// Add a directory into the workstation

// npmw add <path> <workstation> [options]
// npmw add <path> <workstation> --lerna

const path = require('path')
const {Command} = require('bin-tool')

const {workstation} = require('../../src/read-workstation')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'add a project directory into a workstation'
  }

  constructor (raw) {
    super(raw)

    this.options = {
      cwd: options.cwd,
      workstation: options.workstation({
        useCurrent: true
      })
    }

    // npmw add -w foo: add current directory to foo
    // npmw add: add the current directory to current workstation
    // npmw add -w foo --cwd /path/to: add /path/to to foo
    this.usage = `npmw add [workstation] [options]
npmw add [options]`
  }

  async run ({
    argv
  }) {
    const {cwd} = argv
    const ws = argv.workstation
    const {projects} = ws
    const index = projects.findIndex(project => project.path === cwd)

    if (~ index) {
      console.log(`"${path}" already in workstation "${ws.name}"`)
      return
    }

    projects.push({
      path: cwd
    })

    await workstation.save(ws)
  }
}
