const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: [
        'babel-polyfill',
        './index.js'
    ],
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.html',
        }),
        new webpack.DefinePlugin({ process: { env: {} } })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-react',
                            { plugins: ['@babel/plugin-proposal-class-properties'] }
                        ],
                        "plugins": ["react-native-reanimated/plugin"]
                    },
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            }
        ],
    },
    resolve: {
        alias: { 'react-native$': 'react-native-web', },
        extensions: ['.web.js', '.js'],
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.resolve(__dirname, './public'),
    },
};