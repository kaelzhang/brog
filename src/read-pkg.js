const path = require('path')
const fs = require('fs-extra')

const {error} = require('./error')

const read = async dir => {
  const packageJson = path.join(dir, 'package.json')

  try {
    return await fs.readJson(packageJson)
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw error('PKG_NOT_FOUND', dir)
    }

    throw error('READ_PKG_FAILS', packageJson)
  }
}

// resolve package.bin
const cleanBin = (cwd, bin) => {
  for (const [name, p] of Object.entries(bin)) {
    const binPath = path.join(cwd, p)

    try {
      bin[name] = require.resolve(binPath)
    } catch (err) {
      throw error('ERROR_BIN', name, err.stack)
    }
  }

  return bin
}

module.exports = async dir => {
  const raw = await read(dir)
  const packageJson = {
    ...raw
  }

  if (packageJson.bin) {
    packageJson.bin = cleanBin(dir, {
      ...packageJson.bin
    })
  }

  return {
    rawPackageJson: raw,
    packageJson
  }
}
