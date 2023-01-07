import styled from "@emotion/styled";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import * as tf from "@tensorflow/tfjs";
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
  margin-top: 8px;
  display: flex;
  flex-direction: row;

  div > * {
    margin-left: 8px;
    margin-right: 8px;
  }
`;

const ContestRegression = () => {
  const { isLoading, data } = useGoldRegression();
  const [selectedSeason, setSelectedSeason] = useState<number>(2022);
  const [selectedRank, setSelectedRank] = useState<number>(50);
  const [selectedDay, setSelectedDay] = useState<number>(60);
  const [savedModel, setSavedModel] = useState<tf.Sequential | undefined>();
  const [selectedTotalGold, setSelectedTotalGold] =
    useState<number>(4000000000000);

  const [predictedAmount, setPredictedAmount] = useState<number>();

  const seasons: number[] = useMemo(
    () => (isLoading ? [] : Array.from(new Set(data?.map((x) => x.season)))),
    [isLoading, data]
  );

  const params = useMemo(
    () => [selectedRank, selectedDay, selectedTotalGold],
    [selectedRank, selectedDay, selectedTotalGold]
  );

  const days: number[] = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < 61; i++) {
      result.push(i + 1);
    }
    return result;
  }, []);

  const ranks: number[] = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < 200; i++) {
      result.push(i + 1);
    }
    return result;
  }, []);

  const trainingEntries = useMemo(
    () => (data ? data.filter((entry) => entry.rank === selectedRank) : []),
    [data, selectedRank]
  );
  useEffect(() => {
    if (data) {
      setSelectedSeason(seasons[seasons.length - 1]);
    }
  }, [data, seasons]);

  const getModel = async () => {
    const dayInputs = trainingEntries.map((x) => x.day);
    const totalGoldInputs = trainingEntries.map((x) => x.totalContestGold);
    const goldOutputs = trainingEntries.map((x) => x.gold);

    const singleInputs = dayInputs.map((day, index) => [
      day,
      totalGoldInputs[index],
    ]);

    const inputs = tf.tensor2d(singleInputs);
    const labels = tf.tensor2d(goldOutputs.map((x) => [x]));

    const inputsMin = inputs.min();
    const inputsMax = inputs.max();
    const labelsMin = labels.min();
    const labelsMax = labels.max();

    const normalizedInputs = inputs
      .sub(inputsMin)
      .div(inputsMax.sub(inputsMin));
    const normalizedOutputs = labels
      .sub(labelsMin)
      .div(labelsMax.sub(labelsMin));

    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [2],
        activation: "relu",
        units: 1,
      })
    );

    model.add(
      tf.layers.dense({
        activation: "relu",
        units: 1,
      })
    );

    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ["mse"],
    });

    await model.fit(normalizedInputs, normalizedOutputs, {
      epochs: dayInputs.length,
      shuffle: true,
    });

    const predicted = model.predict(tf.tensor([params.slice(1)]));

    //@ts-ignore
    const values = await predicted.array();
    setPredictedAmount(values[0]);
    setSavedModel(model);
  };

  const getPrediction = async () => {
    if (savedModel) {
      const predicted = savedModel.predict(tf.tensor([params.slice(1)]));
      //@ts-ignore
      const values = await predicted.array();
      setPredictedAmount(values[0]);
    }
  };

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
        <FormControl>
          <InputLabel>Season</InputLabel>
          <Select
            label="Season"
            disabled
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
        </FormControl>
        <FormControl>
          <InputLabel>Rank</InputLabel>
          <Select
            label="Rank"
            value={selectedRank}
            onChange={(e) => {
              setSavedModel(undefined);
              setSelectedRank(Number(e.target.value));
            }}
          >
            {ranks.map((rank) => (
              <MenuItem key={rank} value={rank}>
                {rank}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Day</InputLabel>
          <Select
            label="Day"
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
          >
            {days.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <NumericFormat
            allowLeadingZeros
            allowNegative={false}
            thousandSeparator
            customInput={TextField}
            value={selectedTotalGold}
            onChange={(e) =>
              setSelectedTotalGold(Number(e.target.value.replace(/,/g, "")))
            }
          />
        </FormControl>
      </OptionsContainer>
      <Button disabled={trainingEntries.length === 0} onClick={getModel}>
        Create Model
      </Button>
      <Button
        disabled={savedModel || trainingEntries.length === 0 ? false : true}
        onClick={getPrediction}
      >
        Predict!
      </Button>
      {predictedAmount && (
        <Typography>
          Predicted Gold from Parameters:{" "}
          {Intl.NumberFormat("en-US").format(predictedAmount)} Gold
        </Typography>
      )}
    </RegressionContainer>
  );
};

export default ContestRegression;
