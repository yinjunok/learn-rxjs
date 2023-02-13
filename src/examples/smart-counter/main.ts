import { map, fromEvent, pluck, filter, interval, scan, takeWhile, switchMap, tap, startWith } from 'rxjs'

const range = document.getElementById('range')! as HTMLInputElement
const display = document.getElementById('display')!

const enter$ = fromEvent(range, 'keyup').pipe(
  pluck('code'),
  filter(code => code === 'Enter')
)

const setDisplay = (val: number) => {
  display.innerHTML = `${val}`
}

const increOrDecre = (endNumber: number) => {
  return endNumber > currentNumber ? 1 : -1
}

let currentNumber = 0

enter$.pipe(
  map(() => parseInt(range.value, 10)),
  switchMap(endNumber => {
    return interval(20).pipe(
      map(() => increOrDecre(endNumber)),
      startWith(currentNumber),
      scan((acc, cur) => acc + cur),
      takeWhile((v) => v !== endNumber)
    )
  }),
  tap(v => currentNumber = v)
).subscribe(v => setDisplay(v))