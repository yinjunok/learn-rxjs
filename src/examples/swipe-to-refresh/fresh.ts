import { fromEvent, delay, of, exhaustMap, tap, takeUntil, takeWhile, switchMap, map, iif, repeat } from 'rxjs'

const refreshEle = document.getElementById('refresh')!
const dataEle = document.getElementById('data')!

const mouseDown$ = fromEvent<MouseEvent>(refreshEle, 'mousedown')
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup')!
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove')!

const setRefresh = (top: number) => {
  refreshEle.style.top = `${top}px`
}

const updateData = (txt: string) => {
  dataEle.innerHTML = txt
}

const fakeApi = () => {
  return of(new Date().toUTCString()).pipe(delay(1500))
}

const request$ = of({}).pipe(
  tap(() => setRefresh(10)),
  tap(() => updateData('refreshing...')),
  exhaustMap(() => fakeApi()),
  tap((v) => updateData(v))
)

mouseDown$.pipe(
  switchMap(() => mouseMove$),
  map(e => e.clientY),
  takeWhile(y => y < 110),
  takeUntil(mouseUp$),
  exhaustMap((y) => iif(
    () => y > 100,
    request$,
    of(y).pipe(tap(setRefresh))
  )),
  repeat()
).subscribe()
