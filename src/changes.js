const map = require('p-map')

const {
  getCommitHead,
  hasUncommittedChanges
} = require('./git')

// Get changed projects
class Changed {
  constructor ({
    hasUncommitted = false,
    project,
    isDependent = false
  }) {
    this.hasUncommitted = hasUncommitted
    this.project = project
    this.isDependent = isDependent
    this.commitHead = ''
    this.pkg = null
  }
}

// Get all projects that have changes
const getChanged = async projects => {
  const mapped = await map(projects, async project => {
    const {
      path,
      commitHead
    } = project

    const hasUncommitted = await hasUncommittedChanges(path)

    if (hasUncommitted) {
      return new Changed({
        hasUncommitted,
        project
      })
    }

    const lastCommitHead = await getCommitHead(path)

    if (commitHead !== lastCommitHead) {
      return new Changed({
        hasUncommitted: false,
        project
      })
    }
  })

  return mapped.filter(Boolean)
}

// void
const addDependentsToChanged = async (changed, pc, workspace) => {
  const {length} = changed
  let i = 0

  const addPropertyPkg = (change, projectPath) => {
    const pkg = pc.getByPath(projectPath)
    change.pkg = pkg
    return pkg
  }

  const find = projectPath =>
    changed.find(({project}) => projectPath === project.path)

  const addPkgDependents = pkg => {
    for (const {dependent} of Object.values(pkg.dependents)) {
      // eslint-disable-next-line no-use-before-define
      add(dependent.path)
    }
  }

  const add = projectPath => {
    const found = find(projectPath)

    if (found) {
      found.isDependent = true
      return
    }

    const project = workspace.projectByPath(projectPath)
    const change = new Changed({
      hasUncommitted: false,
      isDependent: true,
      project
    })

    changed.push(change)

    const pkg = addPropertyPkg(change, projectPath)
    addPkgDependents(pkg)
  }

  for (; i < length; i ++) {
    const change = changed[i]
    const pkg = addPropertyPkg(change, change.project.path)
    addPkgDependents(pkg)
  }
}

// Sort projects from `changed`.
// The project that has the deeper dependents comes first

// a -> b
// a -> c
// b -> c

// upgrade a -> no dependents -> just upgrade a\
// upgrade b -> has dependent a -> upgrade b and a
// upgrade c -> upgrade c, b, a
const sortChanged = changed => changed.sort(
  (a, b) => {
    const pkga = a.pkg
    const pkgb = b.pkg

    return pkga.hasDependency(pkgb)
      // b comes first
      ? 1
      : pkgb.hasDependency(pkga)
        // a comes first
        ? - 1
        : 0
  }
)

module.exports = {
  getChanged,
  addDependentsToChanged,
  sortChanged
}
