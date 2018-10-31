import React from 'react'
import { connect } from 'react-redux'
import { IntlProvider, FormattedMessage } from 'react-intl'
import Locale from '../../common/Locale'
import { Icon, TableRow, TableData, TableHead, TableBody, TableHeader, Table } from 'carbon-components-react'
import Util from '../../common/Util'
import ContainerActions from '../../actions/ContainerActions'
import Constants from '../../constants/Constants';

class BoundAppTable extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  render() {
    let boundApps = this.props.serviceViewData.get('bound_apps_data').toJS()
    let appRows = boundApps.map((appData, i) => {
      let appStatus = appData.state.toLowerCase() == 'started' ? 'running' : 'stopped'
      return (
        <TableRow style={{ padding: 10 }} height='40' key={i}>
          <TableData>
            {appData.app_name}
          </TableData>
          <TableData>
            <div className='col_list-state_i18n_state'>
              <div className='list-state bx--card-footer__app-status'>
                <div className={'bx--card-footer__app-status--' + appStatus + ' state-icon active'}>
                  <div className='bx--running__text'>
                    {appData.state}
                  </div>
                </div>
              </div>
            </div>
          </TableData>
          <TableData>{appData.instances}</TableData>
          <TableData>{appData.memory_quota} {<FormattedMessage id='metric_unit_mb' />}</TableData>
          <TableData className='near'>
            <Icon name='icon--link' style={{ margin: 10, cursor: 'pointer' }} fill='#3d70b2'
              onClick={() => {
                this.props.dispatch(ContainerActions.setAppId(appData.app_guid))
              }} />
          </TableData>
        </TableRow>
      )
    })

    return (
      <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <div>
          <Table className='as-service-table'>
            <TableHead>
              <TableRow header>
                <TableHeader>
                  <FormattedMessage id='service_page_table_header_name' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='service_page_table_header_state' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='service_page_table_header_instance' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='service_page_table_header_memory' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='service_page_table_header_dashboard' />
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {appRows}
            </TableBody>
          </Table>
        </div>
      </IntlProvider>
    )
  }
}

export default connect(
  state => ({
    serviceViewData: state.serviceViewData
  })
)(BoundAppTable)