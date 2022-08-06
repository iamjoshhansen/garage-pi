import { interval, map, of } from 'rxjs';

import { ApiEventEmitter } from './api/api-event-emitter';
import { ApiEventListener } from './api/api-event-listener';
import { env } from './env';
import { EventMerger } from './event-merger';
import { OutputPinController } from './output-pin-controller';
import { LocalScheduleGetter } from './schedule-getter';
import { ScheduleObserver } from './schedule-observer';

const server = require('http').createServer();
const ioServer = require('socket.io')(server);

async function main() {
  server.listen(env.port.io);

  const scheduleGetter = new LocalScheduleGetter();
  const schedules = of(await scheduleGetter.getSchedules());
  const clock = interval(1000).pipe(map(() => new Date()));

  const scheduleObserver = new ScheduleObserver({
    schedules,
    clock,
  });

  const apiEventListener = new ApiEventListener({
    id: 'sprinkler',
    ioServer,
  });

  const finalEvents = new EventMerger([
    scheduleObserver.events$,
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
}

void main();
