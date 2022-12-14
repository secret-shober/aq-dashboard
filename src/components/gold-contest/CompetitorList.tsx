import styled from "@emotion/styled";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TablePagination,
  Typography,
  TextField,
  TableFooter,
  Checkbox,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PlayerInformation } from "../../../server/goldList";
import useDebounce from "../../hooks/useDebounce";

interface CompetitorListProps {
  players: PlayerInformation[];
  handleNameClick: (id: number) => void;
  updatedDate?: Date;
}

const TableContainer = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 16px;
`;

const StyledTable = styled(Table)`
  width: 75%;
  border: 1px solid #e0e0e0;
`;

const TableOptions = styled(TableFooter)`
  position: sticky;
  bottom: 0;
  background-color: white;
`;

const CompetitorList: React.FC<CompetitorListProps> = ({
  players,
  handleNameClick,
  updatedDate,
}): JSX.Element => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [page, setPage] = useState<number>(0);
  const [excludedPlayers, setExcludedPlayers] = useState<PlayerInformation[]>(
    []
  );
  const [playersToExclude, setPlayersToExclude] = useState<PlayerInformation[]>(
    []
  );
  const [searchString, setSearchString] = useState<string>("");
  const { debounced, setImmediateValue } = useDebounce(searchString, 500);

  const filteredPlayers: PlayerInformation[] = useMemo(() => {
    if (debounced.length === 0) {
      return players;
    } else {
      return players
        .filter(
          (player) =>
            !excludedPlayers.some((excluded) => excluded.id === player.id)
        )
        .filter((player) => {
          return (
            player.id.toString() === debounced ||
            player.name.toLowerCase().includes(debounced.toLowerCase())
          );
        });
    }
  }, [debounced, players, excludedPlayers]);

  useEffect(() => {
    setPage(0);
  }, [debounced, filteredPlayers, players]);

  const isPlayerChecked = useCallback(
    (player: PlayerInformation) =>
      playersToExclude.some((excluded) => excluded.id === player.id),
    [playersToExclude]
  );

  const handleReset = () => {
    setPage(0);
    setExcludedPlayers([]);
    setPlayersToExclude([]);
    setSearchString("");
    setImmediateValue("");
    setRowsPerPage(50);
  };

  const handlePlayerToExclude = (player: PlayerInformation) => {
    if (isPlayerChecked(player)) {
      const indexToSlice = playersToExclude.findIndex(
        (excluded) => excluded.id === player.id
      );

      const newPlayersToExclude = [
        ...playersToExclude.slice(0, indexToSlice),
        ...playersToExclude.slice(indexToSlice + 1),
      ];

      setPlayersToExclude(newPlayersToExclude);
    } else {
      setPlayersToExclude([...playersToExclude, player]);
    }
  };

  const handleExcludePlayers = () => {
    setExcludedPlayers([...excludedPlayers, ...playersToExclude]);
    setPlayersToExclude([]);
  };

  return (
    <TableContainer>
      <Typography variant="h6" component="h2">
        Gold Contest List
      </Typography>
      <Typography>
        Current Total Gold Estimate:{" "}
        {players
          .reduce((acc, curr) => acc + Number(curr.totalEstimatedGold), 0)
          .toLocaleString()}
      </Typography>
      {updatedDate && (
        <Typography>
          Last Updated at: {new Date(updatedDate).toLocaleString()}
        </Typography>
      )}
      <StyledTable stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Rank</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Total Estimated Gold</TableCell>
            <TableCell>Current Gold</TableCell>
            <TableCell>Daily Gold</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPlayers
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((player, index) => (
              <TableRow key={player.id}>
                <TableCell>
                  <Checkbox
                    onChange={() => handlePlayerToExclude(player)}
                    checked={isPlayerChecked(player)}
                  />
                </TableCell>
                <TableCell>
                  {debounced
                    ? 1 + players.findIndex((x) => x.id === player.id)
                    : page * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleNameClick(player.id)}>
                    {player.name}
                  </Button>
                </TableCell>
                <TableCell>
                  {player.totalEstimatedGold?.toLocaleString()}
                </TableCell>
                <TableCell>{player.gold?.toLocaleString()}</TableCell>
                <TableCell>{player.dailyGold?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableOptions>
          <TableRow>
            <TableCell>
              <TextField
                placeholder="Search for a name or an ID..."
                value={searchString}
                onChange={(evt) => setSearchString(evt.target.value.toString())}
              />
            </TableCell>
            <TableCell>
              <Button
                onClick={handleExcludePlayers}
                variant="contained"
                disabled={playersToExclude.length === 0}
                color="error"
              >
                Filter Players
                {playersToExclude.length
                  ? `: (${playersToExclude.length})`
                  : ""}
              </Button>
              <Button
                disabled={playersToExclude.length !== 0}
                onClick={handleReset}
              >
                Reset
              </Button>
            </TableCell>
            <TablePagination
              page={page}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(evt) =>
                setRowsPerPage(Number(evt.target.value))
              }
              onPageChange={(evt, page) => setPage(page)}
              rowsPerPageOptions={[
                5,
                10,
                25,
                50,
                100,
                { label: "All", value: -1 },
              ]}
              count={filteredPlayers.length}
            />
          </TableRow>
        </TableOptions>
      </StyledTable>
    </TableContainer>
  );
};

export default CompetitorList;
