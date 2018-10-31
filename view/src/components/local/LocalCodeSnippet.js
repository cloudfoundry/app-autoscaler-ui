import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { CodeSnippet } from 'carbon-components-react'

const LocalCodeSnippet = ({ intl, id, className, type, feedbackId, showMoreTextId, showLessTextId, code, onClick}) => {
  return (
    <CodeSnippet
      id={id}
      className={className}
      type={type}
      feedback={intl.formatMessage({ id: feedbackId })}
      showMoreText={intl.formatMessage({ id: showMoreTextId })}
      showLessText={intl.formatMessage({ id: showLessTextId })}
      onClick={onClick}>
      {code}
    </CodeSnippet>
  );
};

LocalCodeSnippet.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalCodeSnippet);