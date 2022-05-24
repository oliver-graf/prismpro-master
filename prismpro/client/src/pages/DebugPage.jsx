import React, { Component } from 'react';

// Components
import {
  Title,
  Divider,
  Alert,
  ElementPlusLabel,
  StackingLayout,
  ConfirmModal,
  Paragraph,
  FlexLayout,
  Button,
  Link,
  Loader,
  Tabs,
  TextLabel,
  FullPageModal,
  QuestionIcon,
  CloseIcon
} from 'prism-reactjs';


import EntitySearch from '../components/EntitySearch.jsx';
// Utils
import {
  basicFetch
} from '../utils/FetchUtils';

class DebugPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showSuccessBanner: false,
      visibleLogModal: false,
      visibleErrorModal: false,
      loading: false,
      logData: '',
      errorData: ''
    };

    this.getLogs = this.getLogs.bind(this);
    this.getError = this.getError.bind(this);
    this.repair = this.repair.bind(this);
    this.resetTicketSystem = this.resetTicketSystem.bind(this);
  }


  successAlert = <Alert type="success" inline={ false } message="Operation performed successfully!" />;

  loadingBar = <Loader tip="Repairing..." overlay={ true } />


  repair() {
    this.setState({ loading: true });
    basicFetch({
      url: '/repair',
      method: 'POST'
    }).then(res => {
      this.setState({
        loading: false,
        showSuccessBanner: true,
        visibleLogModal: false,
        visibleErrorModal: false,
        visibleConfirmModal: false
      });
    });
  }

  resetTicketSystem() {
    this.setState({ loading: true,
      visibleConfirmModal:false });
    basicFetch({
      url: '/reset_ticket_system',
      method: 'POST'
    }).then(res => {
      this.setState({
        loading: false,
        showSuccessBanner: true,
        visibleLogModal: false,
        visibleErrorModal: false
      });
    });
  }

  getError() {
    this.setState({ visibleErrorModal: true,
      visibleLogModal: false });
    basicFetch({
      url: '/error',
      method: 'GET'
    }).then(res => {
      this.setState({ errorData: res.data });
    });
  }

  getLogs() {
    this.setState({ visibleLogModal: true,
      visibleErrorModal: false });
    basicFetch({
      url: '/log',
      method: 'GET'
    }).then(res => {
      this.setState({ logData: res.data });
    });
  }


  render() {
    return (

      <FlexLayout style={ { height: '500px' } } alignItems="center" justifyContent="center">

        <StackingLayout style={ { width: '380px' } } itemSpacing="30px">
          {this.state.loading ? this.loadingBar : null}
          {this.state.showSuccessBanner ? this.successAlert : null}

          <Title>Welcome to Repair Page</Title>

          <Button fullWidth={ true } onClick={ this.repair } >Repair</Button>

          <Button type="primary" fullWidth={ true }
            onClick={ () => this.setState({ visibleConfirmModal: true }) }>
              Reset Ticket System
          </Button>
          <ConfirmModal
            visible={ this.state.visibleConfirmModal }
            onConfirm={ this.resetTicketSystem }
            confirmText="Are you sure you want to reset the ticket system?"
          />

          <StackingLayout>
            <FlexLayout alignItems="center">
              <Divider />

              <div>
                <Button type="primary"
                  onClick={ this.getLogs }>
                  Logs
                </Button>
                <FullPageModal
                  visible={ this.state.visibleLogModal }
                  title="Logs"
                >
                  <Paragraph>{this.state.logData}</Paragraph>
                </FullPageModal>
              </div>

              <Divider />

              <div>
                <Button type="primary"
                  onClick={ this.getError }>
                  Errors
                </Button>
                <FullPageModal
                  visible={ this.state.visibleErrorModal }
                  title="Errors"

                >
                  <Paragraph>{this.state.errorData}</Paragraph>
                </FullPageModal>
              </div>

              <Divider />
            </FlexLayout>
          </StackingLayout>
        </StackingLayout>
      </FlexLayout>


    );
  }

}

export default DebugPage;

