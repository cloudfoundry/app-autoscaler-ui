import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Modal } from 'carbon-components-react'

const LocalModal = ({ intl, open, passiveModal, modalHeadingId, primaryButtonTextId, secondaryButtonTextId, onFocus, onSecondarySubmit, onRequestSubmit }) => {
  let modalHeading = ''
  let primaryButtonText = ''
  let secondaryButtonText = ''
  if (modalHeadingId) {
    modalHeading = intl.formatMessage({ id: modalHeadingId })
  }
  if (primaryButtonTextId) {
    primaryButtonText = intl.formatMessage({ id: primaryButtonTextId })
  }
  if (secondaryButtonTextId) {
    secondaryButtonText = intl.formatMessage({ id: secondaryButtonTextId })
  }
  return (
    <Modal
      onFocus={onFocus}
      open={open}
      passiveModal={passiveModal}
      modalHeading={modalHeading}
      primaryButtonText={primaryButtonText}
      secondaryButtonText={secondaryButtonText}
      onSecondarySubmit={onSecondarySubmit}
      onRequestSubmit={onRequestSubmit}
    />
  );
};

LocalModal.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalModal);