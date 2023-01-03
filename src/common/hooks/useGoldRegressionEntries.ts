import useSWR from "swr";
import { RankedRegressionEntry } from "../types/goldPrediction";

export const useGoldRegression = () => {
    const result = useSWR<RankedRegressionEntry[]>("/api/goldRegression", (input: RequestInfo) =>
        fetch(input).then((res) => res.json())
    );
    return result;
};
