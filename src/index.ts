import { of, Subject } from 'rxjs';

import { env } from './env';
import { EventMerger } from './event-merger';
// import { InputPinEmitter } from './input-pin-emitter';
import { OutputPinController } from './output-pin-controller';
import { LocalScheduleGetter } from './schedule-getter';
import { ScheduleObserver } from './schedule-observer';

async function main() {
  const scheduleGetter = new LocalScheduleGetter();
  const schedules = of(await scheduleGetter.getSchedules());
  // const clock = interval(1000).pipe(map(() => new Date()));

  const clock = new Subject<Date>();

  const scheduleObserver = new ScheduleObserver({
    schedules,
    clock,
  });

  //const manualInput = new InputPinEmitter(env.manualInputPins);
  const finalEvents = new EventMerger([
    scheduleObserver,
    // manualInput,
  ]).output;

  new OutputPinController({
    pinConfig: env.zonePins,
    events: finalEvents,
  });

  schedules.subscribe(async ss => {
    const now = new Date('2022/08/01');
    const [h, m] = ss[0].time.split(':').map(x => parseInt(x, 10));
    now.setHours(h);
    now.setMinutes(m);
    now.setSeconds(0);
    now.setMilliseconds(0);

    while (now.getHours() < 3) {
      now.setSeconds(now.getSeconds() + 1);
      console.log(`${now.toTimeString().substring(0, 8)}`);
      clock.next(now);
      await new Promise<void>(resolve =>
        setTimeout(() => {
          resolve();
        }, 5),
      );
    }
  });
}

void main();
