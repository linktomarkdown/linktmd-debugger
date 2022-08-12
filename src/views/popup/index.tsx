import './index.less';

import * as React from 'react';

import {
  PageHeader,
  Radio,
} from '@arco-design/web-react';

import DebuggerForm from '../debugger/Form';
import TokenForm from '../debugger/TokenForm';
import UrlForm from '../debugger/UrlForm';

const PopupApp = (props:{initData:any}) => {
    const [currentTab, setCurrentTab] = React.useState('gateway');
    return (<>
        <PageHeader
            style={{ background: 'var(--color-bg-2)' }}
            title='Debugger'
            subTitle='派拉公共服务调试平台'
            extra={
            <div>
                <Radio.Group mode='fill' type='button' defaultValue='gateway' onChange={(e) => setCurrentTab(e)}>
                    <Radio value='gateway'>代理服务</Radio>
                    <Radio value='token'>Token管理</Radio>
                    <Radio value='url'>常用地址</Radio>
                </Radio.Group>
            </div>
            }
        />
        <div className='popup-app-content'>
            {currentTab === 'gateway' && <DebuggerForm GW_LIST={props.initData ? props.initData.gw_list : []}></DebuggerForm>}
            {currentTab === 'token' && <TokenForm></TokenForm>}
            {currentTab === 'url' && <UrlForm></UrlForm>}
        </div>
    </>)
}

export default PopupApp;