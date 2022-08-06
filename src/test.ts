import { of, Subject } from 'rxjs';

import { env } from './env';
import { OutputPinController } from './output-pin-controller';
import { LocalScheduleGetter } from './schedule-getter';
import { ScheduleObserver } from './schedule-observer';

async function run() {
  const scheduleGetter = new LocalScheduleGetter();
  const schedules = of(await scheduleGetter.getSchedules());
  const clock = new Subject<Date>();

  const scheduleObserver = new ScheduleObserver({
    schedules,
    clock,
  });

  new OutputPinController({
    pinConfig: env.zonePins,
    events: scheduleObserver.events$,
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

void run();
