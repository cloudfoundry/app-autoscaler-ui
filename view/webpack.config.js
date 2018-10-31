/**
 * Created by zyjiaobj@cn.ibm.com on 2018/01/31
 * webpack config for dev
 */
var webpack = require('webpack');
var path = require('path');
// var config = require('./config/config')

module.exports = {
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    entry: {
        main: path.resolve(__dirname, './src/app.js'),
    },
    output: {
        path: path.resolve(__dirname, './dev'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            { test: /\.(png|jpg|jpeg|gif|woff|woff2|svg)$/, use: ['url-loader'] },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react'],
                    }
                }
            },
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react'],
                    }
                }
            },
            { test: /\.(ttf|eot)$/, loader: 'file-loader' }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.scss', '.less', 'jsonp', '.sass'],
    },
    devServer: {
        inline: true,
        hot: true,
        contentBase: 'dev',
        disableHostCheck: true
        // port: config.port,
        // host:'192.168.199.237'
    },
    node: {
        fs: 'empty'
    }
};