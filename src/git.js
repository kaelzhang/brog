const {exec} = require('child_process')

const {error} = require('./error')

const REGEX_NOT_GIT = /not a git repository/
const NO_HEAD = /ambiguous argument 'HEAD'/

const command = (cmd, cwd) => new Promise((resolve, reject) => {
  exec(cmd, {cwd}, (err, stdout, stderr) => {
    if (!err) {
      return resolve(stdout.trim())
    }

    const message = stderr.trim()
    if (REGEX_NOT_GIT.test(message)) {
      return reject(error('NOT_GIT_REPO', cwd))
    }

    reject(new Error(message))
  })
})

const getCommitHead = async cwd => {
  try {
    return command('git rev-parse HEAD', cwd)
  } catch (err) {
    const {message} = err

    // Has no head
    if (NO_HEAD.test(message)) {
      return null
    }

    throw err
  }
}

const hasUncommittedChanges = async cwd => {
  const out = await command('git status --short', cwd)

  if (!out) {
    return false
  }

  const status = out
  .split(/\r|\n/g)
  // ?? -> untracked
  .filter(s => s && !s.startsWith('??'))

  return status.length !== 0
}

module.exports = {
  getCommitHead,
  hasUncommittedChanges
}
