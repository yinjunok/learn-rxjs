const getEle = (id: string) => document.getElementById(id)

export const timer = getEle('timer')
export const dot = getEle('dot')

const random = () => Math.random() * 300

export const updateDot = (score: number) => {
  dot!.innerHTML = `${score}`
  setDotSize(5)
  dot!.style.transform = `translate3d(${random()}px, ${random()}px, 0)`
}

export const setTimerText = (txt: string | number) => {
  timer!.innerHTML = `${txt}`
}

export const setDotSize = (size: number) => {
  dot!.style.width = `${size}px`
  dot!.style.height = `${size}px`
}
