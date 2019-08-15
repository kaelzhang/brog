// Read and parse all packages
const {
  read,
  write
} = require('./pkg')
const {error} = require('./error')

const CARET = '^'
const TILDE = '~'
const REGEX_IS_NUMBER = /^\d/

class Package {
  constructor (name) {
    this.name = name
    this.dependents = Object.create(null)
    this.packageJson = null
    this.rawPackageJson = null
    this.lastCommitHead = null
    this.path = null

    // Updated dependencies
    this.updates = Object.create(null)
  }

  addDependent (pkg, type) {
    if (pkg.name in this.dependents) {
      this.dependents[pkg.name].type.add(type)
      return
    }

    const dependent = this.dependents[pkg.name] = {
      dependent: pkg,
      type: new Set()
    }

    dependent.type.add(type)
  }

  // - type `string` optional
  hasDependency (pkg, type) {
    const d = pkg.dependents[this.name]
    if (!d) {
      return false
    }

    return type
      ? d.type.has(type)
      : true
  }

  get version () {
    return this.packageJson.version
  }

  set version (version) {
    this.packageJson.version = version
    this.rawPackageJson.version = version

    // Update dep version/range
    for (const {
      dependent,
      type
    } of Object.values(this.dependents)) {
      dependent.updateDepVersion(this.name, version, type)
    }
  }

  get private () {
    return this.packageJson.private
  }

  save () {
    return write(this.path, this.rawPackageJson)
  }

  updateDepVersion (dep, version, types) {
    for (const type of types) {
      this._updateDepVersion(dep, version, this.packageJson[type])
      this._updateDepVersion(dep, version, this.rawPackageJson[type])
    }
  }

  _updateDepVersion (dep, version, host) {
    const origin = host[dep]
    const first = origin.charAt(0)

    this.updates[dep] = version

    // ^1.0.0
    // ~1.0.0
    if (first === CARET || first === TILDE) {
      host[dep] = first + version

    // 1.0.0
    } else if (REGEX_IS_NUMBER.test(origin)) {
      host[dep] = version
    } else {
      throw error('UNSUPPORTED_SEMVER_RANGE', origin)
    }
  }
}

// Parser all packages and calculate dependents
class PackageCollection {
  constructor ({
    projects
  }) {
    this.projects = projects
    this._packages = Object.create(null)
  }

  async process () {
    const tasks = this.projects.map(project => this._processOne(project))
    await Promise.all(tasks)

    for (const [name, pkg] of Object.entries(this._packages)) {
      if (!pkg.packageJson) {
        // Delete packages that is not included by the current workspace
        delete this._packages[name]
      }
    }
  }

  // Get the Package by path
  getByPath (fullpath) {
    for (const pkg of Object.values(this._packages)) {
      if (pkg.path === fullpath) {
        return pkg
      }
    }
  }

  get packages () {
    return this._packages
  }

  async _processOne ({
    path: projectPath,
    commitHead
  }) {
    const {
      packageJson,
      rawPackageJson
    } = await read(projectPath)

    const pkg = this._getPackage(packageJson.name)

    pkg.packageJson = packageJson
    pkg.rawPackageJson = rawPackageJson

    pkg.lastCommitHead = commitHead
    pkg.path = projectPath

    const {
      dependencies,
      devDependencies,
      peerDependencies
    } = packageJson

    this._addDependents(pkg, dependencies, 'dependencies')
    this._addDependents(pkg, devDependencies, 'devDependencies')
    this._addDependents(pkg, peerDependencies, 'peerDependencies')
  }

  _getPackage (name) {
    return this._packages[name] || (
      this._packages[name] = new Package(name)
    )
  }

  _addDependents (dependentpkg, dependencies, type) {
    if (!dependencies) {
      return
    }

    for (const dependencyName of Object.keys(dependencies)) {
      this._addDependent(dependentpkg, dependencyName, type)
    }
  }

  _addDependent (dependentpkg, dependencyName, type) {
    const dependency = this._getPackage(dependencyName)
    dependency.addDependent(dependentpkg, type)
  }
}

module.exports = {
  PackageCollection
}
