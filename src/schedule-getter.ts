import { Schedule, Zone } from './scheduler';

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
              zone: 'Sidewalk' as Zone,
              duration: 6,
            },
            {
              zone: 'FrontYard' as Zone,
              duration: 8,
            },
            {
              zone: 'BackNear' as Zone,
              duration: 7,
            },
            {
              zone: 'BackFar' as Zone,
              duration: 8,
            },
          ],
        },
      ];
      resolve(schedules);
    });
  }
}
