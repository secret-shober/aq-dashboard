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

const ContestPotGraph = () => {
  const { data, isLoading } = useContestPotEntries();

  const seasons = data ? Array.from(new Set(data.map((x) => x.season))) : [];

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
    </LineChart>
  );
};

export default ContestPotGraph;
