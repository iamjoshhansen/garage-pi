import { interval } from 'rxjs';
import { env } from './env';
import { InputPinEmitter } from './input-pin-emitter';
import { OutputPin } from './io';
import { Zone } from './scheduler';

async function main() {
  const inputs = new InputPinEmitter(env.testPins);

  const switchA = inputs.getPinEvents('switchA' as Zone);
  const switchB = inputs.getPinEvents('switchB' as Zone);
  const buttonIn = inputs.getPinEvents('buttonIn' as Zone);

  const out = new OutputPin(env.testPins.buttonOut);

  switchA.subscribe(active => {
    console.log(`Switch A: ${active}`);
  });

  switchB.subscribe(active => {
    console.log(`Switch B: ${active}`);
    out.write(active);
  });

  out.state$.subscribe(active => {
    console.log(`LED: ${active}`);
  });

  interval(1000).subscribe(() => {
    out.toggle();
  });

  buttonIn.subscribe(active => {
    console.log(`Button: ${active}`);
  });

  // new OutputPinController({
  //   pinConfig: env.zonePins,
  //   events: finalEvents,
  // });

  console.log(`Ready!`);
}

void main();
