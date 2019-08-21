const bar = require('bar')
const baz = require('baz')
const ignore = require('ignore')

module.exports = {
  bazEqual () {
    return bar.baz === baz
  },

  ignoreEqual () {
    return bar.ignore === ignore
  }
}
