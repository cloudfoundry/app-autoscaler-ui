import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { PaginationV2 } from 'carbon-components-react'

const LocalPaginationV2 = ({ intl, id, className, totalItems, pageSize, pageSizes, itemsPerPageTextId, itemRangeTextId, pageRangeTextId, onChange }) => {
  return (
    <PaginationV2
      id={id}
      className={className}
      totalItems={totalItems}
      pageSize={pageSize}
      pageSizes={pageSizes}
      itemsPerPageText={intl.formatMessage({ id: itemsPerPageTextId })}
      itemRangeText={(min, max, total) => {
        return intl.formatMessage({ id: itemRangeTextId }, {
          min,
          max,
          total
        })
      }}
      pageRangeText={(current, total) => {
        return intl.formatMessage({ id: pageRangeTextId }, {
          current,
          total
        })
      }}
      onChange={onChange}
    />
  );
};

LocalPaginationV2.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(LocalPaginationV2);