type Fn<Args extends any[]> = (...args: Args) => any
type AnyFn = Fn<any[]>
type Listener<K extends string, Args extends any[]> = (name: K, listener: (...args: Args) => any, ...rest: any[]) => any
type AnyListener = Listener<string, any[]>
type Listenable =
    {addEventListener: AnyListener; removeEventListener?: AnyListener}
    | {addListener: AnyListener; removeListener?: AnyListener}
    | {on: AnyListener; off?: AnyListener}
    | {subscribe: AnyListener; unsubscribe?: AnyListener}

type EventName<O extends Listenable> =
    O extends Window ? keyof WindowEventMap
        : O extends Document ? keyof DocumentEventMap
            : O extends HTMLElement ? keyof HTMLElementEventMap
                : O extends WebSocket ? keyof WebSocketEventMap
                    : O extends XMLHttpRequest ? keyof XMLHttpRequestEventMap
                        : O extends {addEventListener: AnyFn} ? Parameters<O['addEventListener']>[0]
                            : O extends {addListener: AnyFn} ? Parameters<O['addListener']>[0]
                                : O extends {on: AnyFn} ? Parameters<O['on']>[0]
                                    : O extends {subscribe: AnyFn} ? Parameters<O['subscribe']>[0] : string

type LinterBy<O extends Listenable, K extends string> =
    O extends Window ? K extends keyof WindowEventMap ? Fn<[WindowEventMap[K]]> : never
        : O extends Document ? K extends keyof DocumentEventMap ? Fn<[DocumentEventMap[K]]> : never
            : O extends HTMLElement ? K extends keyof HTMLElementEventMap ? Fn<[HTMLElementEventMap[K]]> : never
                : O extends WebSocket ? K extends keyof WebSocketEventMap ? Fn<[WebSocketEventMap[K]]> : never
                    : O extends XMLHttpRequest ? K extends keyof XMLHttpRequestEventMap ? Fn<[XMLHttpRequestEventMap[K]]> : never
                        : O extends {addEventListener: Listener<K, infer Args>} ? Fn<Args>
                            : O extends {addListener: Listener<K, infer Args>} ? Fn<Args>
                                : O extends {on: Listener<K, infer Args>} ? Fn<Args>
                                    : O extends {subscribe: Listener<K, infer Args>} ? Fn<Args> : AnyFn

type Adder =<O extends Listenable, K extends EventName<O>>(o: O, name: K, listener: LinterBy<O, K>, ...params: any[]) => ClearAll
type ClearAll = AnyFn & { add: Adder }

export function add (): ClearAll
export function add <O extends Listenable, K extends EventName<O>> (o: O, name: K, listener: LinterBy<O, K>, ...params: any[]): ClearAll
export function add <O extends Listenable, K extends EventName<O>> (o?: O, name?: K, listener?: LinterBy<O, K>, ...params: any[]): ClearAll {
    const unsubscribes: Array<() => void> = []

    if (o && listener) subscribe(o, name, listener, params)

    function clearAll () {
        unsubscribes.splice(0).forEach(fn => fn())
    }
    clearAll.add = <O extends Listenable, K extends EventName<O>>(o: O, name: K, listener: LinterBy<O, K>, ...params: any[]) => {
        subscribe(o, name, listener, params)
        return clearAll
    }

    return clearAll

    function subscribe (o: any, name: any, listener: AnyFn, ...params: any[]): void {
        const on = o.addEventListener || o.addListener || o.on || o.subscribe
        if (typeof on !== 'function') throw new TypeError('`Add Listener` method was not found.')

        const res = on.call(o, name, listener, ...params)
        if (typeof res === 'function') {
            return void unsubscribes.push(res)
        }

        const off = o.removeEventListener || o.removeListener || o.off || o.unsubscribe
        if (typeof off === 'function') {
            return void unsubscribes.push(() => off.call(o, name, listener))
        }
    }
}

export default add
