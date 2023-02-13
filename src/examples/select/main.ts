import { fromEvent, map, combineLatest } from 'rxjs'

const pet1 = document.getElementById('pet-1')!
const pet2 = document.getElementById('pet-2')!
const pet3 = document.getElementById('pet-3')!

const pet1$ = fromEvent(pet1, 'change')

const pet2$ = fromEvent(pet2, 'change')

const pet3$ = fromEvent(pet3, 'change')

combineLatest([pet1$, pet2$, pet3$]).pipe(
  map(events => events.map(e => (e.target as HTMLSelectElement).value))
).subscribe(console.log)
