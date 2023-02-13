import { interval, share, scan, takeWhile, fromEvent, map, merge, repeat, filter, finalize } from 'rxjs'

const frame$ = interval(500).pipe(share())
const stage = document.getElementById('stage')! as HTMLDivElement

const randomLetter = () => String.fromCharCode(
  Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0)) + 'a'.charCodeAt(0));

const letter$ = frame$.pipe(
  map(() => 'letter')
)

const key$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  map(e => e.key),
)

const enter$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  filter(e => e.key === 'Enter')
)

const game$ = merge(key$, letter$).pipe(
  scan<'letter' | string, string[]>((acc, cur) => {
    if (cur === 'letter') {
      return [randomLetter(), ...acc]
    }
    const last = acc[acc.length - 1]
    if (last && last === cur) {
      acc.pop()
    }
    return acc
  }, []),
  takeWhile(letters => letters.length <= 15),
  finalize(() => {
    stage.innerHTML = '<div>Game Over!</div>'
  }),
  repeat({
    delay: () => enter$
  })
)

game$
.subscribe({
  next: (letters) => {
    const html = letters.map(l => `<div>${l}</div>`).join('')
    stage.innerHTML = html
  },
})
