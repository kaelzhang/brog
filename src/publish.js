const {series} = require('promise.extra')

const {
  publish
} = require('./npm')
const {
  tag,
  pushTags
} = require('./git')

const publishAndTagOne = async (extraArgs, pkg, cwd) => {
  const {version} = pkg

  if (!pkg.private) {
    await publish(extraArgs, cwd)
    // eslint-disable-next-line no-console
    console.log(`+ ${pkg.name}@${pkg.version}`)
  }

  await tag(cwd, version)
  // eslint-disable-next-line no-console
  console.log(`${pkg.name}: git tag ${pkg.version}`)
}

const publishAndTag = async (changed, extraArgs) => {
  await series(changed, async (_, {
    pkg,
    project
  }) => {
    await publishAndTagOne(extraArgs, pkg, project.path)
  })
}

const pushProjectTags = async changed => {
  await series(changed, async (_, {
    project: {
      path
    },
    pkg
  }) => {
    if (pkg.private) {
      return
    }

    await pushTags(path)
  })
}

module.exports = {
  publishAndTag,
  pushProjectTags
}
