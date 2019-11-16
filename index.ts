type Func<Args extends any[]> = (...args: Args) => any
type AnyFunc = Func<any[]>
type Listen<K extends string, Args extends any[]> = (name: K, listener: (...args: Args) => any, ...rest: any[]) => any;
type AnyListen = Listen<any, any[]>
type Listenable =
    {on: AnyListen; off: AnyListen}
    | {addListener: AnyListen; removeListener: AnyListen}
    | {addEventListener: AnyListen; removeEventListener: AnyListen}
type EventName<O extends Listenable> =
    O extends Window ? keyof WindowEventMap
    : O extends Document ? keyof DocumentEventMap
    : O extends HTMLElement ? keyof HTMLElementEventMap
    : O extends WebSocket ? keyof WebSocketEventMap
    : O extends XMLHttpRequest ? keyof XMLHttpRequestEventMap
    : O extends {on: AnyFunc} ? Parameters<O['on']>[0]
    : O extends {addListener: AnyFunc} ? Parameters<O['addListener']>[0]
    : O extends {addEventListener: AnyFunc} ? Parameters<O['addEventListener']>[0] : string
type Listener<O extends Listenable, K extends string> =
    O extends Window ? K extends keyof WindowEventMap ? Func<[WindowEventMap[K]]> : never
    : O extends Document ? K extends keyof DocumentEventMap ? Func<[DocumentEventMap[K]]> : never
    : O extends HTMLElement ? K extends keyof HTMLElementEventMap ? Func<[HTMLElementEventMap[K]]> : never
    : O extends WebSocket ? K extends keyof WebSocketEventMap ? Func<[WebSocketEventMap[K]]> : never
    : O extends XMLHttpRequest ? K extends keyof XMLHttpRequestEventMap ? Func<[XMLHttpRequestEventMap[K]]> : never
    : O extends {on: Listen<K, infer Args>} ? Func<Args>
    : O extends {addListener: Listen<K, infer Args>} ? Func<Args>
    : O extends {addEventListener: Listen<K, infer Args>} ? Func<Args> : AnyFunc

export function add <O extends Listenable, K extends EventName<O>> (o: O, name: K, listener: Listener<O, K>, ...params: any[]) {
    const unsubscribes: Array<() => void> = []

    subscribe(o, name, listener, params)

    function clearAll () {
        unsubscribes.slice().forEach(fn => fn())
    }
    clearAll.add = <O extends Listenable, K extends EventName<O>>(o: O, name: K, listener: Listener<O, K>, ...params: any[]) => {
        subscribe(o, name, listener, params)
        return clearAll
    }

    return clearAll

    function subscribe (o: Listenable, name: any, listener: AnyFunc, ...params: any[]) {
        const { on, off } = normalizeListenable(o)
        on(name, listener, ...params)
        unsubscribes.push(function unsubscribe () {
            off(name, listener)
            unsubscribes.splice(unsubscribes.indexOf(unsubscribe), 1)
        })
    }
}

export default add

function normalizeListenable (o: any): {on: AnyListen; off: AnyListen} {
    return {
        on: (o.on || o.addListener || o.addEventListener || noop).bind(o),
        off: (o.off || o.removeListener || o.removeEventListener || noop).bind(o)
    }
}

function noop () {}
