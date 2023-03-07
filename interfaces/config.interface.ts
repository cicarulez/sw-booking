import { Worker } from './worker.interface';

export interface Config {
    maxSmartDays: number;
    weeksNumber: number;
    weekDays: string[];
    workstationsId: string[];
    workers: Worker[];
}