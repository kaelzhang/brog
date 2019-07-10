const path = require('path')
const fs = require('fs-extra')
const globby = require('globby')
const home = require('home')
const {
  parse,
  stringify,
  assign
} = require('comment-json')

const error = require('./error')
const {exists} = require('./utils')

const BROG = '.brog'
const BROG_WORKSPACE = '.brog-workspace'
const EMPTY_WORKSPACE = parse(`{
  projects: []
}`)

class Workspace {
  constructor (root) {
    this._root = root
  }

  exists (name) {
    const workspaceFile = this._getWSFile(name)

    if (exists(workspaceFile)) {
      return workspaceFile
    }
  }

  get (name) {
    const file = this.exists(name)

    if (!file) {
      return
    }

    const workspace = fs.readJsonSync(file)
    return workspace
  }

  _getWSFile (name) {
    return path.join(
      this._root, BROG, name + BROG_WORKSPACE)
  }

  _getCurrentNameFile () {
    return path.join(this._root, BROG, 'CURRENT')
  }

  currentName () {
    const currentFile = this._getCurrentNameFile()

    let current

    try {
      const content = fs.readFileSync(currentFile)
      current = content.toString().trim()
    } catch (err) {
      if (err.code === 'ENOENT') {
        return
      }

      throw error('READ_CURRENT_FAILED', err.stack)
    }

    if (this.exists(current)) {
      return current
    }
  }

  async setCurrentName (name) {
    const currentFile = this._getCurrentNameFile()

    await fs.outputFile(currentFile, name)
  }

  async create (name) {
    const config = assign({
      name
    }, EMPTY_WORKSPACE)

    return this.save(config)
  }

  async save (ws) {
    return fs.outputFile(this._getWSFile(ws.name),
      stringify(ws, null, 2))
  }

  async allNames () {
    const cwd = path.join(this._root, BROG)
    if (!exists(cwd)) {
      return []
    }

    const files = await globby(['*.brog-workspace'], {
      cwd
    })

    return files.map(f => path.basename(f, BROG))
  }
}

module.exports = {
  Workspace,
  workspace: new Workspace(home())
}
