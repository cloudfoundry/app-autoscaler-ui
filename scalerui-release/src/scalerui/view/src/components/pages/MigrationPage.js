import React from 'react'
import { connect } from 'react-redux'
import LocalProgressIndicator from '../local/LocalProgressIndicator'

let steps = [
  { name: 'onboard', messageId: 'migration_step_onboard_check', show: true },
  { name: 'migrate', messageId: 'migration_step_migrate_policy', show: true },
  { name: 'confirm', messageId: 'migration_step_confirm', show: true },
  { name: 'complete', messageId: 'migration_step_complete', show: true }
]

class MigrationPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      currentIndex: 1
    }
    // if (this.props.containerViewData.get('app_id')) {
    //   this.props.dispatch(PolicyActions.getPolicy(this.props.containerViewData.get('app_id')))
    // }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  render() {

    console.log(this.state.currentIndex)
    let currentContentView = (() => {
      switch (this.state.currentIndex) {
        case 0:
        return (<div>1</div>)
        case 1:
        return (<div>2></div>)
        case 2:
        return (<div>3</div>)
        case 3:
        return (<div>4</div>)
      }
    })()

    return (
      <div>
        <LocalProgressIndicator currentIndex={this.state.currentIndex} labelIds={steps} />
        <div className='app-view-body'>
          {currentContentView}
        </div>
        {/* <Loading active={this.props.appViewData.get('loading')} /> */}
      </div>
    )
  }
}

export default connect(
  state => ({
  })
)(MigrationPage)
