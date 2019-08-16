const {join, dirname} = require('path')
const fs = require('fs-extra')
const {chmod} = require('fs-chmod')
const {satisfies} = require('semver')

const {error} = require('./error')
const {
  DEPENDENCIES,
  PEER_DEPENDENCIES
} = require('./constants')

const NODE_MODULES = 'node_modules'

const createLink = async (target, source) => {
  await fs.remove(target)
  await fs.ensureDir(dirname(target))
  await fs.symlink(source, target)
}

const createBinLink = async (target, source) => {
  await createLink(target, source)
  await chmod(target, 'ug+x')
}

// - pc `PackageCollection`
const link = async pc => {
  const {packages} = pc

  const tasks = []

  for (const pkg of Object.values(packages)) {
    const source = pkg.path

    for (const {dependent} of Object.values(pkg.dependents)) {
      const target = join(dependent.path, NODE_MODULES, pkg.name)
      tasks.push(createLink(target, source))

      const {packageJson} = pkg
      const {bin} = packageJson

      if (!bin) {
        continue
      }

      for (const [name, binPath] of Object.entries(bin)) {
        const binTarget = join(
          dependent.path, NODE_MODULES, '.bin', name)
        tasks.push(createBinLink(binTarget, binPath))
      }
    }
  }

  await Promise.all(tasks)
}

const getFirstWSDependent = pkg => {
  for (const {
    dependent,
    type
  } of pkg.dependents) {
    if (type.has(PEER_DEPENDENCIES)) {
      return dependent
    }
  }
}

const getDepRange = (name, dependent) => {
  const {
    dependencies = {},
    peerDependencies = {}
  } = dependent.packageJson

  return peerDependencies[name] || dependencies[name]
}

const linkPeer = async (pkg, packageJson, dependent, rootDependent) => {
  const {
    version,
    name
  } = packageJson

  const dependentPath = dependent.path
  const rootDependentPath = rootDependent.path

  // Check peer dependency ranges
  const required = getDepRange(name, dependent)
  if (!satisfies(version, required)) {
    throw error('PEER_CONFLICT', name,
      rootDependentPath, getDepRange(name, rootDependent), version,
      dependentPath, required)
  }

  const target = join(dependentPath, NODE_MODULES, name)
  const source = join(rootDependentPath, NODE_MODULES, name)

  await createLink(target, source)
}

const checkAndLinkPeer = async pkg => {
  // Just get the first dependent that is in the current workspace,
  const rootDependent = getFirstWSDependent(pkg)
  const {path} = rootDependent
  const packagePath = join(
    path, 'node_modules', pkg.name, 'package.json')

  let packageJson

  try {
    packageJson = require(packagePath)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw error('DEPENDENCY_NOT_INSTALLED', pkg.name, path)
    }
  }

  const tasks = []

  for (const {
    dependent,
    type
  } of pkg.dependents) {
    if (type.has(PEER_DEPENDENCIES) || type.has(DEPENDENCIES)) {
      tasks.push(linkPeer(pkg, packageJson, dependent, rootDependent))
    }
  }

  await Promise.all(tasks)
}

// We need to ensure that for a certain peer dependency X,
// all
const linkPeers = async pc => {
  const {peers} = pc

  const tasks = []

  for (const peerPkg of peers) {
    tasks.push(checkAndLinkPeer(peerPkg))
  }

  await Promise.all(tasks)
}

module.exports = {
  link,
  linkPeers
}
