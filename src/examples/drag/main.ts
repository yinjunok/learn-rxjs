import { fromEvent, switchMap, map, takeUntil, share, delay } from 'rxjs'

const avatar = document.getElementById('avatar')!
const avatar1 = document.getElementById('avatar-1')!
const avatar2 = document.getElementById('avatar-2')!
const avatar3 = document.getElementById('avatar-3')!

const updatePosition = (ele: HTMLElement, pos: { left: number, top: number }) => {
  ele.style.left = `${pos.left}px`
  ele.style.top = `${pos.top}px`
}

const move$ = fromEvent<MouseEvent>(avatar, 'mousedown').pipe(
  map(e => {
    const rect = avatar.getBoundingClientRect()
    return {
      diffLeft: e.clientX - rect.left,
      diffTop: e.clientY - rect.top,
    }
  }),
  switchMap((diff) => {
    return fromEvent<MouseEvent>(document, 'mousemove').pipe(
      map(e => ({
        left: e.clientX - diff.diffLeft,
        top: e.clientY - diff.diffTop
      })),
      takeUntil(fromEvent(avatar, 'mouseup')),
    )
  }),
  share()
)

move$.subscribe((pos) => {
  updatePosition(avatar, pos)
})

move$.pipe(
  delay(100)
).subscribe(pos => {
  updatePosition(avatar1, pos)
})

move$.pipe(
  delay(200)
).subscribe(pos => {
  updatePosition(avatar2, pos)
})

move$.pipe(
  delay(300)
).subscribe(pos => {
  updatePosition(avatar3, pos)
})