const { developmentErrors } = require('@/handlers/errorHandlers');

describe('Error Handlers - Extended', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('developmentErrors', () => {
    test('should handle error with stack trace', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:10:5';

      developmentErrors(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error',
          error: error,
        })
      );
    });

    test('should handle error without stack trace', () => {
      const error = new Error('Test error');
      error.stack = '';

      developmentErrors(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error',
        })
      );
    });

    test('should handle error with status property', () => {
      const error = new Error('Test error');
      error.status = 404;
      error.stack = 'Error: Test error';

      developmentErrors(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

