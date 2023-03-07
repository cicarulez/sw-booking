import { Config } from '../interfaces/config.interface';
import fs from 'fs';
import { WEEKDAYS } from '../constants/weekdays.js';
import { NUMBER_OF_WEEKS } from '../constants/number-of-week.js';
import { Booking } from '../interfaces/booking.interface';

export function createBooking(): Booking {
    const config: Config = JSON.parse(fs.readFileSync("config.json").toString());

    let occupiedWorkstations: boolean[][] = new Array(WEEKDAYS.length);
    for (let i = 0; i < occupiedWorkstations.length; i++) {
        occupiedWorkstations[i] = new Array(config.numberOfWorkstations).fill(false);
    }

    let booking: Booking = {};
    for (let weekIndex = 0; weekIndex < NUMBER_OF_WEEKS; weekIndex++) {
        let week = `Week ${weekIndex + 1}`;
        booking[week] = {};
        for (let weekdayIndex = 0; weekdayIndex < WEEKDAYS.length; weekdayIndex++) {
            let weekday = WEEKDAYS[weekdayIndex];
            booking[week][weekday] = {};
            for (let i = 0; i < config.workers.length; i++) {
                let worker = config.workers[i].name;
                if (config.workers[i].smartWorking.includes(weekday)) {
                    booking[week][weekday][worker] = "Smart Working";
                } else {
                    let preferredWorkstations = config.workers[i].workstations.filter((p) => !occupiedWorkstations[weekdayIndex][p - 1]);
                    let workstationIndex = preferredWorkstations.length > 0 ? preferredWorkstations[0] - 1 : occupiedWorkstations[weekdayIndex].findIndex((p) => !p);
                    occupiedWorkstations[weekdayIndex][workstationIndex] = true;
                    booking[week][weekday][worker] = `Workstation ${workstationIndex + 1}`;
                }
            }
        }
    }
    return booking;
}