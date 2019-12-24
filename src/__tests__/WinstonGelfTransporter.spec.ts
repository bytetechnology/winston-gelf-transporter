import winston from 'winston';
import log from 'gelf-pro';
import WinstonGelfTransporter from '../WinstonGelfTransporter';
import Mock = jest.Mock;
import SpyInstance = jest.SpyInstance;

describe('WinstonGelfTransporter', () => {
  describe('getLogMessage', () => {
    let transporter: WinstonGelfTransporter;
    beforeAll(() => {
      transporter = new WinstonGelfTransporter({});
    });
    it(`returns correct string when info.message is a string
    and info has no extended properties`, () => {
      // This is the case of winston.log('Hello World!')
      const hello: string = 'Hello World!';
      expect(
        transporter.getLogMessage({ level: 1, message: hello })
      ).toBe(hello);
    });
    it('returns the error object when message is an error', () => {
      // This is the case of winston.log(new Error());
      const parameter = { level: 1, message: new Error() };
      expect(transporter.getLogMessage(parameter)).toBe(
        parameter.message
      );
    });
    it(`calls the serializer with info.message when info.message is 
    an object`, () => {
      // This is the case of winston.log({ some: 'object' });
      const parameter = { level: 1, message: { some: 'object' } };
      const response = transporter.getLogMessage(parameter);
      expect(response).toBe(JSON.stringify(parameter.message));
    });
    it(`calls the serializer with all props but level when passed 
    a non error info object with extended properties`, () => {
      // This is the case of winston.log('Hi!', { some: 'object' })
      const parameter = { level: 1, message: 'Hi!', some: 'object' };
      expect(transporter.getLogMessage(parameter)).toBe(
        JSON.stringify({
          message: parameter.message,
          some: parameter.some
        })
      );
    });
  });
  describe('log', () => {
    let transporter: WinstonGelfTransporter;
    beforeAll(() => {
      log.message = jest
        .fn()
        .mockImplementation((message, level, extra, next) => {
          if (!next) return extra();
          return next();
        });
      transporter = new WinstonGelfTransporter({});
    });
    it('calls message with correct parameters', () => {
      const params = { level: 'error', message: 'Hello World!' };
      function fn() {}
      transporter.log(params, fn);
      expect(log.message).toBeCalledWith(
        transporter.getLogMessage(params),
        3,
        fn
      );
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
  });
});
