import { useMemo, useState } from "react";

import { GoldListRecord, PlayerInformation } from "../../server/goldList/types";
import CompetitorBreakdown from "../../src/components/gold-contest/CompetitorBreakdown";
import CompetitorList from "../../src/components/gold-contest/CompetitorList";

const GoldContest: React.FC<{ data: GoldListRecord }> = ({
  data,
}): JSX.Element => {
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
    [selectedId, data.vaults]
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
        updatedDate={data.date}
      />
      {data.vaults.length && (
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

export const getStaticProps = async (): Promise<{
  props: { data: GoldListRecord };
}> => {
  const url =
    process.env.NODE_ENV === "production"
      ? "https://aq-dashboard.onrender.com/"
      : "http://localhost:3000";

  const request = await fetch(`${url}/api/goldList`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: GoldListRecord = await request.json();

  return {
    props: {
      data: response,
    },
  };
};
