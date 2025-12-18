const pagination = require('../../../middleware/pagination');

describe('Pagination Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('Default Pagination Values', () => {
        it('should set default page to 1 and limit to 10', () => {
            pagination(req, res, next);

            expect(req.pagination).toEqual({
                page: 1,
                limit: 10,
                skip: 0
            });
            expect(next).toHaveBeenCalled();
        });

        it('should calculate skip value correctly', () => {
            req.query = { page: '3', limit: '20' };
            pagination(req, res, next);

            expect(req.pagination).toEqual({
                page: 3,
                limit: 20,
                skip: 40
            });
        });
    });

    describe('Query Parameter Parsing', () => {
        it('should parse valid page and limit from query', () => {
            req.query = { page: '5', limit: '25' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(5);
            expect(req.pagination.limit).toBe(25);
            expect(req.pagination.skip).toBe(100);
        });

        it('should handle string numbers correctly', () => {
            req.query = { page: '10', limit: '50' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(10);
            expect(req.pagination.limit).toBe(50);
        });

        it('should handle numeric query params', () => {
            req.query = { page: 2, limit: 15 };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(2);
            expect(req.pagination.limit).toBe(15);
        });
    });

    describe('Boundary Validation', () => {
        it('should enforce minimum page of 1', () => {
            req.query = { page: '0' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(1);
        });

        it('should enforce minimum page for negative values', () => {
            req.query = { page: '-5' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(1);
        });

        it('should enforce maximum limit of 100', () => {
            req.query = { limit: '500' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(100);
        });

        it('should enforce minimum limit of 1', () => {
            req.query = { limit: '0' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(1);
        });

        it('should enforce minimum limit for negative values', () => {
            req.query = { limit: '-10' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(1);
        });

        it('should handle limit exactly at boundary (100)', () => {
            req.query = { limit: '100' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(100);
        });

        it('should handle limit at 101 (over boundary)', () => {
            req.query = { limit: '101' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(100);
        });
    });

    describe('Invalid Input Handling', () => {
        it('should default to page 1 for invalid page string', () => {
            req.query = { page: 'invalid' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(1);
        });

        it('should default to limit 10 for invalid limit string', () => {
            req.query = { limit: 'invalid' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(10);
        });

        it('should handle decimal page numbers by truncating', () => {
            req.query = { page: '3.7' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(3);
        });

        it('should handle decimal limit numbers by truncating', () => {
            req.query = { limit: '15.9' };
            pagination(req, res, next);

            expect(req.pagination.limit).toBe(15);
        });

        it('should handle null values', () => {
            req.query = { page: null, limit: null };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(1);
            expect(req.pagination.limit).toBe(10);
        });

        it('should handle undefined values', () => {
            req.query = { page: undefined, limit: undefined };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(1);
            expect(req.pagination.limit).toBe(10);
        });

        it('should handle empty string values', () => {
            req.query = { page: '', limit: '' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(1);
            expect(req.pagination.limit).toBe(10);
        });
    });

    describe('Skip Calculation', () => {
        it('should calculate skip for page 1', () => {
            req.query = { page: '1', limit: '10' };
            pagination(req, res, next);

            expect(req.pagination.skip).toBe(0);
        });

        it('should calculate skip for page 2', () => {
            req.query = { page: '2', limit: '10' };
            pagination(req, res, next);

            expect(req.pagination.skip).toBe(10);
        });

        it('should calculate skip for large page numbers', () => {
            req.query = { page: '100', limit: '50' };
            pagination(req, res, next);

            expect(req.pagination.skip).toBe(4950);
        });

        it('should calculate skip with custom limit', () => {
            req.query = { page: '5', limit: '25' };
            pagination(req, res, next);

            expect(req.pagination.skip).toBe(100);
        });
    });

    describe('Response JSON Enhancement', () => {
        it('should add pagination metadata to response', () => {
            req.query = { page: '2', limit: '10' };
            req.paginationTotal = 50;
            
            pagination(req, res, next);

            const responseData = {
                success: true,
                data: [1, 2, 3, 4, 5]
            };

            res.json(responseData);

            expect(res.json).toHaveBeenCalled();
            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination).toEqual({
                currentPage: 2,
                pageSize: 10,
                totalItems: 50,
                totalPages: 5,
                hasNextPage: true,
                hasPrevPage: true
            });
        });

        it('should calculate totalPages correctly', () => {
            req.query = { page: '1', limit: '10' };
            req.paginationTotal = 25;
            
            pagination(req, res, next);

            res.json({ success: true, data: [] });

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination.totalPages).toBe(3);
        });

        it('should set hasNextPage to false on last page', () => {
            req.query = { page: '3', limit: '10' };
            req.paginationTotal = 25;
            
            pagination(req, res, next);

            res.json({ success: true, data: [] });

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination.hasNextPage).toBe(false);
            expect(calledWith.pagination.hasPrevPage).toBe(true);
        });

        it('should set hasPrevPage to false on first page', () => {
            req.query = { page: '1', limit: '10' };
            req.paginationTotal = 50;
            
            pagination(req, res, next);

            res.json({ success: true, data: [] });

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination.hasPrevPage).toBe(false);
            expect(calledWith.pagination.hasNextPage).toBe(true);
        });

        it('should not add pagination if paginationTotal is undefined', () => {
            pagination(req, res, next);

            const responseData = { success: true, data: [] };
            res.json(responseData);

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination).toBeUndefined();
        });

        it('should not add pagination if data is not array', () => {
            req.paginationTotal = 10;
            pagination(req, res, next);

            const responseData = { success: true, data: 'not an array' };
            res.json(responseData);

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination).toBeUndefined();
        });

        it('should not add pagination if body has no data property', () => {
            req.paginationTotal = 10;
            pagination(req, res, next);

            const responseData = { success: true };
            res.json(responseData);

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination).toBeUndefined();
        });

        it('should handle zero total items', () => {
            req.query = { page: '1', limit: '10' };
            req.paginationTotal = 0;
            
            pagination(req, res, next);

            res.json({ success: true, data: [] });

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination).toEqual({
                currentPage: 1,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            });
        });

        it('should handle single page result', () => {
            req.query = { page: '1', limit: '10' };
            req.paginationTotal = 5;
            
            pagination(req, res, next);

            res.json({ success: true, data: [1, 2, 3, 4, 5] });

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.pagination).toEqual({
                currentPage: 1,
                pageSize: 10,
                totalItems: 5,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large page numbers', () => {
            req.query = { page: '999999', limit: '10' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(999999);
            expect(req.pagination.skip).toBe(9999980);
        });

        it('should handle page number with leading zeros', () => {
            req.query = { page: '003', limit: '10' };
            pagination(req, res, next);

            expect(req.pagination.page).toBe(3);
        });

        it('should preserve original response data', () => {
            req.paginationTotal = 100;
            pagination(req, res, next);

            const originalData = {
                success: true,
                message: 'Retrieved successfully',
                data: [1, 2, 3],
                customField: 'custom value'
            };

            res.json(originalData);

            const calledWith = res.json.mock.calls[0][0];
            expect(calledWith.success).toBe(true);
            expect(calledWith.message).toBe('Retrieved successfully');
            expect(calledWith.customField).toBe('custom value');
            expect(calledWith.data).toEqual([1, 2, 3]);
            expect(calledWith.pagination).toBeDefined();
        });
    });
});
