const path = require('path');
const webpack = require('webpack');
const basePath = path.resolve(__dirname);

module.exports = {
    entry: {
        app: './app.js'
    },
    output: {
        path: path.join(basePath, 'dist'),
        filename: '[name].bundle.js',
        publicPath: '/dist'
    },
    devServer: {
        contentBase: basePath,
        watchContentBase: true
    },
    resolve: {
        alias: {
            videojs: 'video.js',
            WaveSurfer: 'wavesurfer.js',
            RecordRTC: 'recordrtc'
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            videojs: 'video.js/dist/video.cjs.js',
            RecordRTC: 'recordrtc'
        })
    ],
    module: {
        rules: [{
            test: /\.css$/,
            use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
        }]
    }
};