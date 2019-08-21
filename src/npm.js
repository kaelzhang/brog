const execa = require('execa')
const {error} = require('./error')

const SPACE = ' '

const npm = async (args, cwd) => {
  try {
    const {stdout} = await execa('npm', args, {cwd})
    return stdout
  } catch (err) {
    throw error(
      'ERR_NPM_COMMAND',
      `npm ${args.join(SPACE)}`,
      cwd,
      err.stack
    )
  }
}

const publish = async (extraArgs, cwd) =>
  npm(['publish', ...extraArgs], cwd)

module.exports = {
  npm,
  publish
}
