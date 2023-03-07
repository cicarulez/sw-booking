import { Config } from '../interfaces/config.interface';
import { Booking } from '../interfaces/booking.interface';

export function createBooking(config: Config): Booking {
    const booking: Booking = {};

    for (let week = 0; week < config.weeksNumber; week++) {
        booking[`Week${week + 1}`] = {};
        for (const weekday of config.weekDays) {
            booking[`Week${week + 1}`][weekday] = {};

            // Sort workers by priority (workers with assigned workstation first)
            const workers = config.workers.sort((a, b) => {
                if (!a.workstationId && b.workstationId) return 1;
                if (a.workstationId && !b.workstationId) return -1;
                return 0;
            });

            // Assign workstations to workers with assigned workstations
            for (const worker of workers) {
                if (!worker.workstationId) break;

                if (config.weekDays.indexOf(worker.preferredSmartDays[0]) !== config.weekDays.indexOf(weekday)) {
                    booking[`Week${week + 1}`][weekday][worker.name] = worker.workstationId;
                } else {
                    const smartDayCount = Object.values(booking[`Week${week + 1}`]).reduce((count, day) => {
                        return count + (day[worker.name] ? 1 : 0);
                    }, 0);

                    if (smartDayCount < config.maxSmartDays) {
                        booking[`Week${week + 1}`][weekday][worker.name] = 'Smart Working';
                    } else {
                        booking[`Week${week + 1}`][weekday][worker.name] = worker.workstationId;
                    }
                }
            }

            // Assign workstations to workers without assigned workstations
            const availableWorkstations = [...config.workstationsId];
            for (const worker of workers) {
                if (worker.workstationId) continue;

                if (config.weekDays.indexOf(worker.preferredSmartDays[0]) !== config.weekDays.indexOf(weekday)) {
                    if (availableWorkstations.length) {
                        booking[`Week${week + 1}`][weekday][worker.name] = availableWorkstations.shift();
                    } else {
                        booking[`Week${week + 1}`][weekday][worker.name] = 'Workstation not available';
                    }
                } else {
                    const smartDayCount = Object.values(booking[`Week${week + 1}`]).reduce((count, day) => {
                        return count + (day[worker.name] ? 1 : 0);
                    }, 0);

                    if (smartDayCount < config.maxSmartDays) {
                        booking[`Week${week + 1}`][weekday][worker.name] = 'Smart Working';
                    } else {
                        if (availableWorkstations.length) {
                            booking[`Week${week + 1}`][weekday][worker.name] = availableWorkstations.shift();
                        } else {
                            booking[`Week${week + 1}`][weekday][worker.name] = 'Workstation not available';
                        }
                    }
                }
            }
        }
    }

    return booking;
}