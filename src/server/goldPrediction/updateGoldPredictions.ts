import { GoldList } from '../../common/types/goldList';
import { DataTuple, GoldListWithDate } from '../../common/types/goldPrediction';
import { getCurrentGoldList } from '../../common/utils/goldList';
import { getAllValidContestDays, getDataTuple, getWaybackSnapshotResult, parseDateFromTimestamp, processGoldListUrl, wait } from '../../common/utils/goldPrediction';
import { getClient } from '../client';

const updateGoldPredictions = async () => {
    const topElfUrl = 'https://battleon.com/TopElfGold';
    const validDates = getAllValidContestDays();

    console.log('Getting all available snapshots...');

    const snapshotData = await Promise.all(
        validDates.map(validDate => getWaybackSnapshotResult(validDate, topElfUrl))
    );

    snapshotData.forEach(point => console.log(point.archived_snapshots.closest.timestamp));
    return;

    console.log('Got all the snapshots. Getting data from all snapshots: Starting batch 1...');

    const snapshotUrls = snapshotData
        .filter(x => x.archived_snapshots.closest?.url)
        .map(x => x.archived_snapshots.closest?.url?.toLowerCase()
            .replace(/\/\https/g, 'if_/https')
            .replace(/topelfgold/g, 'top/elfgold')
        );

    // This is maximum level badness that I should never actually do but wayback machine is a piece of garbage
    // And won't let me process more than 5 requests at a time.
    // TODO: FIND A BETTER WAY TO DO THIS!!!
    const MAX_URLS_PER_BATCH = 5;
    const steps = Math.ceil(validDates.length / MAX_URLS_PER_BATCH);

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
        date: parseDateFromTimestamp(snapshotData[index].timestamp)
    }));

    results.forEach(list => console.log(list.date.toDateString()));
};

updateGoldPredictions();