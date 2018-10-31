import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { MultiSelect, Icon } from 'carbon-components-react'

class LocalMultiSelectWithTags extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItems: this.props.selectedItems
    }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  render() {
    let intl = this.props.intl
    let id = this.props.id
    let items = this.props.items
    let labelId = this.props.labelId
    let selectedItems = this.state.selectedItems
    let onChange = this.props.onChange
    let className = this.props.className
    let onRemove = this.props.onRemove
    let invalidItems = this.props.invalidItems

    if (invalidItems || this.state.selectedItems.length == 0) {
      className = className + ' as-data-invalid'
    }

    items.map((item) => {
      if (item.text == undefined) {
        item.text = intl.formatMessage({ id: item.msgid })
      }
    })
    selectedItems.map((item) => {
      if (item.text == undefined) {
        item.text = intl.formatMessage({ id: item.msgid })
      }
    })
    let selectedTags = selectedItems.map((item, i) => {
      let color = (() => {
        if (invalidItems && invalidItems[item.id]) return 'rgba(231, 29, 50, 0.3)'
        else return 'rgba(61, 112, 178, 0.1)'
      })()
      return (
        <span className="bx--tag bx--tag--beta select-tag" key={i} style={{ background: color }}>
          {item.text}
          <Icon
            id={'removeIcon' + i}
            name='icon--close'
            fill='#3d70b2'
            className='select-tag-remove'
            onClick={() => {
              this.state.selectedItems.splice(i, 1)
              this.setState({ selectedItems: this.state.selectedItems })
              onRemove(i)
            }} />
        </span>
      )
    })
    return (
      <div id={id}>
        <div className='multi-select-repeat' >
          <MultiSelect
            hideLabel
            id={id}
            className={className}
            label={intl.formatMessage({ id: labelId })}
            items={items}
            itemToString={item => (item ? item.text : '')}
            onChange={(key) => {
              this.setState({ selectedItems: key.selectedItems })
              onChange(key)
            }}
            initialSelectedItems={selectedItems}
            sortItems={() => { return items }}
          />
        </div>
        {selectedTags}
      </div>
    )
  }
}

LocalMultiSelectWithTags.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LocalMultiSelectWithTags);