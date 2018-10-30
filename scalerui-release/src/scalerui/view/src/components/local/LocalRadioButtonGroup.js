import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { RadioButton, RadioButtonGroup } from 'carbon-components-react'

const LocalRadioButtonGroup = ({ intl, defaultSelected, data, nameid, onChange }) => {
  let radioButtons = data.map((item, i) => {
    if (!defaultSelected) {
      defaultSelected = item.value
    }
    return (
      <RadioButton
        key={i}
        value={item.value}
        labelText={intl.formatMessage({ id: item.labelTextId })}
      />
    )
  })
  return (
    <RadioButtonGroup
      name={'radio-button-group-' + nameid}
      defaultSelected={defaultSelected}
      onChange={onChange}>
      {radioButtons}
    </RadioButtonGroup>
  );
};

LocalRadioButtonGroup.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalRadioButtonGroup);