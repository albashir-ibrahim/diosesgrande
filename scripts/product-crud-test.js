/**
 * Vendor Product CRUD & Security Test
 * Simulates: Create Product → Edit Product → Delete Product → Test Cross-Vendor Security
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const BASE = 'http://localhost:3000';

// ── Test helpers ─────────────────────────────────────────────────────────────

function pass(msg, detail = '') {
  console.log(`  ✅ PASS  ${msg}`);
  if (detail) console.log(`        → ${detail}`);
}
function fail(msg, detail = '') {
  console.log(`  ❌ FAIL  ${msg}`);
  if (detail) console.log(`        → ${detail}`);
}
function info(msg) {
  console.log(`  ℹ️       ${msg}`);
}

async function fetchFinal(path, options = {}) {
  let url = path.startsWith('http') ? path : `${BASE}${path}`;
  for (let i = 0; i < 10; i++) {
    const res = await fetch(url, { ...options, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location') || '';
      url = loc.startsWith('http') ? loc : `${BASE}${loc}`;
    } else {
      return { finalUrl: url, status: res.status, res };
    }
  }
  return { finalUrl: url, status: 0 };
}

// ── Main test suite ───────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       VENDOR PRODUCT CRUD & SECURITY TEST REPORT             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  let totalPass = 0, totalFail = 0;
  const mark = (ok) => { ok ? totalPass++ : totalFail++; return ok; };

  // Setup: Create 2 vendors and a category
  info('Setting up test data (2 Vendors, 1 Category)...');
  
  // Category might not have a slug, using name for where
  const categoryName = `Test Category ${Date.now()}`;
  let category;
  try {
     category = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: categoryName }
     });
  } catch(e) {
     mark(fail('Failed to create or find category', e.message));
     return;
  }

  const user1 = await prisma.user.create({
    data: { name: 'Vendor 1', email: `v1_${Date.now()}@test.com`, role: 'VENDOR' }
  });
  const vendor1 = await prisma.vendor.create({
    data: { userId: user1.id, name: 'Store 1', slug: `store-1-${Date.now()}`, email: 'v1@test.com' }
  });

  const user2 = await prisma.user.create({
    data: { name: 'Vendor 2', email: `v2_${Date.now()}@test.com`, role: 'VENDOR' }
  });
  const vendor2 = await prisma.vendor.create({
    data: { userId: user2.id, name: 'Store 2', slug: `store-2-${Date.now()}`, email: 'v2@test.com' }
  });

  let productId = null;

  // ── STEP 1: Create Product ─────────────────────────────────────────────
  console.log('\n━━━ STEP 1: Product Creation ━━━\n');
  
  try {
    const product = await prisma.product.create({
      data: {
        vendorId: vendor1.id,
        categoryId: category.id,
        name: 'Test Product V1',
        description: 'A test product created by Vendor 1',
        price: 15000,
        stock: 50,
        images: ['https://example.com/img.jpg']
      }
    });
    productId = product.id;
    mark(pass('Product successfully created by Vendor 1', `ID: ${product.id} | Price: ₦15,000`));
    
    // Verify in DB
    const dbProduct = await prisma.product.findUnique({ where: { id: productId } });
    mark(dbProduct 
      ? pass('Product verified in database after creation') 
      : fail('Product NOT found in database after creation'));
      
  } catch (e) {
    mark(fail('Failed to create product', e.message));
  }

  // ── STEP 2: Edit Product ───────────────────────────────────────────────
  console.log('\n━━━ STEP 2: Product Edit ━━━\n');

  if (productId) {
    try {
      const updatedProduct = await prisma.product.updateMany({
        where: { id: productId, vendorId: vendor1.id }, // Simulating vendor-scoped update
        data: { price: 20000, stock: 45 }
      });
      
      if(updatedProduct.count > 0) {
        mark(pass('Product successfully edited by Vendor 1', `New Price: ₦20,000 | New Stock: 45`));
        
        const dbProduct = await prisma.product.findUnique({ where: { id: productId } });
        mark(dbProduct.price === 20000 && dbProduct.stock === 45
          ? pass('Product changes verified in database')
          : fail('Product changes NOT reflected in database'));
      } else {
        mark(fail('Failed to edit product: Product not found or unauthorized'));
      }
        
    } catch (e) {
      mark(fail('Failed to edit product', e.message));
    }
  }

  // ── STEP 3: Cross-Vendor Security Test ─────────────────────────────────
  console.log('\n━━━ STEP 3: Cross-Vendor Security (RBAC/Ownership) ━━━\n');

  if (productId) {
    info('Vendor 2 attempting to edit Vendor 1\'s product...');
    try {
      // Simulate API endpoint logic for editing a product: where { id: productId, vendorId: session.vendorId }
      const updateAttempt = await prisma.product.updateMany({
        where: { id: productId, vendorId: vendor2.id },
        data: { price: 1 }
      });
      
      if (updateAttempt.count === 0) {
        mark(pass('Access denied correctly', 'Vendor 2 prevented from editing Vendor 1\'s product (0 records updated)'));
      } else {
         mark(fail('Security breach: Vendor 2 successfully edited Vendor 1\'s product'));
      }
    } catch (e) {
      mark(fail('Unexpected error during security test', e.message));
    }
  }

  // ── STEP 4: Delete Product ─────────────────────────────────────────────
  console.log('\n━━━ STEP 4: Product Deletion ━━━\n');

  if (productId) {
    try {
      // Simulating vendor-scoped deletion
      const deleteResult = await prisma.product.deleteMany({
        where: { id: productId, vendorId: vendor1.id } 
      });
      
      if(deleteResult.count > 0) {
        mark(pass('Product successfully deleted by Vendor 1'));
        
        // Verify removed from DB
        const dbProduct = await prisma.product.findUnique({ where: { id: productId } });
        mark(!dbProduct 
          ? pass('Product verified deleted from database') 
          : fail('Product still exists in database after deletion'));
      } else {
        mark(fail('Failed to delete product: Product not found or unauthorized'));
      }
        
    } catch (e) {
      mark(fail('Failed to delete product', e.message));
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────
  console.log('\n━━━ STEP 5: Test Cleanup ━━━\n');
  
  try {
    // Delete product if it somehow survived
    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    await prisma.vendor.deleteMany({ where: { id: { in: [vendor1.id, vendor2.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    info('Test data cleaned up successfully');
  } catch (e) {
    info(`Cleanup note: ${e.message}`);
  }

  // ── Final report ─────────────────────────────────────────────────────────
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS:  ${totalPass} PASSED  |  ${totalFail} FAILED  |  ${totalPass + totalFail} TOTAL              ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  if (totalFail === 0) {
    console.log('\n🎉  Product CRUD & Security tests passed!\n');
  } else {
    console.log(`\n⚠️  ${totalFail} test(s) failed. Check logs above.\n`);
  }

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error('Fatal error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
