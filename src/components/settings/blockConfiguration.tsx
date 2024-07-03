import { Box, Button, Divider, Stack, styled, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';
import {
  sendMessageToRemoveBlockInterval,
  sendMessageToSetBlockInterval,
} from '../utils/sendMessageBackground';

interface BlockConfigurationProps {
  creatNewBlock: () => Promise<void>;
  fetchCurrentBlockNumber: () => Promise<void>;
  abortBlock: (blockNumber: number) => Promise<void>;
}

export const BlockConfiguration: React.FC<BlockConfigurationProps> = ({
  creatNewBlock,
  fetchCurrentBlockNumber,
  abortBlock,
}) => {
  const [newBlockInterval, setNewBlockInterval] = useState<number>(0);
  const [blockToAbort, setBlockToAbort] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAbort, setLoadingAbort] = useState<boolean>(true);
  const [errorNewInterval, setErrorNewInterval] = useState('');

  const navigate = useNavigate();
  const context = useSharedState();
  const { selectedAccount, url, currentBlock, blockInterval, setBlockInterval, configData } =
    context;

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleIntervalChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!parseInt(event.target.value, 10) || parseInt(event.target.value, 10) === 0) {
      setLoading(true);
      return;
    }
    const newInterval = parseInt(event.target.value, 10);
    if (newInterval < 60000) {
      setErrorNewInterval('Minimum Interval is 60000');
      setLoading(true);
      return;
    }
    setErrorNewInterval('');
    setNewBlockInterval(newInterval);
    setLoading(false);
  };

  const creatNewInterval = () => {
    sendMessageToSetBlockInterval(url, newBlockInterval, setBlockInterval);
  };

  const resetInterval = () => {
    sendMessageToRemoveBlockInterval(url, setBlockInterval);
  };

  const abortInputBlock = () => {
    setLoadingAbort(true);
    abortBlock(blockToAbort);
  };

  const handleAbortBlockChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBlockToAbort(parseInt(event.target.value, 10));
    setLoadingAbort(false);
  };

  useEffect(() => {
    const fetchCurrentBlock = async () => {
      try {
        await fetchCurrentBlockNumber();
      } catch (error) {
        console.error('Error fetching current block number:', error);
      }
    };
    fetchCurrentBlock();
  }, []);

  return (
    <section>
      <PageHeader title="Settings" backButtonHandler={handleBack}>
        <Box
          width={'100%'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          padding={2}
        >
          <Typography variant="caption">
            {' '}
            Block Number: {currentBlock !== null ? currentBlock : 'Loading...'}
          </Typography>
          <Typography variant="caption">
            {' '}
            Interval: {blockInterval.has(url) ? blockInterval.get(url) : 'None'}
          </Typography>
        </Box>
        <Stack direction="column" spacing={2}>
          <Divider variant="middle" />
          <Typography variant="h6">Mint new Block</Typography>
          <Button variant="contained" color="primary" onClick={() => creatNewBlock()}>
            {'Create Block'}
          </Button>
          <Divider variant="middle" />
          <Typography variant="h6">Change interval at which a new block is minted</Typography>
          <TextField
            fullWidth
            label="Block interval"
            id="fullWidth"
            error={!!errorNewInterval}
            helperText={errorNewInterval}
            onChange={(e) => handleIntervalChange(e)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => creatNewInterval()}
            disabled={loading}
          >
            {'Set New Block Interval'}
          </Button>
          <Divider variant="middle" />
          <Typography variant="h6">Reset Interval to none</Typography>
          <Button variant="contained" color="primary" onClick={() => resetInterval()}>
            {'Reset Block Interval'}
          </Button>
          {configData.stateArchiveCapacity == 'full' && (
            <>
              <Divider variant="middle" />
              <Typography variant="h6">Abort a block</Typography>

              <TextField
                fullWidth
                label="Block to abort"
                id="fullWidth"
                onChange={(e) => handleAbortBlockChange(e)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => abortInputBlock()}
                disabled={loadingAbort}
              >
                {'Abort Block'}
              </Button>
            </>
          )}
        </Stack>
      </PageHeader>
    </section>
  );
};
