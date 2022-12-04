import * as dotenv from 'dotenv';

dotenv.config();

interface Competitor {
    id: number;
    name: string;
    guild: string;
    amount: string;
}
interface GoldList {
    givers: Competitor[],
    total: string,
    title: string,
    desc: string,
}

const URL = 'https://www.battleon.com/Top/ElfGold';

const getList = async (): Promise<GoldList> => {
    const request = await fetch(URL);
    const response = await request.json();
    return response as GoldList;
}

getList().then((result) => {
    console.log(result)
}) ;
