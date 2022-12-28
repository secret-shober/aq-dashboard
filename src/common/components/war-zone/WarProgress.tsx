import styled from "@emotion/styled";
import { LinearProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useMemo } from "react";
import useTopWarWins from "../../hooks/useTopWarWins";
import { useWarZone } from "../../hooks/useWarZone";

const WarProgressContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  p {
    margin-top: 8px;
  }
`;

const WarMeterContainer = styled(Box)`
  position: relative;
  width: 100%;
`;
const WarMeterText = styled("div")`
  position: absolute;
  right: 0;
  left: 0;
  margin-top: 8px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  z-index: 1;
  color: purple;
`;

const WarMeter = styled(LinearProgress)`
  width: 50%;
  height: 24px;
  margin-top: 8px;
  background-color: #ecf0f1;
  z-index: -1;
  &.MuiLinearProgress-root {
    span {
      background-color: #2ecc71;
    }
  }
`;

const WarProgress = () => {
  const { data: currentWarProgress, isLoading: progressLoading } = useWarZone();
  const { data: currentWarZone, isLoading: winsLoading } = useTopWarWins();

  const warPercentage: number = useMemo(
    () =>
      currentWarProgress
        ? currentWarProgress?.waves / currentWarProgress?.totalWaves
        : 0,
    [currentWarProgress]
  );

  if (progressLoading || winsLoading) {
    return null;
  }

  const progressText = `${currentWarProgress?.waves.toLocaleString()} / ${currentWarProgress?.totalWaves.toLocaleString()}`;

  const formattedWarPercentage = Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(warPercentage * 100);

  return (
    <WarProgressContainer>
      <Typography>
        Current War Name: <b>{currentWarZone?.zoneName}</b>
      </Typography>
      <Typography>War Progress:</Typography>
      <WarMeterContainer>
        <WarMeterText>
          {progressText} Waves Defeated ({formattedWarPercentage}%)
        </WarMeterText>
      </WarMeterContainer>
      <WarMeter
        variant="determinate"
        color="success"
        value={warPercentage * 100}
      />
      {warPercentage >= 1 && <Typography>The Current War is over!</Typography>}
    </WarProgressContainer>
  );
};

export default WarProgress;
