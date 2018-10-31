import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { MultiSelect } from 'carbon-components-react'

const LocalMultiSelect = ({ intl, id, labelId, messageNames, messageNameIds, selectedItems, onChange, className }) => {
  let items = null
  if (messageNames != null && messageNames != undefined) {
    items = messageNames.map((item, i) => {
      return ({
        id: i + 1,
        text: item.toString()
      })
    })
  } else {
    items = messageNameIds.map((item, i) => {
      return ({
        id: i + 1,
        text: intl.formatMessage({ id: item })
      })
    })
  }
  let initialSelectedItems = selectedItems.map((item) => {
    return items[item - 1]
  })
  return (
    <MultiSelect
      hideLabel
      id={id}
      className={className}
      label={intl.formatMessage({ id: labelId })}
      items={items}
      itemToString={item => (item ? item.text : '')}
      onChange={onChange}
      initialSelectedItems={initialSelectedItems}
    />
  );
};

LocalMultiSelect.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalMultiSelect);
