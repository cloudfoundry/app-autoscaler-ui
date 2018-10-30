import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Toggle } from 'carbon-components-react'

const LocalToggle = ({ intl, id, className, toggled, labelAId, labelBId, onToggle }) => {
  return (
    <Toggle
      id={id}
      className={className}
      toggled={toggled}
      labelA={intl.formatMessage({ id: labelAId })}
      labelB={intl.formatMessage({ id: labelBId })}
      onToggle={onToggle}>
    </Toggle>
  );
};

LocalToggle.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalToggle);