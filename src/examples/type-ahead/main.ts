import { fromEvent, map, tap, of, delay, switchMap, debounceTime, distinctUntilChanged } from 'rxjs'

const getContents = (keyword: string) => [
  'africa',
  'antarctica',
  'asia',
  'australia',
  'europe',
  'north america',
  'south america'
].filter(word => word.includes(keyword.toLowerCase()))

const searchBox = document.getElementById('search')!
const content = document.getElementById('content')!

const fakeRequest = (keyword: string) => {
  return of(getContents(keyword))
}

fromEvent(searchBox, 'input').pipe(
  debounceTime(200),
  map(e => (<HTMLInputElement>e.target).value),
  distinctUntilChanged(),
  switchMap(fakeRequest),
  tap((vals) => {
    const template = vals.map(v => `<p>${v}</p>`).join('');
    content.innerHTML = template
  })
).subscribe(console.log)