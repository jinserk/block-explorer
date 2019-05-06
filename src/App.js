import React, { Fragment, useState } from 'react';
import { Modal, Header, Grid, Menu, Container, Form, Button, Icon } from 'semantic-ui-react';
import { ethers } from 'ethers';
import 'semantic-ui-css/semantic.min.css';

import './App.css';
import { INFURA_PROJECT_ID } from './Config';

const RPCs = [
  { name:'MainNet', url: 'https://mainnet.infura.io/v3/'+INFURA_PROJECT_ID, color: 'orange' },
  { name:'Ropsten', url: 'https://ropsten.infura.io/v3/'+INFURA_PROJECT_ID, color: 'blue' },
  { name:'Rinkeby', url: 'https://rinkeby.infura.io/v3/'+INFURA_PROJECT_ID, color: 'yellow' },
  { name:'Goerli', url: 'https://goerli.infura.io/v3/'+INFURA_PROJECT_ID, color: 'olive' },
  { name:'Kovan', url: 'https://kovan.infura.io/v3/'+INFURA_PROJECT_ID, color: 'green' },
]

const rpcOptions = RPCs.map((item, idx) => {
  return {
    key: item.name.toLowerCase(),
    value: idx,
    text: item.name
  }
});

function AppMain() {
  return (
    <Fragment>
      content
    </Fragment>
  );
}

function NetworkSelector({ provider, current, setNetwork }) {
  const [showModal, setShowModal] = useState(false);
  const [netCategory, setNetCategory] = useState(0);
  const [netState, setNetState] = useState(current);
  const [urlError, setUrlError] = useState(false);
  const [connState, setConnState] = useState('loading');

  provider.getNetwork()
    .then(() => setConnState('connected'))
    .catch(() => setConnState('error'));

  const currentButton = () => {
    const label = (color) => {
      return {
        as: 'a',
        color: color,
        content: (current.name === 'Custom') ? current.url : current.name
      }
    }

    return (
      <Fragment>
      { connState === 'connected' &&
        <Button icon='ethereum' color={current.color} labelPosition='left' label={label(current.color)}
          onClick={() => setShowModal(true)}
        /> }
      { connState === 'error' &&
        <Button icon='exclamation circle' color='red' labelPosition='left' label={label('red')}
          onClick={() => setShowModal(true)}
        /> }
      { connState === 'loading' &&
      <Button loading color={current.color} labelPosition='left' label={label(current.color)}
        onClick={() => setShowModal(true)}
      /> }
      </Fragment>
    );
  }

  const handleCategoryChange = (event, data) => setNetCategory(data.value);
  const handleNetChange = (event, data) => setNetState(RPCs[data.value]);
  const handleUrlChange = (event, data) => setNetState({
    name: 'Custom',
    url: data.value,
    color: 'grey'
  });

  const handleSubmit = () => {
    try {
      new URL(netState.url);
      setUrlError(false);
    } catch (e) {
      setUrlError(true);
      return null;
    }
    setShowModal(false);
    setNetwork(netState);
  }

  const net = { mainstream: 0, custom: 1 };
  return (
    <Modal open={showModal} trigger={currentButton()} basic size='small'>
      <Header icon='ethereum' content='Select Network' />
      <Modal.Content>
        <Form id="123" onSubmit={handleSubmit}>
        <Grid stackable='false' padded>
          <Grid.Row columns={2} verticalAlign='middle'>
            <Grid.Column width={3}>
              <Form.Radio
                label='MainStream'
                checked={netCategory === net.mainstream}
                value={net.mainstream} onChange={handleCategoryChange} />
            </Grid.Column>
            <Grid.Column width={13}>
              <Form.Select
                placeholder='Choose Network'
                disabled={netCategory !== net.mainstream}
                selection onChange={handleNetChange} options={rpcOptions} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2} textAlign='middle'>
            <Grid.Column width={3}>
              <Form.Radio
                label='Custom'
                checked={netCategory === net.custom}
                value={net.custom} onChange={handleCategoryChange} />
            </Grid.Column>
            <Grid.Column width={13}>
              <Form.Input
                fluid
                error={urlError}
                placeholder='Custom RPC URL'
                disabled={netCategory !== net.custom}
                onChange={handleUrlChange} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='red' inverted onClick={() => setShowModal(false)}>
          <Icon name='remove' /> Cancel
        </Button>
        <Button color='green' type="submit" form="123" inverted>
          <Icon name='checkmark' /> Connect
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default function App() {
  const [network, setNetwork] = useState(RPCs[0]);

  let provider;
  try {
    provider = ethers.getDefaultProvider(network.name.toLowerCase());
  } catch (e) {
    provider = new ethers.providers.JsonRpcProvider(network.url);
  }

  console.log(provider);
  /*
  if (network.value === 0)
    network.value = (async () => {
      return await provider.getNetwork();
    })().chainId;
  */

  return (
    <Fragment>
      <Menu fixed='top' borderless inverted>
        <Container>
          <Menu.Item as='a' header>
            <div style={{ marginLeft: '1em', marginRight: '1em' }}>
              Block Explorer
            </div>
          </Menu.Item>
          <Menu.Item position='right'>
            <div style={{ marginLeft: '1em', marginRight: '1em' }}>
              <NetworkSelector provider={provider} current={network} setNetwork={p => setNetwork(p)} />
            </div>
          </Menu.Item>
        </Container>
      </Menu>

      <Container text style={{ marginTop: '6em' }}>
        <AppMain />
      </Container>
    </Fragment>
  );
}
