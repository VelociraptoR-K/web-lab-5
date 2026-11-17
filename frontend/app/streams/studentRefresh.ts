import { filter, fromEvent, interval, map, merge } from 'rxjs';
import { studentChanges$ } from './studentChanges';

export function createStudentRefreshStream(refreshMs: number, canRefresh: () => boolean) {
    const timer$ = interval(refreshMs);
    const visibility$ = fromEvent(document, 'visibilitychange');

    return merge(timer$, studentChanges$, visibility$).pipe(
        filter(() => !document.hidden && canRefresh()),
        map(() => undefined),
    );
}
