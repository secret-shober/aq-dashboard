export interface WarZoneData {
    zoneId: number;
    _id: number;
}

export interface WarZonePayload {
    totalWaves: number;
    waves: number;
}

export interface TopWarWins {
    chars: {
        id: number;
        name: string;
        wins: number;
    }[]
    zoneName: string;
}