import { distinctUntilChanged, filter, map, Observable, Subject } from 'rxjs';
import { InputPin } from './io';
import { ActivationEvent } from './schedule-observer';
import { ScheduleEvent } from './scheduler';

export class InputPinEmitter {
  private readonly eventsSubject = new Subject<ActivationEvent>();
  public readonly events = this.eventsSubject.asObservable();

  constructor(config: Record<string, number>) {
    const pins: Record<string, InputPin> = {};

    for (const key in config) {
      const pin = config[key];
      const input = new InputPin(pin);
      pins[key] = input;

      input.state$.subscribe(active => {
        this.eventsSubject.next({ event: key as ScheduleEvent, active });
      });

      console.log(`Registered input ${pin.toString().padStart(2)}: ${key}`);
    }
  }

  getPinEvents(event: ScheduleEvent): Observable<boolean> {
    return this.events.pipe(
      filter(ev => ev.event === event),
      distinctUntilChanged((a, b) => a.active == b.active),
      map(ev => ev.active),
    );
  }
}
