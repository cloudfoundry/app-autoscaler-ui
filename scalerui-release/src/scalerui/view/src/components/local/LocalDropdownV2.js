import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { DropdownV2 } from 'carbon-components-react'

const LocalDropdownV2 = ({ intl, labelId, items, selectedItem, onChange, className, disabled }) => {
  let label = (() => {
    if (labelId) {
      return intl.formatMessage({ id: labelId })
    } else {
      return ''
    }
  })()
  if (items) {
    items.map((item) => {
      if (!item.text) {
        item.text = intl.formatMessage({ id: item.id })
        if (item.index != null && item.index != undefined) {
          item.text += ' ' + item.index
        }
      }
    })
  }
  if (selectedItem && !selectedItem.text) {
    selectedItem.text = intl.formatMessage({ id: selectedItem.id })
  }
  return (
    <DropdownV2
      className={className}
      label={label}
      items={items}
      initialSelectedItem={selectedItem}
      itemToString={item => (item ? item.text : '')}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

LocalDropdownV2.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalDropdownV2);
