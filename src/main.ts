import { ajax } from 'rxjs/ajax';
import { fromEvent, repeat, switchMap, timer, map, catchError, of, tap } from 'rxjs'

const start = document.getElementById('start')!
const start$ = fromEvent(start, 'click')

const heartbeat$ = ajax('/api/heatbeat').pipe(
  // map(userResponse => console.log('users: ', userResponse)),
  map(({ response }) => response),
  catchError(error => {
    console.log('error: ', error);
    return of(error);
  }),
  repeat({
    delay: () => timer(10000)
  })
);
 
const info$ = ajax({
  url: '/api/info',
  method: 'POST'
})

start$.pipe(
  switchMap(() => {
    return info$.pipe(
      tap(({ response }) => console.log(response)),
      switchMap(() => heartbeat$)
    )
  })
).subscribe(console.log)
