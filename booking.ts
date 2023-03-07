import * as fs from "fs";
import XLSX from "xlsx";

interface Worker {
    name: string;
    smartWorking: string[];
    workstations: number[];
}

interface Booking {
    [day: string]: {
        [weekday: string]: {
            [worker: string]: string;
        }
    };
}

interface Config {
    numberOfWorkstations: number;
    workers: Worker[];
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const NUMBER_OF_WEEKS = 4;

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

console.log(booking); // for testing purposes only

createXLSFile(booking);

function createXLSFile(booking: Booking): void {
    const weeks = Object.keys(booking);
    const workers = new Set<string>();
    const bookingData: { [worker: string]: { [weekday: string]: string } } = {};
    weeks.forEach((week) => {
        const weekdays = WEEKDAYS; // iterate over all weekdays
        weekdays.forEach((weekday) => {
            const workersList = Object.keys(booking[week][weekday] || {}); // use default empty object if no workers are assigned to this weekday
            workersList.forEach((worker) => workers.add(worker));
            workersList.forEach((worker) => {
                if (!bookingData[worker]) {
                    bookingData[worker] = {};
                }
                bookingData[worker][weekday] = booking[week][weekday]?.[worker] || ''; // use default empty string if worker is not assigned to this weekday
            });
        });
    });
    const workerNames = Array.from(workers.values());
    const data = workerNames.map((worker) => {
        const rowData = [worker];
        WEEKDAYS.forEach((weekday) => {
            rowData.push(bookingData[worker][weekday] || '');
        });
        return rowData;
    });
    data.unshift(['', ...WEEKDAYS]);
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    weeks.forEach((week) => {
        XLSX.utils.book_append_sheet(wb, sheet, week); // add a sheet for each week
    });
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync('booking.xlsx', buffer);
}
