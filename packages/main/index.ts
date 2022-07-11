import os from 'os'
import { join } from 'path'
import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { autoUpdater } from 'electron-updater'
const isWin7 = os.release().startsWith('6.1')
if (isWin7) app.disableHardwareAcceleration()

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const ipc = ipcMain
const PACKAGE_ROOT = __dirname

async function createWindow() {
  autoUpdater.checkForUpdatesAndNotify()
  win = new BrowserWindow({
    title: 'Main window',
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(PACKAGE_ROOT, '../preload/index.cjs'),
      contextIsolation: false,
      nodeIntegration: true
    },
    center: true,
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    roundedCorners: true,
    darkTheme: true,
    vibrancy: 'under-window',
    titleBarStyle: 'hidden',
    hasShadow: true,
    titleBarOverlay: {
      color: '#2b2d38',
      symbolColor: '#ffffff',
      height: 36
    },
    // visualEffectState: 'active',
    transparent: os.platform() === 'linux'
    // https://github.com/electron/electron/issues/20357
  })

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (app.isPackaged) {
    win.loadFile(join(PACKAGE_ROOT, '../renderer/index.html'))
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`

    win.loadURL(url)
    // win.webContents.openDevTools({ mode: 'undocked' })
  }

  // Handle window events
  ipc.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'dark'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipc.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'dark'
  })

  ipc.on('closeApp', () => {
    win?.close()
  })

  ipc.on('minimizeApp', () => {
    win?.minimize()
  })

  ipc.on('maximizeRestoreApp', () => {
    if (win?.isMaximized()) {
      win?.restore()
    } else {
      win?.maximize()
    }
  })
  // // Check if is Maximized
  // win.on('maximize', () => win?.webContents.send('isMaximized'))
  // win.on('unmaximize', () => win?.webContents.send('isRestored'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
