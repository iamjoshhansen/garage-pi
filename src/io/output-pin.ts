import { BehaviorSubject, Observable } from 'rxjs';
import { Gpio } from './onoff-env';

export const registeredOutputPins = new Set<OutputPin>();

export class OutputPin {
  private pin: typeof Gpio;
  private stateSource: BehaviorSubject<boolean>;
  public state$: Observable<boolean>;

  private accessible = Gpio.accessible;

  constructor(readonly id: number, initial = false) {
    this.pin = new Gpio(this.id, initial ? 'high' : 'low');

    this.stateSource = new BehaviorSubject<boolean>(initial);
    this.state$ = this.stateSource.asObservable();

    // pins.push(this);
    registeredOutputPins.add(this);
    // this.write(this.state);
  }

  unexport() {
    this.pin.unexport();
  }

  get state(): boolean {
    return this.stateSource.value;
  }

  set state(val: boolean) {
    this.write(val);
  }

  write(val: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[${this.id}] ${val}`);
      if (this.accessible) {
        // console.log(`  Accessible!`);
        this.pin.write(val ? 0 : 1, (err: Error) => {
          if (err) {
            // console.log(`  Nope!`);
            // console.log(`  `, err);
            reject(err);
          } else {
            // console.log(`  [${this.id}] Done: ${val}`);
            this.stateSource.next(val);
            resolve();
          }
        });
      } else {
        // console.log(`  [${this.id}] Done: ${val}`);
        resolve();
      }
    });
  }

  async toggle() {
    const active = await this.read();
    this.write(!active);
  }

  async read(): Promise<boolean> {
    return (await this.pin.read()) === 1;
  }
}
