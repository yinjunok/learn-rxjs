const texts = [
  'click, click',
  'keep clicking',
  'wow',
  'not tired yet?!',
  'click master!',
  'inhuman!!!',
  'ininhuman!!!'
];

const container = document.getElementById('container')

const text = (score: number, level: number) => `${texts[level]} \n ${score}`;

export const render = (score: number, level: number) => {
  const id = 'level' + level;
  const element = document.getElementById(id);
  const innerText = text(score, level);
  if (element) {
    element.innerText = innerText;
  } else {
    const elem = document.createElement('div');
    elem.id = id;
    elem.classList.add('card')
    elem.style.zIndex = `${level}`;
    
    const position = level * 20;
    elem.style.top = position + 'px';
    elem.style.left = position + 'px';
    const col = 100 + position;
    elem.style.background = `rgb(0,${col},0)`;
    elem.innerText = innerText;
    container!.appendChild(elem);
  }
};

export const clear = () => (container!.innerText = '');