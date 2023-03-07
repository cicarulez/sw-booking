import { Config } from '../interfaces/config.interface';
import { Booking, SummaryBooking, BookingSmartDay, BookingNotAvailableDay } from '../interfaces/booking.interface';

export function createBooking(config: Config): SummaryBooking {
    const booking: Booking = {};
    const bookingSw: BookingSmartDay = {};
    const bookingAvailableWs: BookingSmartDay = {};
    const bookingNotAvailableDay: BookingNotAvailableDay = {};

    for (let week = 0; week < config.weeksNumber; week++) {
        booking[`Week${week + 1}`] = {};
        bookingSw[`Week${week + 1}`] = {};
        bookingAvailableWs[`Week${week + 1}`] = {};
        bookingNotAvailableDay[`Week${week + 1}`] = {};
        for (const weekday of config.weekDays) {
            booking[`Week${week + 1}`][weekday] = {};
            bookingAvailableWs[`Week${week + 1}`][weekday] = [];

            const workers = config.workers.sort((a, b) => {
                if (!a.workstationId && b.workstationId) return 1;
                if (a.workstationId && !b.workstationId) return -1;
                return 0;
            });

            let availableWorkstations = [...config.workstationsId];

            for (const worker of workers) {
                if (!bookingSw[`Week${week + 1}`][worker.name]) {
                    bookingSw[`Week${week + 1}`][worker.name] = [];
                }
                if (!bookingNotAvailableDay[`Week${week + 1}`][worker.name]) {
                    bookingNotAvailableDay[`Week${week + 1}`][worker.name] = [];
                }
                if (worker.offsiteDays && worker.offsiteDays.includes(weekday)) {
                    booking[`Week${week + 1}`][weekday][worker.name] = `${config.labels.offsiteDay}`;
                } else if (bookingSw[`Week${week + 1}`][worker.name].length < config.maxSmartDays && worker.preferredSmartDays.includes(weekday)) {
                    booking[`Week${week + 1}`][weekday][worker.name] = 'Smart Working';
                    bookingSw[`Week${week + 1}`][worker.name].push(weekday);
                } else {
                    if (availableWorkstations.length) {
                        if (worker.workstationId) {
                            availableWorkstations = availableWorkstations.filter(_workstation => _workstation !== worker.workstationId);
                            booking[`Week${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${worker.workstationId}`;
                        } else {
                            booking[`Week${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${availableWorkstations.shift()}`;
                        }
                    } else {
                        booking[`Week${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${config.labels.notAvailable}`;
                        bookingNotAvailableDay[`Week${week + 1}`][worker.name].push(weekday);
                    }
                }
            }
            bookingAvailableWs[`Week${week + 1}`][weekday] = [...availableWorkstations];
        }
        for (const bookingAvailableWKey in bookingAvailableWs[`Week${week + 1}`]) {
            if (!bookingAvailableWs[`Week${week + 1}`][bookingAvailableWKey].length) {
                delete bookingAvailableWs[`Week${week + 1}`][bookingAvailableWKey];
            }
        }
        for (const bookingNotAvailableDKey in bookingNotAvailableDay[`Week${week + 1}`]) {
            if (!bookingNotAvailableDay[`Week${week + 1}`][bookingNotAvailableDKey].length) {
                delete bookingNotAvailableDay[`Week${week + 1}`][bookingNotAvailableDKey];
            }
        }
    }

    return {booking, bookingSw, bookingAvailableWs, bookingNotAvailableDay};
}
