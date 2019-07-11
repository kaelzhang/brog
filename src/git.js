const execa = require('execa')

const {error} = require('./error')

const REGEX_NOT_GIT = /not a git repository/
const NO_HEAD = /ambiguous argument 'HEAD'/

const command = async (cmd, args, cwd) => {
  try {
    const {stdout} = await execa(cmd, args, {cwd})
    return stdout
  } catch (err) {
    const {message} = err

    if (REGEX_NOT_GIT.test(message)) {
      throw error('NOT_GIT_REPO', cwd)
    }

    throw err
  }
}

// new Promise((resolve, reject) => {
//   execa(cmd, {cwd}, (err, stdout, stderr) => {
//     if (!err) {
//       return resolve(stdout.trim())
//     }

//     const message = stderr.trim()

//   })
// })

const getCommitHead = async cwd => {
  try {
    return command('git', ['rev-parse', 'HEAD'], cwd)
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
  const out = await command('git', ['status', '--short'], cwd)

  if (!out) {
    return false
  }

  const status = out
  .split(/\r|\n/g)
  // ?? -> untracked
  .filter(s => s && !s.startsWith('??'))

  return status.length !== 0
}

const commit = (cwd, m) => command('git', ['commit', '-a', '-m', m], cwd)

module.exports = {
  getCommitHead,
  hasUncommittedChanges,
  commit
}
