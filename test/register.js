const Gpio = require('onoff').Gpio;

const pinA = new Gpio(4, 'high');
const pinB = new Gpio(17, 'high');
const pinC = new Gpio(18, 'high');

process.on('SIGINT', () => {
  try {
    pinA.writeSync(0);
    pinA.unexport();
    pinB.writeSync(0);
    pinB.unexport();
    pinC.writeSync(0);
    pinC.unexport();
  } catch {}
  process.exit(0);
});

async function run() {

  console.log(`Initial wait...`);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  while (true) {
    console.log(`All on`);
    pinA.write(0);
    pinB.write(0);
    pinC.write(0);

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`All off`);
    pinA.write(1);
    pinB.write(1);
    pinC.write(1);

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

}

void run();
