import React, { Fragment, useContext, useState, useEffect } from 'react';
import { Segment, Container, Header, Table, Grid, Button, Icon } from 'semantic-ui-react';
import { utils } from 'ethers';
import SortedSet from 'collections/sorted-set';
import math from 'math';

import { NetworkContext, useInterval } from './Common';

const history = {
  numBlocks: 100,
  blockNumbers: new SortedSet(),
  blocks: [],
}

export function eventUnregister(provider) {
  if (provider) {
    provider.removeAllListeners('block');
  }
  history.blockNumbers.clear();
  history.blocks.clear();
}

const shortHash = (str) => {
  const len = utils.hexDataLength(str);
  const head = utils.hexDataSlice(str, 0, 3);
  const tail = utils.hexDataSlice(str, len - 3).slice(2);
  return head + '...' + tail;
}

const showDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toUTCString();
}

function BlockEventHandler() {
  const provider = useContext(NetworkContext);
  const [state, setState] = useState(0);

  useEffect(() => {
    provider.on('block', blockNumber => {
      if (!history.blockNumbers.has(blockNumber)) {
        history.blockNumbers.add(blockNumber);
        provider.getBlock(blockNumber).then(block => {
          history.blocks.push(block);
          history.blocks.sort((b1, b2) => (b1.number - b2.number));
          if (history.blocks.length > history.numBlocks) {
            history.blockNumbers.shift();
            history.blocks.shift();
          }
          // for re-rendering
          setState(blockNumber);
        });
      }
    });
  });

  return (
    <Container>
      <Header as='h2' content='Recent Blocks' />
      <Table singleline='true'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Number</Table.HeaderCell>
            <Table.HeaderCell>Hash</Table.HeaderCell>
            <Table.HeaderCell>Datetime</Table.HeaderCell>
            <Table.HeaderCell>Miner</Table.HeaderCell>
            <Table.HeaderCell>Gas Limit</Table.HeaderCell>
            <Table.HeaderCell>Gas Used</Table.HeaderCell>
            <Table.HeaderCell>Transactions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
        { history.blocks.slice().reverse().map((block, idx) => {
          return (
            <Table.Row key={ block.number }>
              <Table.Cell>{ block.number }</Table.Cell>
              <Table.Cell>{ shortHash(block.hash) }</Table.Cell>
              <Table.Cell>{ showDate(block.timestamp) }</Table.Cell>
              <Table.Cell>{ shortHash(block.miner) }</Table.Cell>
              <Table.Cell>{ block.gasLimit.toString() }</Table.Cell>
              <Table.Cell>{ block.gasUsed.toString() }</Table.Cell>
              <Table.Cell>{ block.transactions.length }</Table.Cell>
            </Table.Row>
          )
        }) }
        </Table.Body>
      </Table>
    </Container>
  );
}

function NetworkStatus () {
  const provider = useContext(NetworkContext);
  const [ network, setNetwork ] = useState({
    name: null, chainId: null, ensAddress: null
  });
  const [ blockNumber, setBlockNumber ] = useState(0);
  const [ gasPrice, setGasPrice ] = useState(0);
  const [ difficulty, setDifficulty ] = useState(0);
  const [ hashRate, setHashRate ] = useState(0);
  const [ tps, setTps ] = useState(0);

  useEffect(() => {
    setNetwork({
      name: null, chainId: null, ensAddress: null
    });
    setBlockNumber(0);
    setGasPrice(0);
    setDifficulty(0);
    setHashRate(0);
  }, [provider]);

  provider.getNetwork()
    .then(value => setNetwork(value))
    .catch(error => console.log(error));

  const getPeriodicInfo = () => {
    provider.getBlockNumber()
      .then(value => setBlockNumber(value))
      .catch(error => console.log(error));

    provider.getGasPrice()
      .then(value => {
        const price = utils.formatUnits(value, 9);
        setGasPrice(price);
      }).catch(error => console.log(error));

    const numBlocks = history.blocks.length;
    if (numBlocks > 1) {
      const totalDifficulty = math.sum(history.blocks.map(b => b.difficulty));
      const totalTxn = math.sum(history.blocks.map(b => b.transactions.length));
      const timeDiff = history.blocks[numBlocks - 1].timestamp - history.blocks[0].timestamp;
      setDifficulty(totalDifficulty / numBlocks);
      setHashRate(totalDifficulty / timeDiff);
      setTps(totalTxn / timeDiff);
    }
  }

  useInterval(getPeriodicInfo, 4000);

  return (
    <Container>
      <Header as='h2' content='Network Profile' />
      <Grid stackable={false} padded>
        <Grid.Row columns={5}>
          <Grid.Column>
            <Header sub content='Network Name' />
            { network.name || '-' }
          </Grid.Column>
          <Grid.Column>
            <Header sub content='Network ID' />
            { network.chainId || '-' }
          </Grid.Column>
          <Grid.Column>
            <Header sub content='Block Number' />
            { blockNumber }
          </Grid.Column>
          <Grid.Column columns={2}>
            <Header sub content='ENS Address' />
            { network.ensAddress || '-' }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={5}>
          <Grid.Column>
            <Header sub content='Gas Price' />
            { gasPrice } gwei
          </Grid.Column>
          <Grid.Column>
            <Header sub content='Difficulty' />
            { math.round(difficulty / 1e9) / 1e3 } TH
          </Grid.Column>
          <Grid.Column>
            <Header sub content='Hash Rate' />
            { math.round(hashRate / 1e9) / 1e3 } TH/s
          </Grid.Column>
          <Grid.Column columns={2}>
            <Header sub content='Tx Rate' />
            { math.round(tps * 1e3) / 1e3 } tx/s
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default function AppMain() {
  return (
    <Fragment>
      <Segment>
        <NetworkStatus />
      </Segment>
      <Segment>
        <BlockEventHandler />
      </Segment>
    </Fragment>
  );
}

