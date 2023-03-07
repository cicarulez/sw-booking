export interface Booking {
    [week: string]: {
        [weekday: string]: {
            [worker: string]: string;
        }
    };
}