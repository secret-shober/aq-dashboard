import { useMemo, useState } from "react";

import type {
  GoldListRecord,
  PlayerInformation,
} from "../../src/common/types/goldList";
import CompetitorBreakdown from "../../src/common/components/gold-contest/CompetitorBreakdown";
import CompetitorList from "../../src/common/components/gold-contest/CompetitorList";
import { useGoldList } from "../../src/common/hooks/useGoldList";

const GoldContest: React.FC = (): JSX.Element => {
  const { data } = useGoldList();

  const playersList = useMemo(() => {
    let results: PlayerInformation[] = [];

    data?.vaults?.forEach((vault) => {
      results = [...results, ...(vault.associatedPlayers || [])];
    });

    results.sort((a, b) => {
      if (a.totalEstimatedGold! > b.totalEstimatedGold!) {
        return -1;
      } else if (a.totalEstimatedGold! > b.totalEstimatedGold!) {
        return 1;
      }
      return 0;
    });
    return results;
  }, [data?.vaults]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>(0);

  const selectedVault = useMemo(
    () => data?.vaults?.find((vault) => vault.primaryAccountId === selectedId),
    [selectedId, data?.vaults]
  );

  const handleNameClick = (id: number) => {
    setModalOpen(true);
    setSelectedId(id);
  };

  if (playersList.length === 0) {
    return <div />;
  }
  return (
    <div>
      <CompetitorList
        players={playersList}
        handleNameClick={handleNameClick}
        updatedDate={data?.date}
      />
      {data?.vaults.length && (
        <CompetitorBreakdown
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedId={selectedId}
          vault={selectedVault}
        />
      )}
    </div>
  );
};
export default GoldContest;
