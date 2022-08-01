import { Schedule, ScheduleEvent } from './scheduler';

export abstract class ScheduleGetter {
  abstract getSchedules(): Promise<Schedule[]>;
}

export class LocalScheduleGetter implements ScheduleGetter {
  getSchedules(): Promise<Schedule[]> {
    return new Promise(resolve => {
      const schedules: Schedule[] = [
        {
          dows: 'MWF',
          time: '2:30',
          roundCount: 3,
          roundDelay: 4,
          gap: 3,
          sequence: [
            {
              event: 'Sidewalk' as ScheduleEvent,
              duration: 6,
            },
            {
              event: 'FrontYard' as ScheduleEvent,
              duration: 8,
            },
            {
              event: 'BackNear' as ScheduleEvent,
              duration: 7,
            },
            {
              event: 'BackFar' as ScheduleEvent,
              duration: 8,
            },
          ],
        },
      ];
      resolve(schedules);
    });
  }
}
