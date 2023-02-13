import { fromEvent, interval, tap, map, merge, withLatestFrom, startWith, delay } from 'rxjs'

const container = document.getElementById('container')!
const start$ = fromEvent(container, 'mouseleave').pipe(map(() => 'animate'))
const stop$ = fromEvent(container, 'mouseenter').pipe(map(() => 'stop'))
const frame$ = interval(2500).pipe(map(() => 'aniamte'))

const controller$ = merge(start$, stop$).pipe(startWith('animate'), delay(2000))

frame$.pipe(
  withLatestFrom(controller$),
  map(([, action]) => {
    if (action === 'stop') {
      return 0
    }
    return 312
  }),
  tap(left => {
    if (left !== 0) {
      container.style.transform = `translate3d(-${left}px, 0, 0)`
      container.style.transition = `transform 500ms`
    }
  }),
  delay(500),
  tap(left => {
    if (left !== 0) {
      container.style.transform = `translate3d(0, 0, 0)`
      container.style.transition = 'none'
      container.appendChild(container.firstElementChild!)
    }
  })
).subscribe()
