import { fromEvent, map, filter, switchMap, tap, takeUntil, repeat, delay, last, merge, of } from 'rxjs'

const mouseDown$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
  map(e => ({
    dom: e.target as HTMLElement,
    clientY: e.clientY
  }))
)
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
  map(e => e.clientY)
)
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup')
const touchStart$ = fromEvent<TouchEvent>(document, 'touchstart').pipe(
  map(e => ({
    dom: e.target as HTMLElement,
    clientY: e.touches?.[0].clientY
  }))
)
const touchMove$ = fromEvent<TouchEvent>(document, 'touchmove').pipe(
  map(e => e.touches?.[0].clientY)
)
const touchEnd$ = fromEvent<TouchEvent>(document, 'touchend')

const start$ = merge(mouseDown$, touchStart$)
const move$ = merge(mouseMove$, touchMove$)
const end$ = merge(mouseUp$, touchEnd$)

const sub = start$.pipe(
  filter(({ dom }) => dom.classList.contains('card')),
  switchMap(({ dom, clientY }) => {
    return move$.pipe(
      map(moveY => ({
        dom,
        moveY: moveY - clientY,
      })),
      tap(({ dom, moveY }) => {
        dom.style.transform = `translate3d(0, ${moveY}px, 0)`
      }),
      takeUntil(end$),
      last(),
    )
  }),
  switchMap(({ dom, moveY }) => {
    if (Math.abs(moveY) >= 100) {
      return of({}).pipe(
        tap(() => {
          dom.style.opacity = '1'
        }),
        delay(0),
        tap(() => {
          if (moveY >= 0) {
            dom.style.transform = `translate3d(0, ${moveY + 50}px, 0)`
          } else {
            dom.style.transform = `translate3d(0, ${moveY - 50}px, 0)`
          }
          dom.style.transition = 'all .2s ease'
          dom.style.pointerEvents = 'none'
          dom.style.opacity = '0'
        }),
        delay(200),
        tap(() => {
          dom.remove()
        })
      )
    }
    return of({}).pipe(
      tap(() => {
        dom.style.transform = ''
        dom.style.transition = 'transform .2s ease'
      }),
      delay(200),
      tap(() => {
        dom.style.transition = ''
      })
    )
   }),
  repeat(),
).subscribe(() => {
  const cards = document.getElementsByClassName('card')
  if (cards.length === 0) {
    sub.unsubscribe()
  }
})
