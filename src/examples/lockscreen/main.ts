console.clear();
/*
  Use mouse to 'swipe' across the lock pad (hold mouse button and swipe :) ).
  Pad will turn green if password is correct or red if password is incorrect.
  You can set password to whatever sequence you like.
*/
import { from, fromEvent, Subject, merge, pipe } from 'rxjs';
import { switchMap, takeUntil, repeat, tap, map, throttleTime, distinctUntilChanged, filter, toArray, sequenceEqual, pluck } from 'rxjs/operators';
import { displaySelectedNumbersSoFar, markTouchedPad, pads, resetPasswordPad, setResult } from './dom-updater';

const sub = new Subject();
const expectedPasswordUpdate$ = fromEvent(document.getElementById('expectedPassword'), 'keyup')
  .pipe(
    map((e: any) => e.target.value),
    tap(pass => sub.next(pass.split('').map(e => parseInt(e))))
  );
let expectedPassword = [1, 2, 5, 2];
const expectedPassword$ = sub.pipe(tap((v: any) => expectedPassword = v));

const takeMouseSwipe = pipe(
  // take mouse moves
  switchMap(_ => fromEvent(document, 'mousemove')),
  // once mouse is up, we end swipe
  takeUntil(fromEvent(document, 'mouseup')),
  throttleTime(50)
);
const checkIfPasswordMatch = password => from(password).pipe(sequenceEqual(from(expectedPassword)));
const getXYCoordsOfMousePosition = ({ clientX, clientY }: MouseEvent) => ({ x: clientX, y: clientY });
const findSelectedPad = v => pads.find(r =>
  v.x > r.left &&
  v.x < r.right &&
  v.y > r.top &&
  v.y < r.bottom);
const getIdOfSelectedPad = pipe(
  filter(v => !!v),
  pluck('id'),
  distinctUntilChanged()
);

const actualPassword$ = fromEvent(document, 'mousedown')
  .pipe(
    // new stream so reset password pad and take swipe until mouse up
    tap(resetPasswordPad),
    takeMouseSwipe,
    // as we swipe, we mark pads as touchedand and display selected numbers
    map(getXYCoordsOfMousePosition),
    map(findSelectedPad),
    getIdOfSelectedPad,
    tap(markTouchedPad),
    tap(displaySelectedNumbersSoFar),
    // we need an array of numbers from current swipe which we can pass to checkIfPasswordMatch
    toArray(),
    // on mouse up (swipe end), switchMap to new stream to check if password match
    switchMap(checkIfPasswordMatch),
    tap(setResult),
    // takeUntil inside takeMouseSwipe terminated stream so we repeat from beginning (mousedown) 
    repeat()
  )

merge(
  expectedPassword$,
  expectedPasswordUpdate$,
  actualPassword$
).subscribe();