import { Source } from 'callbag'

export default function takeUntil<I>(
    notifier: Source<any>,
): (source: Source<I>) => Source<I>
