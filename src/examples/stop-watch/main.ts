import { fromEvent, EMPTY, switchMap, map, merge, scan, interval, tap } from 'rxjs'

const counter = document.getElementById('counter')!
const start = document.getElementById('start')!
const pause = document.getElementById('pause')!
const reset = document.getElementById('reset')!

const start$ = fromEvent(start, 'click').pipe(map<Event, Omit<CounterState, 'value' | 'step'>>(() => ({ start: true })))
const pause$ = fromEvent(pause, 'click').pipe(map<Event, Omit<CounterState, 'value' | 'step'>>(() => ({ start: false })))
const reset$ = fromEvent(reset, 'click').pipe(map<Event, Omit<CounterState, 'start' | 'step'>>(() => ({ value: 0 })))

const initVal$ = fromEvent(document.getElementById('setto')!, 'click').pipe(
  map(() => {
    const valInput = document.getElementById('value')! as HTMLInputElement
    return {
      value: parseInt(valInput.value, 10)
    }
  })
)

const interval$ = fromEvent(document.getElementById('setspeed')!, 'click').pipe(
  map(() => {
    const stepInput = document.getElementById('speed')! as HTMLInputElement
    return {
      interval: parseInt(stepInput.value, 10)
    }
  })
)

const step$ = fromEvent(document.getElementById('setincrease')!, 'click').pipe(
  map(() => {
    const stepInput = document.getElementById('increase')! as HTMLInputElement
    return {
      step: parseInt(stepInput.value, 10)
    }
  })
)

const event$ = merge(
  start$,
  pause$,
  reset$,
  initVal$,
  interval$,
  step$
)

interface CounterState {
  value: number
  step: number
  start: boolean
  interval: number
}

const setVal = (val: number) => counter.innerHTML = `${val}`

event$.pipe(
  scan<any, CounterState>((acc, cur) => ({ ...acc, ...cur }), {
    value: 0,
    start: false,
    step: 1,
    interval: 1000
  }),
  tap(state => setVal(state.value)),
  switchMap(state => {
    if (state.start) {
      return interval(state.interval).pipe(
        map(() => ({ ...state, value: state.value += state.step })),
        tap(state => setVal(state.value))
      )
    }

    return EMPTY
  })
).subscribe()
