import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Tooltip } from 'carbon-components-react'

const LocalTooltip = ({ intl, id, labelId, messageId }) => {
  let labelMessage = ''
  let tooltipMessage = ''
  if (labelId != '') {
    labelMessage = intl.formatMessage({ id: labelId })
  }
  if (messageId != '') {
    tooltipMessage = intl.formatMessage({ id: messageId })
  }
  return (
    <Tooltip triggerText={labelMessage} tooltipId={'tooltip_' + id} triggerId={'trigger_' + id}>
      <p className='bx--tooltip__message'>
        {tooltipMessage}
      </p>
    </Tooltip>
  );
};

LocalTooltip.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalTooltip);