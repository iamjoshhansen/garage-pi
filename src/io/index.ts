import { registeredInputPins } from './input-pin';
import { registeredOutputPins } from './output-pin';

export * from './input-pin';
export * from './onoff-env';
export * from './onoff-fake';
export * from './output-pin';

process.on('SIGINT', () => {
  registeredInputPins.forEach(pin => {
    console.log({
      msg: `unexporting input pin`,
      pin: pin.id,
    });
    pin.unexport();
  });

  registeredOutputPins.forEach(pin => {
    console.log({
      msg: `unexporting output pin`,
      pin: pin.id,
    });
    pin.unexport();
  });

  process.exit(0);
});
