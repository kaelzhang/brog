// npmw run test

const path = require('path')
const {Command} = require('bin-tool')

module.exports = class StartCommand extends Command {
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

  async run ({
    argv
  }) {

  }
}
