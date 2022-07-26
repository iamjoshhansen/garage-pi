import { readFileSync } from 'fs';
import { load } from 'js-yaml';

export interface Env {
  dev: boolean;
  port: {
    io: number;
    http: number;
  };
  zonePins: Record<string, number>;
  manualInputPins: Record<string, number>;
  testPins: {
    switchA: number;
    switchB: number;
    buttonIn: number;
    buttonOut: number;
  };
}

const envString = readFileSync('./.env.yml').toString();
export const env = load(envString) as Env;
