const semver = require('semver')
const {series} = require('promise.extra')
const inquirer = require('inquirer')

const {
  commit,
  getCommitHead
} = require('./git')
const {all} = require('./utils')

const ARROW = '→'

const option = (version, type) => {
  const lower = type.toLowerCase()
  return {
    name: `${type}: ${version} ${ARROW} ${semver.inc(version, lower)}`,
    value: lower
  }
}

// Inquirer prompt to select the bump type
const selectBumpType = async pkg => {
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

  const {
    type
  } = await inquirer.prompt(questions)

  return type
}

// eslint -> 6.1.0, @babel/cli -> 7.5.5
const getUpdateMessage = pkg => {
  const m = []
  for (const [name, version] of Object.entries(pkg.updates)) {
    m.push(`${name} ${ARROW} ${version}`)
  }

  return m.join(', ')
}

const bumpVersions = async (changed, pc) =>
  series(changed, async (_, change) => {
    const {
      project
    } = change

    const pkg = pc.getByPath(project.path)
    const type = await selectBumpType(pkg)

    const increased = semver.inc(pkg.version, type)

    // The setter will also update
    pkg.version = increased

    await pkg.save()
  })

const commitBumpVersions = async (changed, pc, workspace) => {
  await all(changed, async ({
    project,
    pkg
  }) => {
    const {path} = project

    await commit(path, getUpdateMessage(pkg))
    project.commitHead = await getCommitHead(path)
  })

  await workspace.save()
}

module.exports = {
  bumpVersions,
  commitBumpVersions
}
