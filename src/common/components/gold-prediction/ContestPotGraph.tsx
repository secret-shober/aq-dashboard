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

const FIRST_SEASON = 2021;

const ContestPotGraph = () => {
  const { data, isLoading } = useContestPotEntries();
  const [predictedValues, setPredictedValues] = useState<ContestPotEntry[]>([]);

  const seasons = useMemo(
    () => (data ? Array.from(new Set(data.map((x) => x.season))) : []),
    [data]
  );

  const currentSeason = useMemo(() => seasons[seasons.length - 1], [seasons]);

  const convertDataToTensor = (data: any, shape: [number, number]) => {
    return tf.tidy(() => {
      const inputTensor = tf.tensor2d(data, shape);
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();

      const normalizedTensor = inputTensor
        .sub(inputMin)
        .div(inputMax.sub(inputMin));

      return {
        tensor: normalizedTensor,
        tensorMin: inputMin,
        tensorMax: inputMax,
      };
    });
  };

  const getPredictedEntries = useCallback(async () => {
    if (data && currentSeason) {
      // our inputs will be day and season, our output, total Contest Gold.
      const trainingEntriesToUse = data.map((entry) => [
        entry.day,
        entry.season - FIRST_SEASON,
        entry.totalContestGold,
      ]);

      tf.util.shuffle(trainingEntriesToUse);

      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          activation: "linear",
          inputShape: [2],
          units: 1,
        })
      );

      // model.add(
      //   tf.layers.dense({
      //     units: 1,
      //   })
      // );

      const trainingXs = trainingEntriesToUse.map((entry) => entry.slice(0, 2));
      const trainingYs = trainingEntriesToUse.map(
        (entry) => entry[entry.length - 1]
      );

      const trainingInputData = convertDataToTensor(trainingXs, [
        trainingXs.length,
        2,
      ]);

      const trainingOutputData = convertDataToTensor(trainingYs, [
        trainingYs.length,
        1,
      ]);

      model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ["mse"],
      });

      const batchSize = 32;
      const epochs = 200;

      await model.fit(trainingInputData.tensor, trainingOutputData.tensor, {
        batchSize,
        epochs,
        shuffle: true,
      });

      const predictionEntries: number[][] = [];
      for (let day = 0; day < 63; day++) {
        predictionEntries.push([day, currentSeason - FIRST_SEASON]);
      }

      const [xSync, ySync] = tf.tidy(() => {
        const predictionTensor = convertDataToTensor(predictionEntries, [
          predictionEntries.length,
          2,
        ]);

        const predictions = model.predict(predictionTensor.tensor);

        const unNormXs = predictionTensor.tensor
          .mul(trainingInputData.tensorMax.sub(trainingInputData.tensorMin))
          .add(trainingInputData.tensorMin);

        const unNormPreds = (predictions as tf.Tensor)
          .mul(trainingOutputData.tensorMax.sub(trainingOutputData.tensorMin))
          .add(trainingOutputData.tensorMin);

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
          stroke={"black"}
        />
      )}
    </LineChart>
  );
};

export default ContestPotGraph;
