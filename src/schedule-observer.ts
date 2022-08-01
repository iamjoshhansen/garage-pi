import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';

import { activeEvents, Schedule, ScheduleEvent } from './scheduler';

export interface ActivationEvent {
  event: ScheduleEvent;
  active: boolean;
}

export class ScheduleObserver {
  private readonly stopped = new Subject<void>();

  public readonly events = new Subject<ActivationEvent>();
  private readonly eventSubjects: Record<string, BehaviorSubject<boolean>> = {};

  constructor(composition: {
    schedules: Observable<Schedule[]>;
    clock: Observable<Date>;
  }) {
    combineLatest([composition.schedules, composition.clock])
      .pipe(takeUntil(this.stopped))
      .subscribe(([schedules, date]) => {
        const events = new Set<ScheduleEvent>();
        for (const schedule of schedules) {
          activeEvents(date, schedule).forEach(event => events.add(event));
        }

        // update all existing
        Object.keys(this.eventSubjects).forEach(key => {
          const event = key as ScheduleEvent;
          const isActive = events.has(event);
          this.eventSubjects[event].next(isActive);
          events.delete(event);
        });

        // create new events
        events.forEach(event => {
          this.getOrCreateEventSubject(event, true);
        });
      });
  }

  eventObservable(event: ScheduleEvent): Observable<boolean> {
    return this.getOrCreateEventSubject(event).pipe(distinctUntilChanged());
  }

  private getOrCreateEventSubject(
    event: ScheduleEvent,
    initialValue = false,
  ): BehaviorSubject<boolean> {
    if (!(event in this.eventSubjects)) {
      this.eventSubjects[event] = new BehaviorSubject<boolean>(initialValue);
    }
    const subject = this.eventSubjects[event];

    // bind to allEvents
    subject
      .pipe(takeUntil(this.stopped), distinctUntilChanged())
      .subscribe(active => this.events.next({ event, active }));

    return subject;
  }

  async stop() {
    this.stopped.next();
  }
}
