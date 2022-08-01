export const dowNames: Record<any, string> = {
  U: 'Sunday',
  M: 'Monday',
  T: 'Tueday',
  W: 'Wednesday',
  R: 'Thursday',
  F: 'Friday',
  S: 'Saturday',
};

export type TaskId = string & { __brand: 'TaskId' };
export type TaskChannel = string & { __brand: 'TaskChannel' };
export type TaskDuration = number & { __brand: 'TaskDuration' };
export type TaskStart = number & { __brand: 'TaskStart' };
export type TaskTimeString = string & { __brand: 'TaskTimeString' };

export type ScheduleEvent = string & { __brand: 'ScheduleEvent' };

export interface Schedule {
  dows: string;
  time: string;
  gap: number;
  roundCount: number;
  roundDelay: number;
  sequence: {
    event: ScheduleEvent;
    duration: number;
  }[];
}

export type DOW = 'U' | 'M' | 'T' | 'W' | 'R' | 'F' | 'S';

export interface SprinklerEvent {
  event: ScheduleEvent;
  dow: DOW;
  start: number;
  duration: number;
  end: number;
}

export function prettyTime(time: number): string {
  const date = new Date('2022/07/12 0:00:00');
  date.setSeconds(time);
  return date.toTimeString().substring(0, 8);
}

export function dateToTime(date = new Date()): string {
  return date.toTimeString().substring(0, 8);
}

export function timeToNumber(time: string) {
  const [h, m, s] = time.split(':').map(x => parseInt(x, 10));
  return h * 3600 + m * 60 + (s || 0);
}

export function dateToDOW(date = new Date()): DOW {
  return 'UMTWRFS'.charAt(date.getDay()) as DOW;
}

export function* sprinklerEvents(
  schedule: Schedule,
): Generator<SprinklerEvent, void, void> {
  for (const d of 'UMTWRFS') {
    const dow = d as DOW;
    if (schedule.dows.toUpperCase().includes(dow)) {
      let time = timeToNumber(schedule.time);

      for (let round = 0; round < schedule.roundCount; round++) {
        for (const ev of schedule.sequence) {
          const duration = ev.duration * 60 - schedule.gap;
          yield {
            dow,
            event: ev.event,
            start: time,
            duration,
            end: time + duration,
          };
          time += duration;

          yield {
            dow,
            event: 'zone delay' as ScheduleEvent,
            start: time,
            duration: schedule.gap,
            end: time + schedule.gap,
          };
          time += schedule.gap;
        }

        const duration = schedule.roundDelay * 60;
        yield {
          dow,
          event: 'round delay' as ScheduleEvent,
          start: time,
          duration,
          end: time + duration,
        };
        time += duration;
      }
    }
  }
}

export function activeEvents(
  date = new Date(),
  schedule: Schedule,
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  const targetDow = dateToDOW(date);
  const time = timeToNumber(dateToTime(date));
  [...sprinklerEvents(schedule)]
    .filter(({ event, dow, start, end }) => {
      if (event.toLowerCase().includes('delay')) {
        return false;
      }
      return targetDow == dow && start <= time && end > time;
    })
    .forEach(({ event }) => events.push(event));
  return events;
}
