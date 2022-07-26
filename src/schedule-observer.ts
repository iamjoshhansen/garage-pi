import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';

import { activeZones, Schedule, Zone } from './scheduler';

export interface ActivationEvent {
  zone: Zone;
  active: boolean;
}

export class ScheduleObserver {
  private readonly stopped = new Subject<void>();

  public events = new Subject<ActivationEvent>();

  constructor(composition: {
    schedules: Observable<Schedule[]>;
    clock: Observable<Date>;
  }) {
    combineLatest([composition.schedules, composition.clock])
      .pipe(takeUntil(this.stopped))
      .subscribe(([schedules, date]) => {
        const zones = new Set<Zone>();
        for (const schedule of schedules) {
          activeZones(date, schedule).forEach(zone => zones.add(zone));
        }

        // console.log([...zones]);

        // update all existing
        Object.keys(this.zoneSubjects).forEach(key => {
          const zone = key as Zone;
          const isActive = zones.has(zone);
          this.zoneSubjects[zone].next(isActive);
          zones.delete(zone);
        });

        // create new zones
        zones.forEach(zone => {
          this.getOrCreateZoneSubject(zone, true);
        });
      });
  }

  zoneObservable(zone: Zone): Observable<boolean> {
    return this.getOrCreateZoneSubject(zone).pipe(distinctUntilChanged());
  }

  private readonly zoneSubjects: Record<string, BehaviorSubject<boolean>> = {};

  private getOrCreateZoneSubject(
    zone: Zone,
    initialValue = false,
  ): BehaviorSubject<boolean> {
    if (!(zone in this.zoneSubjects)) {
      this.zoneSubjects[zone] = new BehaviorSubject<boolean>(initialValue);
    }
    const subject = this.zoneSubjects[zone];

    // bind to allEvents
    subject
      .pipe(takeUntil(this.stopped), distinctUntilChanged())
      .subscribe(active => this.events.next({ zone, active }));

    return subject;
  }

  async stop() {
    this.stopped.next();
  }
}
