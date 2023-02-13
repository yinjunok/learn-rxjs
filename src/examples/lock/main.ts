import { map, sequenceEqual, from, repeat, finalize, fromEvent, filter, tap, scan, takeWhile, switchMap } from 'rxjs'

const grid = document.getElementById('grid')!

const updateInput = (arr: number[]) => {
  const input = document.getElementById('input')!
  input.innerHTML = `${arr.join(', ')}`
}

const password$ = from([1, 1, 1, 1])

fromEvent<MouseEvent>(grid, 'click').pipe(
  tap(e => e.stopPropagation()),
  filter(e => e.target !== grid),
  map(e => {
    const num = (e.target as HTMLDivElement).dataset.number!
    return parseInt(num, 10)
  }),
  scan<number, number[]>((acc, cur) => [...acc, cur], []),
  tap(updateInput),
  switchMap(arr => from(arr).pipe(sequenceEqual(password$))),
  takeWhile((v) => !v),
  finalize(() => updateInput([])),
  repeat()
).subscribe(console.log)
