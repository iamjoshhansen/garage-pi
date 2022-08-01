const Gpio = require('onoff').Gpio;

const pinA = new Gpio(4, 'out');
const pinB = new Gpio(17, 'high');
const pinC = new Gpio(18, 'low');

process.on('SIGINT', () => {
  pinA.unexport();
  pinB.unexport();
  pinC.unexport();
});

async function run() {

  await new Promise((resolve) => setTimeout(resolve, 5000));

  while (true) {
    pinA.write(true);
    pinB.write(true);
    pinC.write(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    pinA.write(false);
    pinB.write(false);
    pinC.write(false);

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

}

void run();
