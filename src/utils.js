const fs = require('fs-extra')

const exists = filepath => {
  try {
    fs.accessSync(filepath, fs.constants.R_OK)
    return true
  } catch (_) {
    return false
  }
}

const all = (tasks, runner) => Promise.all(tasks.map(runner))

module.exports = {
  exists,
  all
}
