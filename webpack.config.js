module.exports = {
    mode: "production",

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            // Phaser recommendations.
            {
                test: [/\.vert$/, /\.frag$/],
                use: "raw-loader"
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml)$/i,
                use: "file-loader"
            }
        ]
    },
    // Phaser plugin recommendations.
    // plugins: [
    //     new CleanWebpackPlugin(["dist"], {
    //         root: path.resolve(__dirname, "../")
    //     }),
    //     new webpack.DefinePlugin({
    //         CANVAS_RENDERER: JSON.stringify(true),
    //         WEBGL_RENDERER: JSON.stringify(true)
    //     }),
    //     new HtmlWebpackPlugin({
    //         template: "./index.html"
    //     })
    // ],
    output: {
        filename: "main.js"
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        phaser: "Phaser"
    }
};
