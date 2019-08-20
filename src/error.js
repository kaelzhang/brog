const {Errors} = require('err-object')
const {join} = require('path')

const {E, error} = new Errors({
  messagePrefix: '[brog] ',
  filterStackSources: [
    __filename,
    join(__dirname, '..', 'cli', 'command.js')
  ]
})

E('PKG_NOT_FOUND', 'package.json is not found in "%s"')

E('READ_PKG_FAILED', 'fails to read "%s"')

E('ERROR_BIN', 'bin.%s is not found or errored, details: %s')

E('READ_CURRENT_FAILED', 'fails to read current workspace, details: %s')

E('HAS_UNCOMMITTED', 'project "%s" has uncommited changes')

E('NOT_IN_WORKSPACE', '"%s" is not in workspace "%s"')

E('WORKSPACE_NOT_FOUND', 'workspace "%s" not found')

E('NAME_REQUIRED', 'workspace name is required')

E('DEPENDENCY_NOT_INSTALLED',
  '"%s" is not install in "%s", make sure you have `npm install` or `yarn` executed first')

E('PEER_CONFLICT', `peer dependency "%s" version conflicts:
- "%s" requires "%s", installed "%s"
- "%s" requires "%s"`)

E('PEER_ALONE', `peer dependency "%s" installed by the following projects:
%s,

but no projects in the current workspace depends on it as a normal dependency or dev dependency`)

E('ERR_NPM_COMMAND', 'command "%s" fails at path "%s", reason: %s')

module.exports = {
  error
}
