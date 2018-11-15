const test = require('tape');
const fromPromise = require('callbag-from-promise');
const fromIter = require('callbag-from-iter');
const takeUntil = require('.');

const newBagFromPromise = delay => fromPromise(new Promise(res => setTimeout(res, delay)));

test('it stops from a pullable source', function (t) {
  t.plan(5);
  const upwardsExpected = [
    [0, 'function'],
    [2, 'undefined']
  ];

  function makeSource() {
    let sink;
    let sent = 0;
    return function source(type, data) {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);

      if (type === 0) {
        sink = data;
        sink(0, source);
        return;
      }
      if (type !== 1) return;

      if (sent === 0) {
        sent++;
        setTimeout(() => sink(1, 10));
        return;
      } else if (sent === 1) {
        sent++;
        sink(2);
        return;
      }
    };
  }

  function makeSink() {
    let talkback;
    return (type, data) => {
      if (type === 0) {
        talkback = data;
        talkback(1);
        return;
      }
      if (type === 1) {
        talkback(1);
        return;
      }
    };
  }

  takeUntil(fromIter('A'))(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 50);
});

test('it stops an async listenable source', function (t) {
  t.plan(18);
  const upwardsExpected = [
    [0, 'function'],
    [2, 'undefined']
  ];
  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined']
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let sent = 0;
    let id;
    return function source(type, data) {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => {
          sink(1, ++sent * 10);
        }, 100);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
  }

  function sink(type, data) {
    const et = downwardsExpectedType.shift();
    t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
    t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
    if (type === 1) {
      const e = downwardsExpected.shift();
      t.equals(data, e, 'downwards data is expected: ' + e);
    }
  }

  takeUntil(newBagFromPromise(400))(makeSource())(0, sink);

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 500);
});

test('it returns a source that disposes upon upwards END (2)', function (t) {
  t.plan(16);
  const upwardsExpected = [
    [0, 'function'],
    [2, 'undefined']
  ];
  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let sent = 0;
    let id;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => {
          sink(1, ++sent * 10);
        }, 100);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
    return source;
  }

  function makeSink() {
    let talkback;
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        talkback = data;
      }
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.equals(data, e, 'downwards data is expected: ' + e);
      }
      downwardsExpected.length === 0 && talkback(2);
    };
  }

  takeUntil(newBagFromPromise(400))(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 400);
});

test('it notifies the sink about termination', function (t) {
  t.plan(18);
  const upwardsExpected = [
    [0, 'function'],
    [2, 'undefined']
  ];
  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined'],
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let sent = 0;
    let id;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => {
          sink(1, ++sent * 10);
        }, 100);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
    return source;
  }

  function makeSink() {
    let talkback;
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        talkback = data;
      }
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.equals(data, e, 'downwards data is expected: ' + e);
      }
    };
  }

  takeUntil(newBagFromPromise(350))(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 400);
});

test('it doesn\'t accept anything from the sink after being notified', function (t) {
  t.plan(15);
  const upwardsExpectedType = [
    [0, 'function'],
    [2, 'undefined']
  ];
  const downwardsExpectedType = [
    [0, 'function'],
    [2, 'undefined'],
  ];
  const notifierExpectedType = [
    [0, 'function'],
    [1, 'undefined'],
    [2, 'undefined'],
  ];

  function makeSource() {
    const source = (type, data) => {
      const e = upwardsExpectedType.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        sink(0, source);
      }
    };
    return source;
  }

  function makeSink() {
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        talkback = data;
        data(2);
      }
    };
  }

  function makeNotifierSource() {
    let sink;
    const notifier = (type, data) => {
      const e = notifierExpectedType.shift();
      t.equals(type, e[0], 'notifier type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'notifier data is expected: ' + e[1]);
      if (type === 0) {
        sink = data;
        sink(0, notifier);
      }
      if (type === 1) {
        sink(1, 'A');
      }
    }
    return notifier;
  }

  takeUntil(makeNotifierSource())(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 400);
});

test('completed notifier doesn\'t complete the source', function (t) {
  t.plan(17);
  const upwardsExpectedType = [
    [0, 'function'],
    [2, 'undefined']
  ];
  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
  ];
  const notifierExpectedType = [
    [0, 'function'],
    [1, 'undefined'],
  ];

  function makeSource() {
    let sent = 0;
    let id;
    return function source(type, data) {
      const e = upwardsExpectedType.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data type is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => {
          sink(1, ++sent * 10);
        }, 100);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
  }

  function makeSink() {
    let talkback
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);

      if (type === 0) {
        talkback = data;
        return;
      }

      if (!downwardsExpectedType.length) {
        talkback(2);
      }
    };
  }

  function makeNotifierSource() {
    let sink;
    const notifier = (type, data) => {
      const e = notifierExpectedType.shift();
      t.equals(type, e[0], 'notifier type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'notifier data is expected: ' + e[1]);
      if (type === 0) {
        sink = data;
        sink(0, notifier);
      }
      if (type === 1) {
        sink(2);
      }
    }
    return notifier;
  }

  takeUntil(makeNotifierSource())(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 400);
});

test('errored notifier should error the sink', function (t) {
  t.plan(13);
  const upwardsExpectedType = [
    [0, 'function'],
    [2, 'undefined']
  ];
  const downwardsExpectedType = [
    [0, 'function'],
    [2, 'string'],
  ];
  const notifierExpectedType = [
    [0, 'function'],
    [1, 'undefined'],
  ];

  function makeSource() {
    let sent = 0;
    let id;
    return function source(type, data) {
      const e = upwardsExpectedType.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data type is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => {
          sink(1, ++sent * 10);
        }, 100);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
  }

  function makeSink() {
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
    };
  }

  function makeNotifierSource() {
    let sink;
    const notifier = (type, data) => {
      const e = notifierExpectedType.shift();
      t.equals(type, e[0], 'notifier type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'notifier data is expected: ' + e[1]);
      if (type === 0) {
        sink = data;
        sink(0, notifier);
      }
      if (type === 1) {
        sink(2, 'test err');
      }
    }
    return notifier;
  }

  takeUntil(makeNotifierSource())(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 400);
});
