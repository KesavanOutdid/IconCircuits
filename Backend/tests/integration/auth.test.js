const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

describe('Authentication Integration Tests', () => {
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

    describe('Token Generation and Validation Flow', () => {
        it('should create and validate token for admin user', () => {
            const payload = {
                userId: 1,
                id: '507f1f77bcf86cd799439011',
                roleId: 1
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(req.userId).toBe(1);
            expect(req.roleId).toBe(1);
            expect(req.userObjectId).toBe('507f1f77bcf86cd799439011');
            expect(next).toHaveBeenCalled();
        });

        it('should create and validate token for regular user', () => {
            const payload = {
                userId: 100,
                id: '507f1f77bcf86cd799439022',
                roleId: 2
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(req.userId).toBe(100);
            expect(req.roleId).toBe(2);
            expect(next).toHaveBeenCalled();
        });

        it('should reject token with different secret', () => {
            const token = jwt.sign(
                { userId: 1, id: 'test', roleId: 1 },
                'different-secret',
                { expiresIn: '24h' }
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

        it('should handle token with missing userId (fallback to id)', () => {
            const token = jwt.sign(
                { id: '507f1f77bcf86cd799439011', roleId: 1 },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(req.userId).toBe('507f1f77bcf86cd799439011');
            expect(req.userObjectId).toBe('507f1f77bcf86cd799439011');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Token Expiration Tests', () => {
        it('should accept token that expires in future', () => {
            const token = jwt.sign(
                { userId: 1, id: 'test-id', roleId: 1 },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should reject expired token', () => {
            const token = jwt.sign(
                { userId: 1, id: 'test-id', roleId: 1 },
                process.env.JWT_SECRET,
                { expiresIn: '-10s' }
            );

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
        });

        it('should accept token without expiration', () => {
            const token = jwt.sign(
                { userId: 1, id: 'test-id', roleId: 1 },
                process.env.JWT_SECRET
            );

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('Token Payload Variations', () => {
        it('should handle token with additional custom fields', () => {
            const token = jwt.sign(
                {
                    userId: 50,
                    id: 'test-id',
                    roleId: 2,
                    email: 'user@test.com',
                    name: 'Test User',
                    custom_field: 'custom_value'
                },
                process.env.JWT_SECRET
            );

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(req.userId).toBe(50);
            expect(req.roleId).toBe(2);
            expect(next).toHaveBeenCalled();
        });

        it('should handle numeric string userId', () => {
            const token = jwt.sign(
                { userId: '123', id: 'test-id', roleId: 1 },
                process.env.JWT_SECRET
            );

            req.headers.authorization = `Bearer ${token}`;
            authMiddleware(req, res, next);

            expect(req.userId).toBe('123');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Authorization Header Formats', () => {
        it('should handle Bearer with lowercase', () => {
            const token = jwt.sign({ userId: 1, id: 'test', roleId: 1 }, process.env.JWT_SECRET);
            req.headers.authorization = `bearer ${token}`;

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle extra whitespace in header', () => {
            const token = jwt.sign({ userId: 1, id: 'test', roleId: 1 }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer  ${token}`;

            authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should reject token without Bearer prefix', () => {
            const token = jwt.sign({ userId: 1, id: 'test', roleId: 1 }, process.env.JWT_SECRET);
            req.headers.authorization = token;

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('Security Tests', () => {
        it('should decode token payload correctly', () => {
            const originalPayload = {
                userId: 42,
                id: 'unique-object-id',
                roleId: 2
            };
            const token = jwt.sign(originalPayload, process.env.JWT_SECRET);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.userId).toBe(originalPayload.userId);
            expect(decoded.id).toBe(originalPayload.id);
            expect(decoded.roleId).toBe(originalPayload.roleId);
            expect(decoded).toHaveProperty('iat');
        });

        it('should not allow token manipulation', () => {
            const token = jwt.sign({ userId: 1, id: 'test', roleId: 1 }, process.env.JWT_SECRET);
            const parts = token.split('.');
            const manipulatedPayload = Buffer.from(
                JSON.stringify({ userId: 999, id: 'hacked', roleId: 1 })
            ).toString('base64');
            const manipulatedToken = `${parts[0]}.${manipulatedPayload}.${parts[2]}`;

            req.headers.authorization = `Bearer ${manipulatedToken}`;
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('should validate token signature integrity', () => {
            const token = jwt.sign({ userId: 1, id: 'test', roleId: 1 }, process.env.JWT_SECRET);
            const corruptedToken = token.slice(0, -5) + 'XXXXX';

            req.headers.authorization = `Bearer ${corruptedToken}`;
            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
        });
    });
});
