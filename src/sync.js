// Make sure the projects are sync with the latest

const {series} = require('promise.extra')
const inquirer = require('inquirer')

const {
  commit,
  pull
} = require('./git')

const askCommitMessage = async change => {
  const {
    pkg,
    project
  } = change

  const questions = [{
    type: 'input',
    name: 'message',
    message: `message for uncommit changes of "${pkg.name || project.path}"`,
    default: 'update',
    validate (input) {
      if (!input) {
        return 'you must provide a message to commit the changes'
      }

      return true
    }
  }]

  const {
    message
  } = await inquirer.prompt(questions)

  return message
}

const commitChanges = async changed =>
  series(changed, async (_, change) => {
    const {
      hasUncommitted, project
    } = change
    if (!hasUncommitted) {
      return
    }

    const message = askCommitMessage(change)
    await commit(project.path, message)
  })

const pullLatest = async changed =>
  series(changed, async (_, {
    project: {
      path
    }
  }) => pull(path))

module.exports = {
  commitChanges,
  pullLatest
}
