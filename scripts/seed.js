/**
 * Standalone Seeding Script for LedgerBridge
 * Seeds 1 Tenant, 10 Accounts, 20 Realistic Payments, Audit logs, and Compliance cases
 */

async function runSeed() {
  console.log('🌱 Starting LedgerBridge Seeding Script...');
  try {
    const res = await fetch('http://localhost:3001/admin/seed?tenantId=default-tenant', {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Seeding completed successfully:', data);
    } else {
      console.log('⚠️ API server might not be running. Start API with `npm run dev` first.');
    }
  } catch (err) {
    console.log('ℹ️ Seeding can be triggered dynamically from API `/admin/seed` or Web UI Navbar button.');
  }
}

runSeed();
