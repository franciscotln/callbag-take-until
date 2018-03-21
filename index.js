const takeUntil = sSrc => src => (start, sink) => {
  let talkback, sTalkback;
  let done = false;
  start === 0 && src(start, (t, d) => {
    if (t === start) {
      talkback = d;
    }
    sSrc(start, (st, sd) => {
      if (st === start) {
        sTalkback = sd;
        sTalkback(1);
      } else if (st === 1) {
        talkback(2);
        sTalkback(2);
        done = true;
      }
      !done && sink(t, d);
    });
  });
};

module.exports = takeUntil;