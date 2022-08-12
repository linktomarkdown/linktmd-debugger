// 注册右键菜单
export const registerContextMenus = () => {
    chrome.contextMenus.create({
        id: "debugger",
        title: "Debugger",
        contexts: ["all"]
    });
    chrome.contextMenus.onClicked.addListener(info => {
        if (info.menuItemId === "debugger") {
            chrome.tabs.create({ url: chrome.runtime.getURL("/debugger.html") });
        }
    });
}