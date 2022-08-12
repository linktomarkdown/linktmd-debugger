import React from 'react';

import {
  Alert,
  Button,
  Card,
  Form,
  Grid,
  Link,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from '@arco-design/web-react';

import {
  clearAll,
  getLocalStorage,
  setGlobalConstant,
  setLocalStorage,
} from '../../utils/format';
import { ServerItem } from './interface';

const TimelineItem = Timeline.Item;
const { Row } = Grid;
const { Title, Paragraph, Text } = Typography;
const DebuggerForm = (props:{GW_LIST:any[]}) => {
    const {GW_LIST} = props;
    const [gwList] = React.useState(GW_LIST ?? [])
    const [serverTypes,setServiceTypes] = React.useState([]);
    const [serviceList,setServiceList] = React.useState([]);
    const [routerList,setRouterList] = React.useState([]);
    const [serverTypesMap,setServiceTypesMap] = React.useState<any>({});
    const [alertFlag,setAlertFlag] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [contextInfo,setContextInfo] = React.useState(null);
    const [clearStatus,setClearStatus] = React.useState(false);
    const [initBol,setInitBol] = React.useState(false);
    const [form] = Form.useForm();
   
    const host = Form.useWatch('host', form);
    const serviceType = Form.useWatch('serviceType', form);
    const service = Form.useWatch('service', form);
    
    const query = async (host:string) => {
        return new Promise((resolve,reject) => {
            fetch(`${host}/web-debug/host/list`, {method: 'GET'})
            .then(response => response.json())
            .then(result => {
                const fData = formatTypeMapData(result);
                setLoading(false);
                resolve(fData);
            })
            .catch(error => {
                setAlertFlag("网关地址接口响应失败,请检查网关地址是否正确");
                setLoading(false);
                form.setFieldValue('serviceType', null);
                form.setFieldValue('service', null)
            });
        })
    }

    const queryContext = async (host:string) => {
        setLoading(true);
        const url = `${host.replace(/\/*$/, "")}/ngw/context`;
        fetch(url, {method: 'GET'})
            .then(response => response.json())
            .then(result => {
                setLoading(false);
                setContextInfo(result);
                const params = {
                    path:"/ngw/context",
                    list: result,
                    finished: true,
                    target: host
                }
                // 兼容旧网关
                setGlobalConstant('__paracontext__', params)
                // 新网关
                setGlobalConstant('__para_pub_context__', params);
                // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                //     chrome.tabs.sendMessage(tabs[0].id, {type: 'config', data: result}, function(response) {
                //       console.log(response);
                //     });
                // });
                chrome.runtime.sendMessage({type: 'config', data: params}, function(response) {
                    console.log(response);
                });
                console.log('[Debugger] 发送配置数据', params);
            })
            .catch(error => {
                setAlertFlag("代理服务接口响应失败,请检查网关地址、代理服务是否正确");
                setLoading(false);
            });
    }
    
    const formatTypeMapData = (result:any[]) => {
        let hostTypeList = [];
        let serverTypes:any = {};
        let serverMap:any = {};
        result.forEach((item: any) => {
            if (item.disable) return true;
            if (serverTypes[item.type] === undefined)
                serverTypes[item.type] = [];
            serverTypes[item.type].push({
                label: item.name,
                value: item.key
            });
            if (!serverMap[item.type])
                serverMap[item.type] = {};
            serverMap[item.type][item.key] = item;
        });
        for (let key in serverTypes) {
            hostTypeList.push({
                label: key,
                value: key,
                children: serverTypes[key]
            });
        }
        setServiceTypes(hostTypeList);
        setServiceTypesMap(serverMap);
        return {hostTypeList,serverTypes,serverMap};
    }

    const formatServiceList = (serviceType:string) => {
        let service = serverTypes.find((item:any) => item.value === serviceType);
        if (service) {
            setServiceList(service.children);
        }
    }
    const formatRouterList = (server:ServerItem) => {
        let routerList:any[] = [];
        const router = Object.values(server.proxyInfo);
        router.forEach((r:any) => {
            let targetCtxsList:any[] = [];
            Object.keys(r.targetCtxs).forEach(ctx => targetCtxsList.push(ctx.replace(/^\//, '')))
            routerList.push({
                label: r.name,
                key: r.key,
                sso: r.sso,
                ctx: targetCtxsList,
                target: r.target.filter((target:any) => !target.disable)
            });
        });
        return routerList;
    }
    // 获取本机浏览器信息
    const getBrowserInfo = () => {
        let ua = navigator.userAgent;
        return {
            name: navigator.appCodeName,
            version: navigator.appVersion,
            platform: (navigator as any).userAgentData.platform,
            userAgent: ua,
        }
    }
    
    const openNewWindow = (url:string) => {
        window.open(url, '_blank');
    }
    const onStepThree = (service:string) =>  {
        const s = serverTypesMap[serviceType]?.[service];
        if (!s) return;
        queryContext(s.origin);
        const rList = formatRouterList(s);
        setRouterList(rList);
    }
   

    const backData = () => {
        setLoading(true);
        setTimeout(() => {
            // 存储服务信息到本地
            setLocalStorage('__debugger_host__', host);
            getLocalStorage('__debugger_type__').then(serviceType => {
                console.group("=====>serviceType",serviceType);
                if (serviceType) {
                    formatServiceList(serviceType as string)
                    console.group('serviceType', serviceType);
                    form.setFieldValue('serviceType', serviceType);
                    getLocalStorage('__debugger_service__').then((service:any) => {
                        if (service) {
                            console.log('service已经存在', service);
                            form.setFieldValue('service', service);
                        }});;
                }});
                setLoading(false);
        }, 1000);
    }
    
    const reLinkNetwork = (type: 'gw' | 'ctx' | 'clear') => {
        if (type === 'gw') {
            clearAll().then(() => {
                query(host).then((fData) => {
                    backData()
                });
            })
        }
        if (type === 'ctx') {
            query(host).then((fData) => {
                backData()
            });
        }
        if (type === 'clear') {
            clearAll()
            setClearStatus(true);
            setTimeout(() => {
                setClearStatus(false);
            } ,1500);
        }
    }

    React.useEffect(() => {
        if (!host) return;
        setAlertFlag(null);
        setLoading(true);
        query(host).then((fData) => {
            backData()
        });
    },[host])

    React.useEffect(() => {
        if (!serviceType) return;
        formatServiceList(serviceType)
        // 存储服务信息到本地
        setLocalStorage('__debugger_type__', serviceType);
    },[serviceType])
    
    React.useEffect(() => {
        if (!service) return;
        onStepThree(service);
        // 存储服务信息到本地
        setLocalStorage('__debugger_service__', service);
        // 刷新当前tab页面
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // 如果当前页面是debugger页面，则不刷新当前页面
            if (tabs[0].url.indexOf('debugger') > -1) return;
            chrome.tabs.reload(tabs[0].id);
        });
    },[service])

    React.useEffect(() => {
         // 读取本地存储的服务信息
         getLocalStorage('__debugger_host__').then((hst:string) => {
            if (hst) {
                console.log('hst已经存在', hst);
                // queryContext(hst)
                form.setFieldValue('host', hst);
                // 如果host变更了，需要清理掉本地的服务信息
            if (host !== hst) {
                form.setFieldValue('serviceType', '');
                form.setFieldValue('service', '');
            }
            }});
    },[]) 

    const renderRouter = () => {
        if (!contextInfo) return;
        return routerList.map((item:any) => {
            return (
                    <div className="__debugger_router__" key={item.key}>
                        <Card hoverable>
                             <Timeline direction='horizontal' mode={'bottom'}>
                            <TimelineItem>
                                <Row align='center'>
                                    <Tooltip content={<>
                                            <div className='mt10'>本机名称: {getBrowserInfo().userAgent}</div>
                                            <div className='mt10 mb10'>&nbsp;浏览器头: {getBrowserInfo().platform}</div>
                                        </>} >
                                        <div className="__debugger_router_center__">
                                            {'本机浏览器:' + getBrowserInfo().name}
                                            <div style={{ fontSize: 12, color: '#4E5969', }} >
                                                <Tag  color='arcoblue'>{getBrowserInfo().platform}</Tag>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </Row>
                            </TimelineItem>
                            <TimelineItem>
                                <Row align='center'>
                                        <Tooltip content={<>
                                            <div className='mt10'>路由名称: {item.label}</div>
                                            <div className='mt10'>开启SSO: <Tag color='arcoblue'>{item.sso ? '开启':'未开启'}</Tag></div>
                                            <div className='mt10 mb10'>&nbsp;上下文: {item.ctx.map((ct:string) => (<Tag key={ct} color='arcoblue' >{ct}</Tag>))}</div>
                                        </>}>
                                            <div className="__debugger_router_center__">
                                                {item.label + '...'}
                                            <div style={{ fontSize: 12, color: '#4E5969', }} >
                                                {item.ctx.map((ct:string) => (<Tag key={ct} color='arcoblue'>{ct}</Tag>))}
                                            </div>
                                        </div>
                                        </Tooltip>
                                </Row>
                            </TimelineItem>
                            <TimelineItem>
                                <Row align='center'>
                                    <div className="__debugger_router_center__">
                                        <Tooltip content={<>
                                            <div className='mt10'>后台服务地址: {item.target.map((target:any,i:number) => (<Tag key={i} color='arcoblue' onClick={() => openNewWindow(target.value)}>{target.value}</Tag>))}</div>
                                            <div className='mt10 mb10'>后台服务权重: {item.target.map((ct:any,ins:number) => (<Tag key={ins} color='arcoblue'>{ct.weight ?? 1}</Tag>))}</div>
                                        </>}>
                                            后台服务
                                            <div style={{ fontSize: 12, color: '#4E5969', }} >
                                                {item.target.length
                                                ? item.target.map((target:any,i:number) => (<Tag key={i} color='arcoblue' onClick={() => openNewWindow(target.value)}>{target.value}</Tag>))
                                                : <Tag color='arcoblue' >静态资源</Tag>}
                                            </div>
                                        </Tooltip>
                                    </div>
                                </Row>
                            </TimelineItem>
                        </Timeline>
                        </Card>
                       
                    </div>
            )
        })
    }
    const renderDesc = () => {
        if (!contextInfo) return null;
        return (
            <Typography>
                <Title heading={6}>代理信息:</Title>
                <Paragraph blockquote>
                    代理地址: <Link icon onClick={() => window.open(host,'_blank')}>{contextInfo.$info.domain}</Link> <br />
                    网关版本: <Text code>{contextInfo.$info.version}</Text>
                </Paragraph>
            </Typography>
        )
    }
    return (
        <>
            <Spin loading={loading} style={{width:'100%'}}>
                <Form layout={'vertical'} form={form}>
                        {alertFlag && <Alert type='error' content={alertFlag} />}
                        <Form.Item label='网关地址' field='host'>
                        <Select options={gwList} placeholder='请选择网关地址' style={{ flex: 1 }}/>
                        </Form.Item>
                        <Form.Item shouldUpdate noStyle>
                            {(values) => {
                                return values.host ? (
                                <Form.Item label='代理分类' field='serviceType'>
                                    <Select options={serverTypes}  placeholder='请选择代理分类' style={{ flex: 1 }}/>
                                </Form.Item>
                                ) : null;
                            }}
                        </Form.Item>
                        <Form.Item shouldUpdate noStyle>
                            {(values) => {
                                return values.serviceType ? (
                                <Form.Item label='代理服务' field='service'>
                                    <Select options={serviceList} placeholder='请选择代理服务' style={{ flex: 1 }}/>
                                </Form.Item>
                                ) : null;
                            }}
                        </Form.Item>
                        <Form.Item label="">
                            {(values) => {
                                return values.service ? (renderDesc()) : null;
                            }}
                        </Form.Item>
                        <Form.Item label="">
                            {(values) => {
                                return values.service ? <div className="__debugger_card__">{renderRouter()}</div> : null;
                            }}
                        </Form.Item>
                    </Form>
            </Spin>
            {/* 接口错误重新请求重试逻辑 */}
            {alertFlag && <div className='__debugger_relink__'>
                {clearStatus && <Alert style={{ marginBottom: 20 }} type='success' content='清理本地缓存成功！'/>}
                <Space size='large'>
                    <Button type='primary' onClick={() => reLinkNetwork('gw')} loading={loading}>重连网关地址</Button>
                    <Button type='primary' status='danger' onClick={() => reLinkNetwork('clear')} loading={loading}>清理本地存储</Button>
                </Space>
            </div>}
        </>
        
    )
}
export default DebuggerForm;