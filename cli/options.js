const path = require('path')

const {workspace} = require('../src/workspace')

exports.workspace = ({
  // Use the project workspace: TODO
  useProjectWorkspace,
  // Use the current workspace name
  useCurrent
} = {}) => ({
  type: 'string',
  alias: 'w',
  description: 'specify the current used workspace',
  async default () {
    let [ws] = this.rawParent._

    if (!ws && useCurrent) {
      ws = workspace.currentName()
    }

    if (!ws) {
      throw new Error('workspace must be specified')
    }

    return ws
  },

  set (name) {
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
