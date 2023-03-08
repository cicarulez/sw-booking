import { Config } from '../interfaces/config.interface';
import { Worker } from '../interfaces/worker.interface';
import { Booking, SummaryBooking, BookingSmartDay, BookingNotAvailableDay } from '../interfaces/booking.interface';

export function createBooking(config: Config): SummaryBooking {
    const booking: Booking = {};
    const bookingSw: BookingSmartDay = {};
    const bookingAvailableWs: BookingSmartDay = {};
    const bookingNotAvailableDay: BookingNotAvailableDay = {};
    const unassignedWsId = config.workstationsId.filter(id => !config.workers.map(w => w.workstationId).includes(id));

    for (let week = 0; week < config.weeksNumber; week++) {
        booking[`${config.labels.week}${week + 1}`] = {};
        bookingSw[`${config.labels.week}${week + 1}`] = {};
        bookingAvailableWs[`${config.labels.week}${week + 1}`] = {};
        bookingNotAvailableDay[`${config.labels.week}${week + 1}`] = {};

        const workers = config.workers.sort((a, b) => {
            if (!a.workstationId && b.workstationId) return 1;
            if (a.workstationId && !b.workstationId) return -1;
            return 0;
        });

        for (const weekday of config.weekDays) {
            booking[`${config.labels.week}${week + 1}`][weekday] = {};
            bookingAvailableWs[`${config.labels.week}${week + 1}`][weekday] = [];

            let availableWorkstations = [...config.workstationsId];

            for (const worker of workers) {
                if (!bookingSw[`${config.labels.week}${week + 1}`][worker.name]) {
                    bookingSw[`${config.labels.week}${week + 1}`][worker.name] = [];
                }
                if (!bookingNotAvailableDay[`${config.labels.week}${week + 1}`][worker.name]) {
                    bookingNotAvailableDay[`${config.labels.week}${week + 1}`][worker.name] = [];
                }
                if (worker.offsiteDays && worker.offsiteDays.includes(weekday)) {
                    booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.offsiteDay}`;
                } else if (bookingSw[`${config.labels.week}${week + 1}`][worker.name].length < config.maxSmartDays && worker.preferredSmartDays.includes(weekday)) {
                    booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = 'Smart Working';
                    bookingSw[`${config.labels.week}${week + 1}`][worker.name].push(weekday);
                } else {
                    if (availableWorkstations.length) {
                        if (worker.workstationId) {
                            availableWorkstations = availableWorkstations.filter(_workstation => _workstation !== worker.workstationId);
                            booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${worker.workstationId}`;
                        } else {
                            booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${availableWorkstations.shift()}`;
                        }
                    } else {
                        booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${config.labels.notAvailable}`;
                        bookingNotAvailableDay[`${config.labels.week}${week + 1}`][worker.name].push(weekday);
                    }
                }
            }
            bookingAvailableWs[`${config.labels.week}${week + 1}`][weekday] = [...availableWorkstations];
        }

        for (const bookingAvailableWKey in bookingAvailableWs[`${config.labels.week}${week + 1}`]) {
            if (!bookingAvailableWs[`${config.labels.week}${week + 1}`][bookingAvailableWKey].length) {
                delete bookingAvailableWs[`${config.labels.week}${week + 1}`][bookingAvailableWKey];
            } else {
                bookingAvailableWs[`${config.labels.week}${week + 1}`][bookingAvailableWKey] = [...bookingAvailableWs[`${config.labels.week}${week + 1}`][bookingAvailableWKey].filter(id => !unassignedWsId.includes(id))]
                if (!bookingAvailableWs[`${config.labels.week}${week + 1}`][bookingAvailableWKey].length) {
                    delete bookingAvailableWs[`${config.labels.week}${week + 1}`][bookingAvailableWKey];
                }
            }
        }

        for (const bookingNotAvailableDKey in bookingNotAvailableDay[`${config.labels.week}${week + 1}`]) {
            if (!bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey].length) {
                delete bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey];
            } else {
                bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey].forEach(notAvailableDay => {
                    const bookingAvailableWsKeys = Object.keys(bookingAvailableWs[`${config.labels.week}${week + 1}`]);
                    if (bookingAvailableWsKeys.length) {
                        const randomWeekDay = bookingAvailableWsKeys[randomNum(0, bookingAvailableWsKeys.length - 1)]
                        const randomBookingAvailableWs = bookingAvailableWs[`${config.labels.week}${week + 1}`][randomWeekDay];
                        const unLockedWsWorker = getUnlockedWsWorker(config, randomBookingAvailableWs);
                        if (unLockedWsWorker) {
                            // Change preferred smart work day
                            console.log(`${config.labels.week}${week + 1} change ${notAvailableDay} of ${bookingNotAvailableDKey} with ${randomWeekDay} of ${unLockedWsWorker.name}`);
                            booking[`${config.labels.week}${week + 1}`][notAvailableDay][unLockedWsWorker.name] = 'Smart Working';
                            booking[`${config.labels.week}${week + 1}`][notAvailableDay][bookingNotAvailableDKey] = `${config.labels.workstation} ${unLockedWsWorker.workstationId}`;
                            booking[`${config.labels.week}${week + 1}`][randomWeekDay][unLockedWsWorker.name] = `${config.labels.workstation} ${unLockedWsWorker.workstationId}`;
                            bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey] = [...bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey]
                                .filter(id => id !== notAvailableDay)];
                            bookingAvailableWs[`${config.labels.week}${week + 1}`][randomWeekDay] = [...bookingAvailableWs[`${config.labels.week}${week + 1}`][randomWeekDay]
                                .filter( id => id !== unLockedWsWorker.workstationId)];
                        } else {
                            console.log('workstation\'s worker not available');
                        }
                    } else {
                        console.log('workstation not available');
                    }
                });
            }
        }
        console.log('\n');

    }

    return {booking, bookingSw, bookingAvailableWs, bookingNotAvailableDay};
}

function getUnlockedWsWorker(config: Config, workstationIds: string[]): Worker {
    const availableWorkers: Worker[] = [];
    config.workers.forEach(w => {
        if (!w.lockedSw && workstationIds.includes(w.workstationId)) {
            availableWorkers.push(w);
        }
    })
    return availableWorkers[randomNum(0, availableWorkers.length - 1)];
}

function randomNum(min, max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}