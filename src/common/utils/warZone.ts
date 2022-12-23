import { WarZoneData, WarZonePayload } from "../types/warZone";

export const parseWarZoneData = (data: string): WarZonePayload => {
    const wavePattern = /intCount=\d+/g;
    const totalPattern = /intMax=\d+/g;

    const waveMatch = data.match(wavePattern);
    const totalMatch = data.match(totalPattern);

    return {
        waves: Number(waveMatch![0].split('=')[1]),
        totalWaves: Number(totalMatch![0].split('=')[1])
    };
};

export const getLatestWarZoneId = async (zoneId: number): Promise<number> => {
    try {
        const response = await getWarZoneData(zoneId + 1);
        if (response) {
            return getLatestWarZoneId(zoneId + 1);
        }
    }
    catch (e) {
        return zoneId;
    }
    return zoneId;
};

export const getWarZoneData = async (zoneId: number): Promise<WarZonePayload> => {
    try {
        const formBody = `${encodeURIComponent('zone')}=${encodeURIComponent(zoneId)}`;
        const request = await fetch('https://aq.battleon.com/game/flash/loadzone.asp', {
            method: 'POST',
            body: formBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'charset': 'us-ascii'
            }
        });

        const response = await request.text();

        if (response.includes('success')) {
            const result = parseWarZoneData(response);
            return result;
        }
        else {
            throw new Error(`Invalid Zone ID ${zoneId}`);
        }
    }
    catch (e) {
        throw new Error(`Unable to get Warzone data for id: ${zoneId}. Error: ${e}`);
    }
};