import { Worker } from './worker.interface';

export interface Config {
    numberOfWorkstations: number;
    workers: Worker[];
}