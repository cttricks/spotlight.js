const path = require('path');

module.exports = {
    entry: './src/spotlight.js',
    output: {
        filename: 'spotlight.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'module',
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    mode: 'development', // Use 'production' for minified output
};
