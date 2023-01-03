import React from "react";
import ContestPotGraph from "../../src/common/components/gold-prediction/ContestPotGraph";
import ContestRegression from "../../src/common/components/gold-prediction/ContestRegression";

const GoldPrediction: React.FC = (): JSX.Element => {
  return (
    <React.Fragment>
      <ContestPotGraph />
      <ContestRegression />
    </React.Fragment>
  );
};

export default GoldPrediction;
