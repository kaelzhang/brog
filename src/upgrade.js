const map = require('p-map')
const inquirer = require('inquirer')
const semver = require('semver')
const {series} = require('promise.extra')

const {
  getCommitHead,
  hasUncommittedChanges,
  commit
} = require('./git')
const {workspace} = require('./workspace')

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

// a -> b
// a -> c
// b -> c

// upgrade a -> no dependents -> just upgrade a

// upgrade b -> has dependent a -> upgrade b and a

// upgrade c -> upgrade c, b, a
const sortChanged = (changed, pc) => changed.sort(
  (a, b) => {
    const pkga = pc.getByPath(a.project.path)
    const pkgb = pc.getByPath(b.project.path)

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
    name: `${type}: ${version} → ${semver.inc(version, lower)}`,
    value: lower
  }
}

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

const bumpVersionAndCommit = async (changed, pc, ws) => {
  const commitMessages = []

  await series(changed, async (_, {
    hasUncommitted,
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
    commitMessages.push(message)
    await pkg.save()
  })

  await series(changed, async (_, {
    project
  }, i) => {
    await commit(project.path, commitMessages[i])
    project.commitHead = await getCommitHead(project.path)

    await workspace.save(ws)
  })
}

module.exports = {
  getChanged,
  sortChanged,
  bumpVersionAndCommit
}
