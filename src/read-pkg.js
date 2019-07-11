const path = require('path')
const readJson = require('read-package-json')

const {error} = require('./error')

const read = async dir => {
  const packageJson = path.join(dir, 'package.json')

  return new Promise((resolve, reject) => {
    readJson(packageJson, (err, data) => {
      if (!err) {
        return resolve(data)
      }

      if (err.code === 'ENOENT') {
        return reject(error('PKG_NOT_FOUND', dir))
      }

      throw error('READ_PKG_FAILS', packageJson)
    })
  })
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
