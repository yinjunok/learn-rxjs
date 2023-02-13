import { fromEvent, map, tap, throttleTime } from 'rxjs'

const indicator = document.getElementById('indicator')

const calcPercent = () => {
  const doc = document.documentElement;
  // https://www.w3schools.com/howto/howto_js_scroll_indicator.asp
  const winScroll = doc.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;

  return (winScroll / height) * 100;
}

fromEvent(document, 'scroll').pipe(
  throttleTime(10),
  map(() => calcPercent()),
  tap(percent => indicator!.style.width = `${percent}%`)
).subscribe()