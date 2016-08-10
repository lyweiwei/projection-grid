import _ from 'underscore';
import $ from 'jquery';
import Backbone from 'backbone';

import pgrid from '../../js';
import bodyTemplate from './body-template.jade';
import store from './js-data-resource.js';
import emailsTemplate from './emails.jade';
import people from 'json!./people.json';

import './index.less';
import 'bootstrap-webpack';

class CustomView extends Backbone.View {
  events() {
    return {
      'click h2': () => console.log('click'),
    };
  }
  render() {
    this.$el.html('<h2>Custom View</h2>');
    return this;
  }
}

window.customView = new CustomView().render();

window.gridViewWin = pgrid.factory({ vnext: true }).create({
  el: '.container-window-viewport',
  scrolling: {
    virtualized: true,
    header: {
      type: 'sticky',
      offset() {
        return $('.navbar-container').height();
      },
    },
  },
  dataSource: {
    type: 'memory',
    data: people.value,
    // filter: (item = {}) => !_.isEmpty(item.AddressInfo),
  },
  selection: { single: true },
  rows: {
    headRows: [{
      view: window.customView,
    },
    'column-header-rows',
    ],
  },
  columns: [{
    name: 'UserName',
    width: 120,
    sortable: true,
  }, {
    name: 'Name',
    property: ({ item }) => `${item.FirstName}, ${item.LastName}`,
    width: 150,
    sortable: true,
  }, {
    name: 'Emails',
    template: emailsTemplate,
    width: 220,
    sortable: ({ item }) => item.Emails.length,
  }, {
    name: 'AddressInfo',
    columns: [{
      name: 'Address',
      property: 'AddressInfo/0/Address',
      sortable: true,
    }, {
      name: 'City',
      columns: [{
        name: 'CityName',
        property: 'AddressInfo/0/City/Name',
        sortable: true,
      }, {
        name: 'CityCountry',
        property: 'AddressInfo/0/City/CountryRegion',
        sortable: true,
      }, {
        name: 'CityRegion',
        property: 'AddressInfo/0/City/Region',
        sortable: true,
      }],
    }],
  }, {
    name: 'Gender',
    sortable: true,
  }, {
    name: 'Concurrency',
    width: 200,
    sortable: true,
  }]
}).gridView.render();
