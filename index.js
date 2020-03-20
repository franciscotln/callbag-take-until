const UNIQUE = {};

const takeUntil = notifier => source => (start, sink) => {
  if (start !== 0) return;
  let sourceTalkback;
  let notifierTalkback;
  let inited = false;
  let done = UNIQUE;

  source(0, (type, data) => {
    if (type === 0) {
      sourceTalkback = data;

      notifier(0, (t, d) => {
        if (t === 0) {
          notifierTalkback = d;
          notifierTalkback(1);
          return;
        }
        if (t === 1) {
          done = void 0;
          notifierTalkback(2);
          sourceTalkback(2);
          if (inited) sink(2);
          return;
        }
        if (t === 2) {
          notifierTalkback = null;
          if (d != null) {
            done = d;
            sourceTalkback(2);
            if (inited) sink(t, d);
          }
        }
      });

      inited = true;

      sink(0, (t, d) => {
        if (done !== UNIQUE) return;
        if (t === 2 && notifierTalkback) notifierTalkback(2);
        sourceTalkback(t, d);
      });

      if (done !== UNIQUE) sink(2, done);
      return;
    }

    if (type === 2 && notifierTalkback) notifierTalkback(2);
    sink(type, data);
  });
};

export default takeUntil;
