import { animationFrameScheduler, interval } from 'rxjs';
import { map, concatMap, takeWhile } from 'rxjs/operators';

export default function timers$(time, pause) {
  return interval(0, animationFrameScheduler).pipe(
    concatMap(part => {
      const startTime = animationFrameScheduler.now();
      return interval(0, animationFrameScheduler).pipe(
        map(_ => {
          const t = animationFrameScheduler.now() - startTime;
          return { 
            part,
            progress: Math.min(t / time, 1.0),
            pause: Math.max(0.0, Math.min((t - time) / pause, 1.0)),
          };
        }),
        takeWhile(d => d.pause < 1.0)
      );
    }),
  );
}
