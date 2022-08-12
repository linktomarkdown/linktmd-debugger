import { registerContextMenus } from './utils/contextMenu';

chrome.runtime.onInstalled.addListener(() => {
  console.group("[Debugger]后台脚本已经启动...")
  let __DEBUGGER_CONST__ = "";
  // 创建全局变量
  chrome.storage.local.get(["__para_pub_debugger__"], (result) => {
    if (result) {
      __DEBUGGER_CONST__ = result["__para_pub_debugger__"];
    }
  }),
  chrome.tabs.create({ url: chrome.runtime.getURL("/debugger.html") });
  // 右键菜单
  registerContextMenus()
  // 注册消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'config':
          // 将配置数据写入storage
          __DEBUGGER_CONST__ = request.data;
          chrome.storage.local.set({'__para_pub_debugger__': request.data}, function() {
            console.log('[Debugger]配置数据已经写入storage', request.data);
          })
          sendResponse({farewell: "ok", data: "[Debugger Content]收到了来自你的请求"})
          break;
        case 'read_config':
          // 读取storage中的配置数据
          sendResponse({farewell: "ok", data: __DEBUGGER_CONST__})
          break;
      }
    }
  );
});