import React, { Component } from 'react';

// Components
import {
  Title,
  Modal,
  StackingLayout,
  ElementPlusLabel,
  Button,
  RadioGroup,
  Radio,
  Loader,
  TextLabel,
  Alert,
  InputPlusLabel
} from 'prism-reactjs';

import EntitySearch from '../components/EntitySearch.jsx';

// Utils
import {
  basicFetch,
  getErrorMessage
} from '../utils/FetchUtils';

import {
  isValidIP
} from '../utils/AppUtil';


class StressPage extends Component {

  state = {
    step: 0
  };

  renderModalHeader() {
    return (
      <div className="modal-title-container">
        <Title size="h3">Lab Helper Tool</Title>
      </div>
    );
  }

  onEntitySearchErr = (e) => {
    if (e && e.message === 'AUTHENTICATION_REQUIRED') {
      this.setState({
        error: 'Failed to authenticate using default password. Please enter your PC Password to continue.'
      });
    } else {
      this.setState({
        error: e
      });
    }
  }

  renderEntityPicker() {
    const { entity } = this.state;
    return (
      <ElementPlusLabel
        label="Select your VM"
        element={
          <EntitySearch
            onEntitiesChange={ selected => this.setState({ entity : selected }) }
            selectedEntities={ entity }
            placeholder="Type to search for your VM"
            entityType="vm"
            nameAttr="vm_name"
            onError={ this.onEntitySearchErr }
          />
        }
      />
    );
  }

  renderBody() {
    const { ppvmIp } = this.state;
    return (
      <StackingLayout padding="20px">
        <StackingLayout itemSpacing="10px">
          <Title size="h3">Stress a VM </Title>
          <div><TextLabel type={ TextLabel.TEXT_LABEL_TYPE.SECONDARY }>
            Select a virtual machine where stress needs to be generated.
          </TextLabel></div>
        </StackingLayout>
        <StackingLayout itemSpacing="20px" />
        { this.renderEntityPicker('Select the PrismProServer VM', ' ', true) }
        <InputPlusLabel
          error={ ppvmIp && !isValidIP(ppvmIp) }
          onChange={ e => this.setState({ ppvmIp : e.target.value }) }
          id="ppvmIP"
          label="VM IP Address"
          placeholder="Enter the IP Address VM"
          helpText={ ppvmIp && !isValidIP(ppvmIp) ? 'Enter a Valid IP Address' : '' }
        />
      </StackingLayout>
    );
  }

  getButtonText() {
    return 'Stress VM';
  }

  completeCurrentStep() {
    const { step, pcIp, ppvmIp, ppvm, password } = this.state;
    const uvmIp = (ppvm && isValidIP(ppvm.ip) && ppvm.ip) || ppvmIp;
    this.setState({
      loading: false,
      error: false,
      showAlertSuccess: false
    });

    basicFetch({
      url: 'generate_stress/',
      method: 'POST',
      data: JSON.stringify({
        pcIp,
        vmIp: uvmIp,
        vmId: ppvm && ppvm.uuid,
        vmName: ppvm && ppvm.name,
        password
      })
    }).then(resp => {
      if (resp && resp.stderr) {
        this.setState({
          error: resp.stderr,
          loading: false
        });
      } else {
        this.setState({
          loading: false,
          step : 1
        });
      }
    }).catch(e => {
      console.log(e);
      this.setState({
        error: e,
        loading: false
      });
    });
  }


  getFooter() {
    const { entity } = this.state;
    const enabled = entity;
    return (
      <div>
        <Button disabled={ !enabled } type="primary" onClick={ () => this.completeCurrentStep() }>
          { this.getButtonText() }
        </Button>
      </div>
    );
  }

  renderAlerts() {
    if (this.state.error) {
      return (
        <Alert
          type={ Alert.TYPE.ERROR }
          message={ getErrorMessage(this.state.error) || 'An unknown error occurred.' }
        />
      );
    } else if (this.state.showAlertSuccess) {
      return (
        <Alert
          type={ Alert.TYPE.SUCCESS }
          message="Stress was Successfully Generated."
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

export default StressPage;
