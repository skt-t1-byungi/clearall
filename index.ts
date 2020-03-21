type Fn<Args extends any[]> = (...args: Args) => any
type AnyFn = Fn<any[]>
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
    : O extends {on: AnyFn} ? Parameters<O['on']>[0]
    : O extends {addListener: AnyFn} ? Parameters<O['addListener']>[0]
    : O extends {addEventListener: AnyFn} ? Parameters<O['addEventListener']>[0] : string
type Listener<O extends Listenable, K extends string> =
    O extends Window ? K extends keyof WindowEventMap ? Fn<[WindowEventMap[K]]> : never
    : O extends Document ? K extends keyof DocumentEventMap ? Fn<[DocumentEventMap[K]]> : never
    : O extends HTMLElement ? K extends keyof HTMLElementEventMap ? Fn<[HTMLElementEventMap[K]]> : never
    : O extends WebSocket ? K extends keyof WebSocketEventMap ? Fn<[WebSocketEventMap[K]]> : never
    : O extends XMLHttpRequest ? K extends keyof XMLHttpRequestEventMap ? Fn<[XMLHttpRequestEventMap[K]]> : never
    : O extends {on: Listen<K, infer Args>} ? Fn<Args>
    : O extends {addListener: Listen<K, infer Args>} ? Fn<Args>
    : O extends {addEventListener: Listen<K, infer Args>} ? Fn<Args> : AnyFn

type Adder =<O extends Listenable, K extends EventName<O>>(o: O, name: K, listener: Listener<O, K>, ...params: any[]) => ClearAll
type ClearAll = AnyFn & { add: Adder }

export function add (): ClearAll
export function add <O extends Listenable, K extends EventName<O>> (o: O, name: K, listener: Listener<O, K>, ...params: any[]): ClearAll
export function add <O extends Listenable, K extends EventName<O>> (o?: O, name?: K, listener?: Listener<O, K>, ...params: any[]): ClearAll {
    let unsubscribes: Array<() => void> = []

    if (o && listener) subscribe(o, name, listener, params)

    function clearAll () {
        unsubscribes.forEach(fn => fn())
        unsubscribes = []
    }
    clearAll.add = <O extends Listenable, K extends EventName<O>>(o: O, name: K, listener: Listener<O, K>, ...params: any[]) => {
        subscribe(o, name, listener, params)
        return clearAll
    }

    return clearAll

    function subscribe (o: Listenable, name: any, listener: AnyFn, ...params: any[]) {
        const { on, off } = normalizeListenable(o)
        on(name, listener, ...params)
        unsubscribes.push(() => off(name, listener))
    }
}

export default add

function normalizeListenable (o: any): {on: AnyListen; off: AnyListen} {
    const on = o.addEventListener || o.addListener || o.on
    if (typeof on !== 'function') throw new TypeError('`Add Listener` method was not found.')

    const off = o.removeEventListener || o.removeListener || o.off
    if (typeof off !== 'function') throw new TypeError('`Remove Listener` method was not found.')

    return { on: on.bind(o), off: off.bind(o) }
}
