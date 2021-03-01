//this configuration file will be read automatically by nextJS and will refersh all the files at an interval of 300 miliseconds
module.exports = {
    webpackDevMiddleware: config => {
        config.watchOptions.poll = 300;
        return config;
    }
};