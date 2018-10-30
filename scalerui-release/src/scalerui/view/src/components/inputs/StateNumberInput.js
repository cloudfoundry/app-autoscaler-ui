import React from 'react'
import Util from '../../common/Util';
import { NumberInput } from 'carbon-components-react'

class StateNumberInput extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    let required = this.props.required == false ? false : true
    let value = this.props.value == undefined ? '' : this.props.value
    let className = (this.props.className ? this.props.className : '') + (Util.numberWithFractionOrExceedRange(this.props.value, this.props.min, this.props.max, required) ? ' as-data-invalid-container' : '')
    let min = value == '' ? undefined : this.props.min
    let max = value == '' ? undefined : this.props.max
    min = isNaN(min) ? undefined : min
    max = isNaN(max) ? undefined : max
    return (
      <NumberInput
        id={this.props.id}
        label={this.props.label}
        className={className}
        value={value}
        step={this.props.step}
        onChange={this.props.onChange}
        onClick={this.props.onClick}
      />
    )
  }
}

export default StateNumberInput