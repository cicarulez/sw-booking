import { createXLSFile } from './functions/create-xls-file.js';
import { createBooking } from './functions/create-booking.js';

const booking = createBooking();

console.log(booking); // for testing purposes only

createXLSFile(booking);
