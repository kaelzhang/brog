const path = require('path')
const {Command} = require('bin-tool')

module.exports = class MainCommand extends Command {
  constructor () {
    super()

    this.load(path.join(__dirname, 'command'))

    this.alias('ls', 'list')
    this.alias('rm', 'remove')
  }
}
