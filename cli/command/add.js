// Add a directory into the workspace

// brog add <path> <workspace> [options]
// brog add <path> <workspace> --lerna

const path = require('path')
const {Command} = require('../command')

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

    // brog add -w foo : add current directory to foo
    // brog add: add the current directory to current workspace
    // brog add -w foo --cwd /path/to: add /path/to to foo
    this.usage = `brog add [workspace] [options]
brog add [options]`
  }

  async run ({
    argv
  }) {
    const {cwd} = argv
    const ws = argv.workspace
    const {projects} = ws
    const index = projects.findIndex(project => project.path === cwd)

    if (~ index) {
      console.log(`"${cwd}" already in workspace "${ws.name}"`)
      return
    }

    projects.push({
      path: cwd
    })

    await workspace.save(ws)
  }
}
