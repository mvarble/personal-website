import React from 'react';
import { interval, animationFrameScheduler } from 'rxjs';
import { map, filter, pairwise, scan } from 'rxjs/operators';
import fp from 'lodash/fp';

import samData from './sam.svg';
import ericData from './eric.svg';
import logString from './log.txt';
import SVGElement from '../../src/components/svg-element';

const pause = 200;
let animationMarkers = logString.split('\n').slice(0, -1).reduce(
  ({ sam: oSam, eric: oEric, queue: oQueue }, str) => {
    // parse the line
    let [typeNum, time] = str.split(':');
    const type = typeNum.split(' ')[0];
    time = parseInt(time);

    // update the rat lists
    let sam;
    if (type === 'GRAB') {
      sam = [...oSam, { type, time: time - pause }, { type: 'RETURN', time }];
    } else if (type === 'QUEUE') {
      sam = [...oSam, { type, time }, { type: 'LEAVE', time: time + pause }];
    } else {
      sam = oSam;
    }
    let eric;
    if (type === 'EAT') {
      eric = [...oEric, { type, time: time - pause }, { type: 'RETURN', time }];
    } else if (type === 'DEQUEUE') {
      eric = [...oEric, { type, time }, { type: 'LEAVE', time: time + pause }];
    } else {
      eric = oEric;
    }

    // update the count
    const queue = (
      (type === 'QUEUE' || type === 'DEQUEUE')
      ? [...oQueue, time]
      : oQueue
    );

    // if the count is ever 2
    return { sam, eric, queue };
  },
  { sam: [{ type: 'LEAVE', time: pause }], eric: [], queue: [] },
);
animationMarkers = {
  sam: [
    ...animationMarkers.sam.slice(0, -1),
    { type: 'END', time: animationMarkers.sam.at(-2).time },
  ],
  eric: [
    ...animationMarkers.eric,
    { type: 'END', time: animationMarkers.eric.at(-1).time },
  ],
  queue: animationMarkers.queue.flatMap((t, i, arr) => (
    (i % 2 === 0) && arr[i+1] !== t
    ? [t, arr[i+1]]
    : []
  )),
};

function Rat({ flip, x, hasItem, rotateRate, rotateScale, data }) {
  const scale = 0.2;
  const r = React.useMemo(() => Math.random(), []);
  return (
    <g 
      transform={ 
        `scale(${flip * scale} ${scale}) 
        translate(${flip * x} 0) 
        rotate(${rotateScale * Math.sin(rotateRate * x + r * Math.PI * 2)})` 
      }
      style={{ transformOrigin: "20% 35%" }}>
      <SVGElement data={ data } />
      { hasItem ? <circle cx={ 100 } cy={ 20 } r={ 2 / scale } fill="var(--info)"/> : null }
    </g>
  );
}

function Sam(props) {
  return <Rat { ...props } data={ samData } />;
}

function Eric(props) {
  return <Rat { ...props } data={ ericData } />;
}

