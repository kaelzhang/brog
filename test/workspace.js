const fixtures = require('test-fixture')

const {Project} = require('../src/workspace')
const {
  git,
  getCommitHead
} = require('../src/git')

// Create a `test-fixture` instance,
// use `resolve` of the instance as the argument
const createGitProject = async (name, resolve) => {
  const cwd = resolve(name)
  await git(['init'], cwd)
  await git(['add', '-A'], cwd)
  await git(['commit', '-m', `"first commit"`], cwd)
  return cwd
}

const createProject = async (name, resolve) => {
  const cwd = await createGitProject(name, resolve)
  return new Project(cwd, await getCommitHead(cwd))
}

const createProjects = async (names, ...to) => {
  const {copy, resolve} = fixtures()
  await copy(...to)
  const projects = await Promise.all(
    names.map(name => createProject(name, resolve))
  )

  return {
    projects,
    resolve
  }
}

module.exports = {
  createGitProject,
  createProjects
}
