import React from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import StateNumberInput from '../inputs/StateNumberInput'

const LocalStateNumberInputWithUnit = ({ className, unitId, rangeId, value, min, max, step, onChange, onClick, required }) => {
  return (
    <div>
      <div className={'form-input-inline ' + className}>
        <StateNumberInput
          required={required}
          id='local-number-input'
          className={className}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          onClick={onClick}
        />
      </div>
      <span className='number-unit'>
        <FormattedMessage id={unitId} /> &nbsp;
        <FormattedMessage tagName='nobr'
          id={rangeId}
          values={{
            value_min: min,
            value_max: max,
          }}
        />
      </span>
    </div>
  );
};

LocalStateNumberInputWithUnit.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalStateNumberInputWithUnit);
