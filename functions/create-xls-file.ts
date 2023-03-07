import { Booking } from '../interfaces/booking.interface';
import XLSX from 'xlsx';
import fs from 'fs';
import { WEEKDAYS } from '../constants/weekdays.js';

export function createXLSFile(booking: Booking): void {
    const weeks = Object.keys(booking);
    const workers = new Set<string>();
    const bookingData: { [worker: string]: { [weekday: string]: string } } = {};
    weeks.forEach((week) => {
        // iterate over all weekdays
        WEEKDAYS.forEach((weekday) => {
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