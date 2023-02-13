import { fromEvent, timeInterval, takeWhile, repeat, scan, tap, finalize, TimeInterval } from 'rxjs'
import { render, clear } from './utils'

interface State {
  score: number;
  interval: number;
  threshold: number;
}

const initState: State = {
  score: 0,
  interval: 0,
  threshold: 300
}

fromEvent(document, 'click').pipe(
  timeInterval(),
  scan<TimeInterval<Event>, State>((state, timeInterval) => ({
    score: state.score + 1,
    interval: timeInterval.interval,
    threshold: state.threshold - 2
  }), initState),
  takeWhile(state => state.interval < state.threshold),
  tap(state => render(state.score, Math.floor(state.score / 10))),
  finalize(clear),
  repeat()
).subscribe()
