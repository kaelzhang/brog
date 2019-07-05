const path = require('path')
const {Command} = require('bin-tool')

module.exports = class MainCommand extends Command {
  constructor (raw) {
    super(raw)

    this.load(path.join(__dirname, 'command'))
    this.alias('ls', 'list')
  }
}
