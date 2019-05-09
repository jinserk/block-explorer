import React, { useContext, Fragment, useState, useRef } from 'react';
import { Modal, Header, Grid, Menu, Container, Popup, Form, Button, Icon } from 'semantic-ui-react';
import { ethers } from 'ethers';
import 'semantic-ui-css/semantic.min.css';

import { INFURA_PROJECT_ID } from './Config';
import AppMain, { eventUnregister } from './AppMain';
import { NetworkContext } from './Common';

const networks = [
  { name:'MainNet', url: 'https://mainnet.infura.io/v3/'+INFURA_PROJECT_ID, color: 'orange' },
  { name:'Ropsten', url: 'https://ropsten.infura.io/v3/'+INFURA_PROJECT_ID, color: 'blue' },
  { name:'Rinkeby', url: 'https://rinkeby.infura.io/v3/'+INFURA_PROJECT_ID, color: 'yellow' },
  { name:'Goerli', url: 'https://goerli.infura.io/v3/'+INFURA_PROJECT_ID, color: 'olive' },
  { name:'Kovan', url: 'https://kovan.infura.io/v3/'+INFURA_PROJECT_ID, color: 'green' },
]

const networkOptions = networks.map((item, idx) => {
  return {
    key: item.name.toLowerCase(),
    value: idx,
    text: item.name
  }
});

function NetworkSelector({ network, setNetwork }) {
  const provider = useContext(NetworkContext);

  const [showModal, setShowModal] = useState(false);
  const [netCategory, setNetCategory] = useState(0);
  const [netState, setNetState] = useState(network);
  const [urlError, setUrlError] = useState(false);
  const [connState, setConnState] = useState('loading');

  provider.getNetwork()
    .then(() => setConnState('connected'))
    .catch(e => setConnState(e));

  const networkButton = () => {
    const label = (color) => {
      return {
        as: 'a',
        color: color,
        content: (network.name === 'Custom') ? network.url : network.name
      }
    }

    switch (connState) {
      case 'loading':
        return (<Button loading color={network.color} labelPosition='left' label={label(network.color)} onClick={() => setShowModal(true)} />);
      case 'connected':
        return (<Button icon='ethereum' color={network.color} labelPosition='left' label={label(network.color)}
          onClick={() => setShowModal(true)} />);
      default:
        return (<Popup trigger={ <Button icon='exclamation circle' color='red' labelPosition='left' label={label('red')}
          onClick={() => setShowModal(true)} /> } content='ERROR: Connection failed'
          style = {{ color: 'red' }} />);
    }
  }

  const handleCategoryChange = (event, data) => setNetCategory(data.value);
  const handleNetChange = (event, data) => setNetState(networks[data.value]);
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
    <Modal open={showModal} trigger={networkButton()} basic size='small'>
      <Header icon='ethereum' content='Select Network' />
      <Modal.Content>
        <Form id="123" onSubmit={handleSubmit}>
        <Grid stackable={false} padded>
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
                selection onChange={handleNetChange} options={networkOptions} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2} verticalAlign='middle'>
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
  const [network, setNetwork] = useState(networks[0]);
  const provider = useRef(null);

  eventUnregister(provider.current);

  provider.current = (network.name === 'Custom')
    ? new ethers.providers.JsonRpcProvider(network.url)
    : ethers.getDefaultProvider(network.name.toLowerCase());

  return (
    <NetworkContext.Provider value={provider.current}>
      <Menu fixed='top' borderless inverted>
        <Container>
          <Menu.Item as='a' header>
            <div style={{ marginLeft: '1em', marginRight: '1em' }}>
              Block Explorer
            </div>
          </Menu.Item>
          <Menu.Item position='right'>
            <div style={{ marginLeft: '1em', marginRight: '1em' }}>
              <NetworkSelector network={network} setNetwork={p => setNetwork(p)} />
            </div>
          </Menu.Item>
        </Container>
      </Menu>

      <Container style={{ marginTop: '6em' }}>
        <AppMain />
      </Container>
    </NetworkContext.Provider>
  );
}
