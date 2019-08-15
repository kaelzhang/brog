const {resolve} = require('path')
const {isNumber} = require('core-util-is')
const inquirer = require('inquirer')

const {workspaces} = require('../src/workspace')
const {error} = require('../src/error')

const selectWorkspace = async (message, names) => {
  const questions = [{
    type: 'list',
    name: 'workspace',
    message,
    choices: names
  }]

  const {workspace} = await inquirer.prompt(questions)
  return workspace
}

const selectProjectWorkspace = async path => {
  const all = await workspaces.all({path})

  const {length} = all

  if (length === 0) {
    return
  }

  if (length === 1) {
    return all[0].name
  }

  const message = 'the current project is in multiple workspaces, select on to proceed'
  return selectWorkspace(message, all.map(ws => ws.name))
}

exports.workspace = ({
  // use the workspace which the current project belongs to
  useProjectWorkspace,
  // Use the current workspace name
  useCurrent,
  // Use the `useArgvRest` item of the reset argv
  // useArgvRest
} = {}) => ({
  alias: 'w',
  description: 'specify the current used workspace',
  async default () {
    let ws

    // if (isNumber(useArgvRest)) {
    //   ws = this.rawParent._[useArgvRest]
    // }

    if (!ws && useCurrent) {
      ws = workspaces.currentName()
    }

    if (!ws && useProjectWorkspace) {
      // --cwd is required
      ws = await selectProjectWorkspace(this.parent.cwd)
    }

    if (!ws) {
      // TODO: err-object
      throw new Error('workspace must be specified')
    }

    return ws
  },

  set (name) {
    if (!name) {
      // TODO: err-object
      throw new Error(`workspace is required`)
    }

    const ws = workspaces.get(name)
    if (!ws) {
      // TODO: err-object
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
  set: resolve
}

exports.name = {
  type: 'string',
  description: 'workspace name',
  default () {
    const [name] = this.rawParent._
    if (!name) {
      throw error('NAME_REQUIRED')
    }

    return name
  }
}
