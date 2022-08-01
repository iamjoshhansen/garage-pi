import { registeredInputPins } from './input-pin';
import { registeredOutputPins } from './output-pin';

export * from './input-pin';
export * from './onoff-env';
export * from './onoff-fake';
export * from './output-pin';

let hasSetUpExport = false;

if (!hasSetUpExport) {
  hasSetUpExport = true;

  process.on('SIGINT', async () => {
    console.log(`UNEXPORTING`);

    console.log('\nInputs:');
    for (const pin of registeredInputPins) {
      console.log(`- ${pin.id}`);
      pin.unexport();
    }

    console.log('\nOutputs:');
    for (const pin of registeredOutputPins) {
      console.log(`- ${pin.id}`);
      await pin.write(false);
      pin.unexport();
    }

    process.exit(0);
  });
}
