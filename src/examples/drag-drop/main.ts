import { fromEvent, withLatestFrom, map, takeUntil, repeat, debounceTime } from 'rxjs'

const drag = document.getElementById('drag')!
const target = document.getElementById('target')!

const dragMousedown$ = fromEvent<MouseEvent>(drag, 'mousedown')
const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove')
const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup')

const dragMove$ = mousemove$.pipe(
  withLatestFrom(dragMousedown$.pipe(map(e => {
    const rect = drag.getBoundingClientRect()
    return {
      clientX: e.clientX,
      clientY: e.clientY,
      originTop: rect.top,
      originLeft: rect.left
    }
  }))),
  map(([end, start]) => {
    const disLeft = end.clientX - start.clientX + start.originLeft
    const disTop = end.clientY - start.clientY + start.originTop
    return {
      top: disTop,
      left: disLeft
    }
  }),
)

const targetMouseEvnter$ = dragMove$.pipe(
  withLatestFrom(mousemove$),
  debounceTime(20),
  map(([, e]) => {
    const rect = target.getBoundingClientRect()

    return {
      target: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      origin: {
        clientX: e.clientX,
        clientY: e.clientY 
      }
    }
  }),
  map((pos) => {
    if (
      (pos.origin.clientX > pos.target.left && pos.origin.clientX < pos.target.left + pos.target.width)
      && (pos.origin.clientY > pos.target.top && pos.origin.clientY < pos.target.top + pos.target.height)
    ) {
      return true
    }
    return false
  }),
  takeUntil(mouseup$),
  repeat()
)

targetMouseEvnter$.subscribe(enter => {
  if (enter) {
    target.style.background = 'red'
  } else {
    target.style.background = ''
  }
})

// targetMouseLeave$

dragMove$.pipe(
  takeUntil(mouseup$),
  repeat()
).subscribe((pos) => {
  drag.style.top = `${pos.top}px`
  drag.style.left = `${pos.left}px`
})
