import test from 'ava'
import EventEmitter from '@byungi/event-emitter'
import add from '.'

test('basic', t => {
    const ee = new EventEmitter<{test(): void}>()

    let calls = 0
    const inc = () => calls++

    const clearAll = add(ee, 'test', inc)
    ee.emit('test')
    t.is(calls, 1)

    clearAll()
    ee.emit('test')
    t.is(calls, 1)

    clearAll
        .add(ee, 'test', inc)
        .add(ee, 'test', inc)
        .add(ee, 'test', inc)
    ee.emit('test')
    t.is(calls, 4)

    clearAll()
    ee.emit('test')
    t.is(calls, 4)
})

test('check listable', t => {
    const ee = new EventEmitter()
    t.notThrows(() => add(ee, 'test', () => {}))
    t.throws(() => add({} as any, 'test', () => {}), 'Listener add method not found.')
})

test.skip('type', t => {
    const ee = new EventEmitter()
    const ws = new WebSocket('')
    const xhr = new XMLHttpRequest()

    add(window, 'click', e => e.altKey)
        .add(document, 'readystatechange', e => e.stopPropagation)
        .add(document.createElement('div'), 'click', e => e.altKey)
        .add(document.createElement('video'), 'click', e => e.altKey)
        .add(ee, 'test', () => {})
        .add(ws, 'message', () => {})
        .add(xhr, 'readystatechange', () => {})

    t.pass()
})
