const fs = require('fs');
const path = require('path');

const services = [
  'pcb-fabrication-assembly-service.json',
  'pcb-layout-service.json',
  'pcb-flex-fabrication-service.json',
  'pcb-stencil-service.json',
  'component-sourcing-service.json'
];

const API_URL = process.env.API_URL || 'http://localhost:5557/api/admin/services';
const AUTH_TOKEN = process.argv[2];

if (!AUTH_TOKEN) {
  console.error('❌ Please provide authentication token as argument');
  console.log('Usage: node import-services.js YOUR_AUTH_TOKEN');
  process.exit(1);
}

async function importServices() {
  console.log('🚀 Starting service import...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const serviceFile of services) {
    try {
      const filePath = path.join(__dirname, serviceFile);
      const serviceData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📦 Importing: ${serviceData.name}...`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(serviceData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Success: ${serviceData.name}`);
        console.log(`   - Service ID: ${result.data[0].service_id}`);
        console.log(`   - Config Options: ${result.data[0].config_options.length}`);
        console.log(`   - Pricing Rules: ${result.data[0].pricing_rules.length}`);
        console.log(`   - Lead Times: ${result.data[0].lead_times.length}\n`);
        successCount++;
      } else {
        console.log(`❌ Failed: ${serviceData.name}`);
        console.log(`   Error: ${result.message}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ Error importing ${serviceFile}:`, error.message, '\n');
      failCount++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`📊 Import Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📈 Total: ${services.length}`);
  console.log('═══════════════════════════════════════\n');

  if (successCount === services.length) {
    console.log('🎉 All services imported successfully!');
  } else if (successCount > 0) {
    console.log('⚠️  Some services failed to import. Check errors above.');
  } else {
    console.log('💥 No services were imported successfully.');
  }
}

importServices().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
