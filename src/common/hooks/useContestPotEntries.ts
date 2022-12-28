import useSWR from 'swr';
import { ContestPotEntry } from '../types/goldPrediction';

const useContestPotEntries = () => {
    const result = useSWR<ContestPotEntry[]>("/api/goldPrediction", (input: RequestInfo) =>
        fetch(input).then((res) => res.json())
    );
    return result;
};

export default useContestPotEntries;