import React from 'react'
import { connect } from 'react-redux'
import { IntlProvider, FormattedMessage } from 'react-intl'
import Locale from '../../common/Locale'
import { TableRow, TableData, TableHead, TableBody, TableHeader, Table } from 'carbon-components-react'
import Constants from '../../constants/Constants'
import moment from 'moment-timezone'
import Util from '../../common/Util'

const scaleStatusImages = {
  'succeeded': require('../../images/green_circle.svg'),
  'failed': require('../../images/red_circle.svg'),
  'ignored': require('../../images/orange_circle.svg')
}

class HistoryTable extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  render() {
    let records = this.props.historyData.get('app_history_data').get('resources').toJS()
    let tableRows = records.map((record, i) => {
      let description = (() => {
        if (record.message) {
          let change = record.new_instances - record.old_instances
          if (change > 0) change = '+' + change
          return change + ' instance(s) because ' + record.message
        } else {
          return record.reason
        }
      })()
      let image = (() => {
        if (record.old_instances > record.new_instances) {
          return <nobr className='scale-in-arrow'>➘ </nobr>
        } else if (record.old_instances < record.new_instances) {
          return <nobr className='scale-out-arrow'>➚ </nobr>
        } else {
          return <nobr className='scale-error-arrow'>➙ </nobr>
        }
      })()
      let timezone = moment.tz.names()[this.props.historyData.get('selected_options').toJS()['timezoneIndex']]
      return (
        <TableRow key={i}>
          <TableData style={{ width: '100%', wordBreak: 'keep-all', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <img className='small' src={scaleStatusImages[Constants.ScalingStatus[record.status]]}></img><FormattedMessage id={'history_page_scaling_status_' + Constants.ScalingStatus[record.status]} />
          </TableData>
          <TableData>
            <FormattedMessage id={'history_page_scaling_type_' + Constants.ScalingType[record.scaling_type]} />
          </TableData>
          <TableData>
            {record.old_instances} {image} {record.new_instances}
          </TableData>
          <TableData>
            {moment(record.timestamp / 1000000).tz(timezone).format(Constants.MomentFormateDateTime)}
          </TableData>
          <TableData>
            {description}
          </TableData>
          <TableData>
            {record.error}
          </TableData>
        </TableRow>
      )
    })

    return (
      <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <div>
          <Table>
            <TableHead>
              <TableRow header>
                <TableHeader>
                  <FormattedMessage id='history_page_scaling_status' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='history_page_scaling_type' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='history_page_header_instance_change' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='history_page_header_time' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='history_page_header_action' />
                </TableHeader>
                <TableHeader>
                  <FormattedMessage id='history_page_header_error' />
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </div>
      </IntlProvider>
    )
  }
}

export default connect(
  state => ({
    historyData: state.historyData
  })
)(HistoryTable)