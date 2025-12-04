const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../middleware/authMiddleware');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('Missing Token', () => {
        it('should return 401 if no token is provided', () => {
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if authorization header is empty', () => {
            req.headers.authorization = '';
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if authorization header does not contain Bearer', () => {
            req.headers.authorization = 'InvalidFormat token123';
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Invalid Token', () => {
        it('should return 401 if token is invalid', () => {
            req.headers.authorization = 'Bearer invalidtoken';

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is malformed', () => {
            req.headers.authorization = 'Bearer not.a.valid.jwt.token';
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is expired', () => {
            const token = jwt.sign(
                { userId: 123, id: 'objId123', roleId: 1 },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' }
            );
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token signature is invalid', () => {
            const token = jwt.sign({ userId: 123, id: 'objId123', roleId: 1 }, 'wrong-secret');
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Valid Token', () => {
        it('should set req.userId and call next() if token is valid', () => {
            const userId = 123;
            const token = jwt.sign({ userId, id: 'objId123', roleId: 1 }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(req.userId).toBe(userId);
            expect(req.roleId).toBe(1);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should set req.userObjectId from decoded token', () => {
            const objectId = 'mongoObjectId123';
            const token = jwt.sign({ userId: 456, id: objectId, roleId: 2 }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(req.userObjectId).toBe(objectId);
            expect(req.userId).toBe(456);
            expect(req.roleId).toBe(2);
            expect(next).toHaveBeenCalled();
        });

        it('should handle token with only id field (fallback to id)', () => {
            const token = jwt.sign({ id: 'objId789', roleId: 1 }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(req.userId).toBe('objId789');
            expect(req.userObjectId).toBe('objId789');
            expect(next).toHaveBeenCalled();
        });

        it('should work with Superadmin role', () => {
            const token = jwt.sign({ userId: 1, id: 'admin-id', roleId: 1 }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(req.roleId).toBe(1);
            expect(next).toHaveBeenCalled();
        });

        it('should work with Enduser role', () => {
            const token = jwt.sign({ userId: 100, id: 'user-id', roleId: 2 }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            authMiddleware(req, res, next);

            expect(req.roleId).toBe(2);
            expect(next).toHaveBeenCalled();
        });
    });
});
