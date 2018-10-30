import React from 'react'
import { injectIntl, intlShape } from 'react-intl'
import { ProgressIndicator, ProgressStep } from 'carbon-components-react'

const LocalProgressIndicator = ({ intl, currentIndex, labelIds }) => {
  let steps = []
  labelIds.map((item, i) => {
    if (item.show) {
      steps.push(
      <ProgressStep
        key={i}
        label={intl.formatMessage({ id: item.messageId })}
        description={intl.formatMessage({ id: item.messageId })}
      />)
    }
  })

  return (
    <ProgressIndicator currentIndex={currentIndex}>
      {steps}
    </ProgressIndicator>
  );
};

LocalProgressIndicator.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalProgressIndicator);