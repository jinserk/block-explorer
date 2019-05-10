import React, { Fragment, useContext, useState, useEffect, useRef } from 'react';
import { Modal, Container, Header, Table, Grid, List, Ref, Button, Icon } from 'semantic-ui-react';
import { utils } from 'ethers';
import SortedSet from 'collections/sorted-set';
import math from 'math';

import { NetworkContext, useInterval } from './Common';

const history = {
  numBlocks: 300,
  showBlocks: 50,
  blockNumbers: new SortedSet(),
  blocks: [],
  numTransactions: 5000,
  showTransactions: 300,
  transactions: []
}

export function eventUnregister(provider) {
  if (provider) {
    provider.removeAllListeners('block');
  }
  history.blockNumbers.clear();
  history.blocks.clear();
}

const shortHash = (str) => {
  if (!str) return null;
  const len = utils.hexDataLength(str);
  const head = utils.hexDataSlice(str, 0, 3);
  const tail = utils.hexDataSlice(str, len - 3).slice(2);
  return head + '...' + tail;
}

const showDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toUTCString();
}

const TxDetailsModal = ({ tx }) => (
  <Modal trigger={<Button size='tiny' compact content={ shortHash(tx.hash) } color='black' />} closeIcon>
    <Header icon='ethereum' content={ 'Transaction ' + tx.hash } />
    <Modal.Content scrolling>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Block Number</Grid.Column>
          <Grid.Column width={13}>{ tx.blockNumber }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Block Hash</Grid.Column>
          <Grid.Column width={13}>{ tx.blockHash }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>From</Grid.Column>
          <Grid.Column width={13}>{ tx.from }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>To</Grid.Column>
          <Grid.Column width={13}>{ tx.to }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Nonce</Grid.Column>
          <Grid.Column width={13}>{ tx.nonce }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Value</Grid.Column>
          <Grid.Column width={13}>
            { utils.formatUnits(tx.value, 9) } gwei
            ({ utils.formatEther(tx.value) } eth)
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Gas Limit</Grid.Column>
          <Grid.Column width={13}>{ tx.gasLimit.toString() }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Gas Price</Grid.Column>
          <Grid.Column width={13}>{ utils.formatUnits(tx.gasPrice, 9) } gwei</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>r</Grid.Column>
          <Grid.Column width={13}>{ tx.r }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>s</Grid.Column>
          <Grid.Column width={13}>{ tx.s }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>v</Grid.Column>
          <Grid.Column width={13}>{ tx.v }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Raw</Grid.Column>
          <Grid.Column width={13}>{ tx.raw }</Grid.Column>
        </Grid.Row>
      </Grid>
    </Modal.Content>
  </Modal>
)

const TxEventHandler = () => (
  <Container>
    <Header as='h2' content='Recent Transactions' />
    <div style={{ height: '300px', overflow: 'auto', maxHeight: '300px' }}>
    <Table compact singleline='true'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>TxHash</Table.HeaderCell>
          <Table.HeaderCell>BlockHash</Table.HeaderCell>
          <Table.HeaderCell>From</Table.HeaderCell>
          <Table.HeaderCell>To</Table.HeaderCell>
          <Table.HeaderCell>Gas Limit</Table.HeaderCell>
          <Table.HeaderCell>Gas Price (gwei)</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        { history.transactions.slice().reverse()
          .filter((tx, idx) => (idx < history.showTransactions))
          .map((tx, idx) => {
            if (!tx) return null;
            return (
              <Table.Row key={ tx.hash }>
                <Table.Cell>
                  <TxDetailsModal tx={ tx } />
                </Table.Cell>
                <Table.Cell>{ shortHash(tx.blockHash) }</Table.Cell>
                <Table.Cell>{ shortHash(tx.from) }</Table.Cell>
                <Table.Cell>{ shortHash(tx.to) }</Table.Cell>
                <Table.Cell>{ tx.gasLimit.toString() }</Table.Cell>
                <Table.Cell>{ utils.formatUnits(tx.gasPrice, 9) }</Table.Cell>
              </Table.Row>
            );
          })
        }
      </Table.Body>
    </Table>
    </div>
  </Container>
)

