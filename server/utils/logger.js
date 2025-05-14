import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, colorize, simple, printf } = format;

const consoleLogFormat = combine(
  colorize(),
  simple(),
  printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

const logger = createLogger({
  level: 'info',
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
  ],
});

export default logger;

