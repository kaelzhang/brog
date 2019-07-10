const {Errors} = require('err-object')

const {E, error} = new Errors({
  messagePrefix: '[npm-workspace] ',
  filterStackSources: [
    __filename
  ]
})

E('PKG_NOT_FOUND', 'package.json is not found in "%s"')
E('READ_PKG_FAILED', 'fails to read "%s"')
E('ERROR_BIN', 'bin.%s is not found or errored, details: %s')

E('READ_CURRENT_FAILED', 'fails to read current workspace, details: %s')

module.exports = {
  error
}
