import React, { Component } from 'react';

// Components
import {
  Title,
  Modal,
  InputPlusLabel,
  StackingLayout,
  Button,
  Loader,
  Alert
} from 'prism-reactjs';

// Utils
import {
  basicFetch,
  getErrorMessage
} from '../utils/FetchUtils';
import {
  isValidIP
} from '../utils/AppUtil';

class DefaultPage extends Component {

  state = {}

  renderModalHeader() {
    return (
      <div className="modal-title-container">
        <Title size="h3">Lab Helper Tool Login</Title>
      </div>
    );
  }

  renderBody() {
    const { pcIp, username, password } = this.state;
    const isValidPcIp = isValidIP(pcIp);
    return (
      <StackingLayout padding="20px">
        <Title size="h3">Provide Your Prism Central Login Information</Title>
        <InputPlusLabel
          error={ pcIp && !isValidPcIp }
          onChange={ e => this.setState({ pcIp : e.target.value }) }
          id="pcIP"
          value={ pcIp }
          label="Prism Central IP Address"
          placeholder="Enter your Prism Central IP Address"
          helpText={ pcIp && !isValidPcIp ? 'Enter a Valid IP Address' : '' }
        />
        <InputPlusLabel
          onChange={ e => this.setState({ username : e.target.value }) }
          id="username"
          value={ username }
          label="Prism Central Username"
          placeholder="Enter your Prism Central Username"
        />
        <InputPlusLabel
          onChange={ e => this.setState({ password : e.target.value }) }
          id="password"
          value={ password }
          label="Prism Central Password"
          placeholder="Enter your Prism Central Password"
          type="password"
        />
      </StackingLayout>
    );
  }

  login() {
    const { pcIp, username, password } = this.state;
    // initiate script
    this.setState({ loading: true,
      loginFailed: false });
    basicFetch({
      url: 'login/',
      method: 'POST',
      data: JSON.stringify({
        pc_ip: pcIp,
        user: username,
        pass: password
      })
    }).then(resp => {
      // Reload to make it past the login page...
      setTimeout((function() {
        window.location.reload();
      }), 3000);
    }).catch(e => {
      if (e && e.response && e.response.data && e.response.data.message === 'LOGIN_FAILED') {
        this.setState({ loginFailed: true,
          loading: false });
        return;
      }
      // Since the server is forced to restart when this action is performed - we will lose our connection,
      // so this API query will never be successful.
      // Reload to make it past the login page...
      setTimeout((function() {
        window.location.reload();
      }), 3000);
    });
  }

  getFooter() {
    const { pcIp, username, password } = this.state;
    const enabled = isValidIP(pcIp) && username && password;
    return (
      <div>
        <Button disabled={ !enabled } type="primary" onClick={ () => this.login() }>Login</Button>
      </div>
    );
  }

  renderAlerts() {
    if (this.state.loginFailed) {
      return (
        <Alert
          type={ Alert.TYPE.ERROR }
          message={ getErrorMessage(this.state.error) ||
            'Login Failed, make sure you are using the correct credentials.' }
        />
      );
    } else if (this.state.error) {
      return (
        <Alert
          type={ Alert.TYPE.ERROR }
          message={ getErrorMessage(this.state.error) || 'An unknown error occurred.' }
        />
      );
    } else if (this.state.showSuccess) {
      return (
        <Alert
          type={ Alert.TYPE.SUCCESS }
          message="Login Successful."
        />
      );
    }
    return null;
  }

  render() {
    return (
      <Modal
        width={ 500 }
        visible={ true }
        title="Modal"
        footer={ this.getFooter() }
        mask={ false }
        maskClosable={ false }
        customModalHeader={ this.renderModalHeader() }
      >
        <Loader loading={ !!this.state.loading }>
          <StackingLayout>
            { this.renderAlerts() }
            { this.renderBody() }
          </StackingLayout>
        </Loader>
      </Modal>
    );
  }

}

export default DefaultPage;
