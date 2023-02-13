import { Observable, of, fromEvent, from, merge, timer } from 'rxjs';
import { map, switchMap, tap, mergeMap, takeUntil, filter, finalize } from 'rxjs/operators';

declare type RequestCategory = 'cats' | 'meats';

// Constants for Cat Requests
const CATS_URL = "https://placekitten.com/g/{w}/{h}";
function mapCats(response: any): Observable<string> {
  return from(new Promise((resolve) => {
    var blob = new Blob([response], { type: "image/png" });
    let reader = new FileReader();
    reader.onload = (data: any) => {
      resolve(data.target.result);
    };
    reader.readAsDataURL(blob);
  }));
}

// Constants for Meat Requests
const MEATS_URL = "https://baconipsum.com/api/?type=meat-and-filler";
function mapMeats(response: any): Observable<string> {
  const parsedData = JSON.parse(response);
  return of(parsedData ? parsedData[0] : '');
}

/*************************
 * Our Operating State
 *************************/
// Which type of data we are requesting
let requestCategory: RequestCategory = 'cats';
/*************************/

/**
 * This function will make an AJAX request to the given Url, map the 
 * JSON parsed repsonse with the provided mapper function, and emit
 * the result onto the returned observable.
 */
function requestData(url: string, mapFunc: (any) => Observable<string>): Observable<string> {
  const xhr = new XMLHttpRequest();
  return from(new Promise<string>((resolve) => {

    // This is generating a random size for a placekitten image
    // so that we get new cats each request.
    const w = Math.round(Math.random() * 400);
    const h = Math.round(Math.random() * 400);
    const targetUrl = url
      .replace('{w}', w.toString())
      .replace('{h}', h.toString());

    xhr.addEventListener("load", () => {
      resolve(xhr.response);
    });
    xhr.open("GET", targetUrl);
    if (requestCategory === 'cats') {
      // Our cats urls return binary payloads
      //  so we need to respond as such.
      xhr.responseType = "arraybuffer";
    }
    xhr.send();
  }))
    .pipe(
      switchMap((data) => mapFunc(xhr.response)),
      tap((data) => console.log('Request result: ', data))
    );
}


/**
 * This function will begin our polling for the given state, and
 * on the provided interval (defaulting to 5 seconds)
 */
function startPolling(category: RequestCategory, interval: number = 5000): Observable<string> {
  const url = category === 'cats' ? CATS_URL : MEATS_URL;
  const mapper = category === 'cats' ? mapCats : mapMeats;

  return timer(0, interval)
    .pipe(
      switchMap(_ => requestData(url, mapper))
    );
}

// Gather our DOM Elements to wire up events
const startButton = document.getElementById('start')!;
const stopButton = document.getElementById('stop')!;
const text = document.getElementById('text')!;
const pollingStatus = document.getElementById('polling-status')!;
const catsRadio = document.getElementById('catsCheckbox')!;
const meatsRadio = document.getElementById('meatsCheckbox')!;
const catsClick$ = fromEvent(catsRadio, 'click').pipe(map(() => 'cats'));
const meatsClick$ = fromEvent(meatsRadio, 'click').pipe(map(() => 'meats'));
const catImage: HTMLImageElement = <HTMLImageElement>document.getElementById('cat');
// Stop polling
let stopPolling$ = fromEvent(stopButton, 'click');

function updateDom(result) {
  if (requestCategory === 'cats') {
    catImage.src = result;
    console.log(catImage);
  } else {
    text.innerHTML = result;
  }
}

function watchForData(category: RequestCategory) {
  // Start  new Poll
  return startPolling(category, 5000).pipe(
    tap(updateDom),
    takeUntil(
      // stop polling on either button click or change of categories
      merge(
        stopPolling$,
        merge(catsClick$, meatsClick$).pipe(filter(c => c !== category))
      )
    ),
    // for demo purposes only
    finalize(() => pollingStatus.innerHTML = 'Stopped')
  )
}

// Handle Form Updates
catsClick$
  .subscribe((category: RequestCategory) => {
    requestCategory = category;
    catImage.style.display = 'block';
    text.style.display = 'none';
  });

meatsClick$
  .subscribe((category: RequestCategory) => {
    requestCategory = category;
    catImage.style.display = 'none';
    text.style.display = 'block';
  });

// Start Polling
fromEvent(startButton, 'click')
  .pipe(
    // for demo purposes only
    tap(_ => pollingStatus.innerHTML = 'Started'),
    mergeMap(_ => watchForData(requestCategory))
  )
  .subscribe();



