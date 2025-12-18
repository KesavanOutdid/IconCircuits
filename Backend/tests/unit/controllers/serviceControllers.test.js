const { 
    parseArray, 
    createService, 
    getService, 
    getServices, 
    updateService, 
    deleteService 
} = require('../../../controllers/admin/serviceControllers');

const database = require('../../../config/db');

jest.mock('../../../config/db');

describe('Service Controllers', () => {
    let mockCollection;
    let req, res;

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
            find: jest.fn(),
            insertOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            countDocuments: jest.fn()
        };

        mockCollection.find.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([])
        });

        database.connectToDatabase = jest.fn().mockResolvedValue({
            collection: jest.fn().mockReturnValue(mockCollection)
        });

        req = {
            userId: 1,
            body: {},
            params: {},
            query: {},
            pagination: { page: 1, limit: 10, skip: 0 }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('parseArray Helper', () => {
        it('should return array as is if input is already an array', () => {
            const input = ['item1', 'item2'];
            const result = parseArray(input);
            expect(result).toEqual(input);
        });

        it('should parse JSON string to array', () => {
            const input = '["item1", "item2"]';
            const result = parseArray(input);
            expect(result).toEqual(['item1', 'item2']);
        });

        it('should return empty array for invalid JSON string', () => {
            const input = 'invalid json';
            const result = parseArray(input);
            expect(result).toEqual([]);
        });

        it('should return empty array for null or undefined', () => {
            expect(parseArray(null)).toEqual([]);
            expect(parseArray(undefined)).toEqual([]);
        });

        it('should return empty array for non-array, non-string input', () => {
            expect(parseArray(123)).toEqual([]);
            expect(parseArray({})).toEqual([]);
        });

        it('should parse complex nested JSON array', () => {
            const input = '[{"id": 1, "name": "test"}, {"id": 2, "name": "test2"}]';
            const result = parseArray(input);
            expect(result).toEqual([
                { id: 1, name: 'test' },
                { id: 2, name: 'test2' }
            ]);
        });
    });

    describe('createService', () => {
        it('should return 400 if name is missing', async () => {
            req.body = { code: 'TEST' };

            await createService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service name and code are required'
            });
        });

        it('should return 400 if code is missing', async () => {
            req.body = { name: 'Test Service' };

            await createService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service name and code are required'
            });
        });

        it('should return 400 if service code already exists', async () => {
            req.body = { name: 'Test Service', code: 'TEST' };
            mockCollection.findOne.mockResolvedValue({ code: 'TEST' });

            await createService(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service code "TEST" already exists'
            });
        });

        it('should create service successfully with minimal data', async () => {
            req.body = {
                name: 'Test Service',
                code: 'TEST'
            };
            mockCollection.findOne.mockResolvedValue(null);
            mockCollection.find().sort().limit().toArray.mockResolvedValue([]);

            await createService(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Service created successfully',
                    data: expect.objectContaining({
                        service_id: 1,
                        name: 'Test Service',
                        code: 'TEST',
                        createdBy: 1
                    })
                })
            );
        });

        it('should create service with complete data including sections and pricing', async () => {
            req.body = {
                name: 'PCB Service',
                code: 'PCB',
                description: 'PCB Fabrication',
                category: 'Manufacturing',
                status: true,
                sections: [{
                    section_id: 'basic',
                    title: 'Basic Info',
                    fields: [{
                        field_id: 'pcb_name',
                        label: 'PCB Name',
                        type: 'text',
                        required: true
                    }]
                }],
                pricing_rules: [{
                    rule_id: 1,
                    name: 'Base Price',
                    formula: 'base + layer * 100',
                    status: true
                }],
                lead_times: [{
                    lead_id: 1,
                    name: 'Standard',
                    days: 7,
                    price_multiplier: 1.0,
                    status: true
                }]
            };
            mockCollection.findOne.mockResolvedValue(null);
            mockCollection.find().sort().limit().toArray.mockResolvedValue([{ service_id: 5 }]);

            await createService(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        service_id: 6,
                        name: 'PCB Service',
                        code: 'PCB',
                        sections: expect.arrayContaining([
                            expect.objectContaining({
                                section_id: 'basic',
                                title: 'Basic Info'
                            })
                        ])
                    })
                })
            );
        });

        it('should handle database errors gracefully', async () => {
            req.body = { name: 'Test', code: 'TEST' };
            mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

            await createService(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal Server Error'
            });
        });
    });

    describe('getService', () => {
        it('should return 400 if serviceId is missing', async () => {
            req.params = {};

            await getService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'serviceId param is required'
            });
        });

        it('should return 400 if serviceId is invalid', async () => {
            req.params = { serviceId: 'invalid' };

            await getService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid serviceId'
            });
        });

        it('should return 400 if serviceId is negative', async () => {
            req.params = { serviceId: '-5' };

            await getService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid serviceId'
            });
        });

        it('should return 404 if service not found', async () => {
            req.params = { serviceId: '999' };
            mockCollection.findOne.mockResolvedValue(null);

            await getService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service not found'
            });
        });

        it('should retrieve service successfully', async () => {
            const mockService = {
                service_id: 1,
                name: 'Test Service',
                code: 'TEST',
                sections: []
            };
            req.params = { serviceId: '1' };
            mockCollection.findOne.mockResolvedValue(mockService);

            await getService(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Service retrieved successfully',
                data: mockService
            });
        });

        it('should handle database errors', async () => {
            req.params = { serviceId: '1' };
            mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

            await getService(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal Server Error'
            });
        });
    });

    describe('getServices', () => {
        it('should retrieve all services with pagination', async () => {
            const mockServices = [
                { service_id: 1, name: 'Service 1' },
                { service_id: 2, name: 'Service 2' }
            ];
            mockCollection.countDocuments.mockResolvedValue(2);
            mockCollection.find().sort().skip().limit().toArray.mockResolvedValue(mockServices);

            await getServices(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Services retrieved successfully',
                data: mockServices
            });
        });

        it('should filter services by status', async () => {
            req.query = { status: 'true' };
            mockCollection.countDocuments.mockResolvedValue(1);
            mockCollection.find().sort().skip().limit().toArray.mockResolvedValue([]);

            await getServices(req, res);

            expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: true });
        });

        it('should filter services by category', async () => {
            req.query = { category: 'Manufacturing' };
            mockCollection.countDocuments.mockResolvedValue(1);
            mockCollection.find().sort().skip().limit().toArray.mockResolvedValue([]);

            await getServices(req, res);

            expect(mockCollection.countDocuments).toHaveBeenCalledWith({
                category: { $regex: 'Manufacturing', $options: 'i' }
            });
        });

        it('should search services by name or code', async () => {
            req.query = { search: 'PCB' };
            mockCollection.countDocuments.mockResolvedValue(1);
            mockCollection.find().sort().skip().limit().toArray.mockResolvedValue([]);

            await getServices(req, res);

            expect(mockCollection.countDocuments).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: 'PCB', $options: 'i' } },
                    { code: { $regex: 'PCB', $options: 'i' } }
                ]
            });
        });
    });

    describe('updateService', () => {
        it('should return 400 if serviceId is missing', async () => {
            req.params = {};

            await updateService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'serviceId param is required'
            });
        });

        it('should return 404 if service not found', async () => {
            req.params = { serviceId: '999' };
            mockCollection.findOne.mockResolvedValue(null);

            await updateService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service not found'
            });
        });

        it('should update service successfully', async () => {
            const existingService = { service_id: 1, name: 'Old Name' };
            const updatedService = { service_id: 1, name: 'New Name' };
            req.params = { serviceId: '1' };
            req.body = { name: 'New Name' };
            mockCollection.findOne
                .mockResolvedValueOnce(existingService)
                .mockResolvedValueOnce(updatedService);

            await updateService(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Service updated successfully',
                data: updatedService
            });
        });

        it('should update service status', async () => {
            const existingService = { service_id: 1, status: true };
            req.params = { serviceId: '1' };
            req.body = { status: false };
            mockCollection.findOne.mockResolvedValue(existingService);

            await updateService(req, res);

            expect(mockCollection.updateOne).toHaveBeenCalledWith(
                { service_id: 1 },
                expect.objectContaining({
                    $set: expect.objectContaining({
                        status: false,
                        modifiedBy: 1
                    })
                })
            );
        });
    });

    describe('deleteService', () => {
        it('should return 400 if serviceId is missing', async () => {
            req.params = {};

            await deleteService(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'serviceId param is required'
            });
        });

        it('should return 404 if service not found', async () => {
            req.params = { serviceId: '999' };
            mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

            await deleteService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service not found'
            });
        });

        it('should delete service successfully', async () => {
            req.params = { serviceId: '1' };
            mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

            await deleteService(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Service deleted successfully'
            });
        });

        it('should handle database errors', async () => {
            req.params = { serviceId: '1' };
            mockCollection.deleteOne.mockRejectedValue(new Error('DB Error'));

            await deleteService(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Internal Server Error'
            });
        });
    });
});
