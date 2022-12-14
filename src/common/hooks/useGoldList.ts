import useSWR from "swr";
import { GoldListRecord } from "../types/goldList";

export const useGoldList = () => {
    const result = useSWR<GoldListRecord>("/api/goldList", (input: RequestInfo) =>
        fetch(input).then((res) => res.json())
    );
    return result;
};
