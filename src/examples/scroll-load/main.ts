import { pairwise, fromEvent, map, filter, tap, startWith, exhaustMap } from 'rxjs'
import { ajax } from 'rxjs/ajax'

const loadingEle = document.getElementById('loading')!
const scrollEle = document.getElementById('content')! as HTMLUListElement
const scroll$ = fromEvent(scrollEle, 'scroll')


let currentPage = 1
const getApi = () => 'https://node-hnapi.herokuapp.com/news?page=' + currentPage; 

const updateLoading = (status: string) => {
  loadingEle.innerHTML = status
}

const renderNews = (news: any[]) => {
  news.forEach(n => {
    const li = document.createElement('li');
    li.innerHTML = `${n.id} - ${n.title}`;
    scrollEle.appendChild(li);
  })
};

interface ScrollData {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

const isExpectPosition = (pos: ScrollData) => {
  return (pos.clientHeight + pos.scrollTop) / pos.scrollHeight > .7
}

const scrollDown$ = scroll$.pipe(
  map<Event, ScrollData>(e => ({
    scrollTop: (<HTMLUListElement>e.target).scrollTop,
    scrollHeight: (<HTMLUListElement>e.target).scrollHeight,
    clientHeight: (<HTMLUListElement>e.target).clientHeight
  })),
  pairwise(),
  filter(([pre, cur]) => {
    return (cur.scrollTop > pre.scrollTop) && isExpectPosition(cur)
  }),
)

scrollDown$.pipe(
  startWith([]),
  tap(() => updateLoading('loading')),
  exhaustMap(() => ajax.getJSON(getApi())),
  tap(() => {
    currentPage += 1
    updateLoading('completed')
  }),
).subscribe(news => {
  renderNews(news as any[])
})