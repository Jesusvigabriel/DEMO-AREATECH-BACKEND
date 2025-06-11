const {createLogger, format, transports} =  require('winston')

const winston=require("winston")
const logConfiguration= {
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'logs/registro.log'})
  ],
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MMM-DD HH:mm:ss'
    }),
    winston.format.printf( (info: { timestamp: any; message: any }) => `${[info.timestamp]}: ${info.message}`),

  )
}
const logger=winston.createLogger(logConfiguration)

module.exports = {'logger': logger} 
