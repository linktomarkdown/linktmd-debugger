import './index.less';

import * as React from 'react';

import {
  Button,
  Drawer,
  PageHeader,
  Radio,
} from '@arco-design/web-react';
import { IconRobot } from '@arco-design/web-react/icon';

import DebuggerForm from './Form';
import TokenForm from './TokenForm';
import UrlForm from './UrlForm';

const Debugger = (props:{initData:any}) => {
    const [visible, setVisible] = React.useState(false);
    const [currentTab, setCurrentTab] = React.useState('gateway');
    return (
        <div className="__debugger_hover__">
            <Button type='primary' shape='round' icon={<IconRobot />} onClick={() => {setVisible(true)}}>Debugger</Button>
            <Drawer
                className={"__debugger_drawer__"}
                width={678}
                title={null}
                footer={null}
                closable={null}
                visible={visible}
                onOk={() => {
                setVisible(false);
                }}
                onCancel={() => {
                setVisible(false);
                }}
            >
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
                {currentTab === 'gateway' && <DebuggerForm GW_LIST={props.initData ? props.initData.gw_list : []}></DebuggerForm>}
                {currentTab === 'token' && <TokenForm></TokenForm>}
                {currentTab === 'url' && <UrlForm></UrlForm>}
            </Drawer>
        </div>
    )
}

export default Debugger;