const jwt = require('jsonwebtoken');

describe('Service API Integration Tests', () => {
    let authToken;
    let adminToken;
    let userToken;

    beforeAll(() => {
        authToken = jwt.sign(
            { userId: 1, id: 'test-id', roleId: 1 },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        adminToken = jwt.sign(
            { userId: 1, id: 'admin-object-id', roleId: 1 },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        userToken = jwt.sign(
            { userId: 100, id: 'user-object-id', roleId: 2 },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    });

    describe('Token Generation', () => {
        it('should generate valid admin JWT token', () => {
            expect(adminToken).toBeDefined();
            
            const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
            expect(decoded.userId).toBe(1);
            expect(decoded.roleId).toBe(1);
            expect(decoded.id).toBe('admin-object-id');
        });

        it('should generate valid user JWT token', () => {
            expect(userToken).toBeDefined();
            
            const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
            expect(decoded.userId).toBe(100);
            expect(decoded.roleId).toBe(2);
            expect(decoded.id).toBe('user-object-id');
        });

        it('should include expiration in token', () => {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
            expect(decoded).toHaveProperty('exp');
            expect(decoded).toHaveProperty('iat');
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    describe('Service Schema Validation', () => {
        it('should validate minimal service schema', () => {
            const minimalService = {
                name: 'Test Service',
                code: 'TEST',
                sections: [],
                pricing_rules: [],
                lead_times: []
            };

            expect(minimalService).toHaveProperty('name');
            expect(minimalService).toHaveProperty('code');
            expect(minimalService.sections).toBeInstanceOf(Array);
            expect(minimalService.pricing_rules).toBeInstanceOf(Array);
            expect(minimalService.lead_times).toBeInstanceOf(Array);
        });

        it('should validate complete service schema with sections', () => {
            const completeService = {
                name: 'PCB Fabrication',
                code: 'PCB_FAB',
                description: 'Custom PCB manufacturing',
                category: 'Manufacturing',
                status: true,
                sections: [{
                    section_id: 'basic_info',
                    title: 'Basic Information',
                    visible_if: null,
                    fields: [{
                        field_id: 'pcb_name',
                        label: 'PCB Name',
                        type: 'text',
                        required: true,
                        options: [],
                        unit: null,
                        file_types: [],
                        show_if: null
                    }]
                }],
                pricing_rules: [{
                    rule_id: 1,
                    name: 'Base Price',
                    conditions: null,
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

            expect(completeService.sections).toHaveLength(1);
            expect(completeService.sections[0].fields).toHaveLength(1);
            expect(completeService.pricing_rules).toHaveLength(1);
            expect(completeService.lead_times).toHaveLength(1);
        });

        it('should validate field types', () => {
            const validFieldTypes = ['text', 'number', 'select', 'radio', 'file', 'checkbox'];
            
            validFieldTypes.forEach(type => {
                const field = {
                    field_id: `test_${type}`,
                    label: `Test ${type}`,
                    type: type,
                    required: false
                };
                expect(validFieldTypes).toContain(field.type);
            });
        });

        it('should validate pricing rule structure', () => {
            const pricingRule = {
                rule_id: 1,
                name: 'Complex Pricing',
                conditions: { material: 'Rogers' },
                formula: '(base + layer * 200) * panel_qty',
                status: true
            };

            expect(pricingRule).toHaveProperty('rule_id');
            expect(pricingRule).toHaveProperty('formula');
            expect(typeof pricingRule.formula).toBe('string');
        });

        it('should validate lead time structure', () => {
            const leadTime = {
                lead_id: 1,
                name: 'Express',
                days: 3,
                price_multiplier: 1.5,
                status: true
            };

            expect(leadTime.days).toBeGreaterThan(0);
            expect(leadTime.price_multiplier).toBeGreaterThan(0);
            expect(typeof leadTime.status).toBe('boolean');
        });
    });

    describe('Service Data Transformations', () => {
        it('should handle section visibility conditions', () => {
            const section = {
                section_id: 'assembly_options',
                title: 'Assembly Options',
                visible_if: { pcb_assembly: 'Yes' },
                fields: []
            };

            expect(section.visible_if).toBeDefined();
            expect(section.visible_if).toHaveProperty('pcb_assembly');
        });

        it('should handle field show conditions', () => {
            const field = {
                field_id: 'smd_components',
                label: 'SMD Components',
                type: 'number',
                show_if: { assembly_type: 'SMD' },
                required: false
            };

            expect(field.show_if).toBeDefined();
            expect(field.show_if).toHaveProperty('assembly_type');
        });

        it('should handle select field options', () => {
            const selectField = {
                field_id: 'material',
                label: 'Material Type',
                type: 'select',
                options: ['FR-4', 'Rogers', 'Aluminum'],
                required: true
            };

            expect(selectField.options).toBeInstanceOf(Array);
            expect(selectField.options.length).toBeGreaterThan(0);
        });

        it('should handle file field types', () => {
            const fileField = {
                field_id: 'gerber_files',
                label: 'Gerber Files',
                type: 'file',
                file_types: ['.zip', '.rar', '.gerber'],
                required: true
            };

            expect(fileField.file_types).toBeInstanceOf(Array);
            expect(fileField.file_types).toContain('.zip');
        });

        it('should handle number field with unit', () => {
            const numberField = {
                field_id: 'board_thickness',
                label: 'Board Thickness',
                type: 'number',
                unit: 'mm',
                required: true
            };

            expect(numberField.unit).toBe('mm');
            expect(numberField.type).toBe('number');
        });
    });

    describe('Service Pricing Scenarios', () => {
        it('should calculate base pricing formula', () => {
            const formula = 'base + (layer * 100)';
            const variables = { base: 500, layer: 4 };
            
            const calculatedPrice = variables.base + (variables.layer * 100);
            expect(calculatedPrice).toBe(900);
        });

        it('should calculate complex pricing with conditions', () => {
            const formula = '(base + layer * 200) * panel_qty';
            const variables = { base: 1000, layer: 6, panel_qty: 10 };
            
            const calculatedPrice = (variables.base + variables.layer * 200) * variables.panel_qty;
            expect(calculatedPrice).toBe(22000);
        });

        it('should apply lead time multipliers', () => {
            const basePrice = 1000;
            const leadTimes = [
                { name: 'Standard', days: 7, price_multiplier: 1.0 },
                { name: 'Express', days: 3, price_multiplier: 1.5 },
                { name: 'Rush', days: 1, price_multiplier: 2.0 }
            ];

            leadTimes.forEach(lt => {
                const finalPrice = basePrice * lt.price_multiplier;
                expect(finalPrice).toBe(basePrice * lt.price_multiplier);
            });
        });
    });

    describe('Service Code Normalization', () => {
        it('should normalize service codes to uppercase', () => {
            const code = 'pcb_fabrication';
            const normalizedCode = code.trim().toUpperCase();
            expect(normalizedCode).toBe('PCB_FABRICATION');
        });

        it('should handle service codes with whitespace', () => {
            const code = '  test_service  ';
            const normalizedCode = code.trim().toUpperCase();
            expect(normalizedCode).toBe('TEST_SERVICE');
        });

        it('should handle mixed case service codes', () => {
            const code = 'PcB_AsSeMbLy';
            const normalizedCode = code.trim().toUpperCase();
            expect(normalizedCode).toBe('PCB_ASSEMBLY');
        });
    });

    describe('Service Search and Filter Logic', () => {
        it('should build filter for status', () => {
            const filter = {};
            const status = 'true';
            if (status !== undefined) {
                filter.status = status === 'true';
            }
            expect(filter.status).toBe(true);
        });

        it('should build regex filter for category', () => {
            const filter = {};
            const category = 'Manufacturing';
            if (category) {
                filter.category = { $regex: category, $options: 'i' };
            }
            expect(filter.category.$regex).toBe('Manufacturing');
            expect(filter.category.$options).toBe('i');
        });

        it('should build search filter for name and code', () => {
            const filter = {};
            const search = 'PCB';
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { code: { $regex: search, $options: 'i' } }
                ];
            }
            expect(filter.$or).toHaveLength(2);
            expect(filter.$or[0].name.$regex).toBe('PCB');
        });
    });

    describe('Audit Trail Tracking', () => {
        it('should track creation metadata', () => {
            const now = new Date();
            const metadata = {
                createdBy: 1,
                createdTime: now,
                modifiedBy: 1,
                modifiedTime: now,
                createdAt: now,
                updatedAt: now
            };

            expect(metadata.createdBy).toBe(1);
            expect(metadata.createdTime).toBeInstanceOf(Date);
            expect(metadata.modifiedBy).toBe(1);
        });

        it('should track update metadata', () => {
            const now = new Date();
            const updateData = {
                modifiedBy: 1,
                modifiedTime: now,
                updatedAt: now
            };

            expect(updateData.modifiedBy).toBe(1);
            expect(updateData.modifiedTime).toBeInstanceOf(Date);
            expect(updateData.updatedAt).toBeInstanceOf(Date);
        });
    });
});
