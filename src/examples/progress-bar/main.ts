import { Observable, of, fromEvent, from } from 'rxjs';
import {
  delay,
  switchMap,
  concatAll,
  count,
  scan,
  withLatestFrom,
  share
} from 'rxjs/operators';

const requestOne = of('first').pipe(delay(500));
const requestTwo = of('second').pipe(delay(800));
const requestThree = of('third').pipe(delay(1100));
const requestFour = of('fourth').pipe(delay(1400));
const requestFive = of('fifth').pipe(delay(1700));

const loadButton = document.getElementById('load')!;
const progressBar = document.getElementById('progress')!;
const content = document.getElementById('data')!;

const updateProgress = (ratio: number) => {
  progressBar.style.width = `${100 * ratio}%`
  if (ratio === 1) {
    progressBar.classList.add('finished')
  } else {
    progressBar.classList.remove('finished')
  }
}

const updateContent = (con: string) => {
  content.innerHTML += con
}

const displayData = (data: any) => {
  updateContent(`<div class="content-item">${data}</div>`);
};

const observables: Array<Observable<string>> = [
  requestOne,
  requestTwo,
  requestThree,
  requestFour,
  requestFive
];

const click$ = fromEvent(loadButton, 'click')
const array$ = from(observables)
const request$ = array$.pipe(concatAll())
const progress$ = click$.pipe(switchMap(() => request$), share())

const count$ = array$.pipe(count())
const ratio$ = progress$.pipe(
  scan((acc) => acc + 1, 0),
  withLatestFrom(count$, (cur, total) => cur / total)
)

progress$.subscribe(updateContent)
click$.pipe(switchMap(() => ratio$)).subscribe(displayData)
