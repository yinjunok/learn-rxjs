import { exhaustMap, fromEvent, iif, map, tap, takeUntil, repeat, takeWhile, switchMap, of, delay } from 'rxjs'

const refreshEle = document.getElementById('refresh')!
const dataEle = document.getElementById('data')!

const mouseDown$ = fromEvent<MouseEvent>(refreshEle, 'mousedown')
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup')!
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove')!

const setRefresh = (top: number) => {
  refreshEle.style.top = `${top}px`
}

const fakeApi = () => {
  return of(`${new Date().toUTCString()}`).pipe(delay(1500))
}

const updateData = (txt: string) => {
  dataEle.innerHTML = txt
}

const request$ = of({}).pipe(
  tap(() => setRefresh(10)),
  tap(() => updateData('refreshing...')),
  exhaustMap(() => fakeApi()),
  tap(v => updateData(v))
)

mouseDown$.pipe(
  switchMap(() => mouseMove$),
  map((e) => e.clientY),
  takeWhile((top) => top < 110),
  takeUntil(mouseUp$),
  exhaustMap((top: number) => iif(
    () => top > 100,
    request$,
    of(top).pipe(tap(setRefresh))
  )),
  repeat(),
).subscribe()