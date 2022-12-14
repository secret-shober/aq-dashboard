import { JSDOM } from "jsdom";

import type {
    Competitor,
    GoldList,
    PlayerDetails,
    PlayerInformation,
    PlayerItemsOfInterest,
    VaultInformation,
} from "../types/goldList";

export const itemsOfInterest: PlayerItemsOfInterest = {
    "Gold Storage Chest": 1000000000,
    "Torontosaurus Rex": 48410333,
    "War's Legacy": 60512917,
    "Mutant King Club": 48410333,
    "Archmage Research": 36307750,
    "War-Torn Heirloom": 24205166,
    "Gemini": 24205166,
    "Fireworks Buckler": 24205166,
    "Fairy Godmother": 18153874
};

export const getCurrentGoldList = async (): Promise<GoldList> => {
    const request = await fetch("https://www.battleon.com/Top/ElfGold");
    const response = await request.json();
    return response as GoldList;
};

export const getCurrentTokenList = async (): Promise<GoldList> => {
    // Yeah, I know this isn't the goldlist, but the payload is still the same structure.
    const request = await fetch("https://www.battleon.com/Top/ElfTokens");
    const response = await request.json();
    return response as GoldList;
};

export const getEligiblePlayers = async (
    ids: number[]
): Promise<PlayerDetails[]> => {
    const requests = ids.map((id) => getPlayerDetails(id));
    const responses = await Promise.all(requests);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const contestStartDate = new Date(
        currentMonth === 11 ? currentYear : currentYear - 1,
        11,
        1
    );

    return responses.filter(
        (player) => new Date(player.accessDate) >= contestStartDate
    );
};

export const getPlayerDetails = async (id: number): Promise<PlayerDetails> => {
    const request = await fetch(
        `https://account.battleon.com/charpage/details?id=${id}`
    );
    const response = await request.json();
    return response.details;
};

export const getCharacterPageUrl = (id: number): string => {
    return `https://aq.battleon.com/game/flash/charview?temp=${id}`;
};

export const getCharacterPage = async (id: number): Promise<JSDOM> => {
    const request = await fetch(getCharacterPageUrl(id));
    const response = await request.text();
    return new JSDOM(response);
};

export const getCharacterPageItems = (
    document: Document
): PlayerItemsOfInterest => {
    const items: PlayerItemsOfInterest = {};

    const textElements = Array.from(document.querySelectorAll("text"));

    Object.keys(itemsOfInterest).forEach((key) => {
        const count = textElements.filter(
            (textElement) => textElement.innerHTML.trim() === key
        ).length;
        items[key] = count;
    });

    for (const itemName in items) {
        if (items[itemName] === 0) {
            delete items[itemName];
        }
    }

    return items;
};

export const getPlayerInformation = async (
    id: number,
    detail: PlayerDetails,
    competitors: Competitor[]
): Promise<PlayerInformation> => {
    const {
        window: { document },
    } = await getCharacterPage(id);
    const vaultIdSelector = Array.from(document.querySelectorAll("b")).filter(
        (x) => x.innerHTML === "View Contents"
    );

    // @ts-ignore this will find the expected anchor element
    const vaultId = vaultIdSelector.length ? Number(vaultIdSelector[0].parentElement.href.split("=")[1])
        : undefined;

    const items = await getCharacterPageItems(document);
    const currentDate = new Date();
    const contestIsActive =
        currentDate.getMonth() === 0 || currentDate.getMonth() === 11;
    const foundCompetitor = competitors.find(
        (competitor) => competitor.id === id
    );

    let goldDonated = 0;

    if (foundCompetitor) {
        goldDonated = Number(foundCompetitor.amount?.replace(/,/g, ""));
    }

    return {
        vaultId,
        id,
        items,
        name: detail.name,
        gold: detail.gold,
        dailyGold: detail.dailyGold,
        type: detail.type,
        level: detail.level,
        goldDonated: contestIsActive ? goldDonated : 0,
    };
};

export const getPrimaryAccount = (
    competitors: Competitor[],
    associatedPlayers: PlayerInformation[]
): number => {
    if (associatedPlayers.length === 1) {
        return associatedPlayers[0].id;
    }

    const associatedPlayerIds = associatedPlayers.map((x) => x.id);

    const competitivePlayers = competitors.filter((x) =>
        associatedPlayerIds.includes(x.id)
    );

    if (competitivePlayers.length) {
        const sorted = associatedPlayers.sort((a, b) => {
            const firstPlayerIndex = competitors.findIndex((c) => c.id === a.id);
            const secondPlayerIndex = competitors.findIndex((c) => c.id === b.id);
            if (firstPlayerIndex < secondPlayerIndex) {
                return 1;
            } else if (firstPlayerIndex > secondPlayerIndex) {
                return -1;
            }
            return 0;
        });

        return sorted[0].id;
    }

    return associatedPlayers.map((a) => a.id).sort()[0];
};

export const calculateTotalFromItems = (items: PlayerItemsOfInterest) => {
    let total = 0;

    for (const itemName in itemsOfInterest) {
        total += itemsOfInterest[itemName] * (items[itemName] || 0);
    }
    return total;
};

export const calculateTotalGoldFromPlayer = (
    player: PlayerInformation,
    otherPlayers: PlayerInformation[],
    vault?: PlayerItemsOfInterest,
    isPrimary?: boolean
): number => {
    let total = player.gold + player.goldDonated;

    if (isPrimary) {
        return (
            total +
            otherPlayers
                .filter((o) => o.id === player.id)
                .reduce((acc, curr) => acc + calculateTotalFromItems(curr.items), 0) +
            (vault ? calculateTotalFromItems(vault) : 0)
        );
    }
    return total + calculateTotalFromItems(player.items);
};

export const processVaultInformation = async (
    vault: VaultInformation,
    competitors: Competitor[]
): Promise<VaultInformation> => {
    const primaryAccountId = getPrimaryAccount(
        competitors,
        vault.associatedPlayers!
    );
    const {
        window: { document },
    } = await getCharacterPage(vault.vaultId!);

    const vaultItems = getCharacterPageItems(document);

    return {
        ...vault,
        primaryAccountId,
        vaultItems,
    };
};

export const sortPlayersById = (players: PlayerInformation[]) => {
    return players.sort((a, b) => {
        if (a.id < b.id) {
            return -1;
        } else if (a.id > b.id) {
            return 1;
        }
        return 0;
    });
};
