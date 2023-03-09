import { Booking } from '../interfaces/booking.interface';
import XLSX from 'xlsx';
import fs from 'fs';
import { Config } from '../interfaces/config.interface';

export function createXLSFile(booking: Booking, config: Config): void {
    const weeks = Object.keys(booking);
    const workers = new Set<string>();
    const bookingData: { [worker: string]: { [weekday: string]: string } } = {};
    const sheet: {[k: string]: XLSX.WorkSheet} = {};
    weeks.forEach((week) => {
        // iterate over all weekdays
        config.weekDays.forEach((weekday) => {
            const workersList = Object.keys(booking[week][weekday] || {}); // use default empty object if no workers are assigned to this weekday
            workersList.forEach((worker) => workers.add(worker));
            workersList.forEach((worker) => {
                if (!bookingData[worker]) {
                    bookingData[worker] = {};
                }
                bookingData[worker][weekday] = booking[week][weekday]?.[worker] || ''; // use default empty string if worker is not assigned to this weekday
            });
        });
        const workerNames = Array.from(workers.values());
        const data = workerNames.map((worker) => {
            const rowData = [worker];
            config.weekDays.forEach((weekday) => {
                rowData.push(bookingData[worker][weekday] || '');
            });
            return rowData;
        });
        data.unshift(['', ...config.weekDays]);
        sheet[week] = XLSX.utils.aoa_to_sheet(data);
    });
    const wb = XLSX.utils.book_new();
    weeks.forEach((week) => {
        XLSX.utils.book_append_sheet(wb, sheet[week], week); // add a sheet for each week
    });
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(`booking-${new Date().getTime()}.xlsx`, buffer);
}