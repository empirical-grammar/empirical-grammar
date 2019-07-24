import React from 'react'
import request from 'request'
import CmsIndexTable from '../components/cms/cms_index_table/cms_index_table.jsx'
import ItemDropdown from '../components/general_components/dropdown_selectors/item_dropdown';
import Server from '../components/modules/server/server'
import getAuthToken from '../components/modules/get_auth_token'


export default React.createClass({

  propTypes: {
    resourceNameSingular: React.PropTypes.string.isRequired,
    resourceNamePlural: React.PropTypes.string.isRequired
  },

  initializeModules: function () {
    var server = new Server(this.props.resourceNameSingular, this.props.resourceNamePlural);
    this.modules = {
      server: server
    }
  },

  // TODO: abstract out below method
  updateState: function (key, value) {
    var newState = this.state;
    newState[key] = value;
    this.setState(newState);
  },

  getInitialState: function () {
    this.initializeModules()
    var hash1 = {
      crudState: 'index',
      resourceToEdit: null,
      flag: 'All'
    };
    hash1[this.props.resourceNamePlural] = [];
    return hash1;
  },

  indexUrl: function () {
    return ['/cms/', this.props.resourceNamePlural].join('');
  },

  componentDidMount: function () {
    this.getIndexFromServer();
  },

  getIndexFromServer: function () {
    this.modules.server.getStateFromServer(this.props.resourceNamePlural, this.indexUrl(), this.populateResources);
  },

  populateResources: function (resource) {
    // FIXME this fn does not have to be so complicated, need to change server module
    let that = this;
    return function (data) {
      var newState = that.state;
      newState[that.props.resourceNamePlural] = data[that.props.resourceNamePlural];
      that.setState(newState);
    }
  },

  indexTable: function () {
    const resourceName = this.props.resourceNamePlural
    let resources
    if (resourceName === 'unit_templates' && this.state.flag !== 'All') {
      if (this.state.flag === 'Not Archived') {
        resources = this.state[resourceName].filter(resource => resource.flag !== 'archived')
      } else {
        resources = this.state[resourceName].filter(resource => resource.flag === this.state.flag.toLowerCase())
      }
    } else {
      resources = this.state[resourceName]
    }
    return (
      <span>
        <div className='row'>
          <div className='col-xs-12'>
            <button className='button-green button-top' onClick={this.crudNew}>New</button>
            {this.renderSaveButton()}
            {this.renderFlagDropdown()}
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <CmsIndexTable data={{ resources, }}
                              actions={{edit: this.edit, delete: this.delete}}
                              isSortable={this.isSortable()}
                              updateOrder={this.updateOrder}
                              resourceNameSingular={this.props.resourceNameSingular}
                            />
          </div>
        </div>
      </span>
    );
  },

  returnToIndex: function () {
    this.getIndexFromServer();
    this.setState({crudState: 'index'});
  },

  individualResourceMode: function () {
    return (this.props.resourceComponentGenerator(this));
  },

  edit: function (resource) {
    this.setState({crudState: 'edit', resourceToEdit: resource});
  },

  delete: function (resource) {
    this.modules.server.cmsDestroy(resource.id);
    this.getIndexFromServer();
  },

  crudNew: function () {
    this.setState({crudState: 'new', resourceToEdit: {}});
  },

  updateOrder: function (sortInfo) {
    if(this.isSortable()) {
      let originalOrder = this.state[this.props.resourceNamePlural]
      if (this.state.flag === 'Not Archived') {
        originalOrder = originalOrder.filter(resource => resource.flag !== 'archived')
      }
      const newOrder = sortInfo.data.items.map(item => item.key);
      const newOrderedResources = newOrder.map((key, i) => {
        const newResource = originalOrder[key];
        newResource.order_number = i;
        return newResource;
      });
      this.setState({[this.props.resourceNamePlural]: newOrderedResources});
    }
  },

  saveOrder: function () {
    if(this.isSortable()) {
      const resourceName = this.props.resourceNamePlural;
      const that = this;
      request.put(`${process.env.DEFAULT_URL}/cms/${resourceName}/update_order_numbers`, {
        json: {
          [resourceName]: that.state[resourceName],
          authenticity_token: getAuthToken()
        }}, (e, r, response) => {
          if (e) {
            console.log(e);
            alert(`We could not save the updated order. Here is the error: ${e}`);
          } else {
            that.setState({[resourceName]: response[resourceName]});
            alert('The updated order has been saved.');
          }
      })
    }
  },

  renderSaveButton: function () {
    return this.isSortable() ? <button className='button-green button-top save-button' onClick={this.saveOrder}>Save Order</button> : null
  },

  renderFlagDropdown: function () {
    const resourceName = this.props.resourceNamePlural;
    if (resourceName === 'unit_templates') {
      const options = ['All', 'Not Archived', 'Archived', 'Alpha', 'Beta', 'Production']
      return <div style={{ marginLeft: '10px', display: 'inline', }}>
        <ItemDropdown
          items={options}
          callback={this.switchFlag}
          selectedItem={this.state.flag}
        />
      </div>
    }
  },

  switchFlag: function(flag) {
    this.setState({flag: flag})
  },

  isSortable: function () {
    if(this.state[this.props.resourceNamePlural].length == 0 || (this.state.flag && !['All', 'Not Archived'].includes(this.state.flag))) { return false }
    const sortableResources = ['activity_classifications', 'unit_templates'];
    return sortableResources.includes(this.props.resourceNamePlural);
  },

  render: function () {
    var result;
    switch (this.state.crudState) {
      case 'index':
        result = this.indexTable();
        break;
      case 'edit':
        result = this.individualResourceMode();
        break;
      case 'new':
        result = this.individualResourceMode();
        break;
    }

    return result || null;
  }
});
