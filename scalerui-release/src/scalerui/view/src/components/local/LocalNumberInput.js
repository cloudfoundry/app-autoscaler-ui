import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import StateNumberInput from '../inputs/StateNumberInput'

const LocalNumberInput = ({ intl, className, labelId, value, min, max, step, onChange, onClick, required }) => {
  return (
    <StateNumberInput
      id='local-number-input'
      className={className}
      label={intl.formatMessage({ id: labelId })}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      onClick={onClick}
      required={required}
    />
  );
};

LocalNumberInput.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalNumberInput);
