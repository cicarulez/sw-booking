export interface Booking {
    [day: string]: {
        [weekday: string]: {
            [worker: string]: string;
        }
    };
}