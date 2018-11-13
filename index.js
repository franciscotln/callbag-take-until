const takeUntil = sSrc => src => (start, sink) => {
  if (start !== 0) return;
  let sourceTalkback, sTalkback;
  let inited = false;
  let done = false;

  src(0, (t, d) => {
    if (t === 0) {
      sourceTalkback = d;

      sSrc(0, (st, sd) => {
        if (st === 0) {
          sTalkback = sd;
          sTalkback(1);
          return
        }
        done = true;
        sTalkback(2);
        sourceTalkback(2);
        inited && sink(2);
      });

      inited = true;

      sink(0, (st, sd) => {
        if (done) return;
        st === 2 && sTalkback(2);
        sourceTalkback(st, sd);
      });

      done && sink(2);
      return;
    }

    t === 2 && sTalkback(2);
    sink(t, d);
  });
};

export default takeUntil;
