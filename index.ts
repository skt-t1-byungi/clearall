type Func<Args extends any[]> = (...args: Args) => any
type AnyFunc = Func<any[]>
type Listen<K extends string, Args extends any[]> = (name: K, listener: (...args: Args) => any, ...rest: any[]) => any;
type AnyListen = Listen<any, any[]>
type Listenable =
    {addEventListener: AnyListen; removeEventListener: AnyListen}
    | {addListener: AnyListen; removeListener: AnyListen}
    | {on: AnyListen; off: AnyListen}
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
    let unsubscribes: Array<() => void> = []

    subscribe(o, name, listener, params)

    function clearAll () {
        unsubscribes.forEach(fn => fn())
        unsubscribes = []
    }
    clearAll.add = <O extends Listenable, K extends EventName<O>>(o: O, name: K, listener: Listener<O, K>, ...params: any[]) => {
        subscribe(o, name, listener, params)
        return clearAll
    }

    return clearAll

    function subscribe (o: Listenable, name: any, listener: AnyFunc, ...params: any[]) {
        const { on, off } = normalizeListenable(o)
        on(name, listener, ...params)
        unsubscribes.push(() => off(name, listener))
    }
}

export default add

function normalizeListenable (o: any): {on: AnyListen; off: AnyListen} {
    const on = o.addEventListener || o.addListener || o.on
    if (typeof on !== 'function') throw new TypeError('Add listener method not found.')

    const off = o.removeEventListener || o.removeListener || o.off
    if (typeof off !== 'function') throw new TypeError('Remove Listener method not found.')

    return { on: on.bind(o), off: off.bind(o) }
}
