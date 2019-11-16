# clearall 🧹
Clear all event listeners at once.

[![npm](https://flat.badgen.net/npm/v/clearall)](https://www.npmjs.com/package/clearall)
[![bundle size](https://flat.badgen.net/bundlephobia/minzip/clearall)](https://bundlephobia.com/result?p=clearall)
[![license](https://flat.badgen.net/github/license/skt-t1-byungi/clearall)](https://github.com/skt-t1-byungi/clearall/blob/master/LICENSE)

## Install
```sh
npm install clearall
```

## Examples
#### Basic
```js
import add from clearall

const clearAll = add(window, 'orientationchange', () => { /* ... */ })
    .add(document, 'mouseup', () => { /* ... */ })
    .add(document, 'mousedown', () => { /* ... */ })
    .add(document, 'mousemove', () => { /* ... */ })
    .add(emitter, 'onMessage', () => { /* ... */ })

clearAll()
```

#### Disposable Class
```js
class View{
    _init(){
        this._clearEvents = add(window, 'orientationchange', this._onRotate)
            .add(this._el, 'mouseup', this._onMouseUp)
            .add(this._el, 'mousedown', this._onMouseDown)
            .add(this._el, 'mousemove', this._onMouseMove)
            .add(this._emitter, 'onMessage', this._onMessage)
    }

    dispose(){
        this._clearEvents()
    }

    /* ... */
}
```
#### React hook
```js
function App(){
    const ref = useRef()

    useEffect(() => {
        const clearAll = add(window, 'orientationchange', () => { /* ... */ })
            .add(ref.current, 'mouseup', () => { /* ... */ })
            .add(ref.current, 'mousedown', () => { /* ... */ })
            .add(ref.current, 'mousemove', () => { /* ... */ })
            .add(emitter, 'onMessage', () => { /* ... */ })

        return clearAll
    }, [])

    /* ... */
}
```

## API
### add(listenable, eventName, listener, ...params)
Add an event listener and return a `clearAll()` function.

### clearAll()
Remove all added event listeners.

### clearAll.add(listenable, eventName, listener, ...params)
Add an event listener to the same clearAll context.

## Tips
### Type Error for window custom event in typescript.
```ts
// ❌ error
add(window, 'user_custom_event', () => { /* ... */})
```
For convenience, there are strong type constraints for some global objects. But sometimes this gets in the way.
`any` can cancel this type constraint.

```ts
// ✔️ ok.
add(window as any, 'user_custom_event', () => { /* ... */})
```


## License
MIT
