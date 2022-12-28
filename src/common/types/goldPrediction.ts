
import { GoldList } from './goldList';

export interface WaybackSnapshotResult {
    archived_snapshots: {
        closest?: {
            available?: boolean;
            url?: string;
            timestamp?: string;
            status?: string;
        }
    }
    url: string;
    timestamp: string;
}

export interface GoldListWithDate extends GoldList {
    date: Date;
}

export interface RankedRegressionEntry {
    season: number;
    day: number;
    rank: number;
    gold: number;
    totalContestGold: number;
}

export interface ContestPotEntry {
    season: number;
    day: number;
    totalContestGold: number;
}

export interface ContestPotRegressionEntry extends ContestPotEntry {
    activityFactor: number;
}

export interface MementoKey {
    datetime: string;
    uri: string[];
}

export interface MementoQueryResult {
    mementos: {
        closest: MementoKey;
        first: MementoKey;
        last: MementoKey;
        next?: MementoKey;
        prev: MementoKey;
    }
}