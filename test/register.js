const Gpio = require('onoff').Gpio;

const pinA = new Gpio(4, 'high');
const pinB = new Gpio(17, 'high');
const pinC = new Gpio(18, 'high');

process.on('SIGINT', () => {
  pinA.unexport();
  pinB.unexport();
  pinC.unexport();
});

async function run() {

  console.log(`Initial wait...`);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  while (true) {
    console.log(`All on`);
    pinA.write(true);
    pinB.write(true);
    pinC.write(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`All off`);
    pinA.write(false);
    pinB.write(false);
    pinC.write(false);

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

}

void run();
