import './style.css';

import { fromEvent, of, merge, EMPTY, concat, defer } from 'rxjs';
import { delay, map, mergeMap, tap, debounceTime, distinctUntilChanged, filter, share, switchAll } from 'rxjs/operators';

// track in progress saves
let savesInProgress = 0;

// references
const input = document.getElementById('note-input')!;
const saveIndicator = document.querySelector('.save-indicator')!;

// streams
const keyup$ = fromEvent(input, 'keyup');

// fake save request
const saveChanges = (value: string) => {
  console.log(value)
  return of(value).pipe(delay(1500))
};

/**
 * Trigger a save when the user stops typing for 200ms
 * After new data has been successfully saved, so a saved
 * and last updated indicator.
 */
const inputToSave$ = keyup$
  .pipe(
    debounceTime(200),
    map(e => (<HTMLTextAreaElement>e.target).value),
    distinctUntilChanged(),
    share()
  );

const savesInProgress$ = inputToSave$.pipe(
  map(() => of('Saving')),
  tap(_ => savesInProgress++)
);

const savesCompleted$ = inputToSave$.pipe(
   mergeMap(saveChanges),
   tap(_ => savesInProgress--),
   // ignore if additional saves are in progress
   filter(_ => !savesInProgress),
   map(() => concat(
    // display saved for 2s
    of('Saved!'),
    EMPTY.pipe(delay(2000)),
    // then last updated time, defer for proper time
    defer(() => of(`Last updated: ${new Date().toUTCString}`))
  ))
);

merge(
  savesInProgress$,
  savesCompleted$
).pipe(
  /*
   If new save comes in when our completion observable is running, we want to switch to it for a status update.
  */
  switchAll()
)
.subscribe(status => {
  saveIndicator.innerHTML = status;
});
  
  

