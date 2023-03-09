// Import the necessary interfaces from other files
import { Config } from '../interfaces/config.interface';
import { Worker } from '../interfaces/worker.interface';
import { Booking, SummaryBooking, BookingSmartDay, BookingNotAvailableDay } from '../interfaces/booking.interface';

// Export the function that creates the booking
export function createBooking(config: Config): SummaryBooking {
    // Initialize objects to store booking data for each week
    const booking: Booking = {};
    const bookingSw: BookingSmartDay = {};
    const bookingAvailableWs: BookingSmartDay = {};
    const bookingNotAvailableDay: BookingNotAvailableDay = {};
    // Find unassigned workstation IDs
    const unassignedWsId = config.workstationsId.filter(id => !config.workers.map(w => w.workstationId).includes(id));

    // Loop through each week
    for (let week = 0; week < config.weeksNumber; week++) {
        // Initialize booking data for the week
        booking[`${config.labels.week}${week + 1}`] = {};
        bookingSw[`${config.labels.week}${week + 1}`] = {};
        bookingAvailableWs[`${config.labels.week}${week + 1}`] = {};
        bookingNotAvailableDay[`${config.labels.week}${week + 1}`] = {};

        // Initialize an array of workers for the week
        const workers: Worker[] = [];
        // Sort workers by whether they are already assigned to a workstation
        config.workers.sort((a, b) => {
            if (!a.workstationId && b.workstationId) return 1;
            if (a.workstationId && !b.workstationId) return -1;
            return 0;
        }).forEach(worker => {
            // If the worker does not have preferred smart days or has too few, generate them
            if (!worker.preferredSmartDays || !worker.preferredSmartDays.length || worker.preferredSmartDays.length !== config.maxSmartDays) {
                const preferredSmartDays: string[] = [];
                let weekDays: string[] = [...config.weekDays];
                if (worker.preferredSmartDays && worker.preferredSmartDays.length) {
                    preferredSmartDays.push(...worker.preferredSmartDays);
                }
                do {
                    const weekday = weekDays[randomNum(0, weekDays.length - 1)];
                    preferredSmartDays.push(weekday);
                    weekDays = [...weekDays.filter(id => !preferredSmartDays.includes(id))];
                } while (preferredSmartDays.length < config.maxSmartDays);

                workers.push({
                    ...worker,
                    preferredSmartDays
                })
            } else {
                workers.push(worker);
            }
        });

        // Loop through each weekday
        for (const weekday of config.weekDays) {
            // Initialize booking data for the day
            booking[`${config.labels.week}${week + 1}`][weekday] = {};
            bookingAvailableWs[`${config.labels.week}${week + 1}`][weekday] = [];

            // Initialize available workstations for the day
            let availableWorkstations = [...config.workstationsId];

            // Loop through each worker for the day
            for (const worker of workers) {
                // Initialize booking data for the worker if it doesn't exist
                if (!bookingSw[`${config.labels.week}${week + 1}`][worker.name]) {
                    bookingSw[`${config.labels.week}${week + 1}`][worker.name] = [];
                }
                if (!bookingNotAvailableDay[`${config.labels.week}${week + 1}`][worker.name]) {
                    bookingNotAvailableDay[`${config.labels.week}${week + 1}`][worker.name] = [];
                }
                // If the worker is offsite for the day, mark them as unavailable
                if (worker.offsiteDays && worker.offsiteDays.includes(weekday)) {
                    booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.offsiteDay}`;
                }
                // If the worker has smart working days available and this is one of them, mark them as smart working
                else if (bookingSw[`${config.labels.week}${week + 1}`][worker.name].length < config.maxSmartDays && worker.preferredSmartDays.includes(weekday)) {
                    booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = 'Smart Working';
                    bookingSw[`${config.labels.week}${week + 1}`][worker.name].push(weekday);
                }
                // Otherwise, assign them to a workstation if one is available
                else {
                    if (availableWorkstations.length) {
                        // If the worker is already assigned to a workstation, mark them as such
                        if (worker.workstationId) {
                            availableWorkstations = availableWorkstations.filter(_workstation => _workstation !== worker.workstationId);
                            booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${worker.workstationId}`;
                        }
                        // Otherwise, assign them to an available workstation
                        else {
                            booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${availableWorkstations.shift()}`;
                        }
                    }
                    // If no workstations are available, mark the worker as unavailable for the day
                    else {
                        booking[`${config.labels.week}${week + 1}`][weekday][worker.name] = `${config.labels.workstation} ${config.labels.notAvailable}`;
                        bookingNotAvailableDay[`${config.labels.week}${week + 1}`][worker.name].push(weekday);
                    }
                }
            }
            // Store available workstations for the day
            bookingAvailableWs[`${config.labels.week}${week + 1}`][weekday] = [...availableWorkstations];
        }

        // Clean up the bookingAvailableWs and bookingNotAvailableDay objects
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
                        const unLockedWsWorker = getUnlockedWsWorker(workers, randomBookingAvailableWs);
                        if (unLockedWsWorker) {
                            // Change preferred smart work day
                            console.log(`${config.labels.week}${week + 1} change ${notAvailableDay} of ${bookingNotAvailableDKey} with ${randomWeekDay} of ${unLockedWsWorker.name}`);
                            booking[`${config.labels.week}${week + 1}`][notAvailableDay][unLockedWsWorker.name] = 'Smart Working';
                            booking[`${config.labels.week}${week + 1}`][notAvailableDay][bookingNotAvailableDKey] = `${config.labels.workstation} ${unLockedWsWorker.workstationId}`;
                            booking[`${config.labels.week}${week + 1}`][randomWeekDay][unLockedWsWorker.name] = `${config.labels.workstation} ${unLockedWsWorker.workstationId}`;
                            bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey] = [...bookingNotAvailableDay[`${config.labels.week}${week + 1}`][bookingNotAvailableDKey]
                                .filter(id => id !== notAvailableDay)];
                            bookingAvailableWs[`${config.labels.week}${week + 1}`][randomWeekDay] = [...bookingAvailableWs[`${config.labels.week}${week + 1}`][randomWeekDay]
                                .filter(id => id !== unLockedWsWorker.workstationId)];
                        } else {
                            console.log(`workstation's worker not available for ${bookingNotAvailableDKey}`);
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

// Helper function to get an available worker for a given workstation
function getUnlockedWsWorker(workers: Worker[], workstationIds: string[]): Worker {
    const availableWorkers: Worker[] = [];
    workers.forEach(w => {
        if (!w.lockedSw && workstationIds.includes(w.workstationId)) {
            availableWorkers.push(w);
        }
    })
    return availableWorkers[randomNum(0, availableWorkers.length - 1)];
}

// Helper function to generate a random number within a range
function randomNum(min, max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}