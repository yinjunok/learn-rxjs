import { fromEvent, interval, map, tap, scan, switchMap, takeWhile, startWith } from 'rxjs'
import { dot, setTimerText, updateDot, setDotSize } from './utils'

interface State {
  score: number
  intrvl: number
}

const gameState: State = {
  score: 0,
  intrvl: 500,
}

fromEvent(dot!, 'mouseover').pipe(
  scan<Event, State>((acc: State, _, i) => ({
    score: acc.score += 1,
    intrvl: i % 3 === 0 ? acc.intrvl - 50 : acc.intrvl
  }), gameState),
  tap(state => updateDot(state.score)),
  switchMap((state) => interval(state.intrvl)),
  map(time => 5 - time),
  tap(() => setDotSize(30)),
  tap((time) => setTimerText(time)),
  takeWhile(time => time > 0),
).subscribe()