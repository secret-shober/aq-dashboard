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
import type { PlayerInformation } from "../../types/goldList";
import useDebounce from "../../../common/hooks/useDebounce";

interface CompetitorListProps {
  players: PlayerInformation[];
  handleNameClick: (id: number) => void;
  updatedDate?: string;
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

  const filteredPlayers: PlayerInformation[] = useMemo(
    () =>
      players.filter(
        (player) =>
          !excludedPlayers.some((excluded) => excluded.id === player.id)
      ),
    [players, excludedPlayers]
  );

  const searchFiltered: PlayerInformation[] = useMemo(
    () =>
      filteredPlayers.filter(
        (player) =>
          player.id.toString() === debounced ||
          player.name.toLowerCase().includes(debounced.toLowerCase())
      ),
    [debounced, filteredPlayers]
  );

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
    const excluding = [...excludedPlayers, ...playersToExclude];
    setExcludedPlayers(excluding);
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
            <TableCell sx={{ width: 75 }} />
            <TableCell>Rank</TableCell>
            <TableCell colSpan={2}>Name</TableCell>
            <TableCell>Total Estimated Gold</TableCell>
            <TableCell>Current Gold</TableCell>
            <TableCell>Daily Gold</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {searchFiltered
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((player, index) => (
              <TableRow key={player.id}>
                <TableCell sx={{ width: 75 }}>
                  <Checkbox
                    onChange={() => handlePlayerToExclude(player)}
                    checked={isPlayerChecked(player)}
                  />
                </TableCell>
                <TableCell>
                  {debounced
                    ? 1 + filteredPlayers.findIndex((x) => x.id === player.id)
                    : page * rowsPerPage + index + 1}
                </TableCell>
                <TableCell colSpan={2} sx={{ paddingLeft: 1 }}>
                  <Button
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                    onClick={() => handleNameClick(player.id)}
                  >
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
          <TableCell colSpan={3} sx={{ borderTop: "1px solid #eoeoeo" }}>
            <TextField
              fullWidth
              placeholder="Search for a name or an ID..."
              value={searchString}
              onChange={(evt) => setSearchString(evt.target.value.toString())}
            />
          </TableCell>
          <TableCell colSpan={2}>
            <Button
              onClick={handleExcludePlayers}
              variant="contained"
              disabled={playersToExclude.length === 0}
              color="error"
            >
              Filter Players
              {playersToExclude.length ? `: (${playersToExclude.length})` : ""}
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
        </TableOptions>
      </StyledTable>
    </TableContainer>
  );
};

export default CompetitorList;
