const execa = require('execa')

const publish = async (extraArgs, cwd) =>
  execa('npm', ['publish', ...extraArgs], {cwd})

module.exports = {
  publish
}
