import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fzqkb32j',
    dataset: 'production',
  },
  deployment: {autoUpdates: true},
})
