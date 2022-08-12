import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  formatCreateElement,
  formatCreateGlobalConstant,
} from './utils/format';
import PopupApp from './views/popup';

function init(){
    const defaultData = formatCreateGlobalConstant();
    console.log('__para_pub_debugger__ init',(window as any)['__para_pub_debugger__']);
    // 判断页面是否存在div#__para_pub_debugger__
    if(!document.querySelector("#__para_pub_debugger__")) formatCreateElement()
    
    ReactDOM.render(
        <PopupApp initData={defaultData}/>,
        document.querySelector("#__para_pub_debugger__")
    );
}

init();