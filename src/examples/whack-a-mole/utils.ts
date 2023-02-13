export const createMole = () => {
  const div = document.createElement('div')
  div.classList.add('mole')
  const left = (window.innerWidth - 80) * Math.random()
  const top = (window.innerHeight - 80) * Math.random()
  div.style.top = `${top}px`
  div.style.left = `${left}px`
  document.body.appendChild(div)
  return div
}

export const updateCountDown = (time: number) => {
  const countDown = document.getElementById('countDown')!
  countDown.innerHTML = `倒计时: ${time}`
}

export const updateScore = (score: number) => {
  const scoreEle = document.getElementById('score')!
  scoreEle.innerHTML = `分数: ${score}`
}
