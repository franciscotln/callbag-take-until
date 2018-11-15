const UNIQUE = {};

const takeUntil = sSrc => src => (start, sink) => {
  if (start !== 0) return;
  let sourceTalkback, sTalkback;
  let inited = false;
  let done = UNIQUE;

  src(0, (t, d) => {
    if (t === 0) {
      sourceTalkback = d;

      sSrc(0, (st, sd) => {
        if (st === 0) {
          sTalkback = sd;
          sTalkback(1);
          return
        }
        if (st === 1) {
          done = undefined;
          sTalkback(2);
          sourceTalkback(2);
          inited && sink(2);
          return;
        }
        if (st === 2) {
          sTalkback = null;

          if (sd) {
            done = sd;
            sourceTalkback(2);
            inited && sink(st, sd);
          }
          return
        }
      });

      inited = true;

      sink(0, (st, sd) => {
        if (done !== UNIQUE) return;
        st === 2 && sTalkback && sTalkback(2);
        sourceTalkback(st, sd);
      });

      done !== UNIQUE && sink(2, done);
      return;
    }

    t === 2 && sTalkback(2);
    sink(t, d);
  });
};

export default takeUntil;
