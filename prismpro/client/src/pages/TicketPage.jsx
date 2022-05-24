import React, { Component } from 'react';
import _ from 'lodash';

// Components
import {
  Title,
  Table,
  Alert,
  ElementPlusLabel,
  StackingLayout,
  ConfirmModal,
  Paragraph
} from 'prism-reactjs';


import EntitySearch from '../components/EntitySearch.jsx';
// Utils
import {
  basicFetch
} from '../utils/FetchUtils';

class TicketPage extends Component {

  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Creation Time',
        key: 'creation_time',
        render: (creation_time) => {
          const dt = new Date(creation_time);
          return <Paragraph> {`${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`}</Paragraph>;
        }
      },
      {
        title: 'Ticket ID',
        key: 'key'
      },
      {
        title: 'Ticket Status',
        key: 'task_status'
      },
      {
        title: 'Incident Name',
        key: 'incident_name',
        render: (name, rowData) => {
          return <div>{ _.upperFirst(rowData.incident_type) || 'Alert' }: { name }</div>;
        }
      },
      {
        title: 'Entity Name',
        key: 'entity_name'
      },
      {
        title: 'Webhook Id',
        key: 'webhook_id'
      },
      {
        title: 'Info',
        key: 'string1'
      }
    ];

    this.state = {
      ticketData: [],
      confirmVisible: false,
      inputVal: '',
      error: false,
      showSuccessBanner: false,
      structure: {
        bodyMaxHeight: '1000px'

      }
    };
  }

  modalErrorAlert = (
    <Alert type="error" inline={ true } message="Please Select a Playbook to proceed." />
  );

  componentDidMount() {
    const options = {
      method: 'GET',
      url: 'gettickets'
    };
    basicFetch(options)
      .then(res => {
        this.setState({
          ticketData: res.data.tickets.sort(function(a, b) {
            let dateA = new Date(a.creation_time), dateB = new Date(b.creation_time);
            return dateB - dateA;
          })
        });
      });
  }

  runPlaybook = () => {
    const { selectedPlaybook, rowData } = this.state;
    if (selectedPlaybook === null || !rowData) {
      this.setState({
        error: true,
        showSuccessBanner: false
      });
      return;
    }

    // initiate script
    return this.callWebhook(rowData, selectedPlaybook);
  }

  renderEntityPicker() {
    return (
      <ElementPlusLabel
        label={ 'Select the Playbook to Trigger' }
        element={
          <EntitySearch
            onEntitiesChange={
              selectedPlaybook => {
                // eslint-disable-next-line no-console
                console.log('selected playbook', selectedPlaybook);
                this.setState({ selectedPlaybook });
              }
            }
            selectedEntities={ this.state.selectedPlaybook }
            placeholder="Type to search for a Playbook"
            entityType="action_rule"
            nameAttr="name"
            // eslint-disable-next-line no-console
            onError={ () => console.error('TODO do something if there is an error') }
          />
        }
      />
    );
  }

  handleRowAction = (key, rowData) => {
    if (key === 'webhookApprove') {
      this.callWebhook(rowData);
    } else if (key === 'webhookDeny') {
      this.callWebhook(rowData, null, true);
    } else if (key === 'playbook') {
      this.setState({
        rowData,
        confirmVisible:true
      });
    }
  }


  callWebhook(rowData, selectedPlaybook, isDenied) {
    this.setState({ loading: true });
    return basicFetch({
      url: '/api/nutanix/v3/action_rules/trigger',
      method: 'POST',
      data: JSON.stringify({
        trigger_type: 'incoming_webhook_trigger',
        trigger_instance_list: [{
          webhook_id: (selectedPlaybook && selectedPlaybook.uuid) || rowData.webhook_id,
          entity1: JSON.stringify({
            type: rowData.entity_type,
            name: rowData.entity_name,
            uuid: rowData.entity_id
          }),
          entity2: JSON.stringify({
            type: rowData.incident_type,
            name: rowData.incident_name,
            uuid: rowData.incident_id
          }),
          string1: rowData.string1,
          string2: rowData.string2,
          string3: rowData.string3,
          string4: rowData.string4,
          string5: isDenied ? '{"message":"The request was denied.","status":"denied"}' : '{"message":"The request was approved.","status":"approved"}',
          integer1: rowData.integer1,
          integer2: rowData.integer2,
          integer3: rowData.integer3,
          integer4: rowData.integer4,
          integer5: rowData.integer5
        }]
      })
    }).then(resp => {
      if (resp && resp.stderr) {
        this.setState({
          error: resp.stderr,
          loading: false
        });
      } else {
        this.setState({
          error: false,
          confirmVisible: false,
          showSuccessBanner: selectedPlaybook ? 'Playbook Triggered Successfully' : 'Remediation Triggered Successfully'
        });
      }
    });
  }

  renderTicketsInTable() {
    return (
      <div>
        <StackingLayout padding="20px">
          <Table
            oldTable={ false }
            loading={ false }
            dataSource={ this.state.ticketData }
            columns={ this.columns }
            structure={ this.state.structure }
            rowAction={ {
              actions: (rowData) => {
                return [
                  {
                    key: 'webhookApprove',
                    value: 'Approve'
                  },
                  {
                    key: 'webhookDeny',
                    value: 'Deny'
                  },
                  {
                    key: 'playbook',
                    value: 'Run Playbook'
                  }
                ];
              },
              onRowAction: this.handleRowAction
            } } />
          <ConfirmModal
            visible={ this.state.confirmVisible }
            onConfirm={ this.runPlaybook }
            confirmTitle="Run Playbook"
            confirmButtonLabel="Submit"
            confirmButtonType="primary"
            alignContent="left"
            confirmText={
              <StackingLayout>
                {this.state.error ? this.modalErrorAlert : null}
                { this.renderEntityPicker() }
              </StackingLayout>
            }
          />
        </StackingLayout>
      </div>
    );
  }

  render() {
    return (
      <StackingLayout>
        {this.state.showSuccessBanner ? <Alert type="success" inline={ false } message={ this.state.showSuccessBanner } /> : null}
        {this.renderTicketsInTable()}
      </StackingLayout>
    );
  }

}

export default TicketPage;

