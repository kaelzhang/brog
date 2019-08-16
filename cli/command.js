const {Command} = require('bin-tool')
const log = require('util').debuglog('brog')

const {error} = require('../src/error')

const fail = (...args) => {
  throw error(...args)
}

exports.Command = class extends Command {
  constructor () {
    super()

    const {run} = this
    this.run = context => {
      log('argv: %j', context.argv)
      return run.call(this, context)
    }

    this.fail = fail
  }
}
