import React, { Fragment, useContext, useState, useEffect } from 'react';
import { Segment, Container, Header, Table, Grid, Button, Icon } from 'semantic-ui-react';
import { utils } from 'ethers';
import SortedSet from 'collections/sorted-set';

import { NetworkContext, useInterval } from './Common';

const blockNumbers = new SortedSet();
const blocks = [];

export function eventUnregister(provider) {
  if (provider) {
    provider.removeAllListeners('block');
  }
  blockNumbers.clear();
  blocks.clear();
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
      if (!blockNumbers.has(blockNumber)) {
        blockNumbers.add(blockNumber);
        provider.getBlock(blockNumber).then(block => {
          blocks.push(block);
          blocks.sort((b1, b2) => (b1.number - b2.number));
          if (blocks.length > 10) {
            blockNumbers.shift();
            blocks.shift();
          }
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
            <Table.HeaderCell>number</Table.HeaderCell>
            <Table.HeaderCell>hash</Table.HeaderCell>
            <Table.HeaderCell>time</Table.HeaderCell>
            <Table.HeaderCell>miner</Table.HeaderCell>
            <Table.HeaderCell>transactions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
        { blocks.reverse().map((block, idx) => {
          return (
            <Table.Row key={ block.number }>
              <Table.Cell>{ block.number }</Table.Cell>
              <Table.Cell>{ shortHash(block.hash) }</Table.Cell>
              <Table.Cell>{ showDate(block.timestamp) }</Table.Cell>
              <Table.Cell>{ shortHash(block.miner) }</Table.Cell>
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

  useEffect(() => {
    setNetwork({
      name: null, chainId: null, ensAddress: null
    });
    setBlockNumber(0);
    setGasPrice(0);
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
  }

  useInterval(getPeriodicInfo, 4000);

  return (
    <Container>
      <Header as='h2' content='Network Profile' />
      <Grid stackable={false} padded>
        <Grid.Row columns={3}>
          <Grid.Column width={4}>
            <Header sub content='Network Name' />
            { network.name || '-' }
          </Grid.Column>
          <Grid.Column width={4}>
            <Header sub content='Network ID' />
            { network.chainId || '-' }
          </Grid.Column>
          <Grid.Column width={8}>
            <Header sub content='ENS Address' />
            { network.ensAddress || '-' }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Header sub content='Block Number' />
            { blockNumber }
          </Grid.Column>
          <Grid.Column>
            <Header sub content='Gas Price' />
            { gasPrice } gwei
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

