import TransportStream from 'winston-transport';
import log from 'gelf-pro';
import os from 'os';

type TransporterOptions = {
  // Winston transporter options
  level?: string;
  silent?: boolean;
  handleExceptions?: boolean;
  // Graylog communication options
  version?: string;
  host?: string;
  port?: number;
  protocol?: string;
  hostName?: string;
  additional?: Object;
};

const MIN_PORT: number = 0;
const MAX_PORT: number = 65535;

export default class WinstonGelfTransporter extends TransportStream {
  private options: TransporterOptions;

  private logLevels = Object({
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warn: 4,
    notice: 5,
    info: 6,
    debug: 7
  });

  private objectSerializer: (o: object) => string;

  readonly gelfClient: any;

  constructor(options: TransporterOptions) {
    super(options);
    this.options = options;
    const logConfig = Object({ fields: {} });

    // Update protocol if provided
    if (options.protocol) {
      logConfig.adapterName = options.protocol;
    }
    // Update host and port information if provided
    if (options.port || options.host) {
      logConfig.adapterOptions = {};
      if (
        options.port &&
        options.port >= MIN_PORT &&
        options.port < MAX_PORT
      ) {
        logConfig.adapterOptions.port = options.port;
      }
      if (options.host) {
        logConfig.adapterOptions.host = options.host;
      }
    }
    logConfig.fields = options.hostName
      ? { host: options.hostName }
      : { host: os.hostname() };
    if (options.additional) {
      logConfig.fields = {
        ...logConfig.fields,
        ...options.additional
      };
    }
    this.objectSerializer = JSON.stringify;

    log.setConfig(logConfig);
    this.gelfClient = log;
  }

  /**
   * This function will return a network connector
   * for sending GELF messages.
   * @returns A TCP Client for graylog.
   */
  getNetworkConnector(): any {
    return this.gelfClient;
  }

  getLogLevel(level: string): number {
    return this.logLevels[level];
  }

  setObjectSerializer(serializer: (o: object) => string): void {
    this.objectSerializer = serializer;
  }

  getLogMessage(info: any): string | Error {
    let { message } = info;
    const logData = { ...info };
    delete logData.message;
    delete logData.level;
    if (info.stack && typeof message === 'string') {
      // Info is an error, send an error object
      message = new Error(message);
      message.stack = info.stack;
    } else if (!(message instanceof Error)) {
      if (info.message instanceof Object) {
        // Message is an object, get string representation
        message = this.objectSerializer(message);
      } else if (Object.keys(logData).length) {
        // Got a message string with additional object param
        message = this.objectSerializer({ message, ...logData });
      }
    }
    return message;
  }

  log(info: any, next: () => void): any {
    const level = this.getLogLevel(info.level);
    if (this.level && level > this.getLogLevel(this.level)) {
      // Don't log if level is too high
      if (next) {
        next();
        return;
      }
      return;
    }
    const message = this.getLogMessage(info);
    this.gelfClient.message(
      message,
      this.getLogLevel(info.level),
      next()
    );
  }

  close(): void {
    this.gelfClient.message('Connection closed');
  }
}
