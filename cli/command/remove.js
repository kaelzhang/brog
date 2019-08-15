// Add a directory into the workspace

// brog add <path> <workspace> [options]
// brog add <path> <workspace> --lerna

const path = require('path')
const {Command} = require('../command')
const options = require('../options')

module.exports = class StartCommand extends Command {
  get description () {
    return 'remove a project directory from a workspace'
  }

  constructor () {
    super()

    this.options = {
      cwd: options.cwd,
      workspace: options.workspace({
        useCurrent: true
      })
    }

    // brog remove -w foo : add current directory to foo
    // brog remove: add the current directory to current workspace
    // brog remove -w foo --cwd /path/to: add /path/to to foo
    this.usage = `brog remove [options]`
  }

  async run ({
    argv
  }) {
    const {cwd} = argv
    const {workspace} = argv

    const has = workspace.has(cwd)

    if (!has) {
      console.error(`"${cwd}" is not in workspace "${workspace.name}"`)
      process.exit(1)
    }

    workspace.remove(cwd)
    await workspace.save()
  }
}
