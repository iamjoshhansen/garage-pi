import { env } from '../env';
export const Gpio = env.dev
  ? require('./onoff-fake').GpioFake
  : require('onoff').Gpio;
