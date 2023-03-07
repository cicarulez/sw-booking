export interface Worker {
    name: string;
    preferredSmartDays: string[];
    offsiteDays?: string[];
    workstationId?: string;
    lockedSw?: boolean;
}