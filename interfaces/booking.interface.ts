export interface Booking {
    [week: string]: {
        [weekday: string]: {
            [worker: string]: string;
        }
    };
}

export interface BookingSmartDay {
    [week: string]: {
        [worker: string]: string[];
    };
}

export interface BookingNotAvailableDay {
    [week: string]: {
        [worker: string]: string[];
    };
}

export interface BookingAvailableWorkstation {
    [week: string]: {
        [workstation: string]: string[];
    };
}

export interface SummaryBooking {
    booking: Booking;
    bookingSw: BookingSmartDay;
    bookingNotAvailableDay: BookingNotAvailableDay;
    bookingAvailableWs: BookingAvailableWorkstation;
}