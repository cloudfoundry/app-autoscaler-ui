const fs = require('fs-extra')
const path = require('path')

const routes = [
    'dev/'
]

routes.forEach((route) => {
    fs.copySync('src/index.html', path.join(route, 'index.html'))
    fs.copySync('src/config.js', path.join(route, 'config.js'))
})