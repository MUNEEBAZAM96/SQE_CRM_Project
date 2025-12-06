const {
  catchErrors,
  notFound,
  productionErrors,
} = require('@/handlers/errorHandlers');

describe('Error Handlers', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('catchErrors', () => {
    test('should catch ValidationError and return 400', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = catchErrors(asyncFn);

      await wrappedFn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Required fields are not supplied',
        })
      );
    });

    test('should catch generic error and return 500', async () => {
      const error = new Error('Server error');

      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = catchErrors(asyncFn);

      await wrappedFn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Server error',
        })
      );
    });

    test('should pass through successful execution', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = catchErrors(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('notFound', () => {
    test('should return 404 for non-existent routes', () => {
      notFound(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Api url doesn't exist ",
      });
    });
  });

  describe('productionErrors', () => {
    test('should handle production errors', () => {
      const error = new Error('Production error');
      productionErrors(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Production error',
        })
      );
    });
  });
});

