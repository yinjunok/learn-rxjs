import { interval, map, tap, takeWhile, merge, fromEvent, scan, repeat, filter, mergeMap, timer, race, finalize } from 'rxjs'
import { createMole, updateCountDown, updateScore } from './utils'

const countDown$ = interval(1000).pipe(
  map(v => 10 - v),
  takeWhile(v => v >= 0),
  tap(updateCountDown),
  map((count) => {
    const num = Math.ceil(3 * Math.random())
    let elements = []
    for (let i = 0; i < num; i += 1) {
      elements.push(createMole())
    }
    return {
      count,
      elements
    }
  }),
  mergeMap((state) => {
    const mole = state.elements.map(ele => {
      const click$ = fromEvent(ele, 'click').pipe(map(() => ({ from: 'user' })))
      const timer$ = timer(Math.random() * 1000 * 1000).pipe(map(() => ({ from: 'auto' })))
  
      return race(click$, timer$).pipe(
        takeWhile(() => state.count > 0),
        tap(() => ele.remove())
      )
    })
    
    return merge(...mole)
  }),
  scan<{ from: string }, number>((acc, cur) => {
    if (cur.from === 'user') {
      return acc += 1
    }
    return acc
  }, 0),
  tap((acc) => updateScore(acc)),
  finalize(() => {
    console.log('finalize')
  }),
  repeat({
    delay: () => fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(e => e.key === 'Enter'), tap(console.log))
  })
)

countDown$.subscribe()

