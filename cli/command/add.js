// Add a directory into the workspace

// brog add <path> <workspace> [options]
// brog add <path> <workspace> --lerna

const path = require('path')
const {Command} = require('../command')
const options = require('../options')

const {getCommitHead} = require('../../src/git')


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
    const {workspace} = argv
    const {projects} = workspace
    const index = projects.findIndex(project => project.path === cwd)

    if (~ index) {
      console.log(`"${cwd}" already in workspace "${workspace.name}"`)
      return
    }

    projects.push({
      path: cwd,

      // Adds the current commitHead to the project
      commitHead: await getCommitHead(cwd)
    })

    await workspace.save()
  }
}
