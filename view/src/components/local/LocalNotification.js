import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { InlineNotification } from 'carbon-components-react'

const LocalNotification = ({ intl, titleId, title, subtitleId, subtitle, kind }) => {
  let titleMessage = ''
  let subtitleMessage = ''
  if (titleId) {
    titleMessage = intl.formatMessage(titleId[0], titleId[1])
  } else if (title) {
    titleMessage = title
  }
  if (subtitleId && subtitleId != '') {
    subtitleMessage = intl.formatMessage({ id: subtitleId })
  } else if (subtitle) {
    subtitleMessage = subtitle
  }
  return (
    <InlineNotification
      title={titleMessage}
      subtitle={subtitleMessage}
      kind={kind}
    />
  );
};

LocalNotification.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalNotification);