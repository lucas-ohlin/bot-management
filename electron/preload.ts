import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})


// const allowedChannels = {
//   send: ["window-minimize", "window-maximize", "window-close", "open-folder-dialog"],
//   receive: ["selected-directory"]
// };

// contextBridge.exposeInMainWorld('ipcRenderer', {
//   send: (channel: string, data: any) => {
//     if (allowedChannels.send.includes(channel)) {
//       ipcRenderer.send(channel, data);
//     }
//   },
//   on: (channel: string, func: (...args: any[]) => void) => {
//     if (allowedChannels.receive.includes(channel)) {
//       ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
//     }
//   },
//   off: (channel: string, func: (...args: any[]) => void) => {
//     if (allowedChannels.receive.includes(channel)) {
//       ipcRenderer.off(channel, func);
//     }
//   },
//   invoke: (channel: string, data?: any) => {
//     if (allowedChannels.send.includes(channel)) {
//       return ipcRenderer.invoke(channel, data);
//     }
//   }
// });


// contextBridge.exposeInMainWorld('ipcRenderer', {
//   send: (channel: string, data?: any) => {
//     if (allowedChannels.send.includes(channel)) {
//       ipcRenderer.send(channel, data);
//     }
//   },
//   on: (channel: string, func: (...args: any[]) => void) => {
//     if (allowedChannels.receive.includes(channel)) {
//       ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
//     }
//   },
//   off: (channel: string, func: (...args: any[]) => void) => {
//     if (allowedChannels.receive.includes(channel)) {
//       ipcRenderer.off(channel, func);
//     }
//   },
//   invoke: (channel: string, data?: any) => {
//     if (allowedChannels.send.includes(channel)) {
//       return ipcRenderer.invoke(channel, data);
//     }
//   }
// });