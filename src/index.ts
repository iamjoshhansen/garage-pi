import { interval, map, of } from 'rxjs';

import { env } from './env';
import { EventMerger } from './event-merger';
import { OutputPinController } from './output-pin-controller';
import { LocalScheduleGetter } from './schedule-getter';
import { ScheduleObserver } from './schedule-observer';

async function main() {
  const scheduleGetter = new LocalScheduleGetter();
  const schedules = of(await scheduleGetter.getSchedules());
  const clock = interval(1000).pipe(map(() => new Date()));

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
}

void main();
