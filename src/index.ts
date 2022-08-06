import { of, Subject } from 'rxjs';
import { ApiEventEmitter } from './api/api-event-emitter';
import { ApiEventListener } from './api/api-event-listener';

import { env } from './env';
import { EventMerger } from './event-merger';
import { OutputPinController } from './output-pin-controller';
import { LocalScheduleGetter } from './schedule-getter';
import { ScheduleObserver } from './schedule-observer';
import { ScheduleEvent } from './scheduler';

const server = require('http').createServer();
const ioServer = require('socket.io')(server);

async function main() {
  server.listen(env.port.io);

  const scheduleGetter = new LocalScheduleGetter();
  const schedules = of(await scheduleGetter.getSchedules());
  // const clock = interval(1000).pipe(map(() => new Date()));
  const clock = new Subject<Date>();

  const scheduleObserver = new ScheduleObserver({
    schedules,
    clock,
  });

  const apiEventListener = new ApiEventListener({
    id: 'sprinkler',
    ioServer,
  });

  //const manualInput = new InputPinEmitter(env.manualInputPins);
  const finalEvents = new EventMerger([
    scheduleObserver.events$,
    // manualInput,
    apiEventListener.events$,
  ]).output;

  new OutputPinController({
    pinConfig: env.zonePins,
    events: finalEvents,
  });

  new ApiEventEmitter({
    ioServer,
    id: 'sprinkler-update',
    events: finalEvents,
  });

  // run the test clock
  schedules.subscribe(async ss => {
    const now = new Date('2022/08/01');
    const [h, m] = ss[0].time.split(':').map(x => parseInt(x, 10));
    now.setHours(h);
    now.setMinutes(m);
    now.setSeconds(0);
    now.setMilliseconds(0);

    while (now.getHours() < 3) {
      now.setSeconds(now.getSeconds() + 60);
      console.log(`${now.toTimeString().substring(0, 8)}`);
      clock.next(now);
      await new Promise<void>(resolve =>
        setTimeout(() => {
          resolve();
        }, 5),
      );
    }
  });

  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log(`testing input`);
  apiEventListener.handleUpdate({
    event: 'Sidewalk' as ScheduleEvent,
    active: true,
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  apiEventListener.handleUpdate({
    event: 'Sidewalk' as ScheduleEvent,
    active: false,
  });
}

void main();
