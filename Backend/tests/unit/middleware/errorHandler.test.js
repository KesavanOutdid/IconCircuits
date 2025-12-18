const errorHandler = require('../../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
    let req, res, next, consoleErrorSpy;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('Basic Error Handling', () => {
        it('should return 500 status code', () => {
            const error = new Error('Test error');
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return error response with success false', () => {
            const error = new Error('Test error');
            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });

        it('should log error to console', () => {
            const error = new Error('Test error');
            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        });
    });

    describe('Different Error Types', () => {
        it('should handle Error instances', () => {
            const error = new Error('Standard error');
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        });

        it('should handle TypeError', () => {
            const error = new TypeError('Type error occurred');
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error'
            });
        });

        it('should handle ReferenceError', () => {
            const error = new ReferenceError('Reference error occurred');
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should handle string errors', () => {
            const error = 'String error message';
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        });

        it('should handle null error', () => {
            errorHandler(null, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleErrorSpy).toHaveBeenCalledWith(null);
        });

        it('should handle undefined error', () => {
            errorHandler(undefined, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should handle object errors', () => {
            const error = { message: 'Custom error object', code: 'ERR_CUSTOM' };
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Error with Stack Traces', () => {
        it('should log error with stack trace', () => {
            const error = new Error('Error with stack');
            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).toHaveBeenCalledWith(error);
            expect(error.stack).toBeDefined();
        });

        it('should handle error without stack trace', () => {
            const error = new Error('Error without stack');
            delete error.stack;
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Multiple Sequential Errors', () => {
        it('should handle multiple errors in sequence', () => {
            const error1 = new Error('First error');
            const error2 = new Error('Second error');

            errorHandler(error1, req, res, next);
            errorHandler(error2, req, res, next);

            expect(res.status).toHaveBeenCalledTimes(2);
            expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('Response Format', () => {
        it('should always return consistent response format', () => {
            const error = new Error('Test');
            errorHandler(error, req, res, next);

            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('message');
            expect(response.success).toBe(false);
            expect(response.message).toBe('Server error');
        });

        it('should not expose error details in response', () => {
            const error = new Error('Sensitive database connection string');
            errorHandler(error, req, res, next);

            const response = res.json.mock.calls[0][0];
            expect(response.message).toBe('Server error');
            expect(response.message).not.toContain('database');
            expect(response.message).not.toContain('Sensitive');
        });

        it('should not expose error stack in response', () => {
            const error = new Error('Test error');
            errorHandler(error, req, res, next);

            const response = res.json.mock.calls[0][0];
            expect(response.stack).toBeUndefined();
        });
    });

    describe('Request Context', () => {
        it('should handle error with request context', () => {
            req.method = 'POST';
            req.url = '/api/test';
            req.userId = 123;

            const error = new Error('Error with context');
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should handle error without request context', () => {
            const error = new Error('Error without context');
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Integration with Express', () => {
        it('should be compatible with Express error handling signature', () => {
            const error = new Error('Express error');
            
            expect(() => {
                errorHandler(error, req, res, next);
            }).not.toThrow();

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalled();
        });

        it('should not call next middleware', () => {
            const error = new Error('Test');
            errorHandler(error, req, res, next);

            expect(next).not.toHaveBeenCalled();
        });
    });
});
