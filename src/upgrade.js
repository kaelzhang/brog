// a -> b
// a -> c
// b -> c

// upgrade a -> no dependents -> just upgrade a

// upgrade b -> has dependent a -> upgrade b and a

// upgrade c -> upgrade c, b, a
const map = require('p-map')

const {
  getCommitHead,
  hasUncommittedChanges
} = require('./git')

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

module.exports = {
  getChanged
}
