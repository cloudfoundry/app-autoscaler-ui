import React, { Component } from 'react'

class MockComponent extends Component {
  constructor(props) {
    super(props)
  }
  render() {
	  return <label>{JSON.stringify(this.props)}</label>
  }
}

export default MockComponent