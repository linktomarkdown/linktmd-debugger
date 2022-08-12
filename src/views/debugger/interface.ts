export interface ServerItem {
    key: string
    name: string
    label: string
    value: string
    origin: string
    type: string
    disable: boolean
    cors: {
        enable: boolean
    },
    proxy: string[]
    proxyInfo: {
        [proxykey: string]: {
            name: string
            isStatic: boolean
            targetCtxs: { [ctx: string]: string }
            target: {
                disable: boolean
                displayName: string
                value: string
            }[]
        }
    }
}