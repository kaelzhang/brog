const execa = require('execa')

const {error} = require('./error')
const {SPACE} = require('./constants')

const REGEX_NOT_GIT = /not a git repository/
const REGEX_NO_HEAD = /ambiguous argument 'HEAD'/
const REGEX_TAG_EXISTS = /already exists/

const git = async (args, cwd) => {
  try {
    const {stdout} = await execa('git', args, {cwd})
    return stdout
  } catch (err) {
    const {message} = err

    if (REGEX_NOT_GIT.test(message)) {
      throw error('NOT_GIT_REPO', cwd)
    }

    throw error(
      'ERR_NPM_COMMAND',
      `git ${args.join(SPACE)}`,
      cwd,
      err.message,
      err.stderr
    )
  }
}

// Get the commit head of the current repo
const getCommitHead = async cwd => {
  try {
    return await git(['rev-parse', 'HEAD'], cwd)
  } catch (err) {
    const {message} = err

    // Has no head
    if (REGEX_NO_HEAD.test(message)) {
      return null
    }

    throw err
  }
}

const hasUncommittedChanges = async cwd => {
  const out = await git(['status', '--short'], cwd)

  if (!out) {
    return false
  }

  const status = out
  .split(/\r|\n/g)
  // ?? -> untracked
  .filter(s => s && !s.startsWith('??'))

  return status.length !== 0
}

// Commit all changes with commit message `m`
const commit = (cwd, m) => git(
  ['commit', '-a', '-m', m],
  cwd
)

const tag = async (cwd, t) => {
  try {
    return git(['tag', t], cwd)
  } catch (err) {
    if (REGEX_TAG_EXISTS.test(err.message)) {
      throw error('TAG_EXISTS', t)
    }

    throw err
  }
}

const currentBranch = cwd => git(['symbolic-ref', '--short', 'HEAD'], cwd)

const pull = async cwd => {
  const branch = await currentBranch(cwd)
  await git(['pull', '--rebase', 'origin', branch], cwd)
}

const pushTags = cwd => git(['push', '--tags'], cwd)

const push = async cwd => {
  const branch = await currentBranch(cwd)
  await git(['push', 'origin', branch], cwd)
}

module.exports = {
  git,
  getCommitHead,
  hasUncommittedChanges,
  commit,
  tag,
  pushTags,
  pull,
  push
}
