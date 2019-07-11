// Run npm scripts

const path = require('path')
const {Command} = require('../command')

module.exports = class StartCommand extends Command {
  get description () {
    return 'run scripts for all projects of a certain workspace'
  }

  constructor () {
    super()

    this.options = {
      cwd: {
        type: 'string',
        description: 'set the current working directory',
        default: process.cwd(),
        set: path.resolve
      }
    }
  }
}
