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

const SortableHeader = styled(TableCell)`
  cursor: pointer;

  &:hover {
    background-color: #eee;
  }
`;

enum SORT_CATEGORIES {
  TOTAL_ESTIMATED_GOLD = 1,
  GOLD_LEFT = 2,
  GOLD_DONATED = 3,
  DAILY_GOLD = 4,
  GOLD = 5,
}

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
  const [selectedColumn, setSelectedColumn] = useState(1);

  const filteredPlayers: PlayerInformation[] = useMemo(
    () =>
      players.filter(
        (player) =>
          !excludedPlayers.some((excluded) => excluded.id === player.id)
      ),
    [players, excludedPlayers]
  );

  const sortData = (
    a: PlayerInformation,
    b: PlayerInformation,
    predicate: Function
  ): number => {
    if (predicate(a) > predicate(b)) {
      return -1;
    } else if (predicate(a) > predicate(b)) {
      return 1;
    }
    return 0;
  };

  const getSortPredicate = (selectedColumn: number): Function => {
    switch (selectedColumn) {
      case SORT_CATEGORIES.TOTAL_ESTIMATED_GOLD: {
        return (player: PlayerInformation) => player.totalEstimatedGold;
      }
      case SORT_CATEGORIES.GOLD_LEFT: {
        return (player: PlayerInformation) =>
          player.totalEstimatedGold! - player.goldDonated;
      }
      case SORT_CATEGORIES.GOLD_DONATED: {
        return (player: PlayerInformation) => player.goldDonated;
      }
      case SORT_CATEGORIES.DAILY_GOLD: {
        return (player: PlayerInformation) => player.dailyGold;
      }
      default:
      case SORT_CATEGORIES.GOLD: {
        return (player: PlayerInformation) => player.gold;
      }
    }
  };

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

  const searchFiltered: PlayerInformation[] = useMemo(
    () =>
      filteredPlayers
        .filter(
          (player) =>
            player.id.toString() === debounced ||
            player.name.toLowerCase().includes(debounced.toLowerCase())
        )
        .sort((a, b) => sortData(a, b, getSortPredicate(selectedColumn))),
    [debounced, filteredPlayers, selectedColumn]
  );

  useEffect(() => {
    setPage(0);
  }, [debounced, filteredPlayers, players]);

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
        <Typography style={{ marginBottom: "24px" }}>
          Last Updated at: {new Date(updatedDate).toLocaleString()}
        </Typography>
      )}
      <StyledTable stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 75 }} />
            <TableCell>Rank</TableCell>
            <TableCell colSpan={2}>Name</TableCell>
            <SortableHeader
              onClick={() =>
                setSelectedColumn(SORT_CATEGORIES.TOTAL_ESTIMATED_GOLD)
              }
            >
              Total Estimated Gold
            </SortableHeader>
            <SortableHeader
              onClick={() => setSelectedColumn(SORT_CATEGORIES.GOLD_LEFT)}
            >
              Estimated Gold Left
            </SortableHeader>
            <SortableHeader
              onClick={() => setSelectedColumn(SORT_CATEGORIES.GOLD_DONATED)}
            >
              Currently Donated Gold
            </SortableHeader>
            <SortableHeader
              onClick={() => setSelectedColumn(SORT_CATEGORIES.GOLD)}
            >
              Current Gold
            </SortableHeader>
            <SortableHeader
              onClick={() => setSelectedColumn(SORT_CATEGORIES.DAILY_GOLD)}
            >
              Daily Gold
            </SortableHeader>
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
                <TableCell>
                  {(
                    player.totalEstimatedGold! - player.goldDonated
                  ).toLocaleString()}
                </TableCell>
                <TableCell>{player.goldDonated.toLocaleString()}</TableCell>
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
