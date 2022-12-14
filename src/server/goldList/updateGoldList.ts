import dotenv from "dotenv";

import { getClient } from "../client";
import {
    calculateTotalGoldFromPlayer,
    getCurrentGoldList,
    getCurrentTokenList,
    getEligiblePlayers,
    getPlayerInformation,
    processVaultInformation,
    sortPlayersById,
} from "../../common/utils/goldList";

import type {
    PastPlayerIdsQuery,
    PlayerInformation,
    VaultInformation,
    GoldListRecord,
} from '../../common/types/goldList';

dotenv.config();

const updateGoldList = async () => {
    const client = await getClient();
    const db = client.db("aq-dashboard");

    const { ids: pastIds } = await db
        .collection("past-contest-ids")
        .findOne<PastPlayerIdsQuery>();

    console.log("Getting Current IDs...");
    const currentGoldPlayers = await getCurrentGoldList();
    const currentTokenPlayers = await getCurrentTokenList();
    console.log("Successfully got current IDs. Getting items of interest...");

    const playerIds = Array.from(new Set([
        ...currentGoldPlayers.givers.map((player) => player.id),
        ...currentTokenPlayers.givers.map((player) => player.id),
        ...pastIds,
    ]));

    const eligiblePlayers = await getEligiblePlayers(playerIds);
    const allEligibleIds = eligiblePlayers.map(x => x.id);

    console.log("Number of players eligible to track:", allEligibleIds.length);
    console.log("Getting all the items of interest...");

    const allPlayerInformation = await Promise.all(
        allEligibleIds.map((playerId) =>
            getPlayerInformation(
                playerId,
                eligiblePlayers.find((detail) => detail.id === playerId),
                currentGoldPlayers.givers
            )
        )
    );

    console.log("Got all the items of interest! Organizing results...");

    const playerVaults = new Map<number, VaultInformation>();
    const playersWithoutVaults: PlayerInformation[] = [];

    allPlayerInformation.forEach((player) => {
        const vaultId = player.vaultId;

        if (vaultId) {
            const currentVault: VaultInformation = playerVaults.get(player.vaultId);
            playerVaults.set(vaultId, {
                ...currentVault,
                vaultId: player.vaultId,
                associatedPlayers: [...(currentVault?.associatedPlayers || []), player],
            });
        } else {
            playersWithoutVaults.push(player);
        }
    });

    console.log("Now processing players with vaults...");

    let processVaultsRequests = [];

    playerVaults.forEach((vault) => {
        processVaultsRequests.push(
            processVaultInformation(vault, currentGoldPlayers.givers)
        );
    });

    processVaultsRequests = await Promise.all(processVaultsRequests);

    const vaultless: VaultInformation[] = playersWithoutVaults.map((player) => ({
        primaryAccountId: player.id,
        associatedPlayers: [player],
    }));

    const allVaults = [...processVaultsRequests, ...vaultless];

    console.log("Finished processing the vaults... Updating the list...");

    const processedVaults = allVaults.map(
        (processedVault: VaultInformation) => {
            const primaryAccountId = processedVault.primaryAccountId;
            const associatedPlayers = processedVault.associatedPlayers?.map(
                (player) => ({
                    ...player,
                    totalEstimatedGold: calculateTotalGoldFromPlayer(
                        player,
                        processedVault.associatedPlayers.filter((p) => p.id === player.id),
                        processedVault.vaultItems,
                        player.id === primaryAccountId
                    ),
                })
            );
            return {
                ...processedVault,
                associatedPlayers: sortPlayersById(associatedPlayers),
            };
        }
    );

    await db.collection("gold-list").drop();

    await db
        .collection("gold-list")
        .updateOne(
            { id: 1 },
            {
                $set: {
                    id: 1,
                    vaults: Array.from(processedVaults.values()),
                    date: new Date()
                } as GoldListRecord
            },
            { upsert: true }
        );
    await client.close();
    console.log("Updated the List! Waiting on the next interval/update...");
};

const run = async () => {
    const intervalTimer = 1000 * 60 * Number(process.env.INTERVAL_MINUTES);
    let currentDate = new Date();
    let contestActive = currentDate.getMonth() === 0 || currentDate.getMonth() === 11;

    try {
        if (contestActive) {
            await updateGoldList();
        }
    }
    catch (e) {
        console.log('Failed to update the gold list. Error:', e);
    }
    finally {
        setInterval(async () => {
            contestActive = currentDate.getMonth() === 0 || currentDate.getMonth() === 11;
            try {
                if (contestActive) {
                    await updateGoldList();
                }
            }
            catch (e) {
                console.log('Encountered an error:', e);
                console.log('Will attempt to poll again next interval...');
            }
        }, intervalTimer);
    }
};

run();
