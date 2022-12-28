export interface Competitor {
    id: number;
    name: string;
    guild: string;
    amount: string;
}

export interface GoldList {
    givers: Competitor[],
    total: string,
    title: string,
    desc: string,
}

export interface OldGoldList {
    data: Competitor[];
    total: string;
}

export interface GoldListRecord {
    id: number;
    vaults: VaultInformation[];
    date: string;
}

export interface PlayerDetails {
    id: number;
    name: string;
    level: number;
    exp: number;
    gold: number;
    statStr: number;
    statDex: number;
    statInt: number;
    statCha: number;
    statEnd: number;
    statLuk: number;
    createDate: Date;
    accessDate: Date;
    class: string;
    clan: string;
    type: string;
    dailyExp: number;
    dailyGold: number;
}

export interface PlayerItemsOfInterest {
    [name: string]: number;
}

export interface PlayerInformation {
    items: PlayerItemsOfInterest;
    id: number;
    vaultId?: number;
    type: string;
    level: number;
    name: string;
    gold: number;
    goldDonated: number;
    dailyGold: number;
    totalEstimatedGold?: number;
}

export interface PastPlayerIdsQuery {
    ids: number[];
}

export interface VaultInformation {
    primaryAccountId: number;
    vaultId?: number;
    associatedPlayers?: PlayerInformation[];
    vaultItems?: PlayerItemsOfInterest;
}