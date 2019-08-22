const fs = require('fs-extra')
const {join} = require('path')

const change = async dir => {
  const filepath = join(dir, 'index.js')
  await fs.writeFile(filepath, '\n', {
    flag: 'a'
  })
}

module.exports = {
  change
}
