import { interval } from 'rxjs';
import { env } from './env';
import { OutputPin } from './io';

async function main() {
  const sidewalk = new OutputPin(env.zonePins.Sidewalk);
  const frontYard = new OutputPin(env.zonePins.FrontYard);
  const backNear = new OutputPin(env.zonePins.BackNear);
  const backFar = new OutputPin(env.zonePins.BackFar);
  const drip = new OutputPin(env.zonePins.Drip);
  const gardenNorth = new OutputPin(env.zonePins.GardenNorth);
  const gardenEast = new OutputPin(env.zonePins.GardenEast);
  const active = new OutputPin(env.zonePins.active);

  const pins = [
    sidewalk,
    frontYard,
    backNear,
    backFar,
    drip,
    gardenNorth,
    gardenEast,
    active,
  ];

  interval(1000).subscribe(async i => {
    const pin = pins[i % pins.length];
    pin.write(true);
    await new Promise(resolve => setTimeout(resolve, 250));
    pin.write(false);
  });

  console.log(`Ready!`);
}

void main();
