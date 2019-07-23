/**
 * Winston Logger Setup
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */
const { format, createLogger, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logger = require('winston');

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

logger.configure({
    level: 'info',
    format: combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        myFormat
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
        //
        // If we're not in production then log to the `console` with the format:
        // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        // 
        process.env.NODE_ENV !== 'production' ? new transports.Console({ format: myFormat }) : null,

    ]
});

module.exports = logger;




