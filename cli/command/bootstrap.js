// Initialize workspace
// link dependencies

const path = require('path')
const {Command} = require('../command')

const options = require('../options')
const {PackageCollection} = require('../../src/pc')
const {
  link,
  linkPeers
} = require('../../src/link')

const HANDLE_PEER = 'handle-peer'

module.exports = class StartCommand extends Command {
  get description () {
    return 'initialize and link projects'
  }

  constructor () {
    super()

    this.options = {
      cwd: options.cwd,
      workspace: options.workspace({
        useProjectWorkspace: true
      }),
      [HANDLE_PEER]: {
        type: 'boolean',
        description: 'whether should handle peerDepedendencies or not',
        default: true
      }
    }

    // brog bootstrap foo
    // brog bootstrap -w foo
    this.usage = `brog bootstrap <workspace>
brog bootstrap [options]`
  }

  async run ({
    argv
  }) {
    const pc = new PackageCollection({
      projects: argv.workspace.projects
    })

    const handlePeers = arvs[HANDLE_PEER]

    await pc.process(handlePeers)
    await link(pc)

    if (handlePeers) {
      await linkPeers(pc)
    }
  }
}
