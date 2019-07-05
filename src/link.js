const path = require('path')
const fs = require('fs-extra')
const {chmod} = require('fs-chmod')

const createLink = async (target, source) => {
  await fs.remove(target)
  await fs.ensureDir(path.dirname(target))
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
      const target = path.join(dependent.path, 'node_modules', pkg.name)
      tasks.push(createLink(target, source))

      const {packageJson} = pkg
      const {bin} = packageJson

      if (!bin) {
        continue
      }

      for (const [name, binPath] of Object.entries(bin)) {
        const binTarget = path.join(
          dependent.path, 'node_modules', '.bin', name)
        tasks.push(createBinLink(binTarget, binPath))
      }
    }
  }

  await Promise.all(tasks)
}

module.exports = link
