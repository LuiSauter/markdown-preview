/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'YourAppID',
  asar: true,
  directories: {
    output: 'release/${version}'
  },
  files: [
    'dist'
  ],
  mac: {
    artifactName: '${productName}_${version}.${ext}',
    target: [
      'dmg'
    ]
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: [
          'x64'
        ]
      }
    ],
    artifactName: '${productName}_${version}.${ext}',
    publish: 'github'
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false
  }
}
module.exports = config
