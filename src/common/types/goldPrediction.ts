
import { GoldList } from './goldList';

export interface WaybackSnapshotResult {
    archived_snapshots: {
        closest?: {
            available: boolean;
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

export interface DataTuple {
    date: string;
    rank: number;
    gold: number;
    totalContestGold: number;
}