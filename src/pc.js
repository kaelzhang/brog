// Read and parse all packages
const {
  read,
  write
} = require('./pkg')
const {error} = require('./error')
const {
  DEPENDENCIES,
  PEER_DEPENDENCIES
} = require('./constants')

const CARET = '^'
const TILDE = '~'
const REGEX_IS_NUMBER = /^\d/

class Dependent {
  constructor (pkg) {
    this.dependent = pkg
    this.type = new Set()
  }
}

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
    this._isPeer = false
  }

  // Whether the package is a peer dependency of any other packages
  isPeerDependency () {
    return this._isPeer
  }

  // Wheter the package is in the current workspace
  isInWorkspace () {
    // Only the the packages inside the current workspace
    // will have this property assigned
    return !!this.packageJson
  }

  addDependent (pkg, type) {
    if (type === PEER_DEPENDENCIES) {
      this._isPeer = true
    }

    if (pkg.name in this.dependents) {
      this.dependents[pkg.name].type.add(type)
      return
    }

    const dependent = this.dependents[pkg.name] = new Dependent(pkg)

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

  // Update the version of the current package
  // and update the dep version of its dependents
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
    this._peers = new Set()
  }

  _processPeers () {
    for (const pkg of Object.values(this._packages)) {
      if (pkg.isPeerDependency()) {
        this._peers.add(pkg)
      }
    }
  }

  async process (handlePeers) {
    const tasks = this.projects.map(project => this._processOne(project))
    await Promise.all(tasks)

    if (handlePeers) {
      this._processPeers()
    }

    // Clean
    for (const [name, pkg] of Object.entries(this._packages)) {
      if (!pkg.isInWorkspace()) {
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

  get peers () {
    return this._peers
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

    this._addDependents(pkg, dependencies, DEPENDENCIES)
    this._addDependents(pkg, devDependencies, 'devDependencies')
    this._addDependents(pkg, peerDependencies, PEER_DEPENDENCIES)
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
