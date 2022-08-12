import {
  formatCreateElement,
  setGlobalConstant,
} from './utils/format';

function init(){
    // 判断是否开启调试模式
    // console.log("__DEBUGGER_OPEN__",(window as any).__DEBUGGER_OPEN__);
    // if (!(window as any).__DEBUGGER_OPEN__) return console.log("[Debugger]调试模式未开启");
    // 创建全局变量
    let __DEBUGGER_CONST__ = "";
    // 向background发送消息,请求最新的配置数据
    chrome.runtime.sendMessage({type: 'read_config', data: null}, function(response) {
      console.log('[ParaPubDebugger] 请求配置数据', response);
      const {data,farewell} = response;
      if (farewell == 'ok' && data) {
        // 挂载全局对象
        setGlobalConstant('__paracontext__', data)
        // 新网关
        setGlobalConstant('__para_pub_context__', data);
        __DEBUGGER_CONST__ = data;
        // const defaultData = formatCreateGlobalConstant();
        // 判断页面是否存在div#__para_pub_debugger__
        if(!document.querySelector("#__para_pub_debugger__")) {
          formatCreateElement();
          // 往页面插入js,
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('/inject.bundle.js');
          // 往页面写入全局变量
          script.innerHTML = `${JSON.stringify(data)}`;
          script.id = '__para_pub_debugger_const__';
          document.head.appendChild(script);
        }
        // ReactDOM.render(
        //     <Debugger initData={defaultData}/>,
        //     document.querySelector("#__para_pub_debugger__")
        // );
      }
    });
    
}

init();


