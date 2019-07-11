// Read and parse all packages

const readPackageJson = require('./read-pkg')

class Package {
  constructor (name) {
    this.name = name
    this.dependents = Object.create(null)
    this.packageJson = null
    this.rawPackageJson = null
    this.lastCommitHead = null
    this.path = null
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
    } = await readPackageJson(projectPath)

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
