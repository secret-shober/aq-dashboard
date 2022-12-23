import useSWR from 'swr';
import { WarZonePayload } from "../types/warZone";

export const useWarZone = () => {
    const { data, isLoading } = useSWR<WarZonePayload>("/api/warZone", (input: RequestInfo) =>
        fetch(input).then((res) => res.json())
    );

    return { data, isLoading };
};