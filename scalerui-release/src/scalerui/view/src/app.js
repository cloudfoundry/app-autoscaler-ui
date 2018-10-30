import React from 'react'
import ReactDOM from 'react-dom'
import Container from './router'

import 'carbon-components/css/carbon-components.min.css'
import './styles/theme.scss'
import './styles/appView.scss'
import './styles/policyDes.scss'
import './styles/policyForm.scss'
import './styles/commonForm.scss'
import './styles/history.scss'
import './styles/metrics.scss'
import './styles/main.scss'

ReactDOM.render(<Container/>, document.getElementById('app'))