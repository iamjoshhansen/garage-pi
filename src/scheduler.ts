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

export type Zone = string & { __brand: 'Zone' };

export interface Schedule {
  dows: string;
  time: string;
  gap: number;
  roundCount: number;
  roundDelay: number;
  sequence: {
    zone: Zone;
    duration: number;
  }[];
}

export type DOW = 'U' | 'M' | 'T' | 'W' | 'R' | 'F' | 'S';

export interface SprinklerEvent {
  zone: Zone | string;
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
            zone: ev.zone,
            start: time,
            duration,
            end: time + duration,
          };
          time += duration;

          yield {
            dow,
            zone: 'zone delay',
            start: time,
            duration: schedule.gap,
            end: time + schedule.gap,
          };
          time += schedule.gap;
        }

        const duration = schedule.roundDelay * 60;
        yield {
          dow,
          zone: 'round delay',
          start: time,
          duration,
          end: time + duration,
        };
        time += duration;
      }
    }
  }
}

export function activeZones(date = new Date(), schedule: Schedule): Zone[] {
  const zones: Zone[] = [];
  const dow = dateToDOW(date);
  const time = timeToNumber(dateToTime(date));
  [...sprinklerEvents(schedule)]
    .filter(event => {
      if (event.zone.toLowerCase().includes('delay')) {
        return false;
      }
      return event.dow == dow && event.start <= time && event.end > time;
    })
    .forEach(event => zones.push(event.zone as Zone));
  return zones;
}
