// Add a directory into the workspace

// brog add <path> <workspace> [options]
// brog add <path> <workspace> --lerna

const path = require('path')
const {Command} = require('../command')
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
    this.usage = `brog add [options]`
  }

  async run ({
    argv
  }) {
    const {cwd} = argv
    const {workspace} = argv

    const has = workspace.has(cwd)

    if (has) {
      console.log(`"${cwd}" already in workspace "${workspace.name}"`)
      return
    }

    await workspace.add(cwd)
    await workspace.save()
  }
}
