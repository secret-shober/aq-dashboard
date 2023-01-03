import { format, addDays, differenceInDays, isSameDay, isAfter } from 'date-fns';
import { GoldList, OldGoldList } from '../types/goldList';
import { MementoQueryResult } from '../types/goldPrediction';

export const getAllSnapshotTimestamps = async (): Promise<string[]> => {
    const url = 'https://web.archive.org/cdx/search/cdx?url=https://battleon.com/topelfgold';
    const request = await fetch(url);
    const response = await request.text();
    return response.split('\n')
        .filter(line => line.length)
        .map(line => line.split(' ')[1]);
};

export const filterTimestamp = (timestamp: string): boolean => {
    try {
        const parsedDate = parseDateFromTimestamp(timestamp);
        switch (parsedDate.getMonth()) {
            case 0:
            case 11:
                return true;
            case 1:
                if (parsedDate.getDate() < 3) {
                    return true;
                }
                return false;
            default:
                return false;
        }
    }
    catch (e) {
        console.log('error timestamp', timestamp);
        console.log('the error', e);
        throw new Error();
    }
};

export const processGoldListUrl = async (url: string): Promise<GoldList> => {
    const request = await fetch(url);
    const response: GoldList | OldGoldList = await request.json();

    // After January 2nd 2022, the payload changes from [data, total] to [givers, total, title, desc] 
    if ('data' in response) {
        return {
            givers: response.data,
            total: response.total,
            desc: '',
            title: '',
        };
    }
    return response;
};

export const parseDateFromTimestamp = (timestamp: string): Date => {
    const year = Number(timestamp.slice(0, 4));
    const month = Number(timestamp.slice(4, 6)) - 1;
    const day = Number(timestamp.slice(6, 8));
    const hours = Number(timestamp.slice(8, 10));
    const minutes = Number(timestamp.slice(10, 12));
    const seconds = Number(timestamp.slice(12, 14));
    return new Date(year, month, day, hours, minutes, seconds);
};

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getContestSeasonFromTimestamp = (timestamp: string): number => {
    const parsedDate = parseDateFromTimestamp(timestamp);

    // January is the 2nd month of every contest season so we need to subtract 1 from the year and get last year's;
    // Otherwise we just return the current year. 11 is December, and all other months are considered part
    // of the previous "season"
    if (parsedDate.getMonth() !== 11) {
        return parsedDate.getFullYear() - 1;
    }
    return parsedDate.getFullYear();
};

export const getDaysFromSeasonStart = (season: number, contestDate: Date): number => {
    const contestStartDate = new Date(season, 11, 1);
    return differenceInDays(contestDate, contestStartDate);
};