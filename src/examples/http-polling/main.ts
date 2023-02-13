import { fromEvent, map, merge, switchMap, EMPTY, timer, scan, tap } from 'rxjs'
import { ajax } from 'rxjs/ajax'

const getCatUrl = () => {
  return `https://placekitten.com/g/${getRandom()}/${getRandom()}`
}
const getRandom = () => Math.floor((Math.random() * 400))
const MEATS_URL = "https://baconipsum.com/api/?type=meat-and-filler";
const getEle = (id: string) => document.getElementById(id)! as HTMLElement

const getCat = () => ajax<Blob>({
  crossDomain: true,
  url: getCatUrl(),
  withCredentials: false,
  responseType: 'blob'
}).pipe(
  map(res => res.response),
  switchMap(response => {
    return new Promise<string>((res, rej) => {
      const blob = new Blob([response], { type: "image/png" })
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        res(e.target!.result as string);
      }
      reader.onerror = (e) => {
        rej(e)
      }
      reader.readAsDataURL(blob)
    })
  })
)

const meat$ = ajax<string[]>({
  crossDomain: true,
  url: MEATS_URL,
  withCredentials: false,
}).pipe(map(res => res.response))

const catsCheckbox = getEle('catsCheckbox') as HTMLInputElement
const meatsCheckbox = getEle('meatsCheckbox') as HTMLInputElement
const start = getEle('start') as HTMLInputElement
const stop = getEle('stop') as HTMLInputElement
const cat = getEle('cat') as HTMLImageElement
const text = getEle('text') as HTMLParagraphElement
const status = getEle('polling-status') as HTMLSpanElement

const start$ = fromEvent(start, 'click')
const stop$ = fromEvent(stop, 'click')
const catsCheckbox$ = fromEvent<MouseEvent>(catsCheckbox, 'change').pipe(map(e => (<HTMLInputElement>e.target).value))
const meatsCheckbox$ = fromEvent<MouseEvent>(meatsCheckbox, 'change').pipe(map(e => (<HTMLInputElement>e.target).value))

catsCheckbox$.subscribe(() => {
  cat.style.display = 'inline-block'
  text.style.display = 'none'
})

start$.subscribe(() => status.innerHTML = 'Started!')
stop$.subscribe(() => status.innerHTML = 'Stoped!')

meatsCheckbox$.subscribe(() => {
  text.style.display = 'block'
  cat.style.display = 'none'
})

const poll$ = timer(1000, 3000)

let cate = 'cat'
merge(
  start$.pipe(map(() => ({ start: true }))),
  stop$.pipe(map(() => ({ start: false }))),
  catsCheckbox$.pipe(
    map(() => ({ cate: 'cat' })),
    tap(() => cate = 'cat'),
  ),
  meatsCheckbox$.pipe(
    map(() => ({ cate: 'meats' })),
    tap(() => cate = 'meats')
  ),
).pipe(
  scan((acc, cur) => ({ ...acc, ...cur }), ({ start: true, cate: 'cat' })),
  switchMap((state) => {
    if (state.start) {
      return poll$.pipe(switchMap(() => state.cate === 'cat' ? getCat() : meat$))
    }

    return EMPTY
  }),
).subscribe(v => {
  if (cate === 'cat') {
    cat.src = v as string
  }
  if (cate === 'meats') {
    text.innerHTML = (<string[]>v).join()
  }
})
