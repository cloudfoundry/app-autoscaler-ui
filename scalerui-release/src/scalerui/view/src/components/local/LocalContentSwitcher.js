import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { ContentSwitcher, Switch } from 'carbon-components-react'

const LocalContentSwitcher = ({ intl, selectedIndex, messageNameIds, onChange }) => {
  let switchs = []
  messageNameIds.map((item, i) => {
    if (item.show) {
      let className = selectedIndex == i ? 'as--content-switcher--selected' : ''
      switchs.push(<Switch
        id={i}
        className={className}
        name={item.name}
        text={intl.formatMessage({ id: item.messageId })}
        key={i}
        selected={selectedIndex == i}
      />)
    }
  })

  return (
    <ContentSwitcher
      onClick={(e) => {
        onChange(messageNameIds[e.target.id])
      }}
      selectedIndex={selectedIndex}
      onChange={() => { }}
    >
      {switchs}
    </ContentSwitcher>
  );
};

LocalContentSwitcher.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalContentSwitcher);