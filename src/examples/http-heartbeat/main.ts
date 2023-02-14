import { ajax } from 'rxjs/ajax';
import { fromEvent, repeat, switchMap, timer, of, tap, throwError, retry, EMPTY, last, take, finalize } from 'rxjs'

const start = document.getElementById('start') as HTMLButtonElement
const logEle = document.getElementById('log')!
const start$ = fromEvent(start, 'click')

type BaseResponse<T> = {
  code: number
  data: T
}

type HeartbeatResponse = BaseResponse<boolean>
type InfoResponse = BaseResponse<{ name: string } | null>

const log = (msg: string) => {
  const p = document.createElement('p')
  p.innerText = msg
  logEle.appendChild(p)

  return {
    update: (updateMsg: string) => {
      p.innerText = updateMsg
    },
    remove: () => p.remove()
  }
}

let heartbeatErrorCount = 0
const heartbeat$ = ajax<HeartbeatResponse>('/api/heatbeat').pipe(
  switchMap(({ response }) => {
    if (response.code === 0) {
      return of(response.data)
    }

    return throwError(() => new Error())
  }),
  tap({
    error: () => {
      heartbeatErrorCount += 1
      log(`心跳错误 ${heartbeatErrorCount} 次`)
    }
  }),
  retry({
    delay: () => timer(3000)
  }),
  repeat({
    delay: () => timer(3000)
  })
);

const info$ = ajax<InfoResponse>({
  url: '/api/info',
  method: 'POST'
}).pipe(
  switchMap(({ response }) => {
    if (response.code === 0) {
      return of(response.data)
    }

    return throwError(() => new Error())
  }),
  retry({
    delay: (_, retryCount) => {
      const msg = log(`接口调用错误, 5s 后自动重试! 重试次数: ${retryCount}`)
      const countDown$ = of({}).pipe(
        switchMap(() => {
          return timer(0, 1000).pipe(
            tap((v) => msg.update(`接口调用错误, ${5 - v}s 后自动重试! 重试次数: ${retryCount}`)),
            take(6),
            last(),
            finalize(() => msg.remove())
          )
        })
      )

      return retryCount > 3 ? EMPTY : countDown$
    }
  }),
)

start$.pipe(
  tap(() => {
    start.disabled = true
  }),
  switchMap(() => {
    return info$.pipe(
      switchMap(() => heartbeat$)
    )
  }),
  finalize(() => {
    start.disabled = false
  })
).subscribe()

// of({}).pipe(
//   switchMap(() => throwError(() => new Error())),
//   tap({
//     error() {
//       console.log('tap error')
//     },
//     next(value) {
//       console.log('tap next')
//     },
//     complete() {
//       console.log('tap complete')
//     },
//   }),
//   retry({
//     delay: () => timer(1000, 5)
//   }),
// ).subscribe({
//   error() {
//     console.log('error')
//   },
//   next(value) {
//     console.log('next')
//   },
//   complete() {
//     console.log('complete')
//   },
// })
