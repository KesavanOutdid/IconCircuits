# PCB Services - Mock Data

This directory contains comprehensive mock data for all PCB services offered by IconCircuits.

## Available Services

### 1. PCB Fabrication & Assembly (Rigid)
**File:** `pcb-fabrication-assembly-service.json`

Complete PCB manufacturing service with:
- **95+ Configuration Options** covering all form fields
- Panel configurations (Customer/PCB Power panelization)
- Materials (FR-4, Rogers, High-Tg variants)
- Layers (1-10 layers)
- Surface finishes (HASL, ENIG, OSP, etc.)
- Assembly options (Turnkey, Combo, Consigned)
- Component types (SMD, Through-hole, BGA/QFN)
- Advanced options (Impedance control, Via fill, Conformal coating)

### 2. PCB Layout Design
**File:** `pcb-layout-service.json`

Professional PCB design service with:
- Layer options (2-8 layers)
- Component count ranges (0-50, 51-100, 101-200, 200+)
- Impedance control design
- Pricing based on complexity

### 3. PCB Fabrication (Flex)
**File:** `pcb-flex-fabrication-service.json`

Flexible PCB manufacturing with:
- Materials (Polyimide, PET)
- Flex layers (1, 2, 4-layer Rigid-Flex)
- Ultra-thin thickness options (0.05mm - 0.3mm)
- High-temperature ratings

### 4. PCB Stencil
**File:** `pcb-stencil-service.json`

Precision stencils for SMT assembly:
- Stencil sides (Top, Bottom, Both)
- Types (Framed, Frameless)
- Thickness options (4-8 mil)
- Data approval workflow

### 5. Component Sourcing
**File:** `component-sourcing-service.json`

Component procurement service:
- Sourcing types (Standard, Custom/Hard-to-find)
- Component categories (Passive, Active, Connectors, etc.)
- Quality grades (Standard, Industrial, Automotive, Military)
- Verification levels (Basic, Advanced with X-Ray)
- Special packaging options (ESD, Moisture barrier)

## How to Use

### Import Single Service via API

```bash
POST http://localhost:5557/api/admin/services
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

# Copy content from any JSON file
```

### Import All Services via Script

Create `import-services.js`:

```javascript
const fs = require('fs');
const path = require('path');

const services = [
  'pcb-fabrication-assembly-service.json',
  'pcb-layout-service.json',
  'pcb-flex-fabrication-service.json',
  'pcb-stencil-service.json',
  'component-sourcing-service.json'
];

async function importServices() {
  for (const serviceFile of services) {
    const filePath = path.join(__dirname, serviceFile);
    const serviceData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const response = await fetch('http://localhost:5557/api/admin/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify(serviceData)
    });
    
    const result = await response.json();
    console.log(`Imported: ${serviceData.name}`, result.success ? '✓' : '✗');
  }
}

importServices();
```

Run: `node import-services.js`

## Data Structure

Each service file contains:

```json
{
  "name": "Service Name",
  "code": "SERVICE_CODE",
  "description": "Service description",
  "category": "Category",
  "config_options": [
    {
      "type": "option_type",
      "name": "Option Name",
      "value": "option_value",
      "displayName": "Display Name",
      "unit": "unit",
      "priceModifier": 1.0,
      "status": true
    }
  ],
  "pricing_rules": [
    {
      "ruleName": "Rule Name",
      "conditions": { "key": "value" },
      "basePrice": 1000,
      "calculationType": "fixed|formula|percentage",
      "formula": "basePrice * multiplier",
      "status": true
    }
  ],
  "lead_times": [
    {
      "name": "Standard",
      "days": 7,
      "priceMultiplier": 1.0,
      "displayText": "7 Working Days",
      "status": true
    }
  ]
}
```

## Key Features

### Auto-Generated IDs
All IDs are automatically generated:
- `service_id` - Sequential service identifier
- `option_id` - Sequential option identifier
- `rule_id` - Sequential pricing rule identifier
- `leadtime_id` - Sequential lead time identifier

### Price Modifiers
Each configuration option has a `priceModifier`:
- `1.0` = Base price (no change)
- `< 1.0` = Discount (e.g., 0.85 = 15% discount)
- `> 1.0` = Premium (e.g., 1.5 = 50% increase)

### Pricing Rules
Three calculation types:
1. **fixed** - Static price
2. **formula** - Dynamic calculation using variables
3. **percentage** - Percentage of base/component cost

### Lead Times
Different delivery options with price multipliers:
- Express (higher cost, faster delivery)
- Standard (baseline)
- Economy (lower cost, slower delivery)

## Real-World Mapping

### PCB Fabrication & Assembly Form → Config Options

| Form Field | Config Type | Example Values |
|------------|-------------|----------------|
| PCB Assembly | `pcb_assembly` | yes, no |
| Dispatch Unit | `dispatch_unit` | single_board, panel |
| Panel By | `panel_by` | customer, pcb_power |
| Material | `material` | fr4, fr4_tg150, rogers |
| Layer | `layer` | 1, 2, 4, 6, 8, 10 |
| Board Thickness | `board_thickness` | 0.4, 0.6, 0.8, 1.0, 1.6, 2.0 |
| Surface Finish | `surface_finish` | hasl_lead_free, enig, osp |
| Temperature Gradient | `temperature_gradient` | std_tg, middle_tg, high_tg |
| Finish Cu Thickness | `finish_cu_thickness` | 35, 70, 90, 130 |
| Solder Mask | `solder_mask_top/bottom` | green, red, blue, black |
| Legend | `legend_top/bottom` | no_legend, white, black |
| Impedance Control | `impedance_control` | yes, no |
| Component Sourcing | `component_sourcing` | turnkey, combo, consigned |

## Extending Services

To add new options to a service:

1. Open the service JSON file
2. Add new option to `config_options` array
3. Optionally add pricing rule for the option
4. Update via PUT API or reimport

```json
{
  "type": "new_option_type",
  "name": "New Option",
  "value": "new_value",
  "displayName": "New Option Display",
  "unit": null,
  "priceModifier": 1.2,
  "status": true
}
```

## Testing

Use Swagger UI to test:
```
http://localhost:5557/api-docs
```

Navigate to **Admin - Services** section to:
- Create services with nested data
- View all services
- Get service by ID
- Update service configurations

## Notes

- All prices are in INR (₹)
- Lead times are in working days (WD)
- Tax is calculated separately (18% GST standard)
- Setup charges are one-time fees
- Freight charges calculated based on location and weight
