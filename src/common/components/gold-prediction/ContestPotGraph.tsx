import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  CartesianGrid,
} from "recharts";
import randomColor from "randomcolor";
import useContestPotEntries from "../../hooks/useContestPotEntries";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { ContestPotEntry } from "../../types/goldPrediction";

const ContestPotGraph = () => {
  const { data, isLoading } = useContestPotEntries();
  const [predictedValues, setPredictedValues] = useState<ContestPotEntry[]>([]);

  const seasons = useMemo(
    () => (data ? Array.from(new Set(data.map((x) => x.season))) : []),
    [data]
  );

  const currentSeason = useMemo(() => seasons[seasons.length - 1], [seasons]);

  const getPredictedEntries = useCallback(async () => {
    if (data && currentSeason) {
      // our inputs will be day and season, our output, total Contest Gold.
      const trainingEntriesToUse = data.map((entry) => [
        entry.day,
        entry.season,
        entry.totalContestGold,
      ]);

      tf.util.shuffle(trainingEntriesToUse);

      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          inputShape: [2],
          activation: "linear",
          units: 1,
          useBias: true,
        })
      );

      model.add(
        tf.layers.dense({
          units: 1,
          useBias: true,
        })
      );

      const trainingXs = trainingEntriesToUse.map((entry) => entry.slice(0, 2));
      const trainingYs = trainingEntriesToUse.map(
        (entry) => entry[entry.length - 1]
      );

      const inputTensor = tf.tensor2d(trainingXs);
      const labelTensor = tf.tensor(trainingYs);

      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedTrainingInputs = inputTensor
        .sub(inputMin)
        .div(inputMax.sub(inputMin));

      const normalizedTrainingLabels = labelTensor
        .sub(labelMin)
        .div(labelMax.sub(labelMin));

      model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ["mse"],
      });

      const batchSize = 32;
      const epochs = 50;

      await model.fit(normalizedTrainingInputs, normalizedTrainingLabels, {
        batchSize,
        epochs,
        shuffle: true,
      });

      const predictionEntries: number[][] = [];
      for (let day = 1; day < 62; day++) {
        predictionEntries.push([day, currentSeason]);
      }

      const [xSync, ySync] = tf.tidy(() => {
        const predictionTensor = tf.tensor2d(predictionEntries, [
          predictionEntries.length,
          2,
        ]);

        const predictionTensorMin = predictionTensor.min();
        const predictionTensorMax = predictionTensor.max();
        const normalizedPredictionEntries = predictionTensor
          .sub(predictionTensorMin)
          .div(predictionTensorMax.sub(predictionTensorMin));

        const predictions = model.predict(normalizedPredictionEntries);

        const unNormXs = normalizedPredictionEntries
          .mul(inputMax.sub(inputMin))
          .add(inputMin);

        const unNormPreds = (predictions as tf.Tensor)
          .mul(labelMax.sub(labelMin))
          .add(labelMin);

        const xSync = Array.from(unNormXs.dataSync());
        const ySync: number[] = Array.from(unNormPreds.dataSync());

        return [xSync, ySync];
      });

      const predictedX: number[][] = [];
      let heldPair: number[] = [];

      xSync.forEach((entry) => {
        if (heldPair.length === 2) {
          predictedX.push(heldPair);
          heldPair = [entry];
        } else {
          heldPair.push(entry);
        }
      });

      setPredictedValues(
        predictedX.map((entry, index) => ({
          day: entry[0],
          season: entry[1],
          totalContestGold: ySync[index],
        }))
      );
    }
  }, [data, currentSeason]);

  useEffect(() => {
    if (data) {
      getPredictedEntries();
    }
  }, [data, getPredictedEntries]);

  if (!data || isLoading) {
    return null;
  }

  return (
    <LineChart
      width={1300}
      height={700}
      margin={{
        top: 200,
        left: 200,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />

      <Tooltip />
      <Legend />
      <XAxis dataKey="day" type="number" />
      <YAxis dataKey="totalContestGold" type="number" />
      {seasons.map((season, index) => (
        <Line
          key={index}
          type="monotone"
          dataKey="totalContestGold"
          name={`Season ${season}`}
          data={data.filter((x) => x.season === season)}
          stroke={randomColor()}
        />
      ))}
      {predictedValues.length && (
        <Line
          type="monotone"
          dataKey="totalContestGold"
          name={`Season ${currentSeason} Prediction`}
          data={predictedValues}
          stroke={randomColor()}
        />
      )}
    </LineChart>
  );
};

export default ContestPotGraph;
