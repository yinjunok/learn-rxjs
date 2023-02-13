import { of, timestamp, map, switchMap, interval, repeat, takeWhile } from 'rxjs'

const interval$ = interval(4)

const dot = document.getElementById('dot')!
const progress = document.getElementById('progress') !

of({}).pipe(
  timestamp(),
  map(v => v.timestamp),
  switchMap((time) => interval$.pipe(
    timestamp(),
    map(v => ({ cur: v.timestamp, start: time })
  ))),
  takeWhile(val => val.cur - val.start < 4000),
  map(val => (val.cur - val.start) / 4000),
  repeat()
).subscribe(v => {
  const totalLeft = progress.clientWidth - dot.clientWidth
  dot.style.transform = `translate3d(${totalLeft * v}px, 0, 0)`
})
