import React, { useMemo } from "react";
import {
  Box,
  Button,
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";

import type {
  PlayerItemsOfInterest,
  VaultInformation,
} from "../../types/goldList";
import {
  itemsOfInterest,
  getCharacterPageUrl,
  calculateTotalFromItems,
} from "../../utils/goldList";

const ModalContainer = styled(Box)`
  position: absolute;
  left: 25%;
  margin-top: 16px;
  margin-bottom: 16px;
  height: 95%;
  overflow-y: scroll;
  background-color: white;
  width: 50%;
  padding: 16px;
`;

const ModalHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

const TotalEstimatedGold = styled(Typography)`
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const TableContainer = styled(Table)`
  margin-bottom: 16px;
`;

const ItemBreakdownTable = styled(TableRow)`
  td:not(:first-child),
  th:not(:first-child) {
    text-align: right;
  }
`;

const BasicInformationContainer = styled(Box)`
  margin-top: 8px;
  margin-bottom: 8px;
`;

const BasicInformationItem = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

interface CompetitorBreakdownProps {
  open: boolean;
  onClose: () => void;
  selectedId: number;
  vault?: VaultInformation;
}

const CompetitorBreakdown: React.FC<CompetitorBreakdownProps> = ({
  open,
  onClose,
  selectedId,
  vault,
}): JSX.Element => {
  const primaryPlayer = useMemo(
    () => vault?.associatedPlayers?.find((x) => x.id === selectedId),
    [selectedId, vault]
  );

  const altPlayers = useMemo(
    () => vault?.associatedPlayers?.filter((x) => x.id !== selectedId),
    [selectedId, vault]
  );

  const renderBasicInformation = () => {
    return (
      <BasicInformationContainer sx={{ marginTop: "8px" }}>
        <BasicInformationItem>
          <Typography>Total Estimated Gold: </Typography>
          <Typography>
            {primaryPlayer?.totalEstimatedGold?.toLocaleString()}
          </Typography>
        </BasicInformationItem>

        <BasicInformationItem>
          <Typography>Current Donated Gold: </Typography>
          <Typography>
            {primaryPlayer?.goldDonated?.toLocaleString()}
          </Typography>
        </BasicInformationItem>

        <BasicInformationItem>
          <Typography>Current Gold: </Typography>
          <Typography>{primaryPlayer?.gold?.toLocaleString()}</Typography>
        </BasicInformationItem>
      </BasicInformationContainer>
    );
  };

  const renderItemBreakdown = (items: PlayerItemsOfInterest) => {
    return (
      <TableContainer>
        <TableHead>
          <ItemBreakdownTable>
            <TableCell>Item</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Total Value</TableCell>
          </ItemBreakdownTable>
        </TableHead>
        <TableBody>
          {Object.keys(items).map((itemName, index) => (
            <ItemBreakdownTable key={index}>
              <TableCell>{itemName}</TableCell>
              <TableCell>{items[itemName].toLocaleString()}</TableCell>
              <TableCell>
                {itemsOfInterest[itemName].toLocaleString()}
              </TableCell>
              <TableCell>
                {(items[itemName] * itemsOfInterest[itemName]).toLocaleString()}
              </TableCell>
            </ItemBreakdownTable>
          ))}
          <ItemBreakdownTable>
            <TableCell />
            <TableCell />
            <TableCell>Total Gold:</TableCell>
            <TableCell>
              {calculateTotalFromItems(items).toLocaleString()}
            </TableCell>
          </ItemBreakdownTable>
        </TableBody>
      </TableContainer>
    );
  };
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContainer>
        <ModalHeader>
          <Typography component="h2" variant="h6">
            <a
              href={getCharacterPageUrl(selectedId)}
              target="_blank"
              rel="noreferrer"
            >
              Character:{" "}
              {vault?.associatedPlayers?.find((x) => x.id === selectedId)?.name}
            </a>
          </Typography>
          <Button onClick={onClose}>Close</Button>
        </ModalHeader>
        <Divider />

        {renderBasicInformation()}

        {primaryPlayer?.items && renderItemBreakdown(primaryPlayer.items)}

        {vault?.vaultItems && (
          <React.Fragment>
            <Typography component="h2" variant="h6">
              <a href={getCharacterPageUrl(vault.vaultId!)}>
                Vault Items Breakdown:
              </a>
            </Typography>
            {renderItemBreakdown(vault.vaultItems)}
          </React.Fragment>
        )}

        {altPlayers?.length
          ? altPlayers.map((player) => (
              <Box key={player.id}>
                <Typography component="h2" variant="h6">
                  Alt Character:{" "}
                  <a
                    href={getCharacterPageUrl(player.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {player.name}
                  </a>
                </Typography>
                {renderItemBreakdown(player.items)}
              </Box>
            ))
          : null}
      </ModalContainer>
    </Modal>
  );
};

export default CompetitorBreakdown;
