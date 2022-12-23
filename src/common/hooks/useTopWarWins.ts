import useSWR from 'swr';
import { TopWarWins, WarZonePayload } from "../types/warZone";

const useTopWarWins = () => {
    const { data, isLoading } = useSWR<TopWarWins>("https://www.battleon.com/Top/ZoneWins", (input: RequestInfo) =>
        fetch(input).then((res) => res.json()).then((value) => value[0])
    );
    return { data, isLoading };
};

export default useTopWarWins;