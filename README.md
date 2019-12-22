winston-gelf-transporter
========================
A Winston transporter for sending GELF messages to your Graylog server.

## Setup

### Installation

To install with npm
```shell script
npm install winston-gelf-transporter
```
### Importing

ES6 style

```js
import WinstonGelfTransporter from 'winston-gelf-transporter';
```

CommonJS
```js
var WinstonGelfTransporter = require('winston-gelf-transporter');
``` 

### Configuration 

You can create a new transporter as such
```js
const transporter = new WinstonGelfTransporter();
```

You can also pass a `TransporterOptions` object to the constructor
```js
const transporter = new WinstonGelfTransporter({
  level: string,              // optional - logging level for the transporter
  silent: boolean,            // optional - true to turn off output
  handleExceptions: boolean, 
  version: string,            // Graylog communication version, default 1.1
  host: string,               // Host for your graylog server, default 127.0.0.1
  port: number,               // Port for your graylog server, default 12201
  protocol: string,           // The input protocol for your GELF input, default 'udp'
  hostName: string,           // The name of the host for your Node.js app
  additional: Object          // Additional defaults to add to your messages
})
```

## Usage

All you need to do is add the transporter to your winston logger.

```javascript
import winston from 'winston';
import WinstonGelfTransporter from 'winston-gelf-transporter';

logger = winston.createLogger({
  level: winston,
  transports: [
    winston.transports.Console,
    // Add the Graylog transporter to the logger
    new WinstonGelfTransporter({
      host: 'graylog.example.com',
      port: 12345,
      hostName: 'client.example.com',
      additional: {
        foo: 'Bar'
      }
    })
  ]
});

// 1. Log a string
logger.info('Something');
// 2. Log an object
logger.info({ hello: 'world' });
// 3. Log a string message with object
logger.info('Something', { hello: 'world' });
// 4. Log an error
logger.error(new Error());
// 5. Log an error with a message
logger.error(new Error('Something'));
// 6. Or log a message with an error
logger.error('Something', new Error());
```
The above logging statements will result in the following
```shell script
1.
{
  "version":"1.1",
  "short_message":"Something",
  "timestamp":1577041912.451,
  "host":"client.example.com",
  "level":6,
  "foo": "Bar"
}
2.
{
  "version":"1.1",
  "short_message":"{\"hello\":\"world\"}",
  "timestamp":1577041912.452,
  "host":"client.example.com",
  "level":6,
  "foo": "Bar"
}
3.
{
  "version":"1.1",
  "short_message":"{\"message\":\"Something\",\"hello\":\"world\"}",
  "timestamp":1577041912.452,
  "host":"client.example.com",
  "level":6,
  "foo": "Bar"
}
4.
{
  "version":"1.1",
  "short_message":"Error",
  "timestamp":1577041912.453,
  "host":"client.example.com",
  "full_message":"Error\n <extended stack trace>",
  "level":3,
  "foo": "Bar"
}
5.
{
  "version":"1.1",
  "short_message":"Something",
  "timestamp":1577041912.453,
  "host":"client.example.com",
  "full_message":"Error: Something\n <extended stack trace>",
  "level":3,
  "foo": "Bar"
}
6.
{
  "version":"1.1",
  "short_message":"Something",
  "timestamp":1577041912.453,
  "host":"client.example.com",
  "full_message":"Error\n <extended stack trace>",
  "level":3,
  "foo": "Bar"
}
```
