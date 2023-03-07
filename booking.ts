import { createXLSFile } from './functions/create-xls-file.js';
import { createBooking } from './functions/create-booking.js';
import { Config } from './interfaces/config.interface';
import fs from 'fs';
import { SummaryBooking } from './interfaces/booking.interface';

const config: Config = JSON.parse(fs.readFileSync("real-config.json").toString());

const summaryBooking: SummaryBooking = createBooking(config);

console.log('booking', summaryBooking.booking); // for testing purposes only
console.log('bookingAvailableWs', summaryBooking.bookingAvailableWs); // for testing purposes only
console.log('bookingNotAvailableDay', summaryBooking.bookingNotAvailableDay); // for testing purposes only

createXLSFile(summaryBooking.booking, config);
