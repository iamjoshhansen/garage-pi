import { Observable } from 'rxjs';
import { OutputPin } from './io';
import { ActivationEvent } from './schedule-observer';

export class OutputPinController {
  constructor(composition: {
    pinConfig: Record<string, number>;
    events: Observable<ActivationEvent>;
  }) {
    const pins: Record<string, OutputPin> = {};

    for (const key in composition.pinConfig) {
      const pin = composition.pinConfig[key];
      pins[key] = new OutputPin(pin);
      console.log(`Registered ${pin.toString().padStart(2)}: ${key}`);
    }

    composition.events.subscribe(({ event, active }) => {
      const pin = pins[event];
      if (!pin) {
        console.warn(`Recieved unknown pin key: '${event}' (${active})`);
        return;
      }

      console.log(`${active ? '🟩' : '🟥'} ${event}`);
      pin.write(active);
    });
  }
}
