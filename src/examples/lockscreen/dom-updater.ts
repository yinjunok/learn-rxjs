const createPadObject = (id, rectange) => ({
  id: id,
  left: rectange.left,
  right: rectange.right,
  top: rectange.top,
  bottom: rectange.bottom
});

const setResultText = text => document.getElementById('result').innerText = text;

const setPasswordPads = color => Array.from(document
  .querySelectorAll('.cell'))
  .forEach((v: HTMLElement) => v.style.background = color)

const getPad = id => document.getElementById(`c${id}`);

export const pads = Array
  .from({ length: 9 }, (_, n) => n + 1)
  .map(v => createPadObject(v, getPad(v).getBoundingClientRect()));

export const markTouchedPad = v => {
  const pad = getPad(v);
  pad.style.background = 'lightgrey';
  if (!pad.animate) return; //animate does not work in IE
  const animation: any = [
    { transform: 'scale(0.9)' },
    { transform: 'scale(1)' }
  ];
  const animationOptions = {
    duration: 300,
    iterations: 1
  };
  pad.animate(animation, animationOptions);
  document.getSelection().removeAllRanges();
};

export const setResult = result => {
  setPasswordPads(result ? 'MediumSeaGreen' : 'IndianRed');
  setResultText('Password ' + (result ? 'matches :)' : 'does not match :('));
}

export const displaySelectedNumbersSoFar = v =>
  document.getElementById('result').textContent += v;

export const resetPasswordPad = () => {
  setResultText('');
  setPasswordPads('gray');
}