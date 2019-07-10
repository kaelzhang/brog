// Add a directory into the workspace

// npmw add <path> <workspace> [options]
// npmw add <path> <workspace> --lerna

const path = require('path')
const {Command} = require('bin-tool')

const {workspace} = require('../../src/workspace')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'add a project directory into a workspace'
  }

  constructor () {
    super()

    this.options = {
      cwd: options.cwd,
      workspace: options.workspace({
        useCurrent: true
      })
    }

    // npmw add -w foo: add current directory to foo
    // npmw add: add the current directory to current workspace
    // npmw add -w foo --cwd /path/to: add /path/to to foo
    this.usage = `npmw add [workspace] [options]
npmw add [options]`
  }

  async run ({
    argv
  }) {
    const {cwd} = argv
    const ws = argv.workspace
    const {projects} = ws
    const index = projects.findIndex(project => project.path === cwd)

    if (~ index) {
      console.log(`"${path}" already in workspace "${ws.name}"`)
      return
    }

    projects.push({
      path: cwd
    })

    await workspace.save(ws)
  }
}
