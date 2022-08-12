export const formatCreateElement = () => {
    // 创建一个div插入到页面中
    const div = document.createElement('div');
    div.id = '__para_pub_debugger__';
    document.body.appendChild(div);
    // 网页面里面插入外部样式表连接
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@arco-design/web-react@2.38.1/dist/css/arco.min.css'
    document.head.appendChild(link);
}

export const formatCreateGlobalConstant = () => {
    (window as any)['__para_pub_debugger__'] = {
        version: '2.38.1',
        gw_list: ['http://192.168.7.27']
    }
    return (window as any)['__para_pub_debugger__'];
}

export const setGlobalConstant = (key: string, data: any) => {
    // 设置全局变量
    (window as any)[key] = data;
}

export const setLocalStorage = (key: string, value: string) => {
    // 设置本地存储
    const val = typeof value === "string" ? value : JSON.stringify(value);
    chrome.storage.local.set({ [key]: val }, function () {
        console.log('Value is set to ' + val);
    });
}

export const getLocalStorage = async (key: string) => {
    // 获取本地存储
    const p = await chrome.storage.local.get([key]);
    return new Promise((resolve) => resolve(p[key]));
}

export const removeLocalStorage = async (key: string) => {
    // 删除本地存储
    await chrome.storage.local.remove(key)
    return new Promise((resolve) => resolve(true));
}


export const clearAll = async () => {
    return new Promise((resolve, reject) => {
        removeLocalStorage('__debugger_host__');
        removeLocalStorage('__debugger_type__');
        removeLocalStorage('__debugger_service__');
        resolve(true);
    })
}
