const map = require('p-map')
const inquirer = require('inquirer')
const semver = require('semver')
const {series} = require('promise.extra')

const {
  getCommitHead,
  hasUncommittedChanges,
  commit
} = require('./git')

const ARROW = '→'

// Get all projects that have changes
const getChanged = async projects => {
  const mapped = await map(projects, async project => {
    const {
      path,
      commitHead
    } = project

    const hasUncommitted = await hasUncommittedChanges(path)

    if (hasUncommitted) {
      return {
        hasUncommitted,
        project
      }
    }

    const lastCommitHead = await getCommitHead(path)

    if (commitHead !== lastCommitHead) {
      return {
        hasUncommitted: false,
        project
      }
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

  const included = projectPath =>
    changed.some(change => change.project.path === projectPath)

  const addPkgDependents = pkg => {
    for (const {dependent} of Object.values(pkg.dependents)) {
      // eslint-disable-next-line no-use-before-define
      add(dependent.path)
    }
  }

  const add = projectPath => {
    if (included(projectPath)) {
      return
    }

    included[projectPath] = true

    const project = workspace.projectByPath(projectPath)
    const change = {
      hasUncommitted: false,
      autoMessage: true,
      project
    }

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

const option = (version, type) => {
  const lower = type.toLowerCase()
  return {
    name: `${type}: ${version} ${ARROW} ${semver.inc(version, lower)}`,
    value: lower
  }
}

// Inquirer prompt to select the bump type
const selectBumpType = async (pkg, hasUncommitted) => {
  const {version} = pkg

  const questions = [{
    type: 'list',
    name: 'type',
    message: pkg.name,
    choices: [
      option(version, 'Patch'),
      option(version, 'Minor'),
      option(version, 'Major')
    ]
  }]

  if (hasUncommitted) {
    questions.push({
      type: 'input',
      name: 'message',
      message: 'message for uncommit changes',
      default ({type}) {
        return semver.inc(version, type)
      },
      validate (input) {
        if (!input) {
          return 'you must provide a message to commit the changes'
        }

        return true
      }
    })
  }

  return inquirer.prompt(questions)
}

const getUpdateMessage = pkg => {
  const m = []
  for (const [name, version] of Object.entries(pkg.updates)) {
    m.push(`${name} ${ARROW} ${version}`)
  }

  return m.join(', ')
}

const bumpVersionAndCommit = async (changed, pc, workspace) => {
  const commitMessages = []

  await series(changed, async (_, {
    hasUncommitted,
    autoMessage,
    project
  }) => {
    const pkg = pc.getByPath(project.path)
    const {
      type,
      message
    } = await selectBumpType(pkg, hasUncommitted)

    const increased = semver.inc(pkg.version, type)
    pkg.version = increased

    // There might be circular dependencies,
    // so we can not commit the changes just now.
    // Save the commit message
    commitMessages.push(
      hasUncommitted
        ? message
        : autoMessage
          ? `${increased}: ${getUpdateMessage(pkg)}`
          : increased
    )
    await pkg.save()
  })

  await series(changed, async (_, {
    project
  }, i) => {
    await commit(project.path, commitMessages[i])
    project.commitHead = await getCommitHead(project.path)

    await workspace.save()
  })
}

module.exports = {
  getChanged,
  addDependentsToChanged,
  sortChanged,
  bumpVersionAndCommit
}