const BlockDetailsModal = ({ block }) => (
  <Modal trigger={<Button size='tiny' compact content={ block.number } color='black' />} closeIcon>
    <Header icon='ethereum' content={ 'Block ' + block.number } />
    <Modal.Content scrolling>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Parent Hash</Grid.Column>
          <Grid.Column width={13}>{ block.parentHash }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Hash</Grid.Column>
          <Grid.Column width={13}>{ block.hash }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>DateTime (UTC)</Grid.Column>
          <Grid.Column width={13}>{ showDate(block.timestamp) }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Miner</Grid.Column>
          <Grid.Column width={13}>{ block.miner }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Difficulty</Grid.Column>
          <Grid.Column width={13}>{ block.difficulty }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Nonce</Grid.Column>
          <Grid.Column width={13}>{ block.nonce }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Extra Data</Grid.Column>
          <Grid.Column width={13}>{ block.extraData }</Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={3}>Transactions</Grid.Column>
          <Grid.Column width={13}>
            { block.transactions.map((h) => (<Fragment key='modal-{h}'>{h} <br /></Fragment>)) }
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Modal.Content>
  </Modal>
)

const BlockEventHandler = () => (
  <Container>
    <Header as='h2' content='Recent Blocks' />
    <div style={{ height: '300px', overflow: 'auto', maxHeight: '300px' }}>
    <Table compact singleline='true'>
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
        { history.blocks.slice().reverse()
          .filter((block, idx) => (idx < history.showBlocks))
          .map((block, idx) => {
            if (!block) return null;
            return (
              <Table.Row key={ block.number }>
                <Table.Cell>
                  <BlockDetailsModal block={ block } />
                </Table.Cell>
                <Table.Cell>{ shortHash(block.hash) }</Table.Cell>
                <Table.Cell>{ showDate(block.timestamp) }</Table.Cell>
                <Table.Cell>{ shortHash(block.miner) }</Table.Cell>
                <Table.Cell>{ block.gasLimit.toString() }</Table.Cell>
                <Table.Cell>{ block.gasUsed.toString() }</Table.Cell>
                <Table.Cell>{ block.transactions.length }</Table.Cell>
              </Table.Row>
            )
          })
        }
      </Table.Body>
    </Table>
    </div>
  </Container>
)

function NetworkStatus () {
  const provider = useContext(NetworkContext);
  const [ network, setNetwork ] = useState({
    name: null, chainId: null, ensAddress: null
  });
  const [ blockNumber, setBlockNumber ] = useState(0);
  const [ gasPrice, setGasPrice ] = useState(0);
  const [ difficulty, setDifficulty ] = useState(0);
  const [ hashRate, setHashRate ] = useState(0);
  const [ txRate, setTxRate ] = useState(0);

  useEffect(() => {
    setNetwork({
      name: null, chainId: null, ensAddress: null
    });
    setBlockNumber(0);
    setGasPrice(0);
    setDifficulty(0);
    setHashRate(0);
    setTxRate(0);
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
      setTxRate(totalTxn / timeDiff);
    }
  }

  useInterval(getPeriodicInfo, 4000);

  const getUnitified = (num) => {
    let tmp = math.round(num) / 1e3;
    if (1 <= tmp && tmp < 1e3) return (tmp.toString() + ' K');
    tmp = math.round(num / 1e3) / 1e3;
    if (1 <= tmp && tmp < 1e3) return (tmp.toString() + ' M');
    tmp = math.round(num / 1e6) / 1e3;
    if (1 <= tmp && tmp < 1e3) return (tmp.toString() + ' G');
    tmp = math.round(num / 1e9) / 1e3;
    if (1 <= tmp && tmp < 1e3) return (tmp.toString() + ' T');
    tmp = math.round(num / 1e12) / 1e3;
    if (1 <= tmp && tmp < 1e3) return (tmp.toString() + ' P');
    tmp = math.round(num / 1e15) / 1e3;
    if (1 <= tmp && tmp < 1e3) return (tmp.toString() + ' E');
    tmp = math.round(num * 1e3) / 1e3;
    return tmp.toString() + ' ';
  }

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
            { getUnitified(difficulty)}H
          </Grid.Column>
          <Grid.Column>
            <Header sub content='Hash Rate' />
            { getUnitified(hashRate) }H/s
          </Grid.Column>
          <Grid.Column columns={2}>
            <Header sub content='Tx Rate' />
            { getUnitified(txRate)}tps
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default function AppMain() {
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
          block.transactions.forEach(txHash => {
            provider.getTransaction(txHash).then(tx => {
              history.transactions.push(tx);
              while (history.transactions.length > history.numTransactions) {
                history.transactions.shift();
              }
            });
          });
          // for re-rendering
          setState(blockNumber);
        });
      }
    });
  });

  return (
    <Grid padded>
      <Grid.Row>
        <Grid.Column>
          <NetworkStatus />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <BlockEventHandler />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <TxEventHandler />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