export default function QueueAnimation() {
  // create a ref that ensures the size of the svg matches up
  const ratio = 0.2;
  const ref = React.useRef();
  const [height, setHeight] = React.useState(100);
  React.useEffect(() => {
    if (!ref.current) return;
    setHeight(ref.current.clientWidth * ratio);
    const listener = () => setHeight(ref.current.clientWidth * ratio);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [ref, setHeight, ratio]);

  // encode the virtual dimensions
  const vWidth = 100;
  const vHeight = vWidth * ratio;
  const D = 50;

  // this is a state tree of the animation
  const initAnimationState = React.useMemo(() => ({ 
    sam: { 
      index: 0, 
      x: 0,
      flip: 1,
      hasItem: false,
    }, 
    eric: { 
      index: 0,
      x: 0,
      flip: -1,
      hasItem: false,
    }, 
    time: 0,
    queueIndex: 0,
    queue: false,
    items: true,
  }), [D]);
  const [animationState, setAnimationState] = React.useState(initAnimationState);

  // subscribe the state of the rats to a timer
  React.useEffect(() => {
    // create an observable that runs the clock
    const dt$ = interval(0, animationFrameScheduler).pipe(
      map(() => (new Date()).getTime()),
      pairwise(),
      map(([t0, t1]) => t1 - t0),
      filter(x => x > 12),
    );

    // map the clock to an animation state observable
    const animation$ = dt$.pipe(
      scan(
        (state, dt) => {
          // unpack the state
          const {
            sam,
            eric,
            time: oldTime,
            queueIndex: oldQueueIndex,
          } = state;

          // create a cycle
          if (oldTime > animationMarkers.eric.at(-1).time + 5 * pause) {
            return initAnimationState;
          }

          // otherwise, update clock
          const time = oldTime + dt;

          // get the state of the animation from the clock
          const si = (
            animationMarkers.sam[sam.index].time >= time
            ? sam.index
            : Math.min(sam.index + 1, animationMarkers.sam.length - 1)
          );
          const ss = animationMarkers.sam[si];
          const ei = (
            animationMarkers.eric[eric.index].time >= time
            ? eric.index
            : Math.min(eric.index + 1, animationMarkers.eric.length - 1)
          );
          const es = animationMarkers.eric[ei];

          // use the state of the animation and time to derive locations of rats
          let sLoc;
          if (ss.type === 'LEAVE') {
            sLoc = { x: D * (ss.time - time) / pause, flip: -1 };
          } else if (ss.type === 'RETURN') {
            sLoc = { x: -D * (ss.time - time) / pause, flip: 1 };
          } else if (ss.type === 'GRAB') {
            sLoc = { x: 0, flip: -1 };
          } else {
            sLoc = { x: 0, flip: 1 };
          }
          let eLoc;
          if (es.type === 'LEAVE') {
            eLoc = { x: D * (1 - (es.time - time) / pause), flip: 1 };
          } else if (es.type === 'RETURN') {
            eLoc = { x: D * (es.time - time) / pause, flip: -1 };
          } else if (es.type === 'EAT') {
            eLoc = { x: D, flip: 1 };
          } else {
            eLoc = { x: 0, flip: -1 };
          }

          // calculate the queue
          const queueIndex = (
            time > animationMarkers.queue[oldQueueIndex+1]
            ? Math.min(oldQueueIndex + 2, animationMarkers.queue.length - 2)
            : oldQueueIndex
          );
          const queue = (
            animationMarkers.queue[queueIndex] <= time
            && time < animationMarkers.queue[queueIndex + 1]
          );

          // return the animation states of sam and eric, along with a clock
          return { 
            sam: { 
              index: si, 
              state: ss,
              ...sLoc,
              hasItem: ss.type === 'RETURN' || ss.type === 'QUEUE',
            },
            eric: { 
              index: ei, 
              state: es,
              ...eLoc,
              hasItem: es.type === 'LEAVE' || es.type === 'EAT'
            },
            time,
            queue,
            queueIndex,
            items: time < animationMarkers.sam.at(-4).time,
          };
        },
        initAnimationState,
      ),
    );

    const subscription = animation$.subscribe(setAnimationState);

    return () => subscription.unsubscribe();
  }, [setAnimationState, initAnimationState, D, animationMarkers]);

  return (
    <div style={{ 
      width: '100%', 
      overflow: 'hidden', 
      margin: '0 auto', 
      display: 'block',
    }}>
      <svg 
        style={{ width: '100%' }} 
        height={ height } 
        viewBox={ `0 0 ${vWidth} ${vHeight}` } 
        ref={ ref }>
        <text x={ vWidth - 23 } y={ 5 } style={{ fontSize: '3px' }}>
          { 'Time: ' + String(animationState.time).padStart(4, '0') + 'ms' }
        </text>
        <g transform="translate(0 2)">
          <rect 
            stroke="black" 
            fill={ animationState.items ? 'var(--info)' : 'white' } 
            x={ 8 } 
            y={ vHeight / 2 - 6 } 
            width={ 5 } 
            height={ 10 } />
          <rect 
            x={ vWidth / 2 - 3 } 
            y={ vHeight / 2 + 3 } 
            width={ 6 } 
            height={ 2 } />
            { 
              animationState.queue 
                ? <circle 
                    cx={ vWidth / 2  } 
                    cy={ vHeight / 2 + 1 } r={ 2 } 
                    fill="var(--info)"/> 
                : null 
            }
          <g>
            <g transform={ `translate(${vWidth / 2 - 40})` }>
              <Sam 
                { ...animationState.sam }
                rotateRate={ 2.0 } 
                rotateScale={ 3 } />
            </g>
            <g transform={ `translate(${vWidth / 2})` }>
              <Eric 
                { ...animationState.eric }
                rotateRate={ 2.0 }
                rotateScale={ 3 } />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
