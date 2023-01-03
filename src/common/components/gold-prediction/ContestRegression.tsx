import styled from "@emotion/styled";
import {
  Box,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useGoldRegression } from "../../hooks/useGoldRegressionEntries";

const RegressionContainer = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: 8px;
  border-top: 8px solid black;
  padding-top: 8px;
  flex-direction: column;
`;

const OptionsContainer = styled(Box)`
  display: flex;
  justify-content: center;

  .MuiSelect-select {
    margin-left: 8px;
    margin-right: 8px;
  }
`;

const ContestRegression = () => {
  const { isLoading, data } = useGoldRegression();
  const [selectedSeason, setSelectedSeason] = useState<number>(2021);
  const [selectedRank, setSelectedRank] = useState<number>(50);
  const [selectedTotalGold, setSelectedTotalGold] =
    useState<number>(4000000000000);

  const seasons: number[] = useMemo(
    () => (isLoading ? [] : Array.from(new Set(data?.map((x) => x.season)))),
    [isLoading, data]
  );

  const ranks: number[] = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < 200; i++) {
      result.push(i + 1);
    }
    return result;
  }, []);

  useEffect(() => {
    if (data) {
      setSelectedSeason(seasons[seasons.length - 1]);
    }
  }, [data, seasons]);

  if (isLoading) {
    return (
      <RegressionContainer>
        <Typography>Loading...</Typography>
      </RegressionContainer>
    );
  }

  return (
    <RegressionContainer>
      <Typography component="h1">Predict Contest Result</Typography>
      <OptionsContainer>
        <Select
          label="Season"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
        >
          <InputLabel>Season</InputLabel>
          {seasons.map((season) => (
            <MenuItem key={season} value={season}>
              {season}
            </MenuItem>
          ))}
        </Select>
        <Select
          label="Rank"
          value={selectedRank}
          onChange={(e) => setSelectedRank(Number(e.target.value))}
        >
          <InputLabel>Rank</InputLabel>
          {ranks.map((rank) => (
            <MenuItem key={rank} value={rank}>
              {rank}
            </MenuItem>
          ))}
        </Select>
        <NumericFormat
          allowNegative={false}
          thousandSeparator
          customInput={TextField}
          value={selectedTotalGold}
          onChange={(e) =>
            setSelectedTotalGold(Number(e.target.value.replace(/,/g, "")))
          }
        />
      </OptionsContainer>
    </RegressionContainer>
  );
};

export default ContestRegression;
