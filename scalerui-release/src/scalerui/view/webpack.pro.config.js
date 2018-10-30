/**
 * Created by zyjiaobj@cn.ibm.com on 2018/01/31
 * webpack config for prod
 */
var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.UglifyJsPlugin({ minimize: true }),
        // new webpack.optimize.CommonsChunkPlugin('common'),
        // new HtmlWebpackPlugin({
        //     title: 'scalerui',
        //     filename: 'index.html',
        //     template: './src/index.html'
        // }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
    //    new BundleAnalyzerPlugin()
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
    }
};