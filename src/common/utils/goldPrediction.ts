import { format, addDays } from 'date-fns';
import { GoldList } from '../types/goldList';
import { DataTuple, GoldListWithDate, WaybackSnapshotResult } from '../types/goldPrediction';

export const getWaybackSnapshotResult = async (date: Date, url: string): Promise<WaybackSnapshotResult> => {
    const parsedDate = format(date, 'yyyyMMdd');

    const snapshotRequestUrl = `http://archive.org/wayback/available?url=${url}&timestamp=${parsedDate}`;

    const request = await fetch(snapshotRequestUrl);
    const response: WaybackSnapshotResult = await request.json();
    return response;
};

export const getDataTuple = (goldList: GoldListWithDate): DataTuple[] => {
    return goldList.givers.map((giver, index) => ({
        date: goldList.date.toString(),
        rank: index + 1,
        gold: Number(giver.amount.replace(/,/g, '')),
        totalContestGold: Number(goldList.total.replace(/,/g, ''))
    }));
};

export const getAllValidContestDays = (): Date[] => {
    const currentDate = new Date();

    let startDate = new Date(2021, 11, 0);

    const validDates: Date[] = [];

    while (startDate <= currentDate) {
        if (startDate.getMonth() === 0 || startDate.getMonth() === 11) {
            validDates.push(startDate);
        }
        startDate = addDays(startDate, 1);
    }

    return validDates;
};

export const processGoldListUrl = async (url: string): Promise<GoldList> => {
    const request = await fetch(url);
    const response = await request.json();
    return response;
};

export const parseDateFromTimestamp = (timestamp: string): Date => {
    const year = Number(timestamp.slice(0, 4));
    const month = Number(timestamp.slice(4, 6)) - 1;
    const day = Number(timestamp.slice(6, 8));

    return new Date(year, month, day);
};

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));