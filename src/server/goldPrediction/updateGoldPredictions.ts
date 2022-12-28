import { addDays, format } from 'date-fns';
import { ContestPotEntry, GoldListWithDate, RankedRegressionEntry } from '../../common/types/goldPrediction';
import { filterTimestamp, getAllSnapshots, getAllValidContestDays, getContestSeasonFromTimestamp, getDaysFromSeasonStart, parseDateFromTimestamp, processGoldListUrl, wait } from '../../common/utils/goldPrediction';
import { getClient } from '../client';

const updateGoldPredictions = async () => {
    console.log('Getting all available snapshots...');
    const startingDate = format(new Date(2021, 10, 30, 0, 0, 0), 'yyyyMMddhhmmss');
    const urls = await getAllSnapshots([], startingDate, addDays(new Date(), 2));
    console.log('Got all the snapshots!');

    const addedDates: { [timestamp: string]: string } = {};

    urls.forEach(url => {
        addedDates[url.slice(0, 8)] = url;
    });

    const uniqueTimestamps = Array.from(Object.values(addedDates))
        .sort((a: string, b: string) => {
            const parsedDateA = parseDateFromTimestamp(a);
            const parsedDateB = parseDateFromTimestamp(b);
            if (parsedDateA < parsedDateB) {
                return -1;
            }
            else if (parsedDateA > parsedDateB) {
                return 1;
            }
            return 0;
        })
        .filter(filterTimestamp);

    const snapshotUrls = uniqueTimestamps
        .map(x => `https://web.archive.org/web/${x}_if/https://www.battleon.com/Top/ElfGold`);

    // This is maximum level badness that I should never actually do but wayback machine is a piece of garbage
    // And won't let me process more than 10 requests at a time.
    // TODO: FIND A BETTER WAY TO DO THIS!!!
    const MAX_URLS_PER_BATCH = 10;
    const steps = Math.ceil(snapshotUrls.length / MAX_URLS_PER_BATCH);

    const slices: any[] = [];
    let results: GoldListWithDate[] = [];

    for (let step = 0; step < steps; step++) {
        const slice = snapshotUrls.slice(
            step * MAX_URLS_PER_BATCH,
            (step + 1) * MAX_URLS_PER_BATCH
        );
        slices.push(slice);
    }

    let count = 0;

    for (const slice of slices) {
        await wait(1500);
        const requests = await Promise.all(slice.map(x =>
            processGoldListUrl(x as string)
        ));
        results = [...results, ...requests];
        count += 1;
        console.log(`finished batch ${count}`);
    }

    results = results.map((x, index) => ({
        ...x,
        date: parseDateFromTimestamp(uniqueTimestamps[index])
    }));

    const rankedRegressionEntries: RankedRegressionEntry[] = [];
    const contestPotEntries: ContestPotEntry[] = [];

    results.forEach((snapshot) => {
        const timestamp = format(snapshot.date, 'yyyyMMdd');
        const season = getContestSeasonFromTimestamp(timestamp);
        const totalContestGold = Number(snapshot.total.replace(/,/g, ''));
        const daysFromSeasonStart = getDaysFromSeasonStart(season, snapshot.date);

        snapshot.givers.forEach((giver, index) => {
            rankedRegressionEntries.push({
                season,
                rank: index + 1,
                day: daysFromSeasonStart,
                totalContestGold,
                gold: Number(giver.amount.replace(/,/g, '')),
            });
        });

        const contestPotEntry = {
            day: daysFromSeasonStart,
            season,
            totalContestGold: totalContestGold
        };

        contestPotEntries.push(contestPotEntry);
    });

    const client = await getClient();
    const collection = client.db('aq-dashboard').collection('gold-prediction');
    await collection.drop();

    await collection.updateOne({}, {
        '$set': {
            rankedRegressionEntries,
            contestPotEntries
        }
    }, { upsert: true });

    await client.close();
    return;
};

updateGoldPredictions();