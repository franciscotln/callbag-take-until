# callbag-take-until

Emits the values emitted by the source Callbag until a notifier Callbag emits a value.
Works on either pullable or listenable sources.

`npm install callbag-take-until`

## Examples

### Listenables

Drag and drop:
[Demo Here](https://codesandbox.io/s/zwjnjnn25p)

```js
import forEach from 'callbag-for-each';
import fromEvent from 'callbag-from-event';
import map from 'callbag-map';
import pipe from 'callbag-pipe';
import switchMap from 'callbag-switch-map';
import takeUntil from 'callbag-take-until';

const getCoords = downEvt => moveEvt => {
  moveEvt.preventDefault();
  return {
    left: moveEvt.clientX - downEvt.offsetX,
    top: moveEvt.clientY - downEvt.offsetY
  };
};

const ball = document.querySelector('.drag-ball');
const mouseDown$ = fromEvent(ball, 'mousedown');
const mouseUp$ = fromEvent(ball, 'mouseup');
const mouseMove$ = fromEvent(document, 'mousemove');

pipe(
  mouseDown$,
  switchMap(downEvt =>
    pipe(
      mouseMove$,
      map(getCoords(downEvt)),
      takeUntil(mouseUp$)
    )
  ),
  forEach(({ left, top }) => {
    ball.style.left = `${left}px`;
    ball.style.top = `${top}px`;
  })
);
```

### Pullables

Immediatelly "unsubscribe" from the source:

```js
const forEach = require('callbag-for-each');
const fromIter = require('callbag-from-iter');
const pipe = require('callbag-pipe');
const takeUntil = require('callbag-take-until');

pipe(
  fromIter([1, 2, 3]),
  takeUntil(fromIter([0])),
  forEach((x) => {
    console.log(x); // void (immediately stops pulling)
  })
);
```