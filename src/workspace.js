const {join, basename} = require('path')
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
const {getCommitHead} = require('./git')

const BROG = '.brog'
const BROG_WORKSPACE = '.brog-workspace'
const EMPTY_WORKSPACE = parse(`{
  "projects": []
}`)

class Workspace {
  constructor (filepath, config) {
    this.path = filepath
    this.config = config
  }

  get name () {
    return this.config.name
  }

  get projects () {
    return this.config.projects
  }

  // Save workspace
  async save () {
    return fs.outputFile(this.path, stringify(this.config, null, 2))
  }

  // Get project by path
  projectByPath (fullpath) {
    for (const project of this.projects) {
      if (project.path === fullpath) {
        return project
      }
    }
  }

  index (path) {
    return this.projects.findIndex(project => project.path === path)
  }

  has (path) {
    return this.index(path) !== - 1
  }

  // Add a new path to the project without checking
  async add (path) {
    this.projects.push({
      path,

      // Adds the current commitHead to the project
      commitHead: await getCommitHead(path)
    })
  }

  remove (path) {
    const index = this.index(path)
    if (index === - 1) {
      return
    }

    this.projects.splice(index, 1)
  }
}

// All workspaces
class Workspaces {
  constructor (root) {
    this._root = root
  }

  exists (name) {
    const workspaceFile = this._getWSFile(name)

    if (exists(workspaceFile)) {
      return workspaceFile
    }
  }

  // Returns `object`
  get (name) {
    const file = this.exists(name)

    if (!file) {
      return
    }

    const content = fs.readFileSync(file)
    return new Workspace(file, parse(content.toString()))
  }

  _getWSFile (name) {
    return join(
      this._root, BROG, name + BROG_WORKSPACE)
  }

  _getCurrentNameFile () {
    return join(this._root, BROG, 'CURRENT')
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

    const workspace = new Workspace(this._getWSFile(name), config)

    return workspace.save()
  }

  async allNames () {
    const cwd = join(this._root, BROG)
    if (!exists(cwd)) {
      return []
    }

    const files = await globby(['*.brog-workspace'], {
      cwd
    })

    return files.map(f => basename(f, BROG_WORKSPACE))
  }
}

module.exports = {
  Workspaces,
  workspaces: new Workspaces(home())
}
