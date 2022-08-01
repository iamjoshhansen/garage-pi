import { merge, Observable, Subject } from 'rxjs';

import { ActivationEvent } from './schedule-observer';

export class EventMerger {
  public readonly output = new Subject<ActivationEvent>();

  constructor(inputs: { events: Observable<ActivationEvent> }[]) {
    merge(...inputs.map(x => x.events)).subscribe(({ event, active }) =>
      this.output.next({ event, active }),
    );
  }
}
