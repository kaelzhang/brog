const path = require('path')

const {workspace} = require('../src/workspace')

exports.workspace = ({
  // Use the project workspace: TODO
  // use the workspace which the current project belongs to
  useProjectWorkspace,
  // Use the current workspace name
  useCurrent
} = {}) => ({
  alias: 'w',
  description: 'specify the current used workspace',
  async default () {
    let ws

    if (useCurrent) {
      ws = workspace.currentName()
    }

    if (!ws) {
      throw new Error('workspace must be specified')
    }

    return ws
  },

  set (name) {
    if (!name) {
      throw new Error(`workspace is required`)
    }

    const ws = workspace.get(name)
    if (!ws) {
      throw new Error(`workspace "${name}" not found`)
    }

    return ws
  }
})

exports.optionalWorkspace = {
  type: 'string',
  alias: 'w',
  description: 'specify the current used workspace',
  default () {
    const [w] = this.rawParent._
    if (w) {
      return w
    }
  }
}

exports.cwd = {
  type: 'string',
  description: 'set the current working directory',
  default: process.cwd(),
  set: path.resolve
}
