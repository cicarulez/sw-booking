import { createXLSFile } from './functions/create-xls-file.js';
import { createBooking } from './functions/create-booking.js';
import { Config } from './interfaces/config.interface';
import fs from 'fs';

const config: Config = JSON.parse(fs.readFileSync("real-config.json").toString());

const booking = createBooking(config);

console.log(booking); // for testing purposes only

createXLSFile(booking, config);
