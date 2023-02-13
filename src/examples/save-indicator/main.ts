import { defer, filter, fromEvent, map, tap, distinctUntilChanged, debounceTime, share, switchMap, of, delay, mergeMap, concat, EMPTY, merge, switchAll, mergeAll } from 'rxjs'

/**
 * saving
 * saved
 * lastUpdated
*/
const textarea = document.getElementById('note-input')! as HTMLTextAreaElement
const indicator = document.getElementById('save-indicator')! as HTMLDivElement

let saving = false

const keyup$ = fromEvent(textarea, 'keyup')

const saveApi = (val: string) => {
  return of(val).pipe(delay(1500))
}

const inputToSave$ = keyup$.pipe(
  debounceTime(200),
  map(e => (<HTMLTextAreaElement>e.target).value),
  distinctUntilChanged(),
  share(),
)

const savesInProgress$ = inputToSave$.pipe(
  map(() => of('Saving!')),
  tap(() => saving = true)
)

const savesCompleted$ = inputToSave$.pipe(
  switchMap(saveApi),
  tap(() => saving = false),
  filter(() => !saving),
  map(() => concat(
    of('Saved!'),
    EMPTY.pipe(delay(2000)),
    defer(() => of(`Last Update: ${new Date().toUTCString()}`))
  )),
)

merge(
  savesInProgress$,
  savesCompleted$
).pipe(
  switchAll()
).subscribe(status => {
  indicator.innerHTML = status;
});