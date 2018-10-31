import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux'
import ContainerPage from './components/pages/ContainerPage'
import store from './store'

export default class Container extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='app-content'>
        <Provider store={store}>
          <Router history={browserHistory} >
            <Route path="/*" component={ContainerPage} />
          </Router>
        </Provider>
      </div>
    )
  }
}