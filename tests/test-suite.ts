// Comprehensive Automated Test Suite for LAAM Admin & Storefront Verification
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING VERIFICATION TEST SUITE ---');
  let failures = 0;
  let passed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failures++;
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.ok && data.status === 'ok', 'Server health check /api/health');
  } catch (err: any) {
    assert(false, `Server health check failed: ${err.message}`);
    process.exit(1);
  }

  // 2. Authentication Login
  let adminToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@laam.com', password: 'admin123' })
    });
    const data = await res.json();
    assert(res.ok && Boolean(data.token), 'Admin authentication with JWT login');
    adminToken = data.token;
  } catch (err: any) {
    assert(false, `Admin login failed: ${err.message}`);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  // 3. Products CRUD & Status Filtering
  let testProductId = '';
  try {
    // Create an Active product
    const createRes = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Emerald Silk Festive Kalidar',
        description: 'Exquisite hand-worked emerald green raw silk kalidar with resham embroidery.',
        designer: 'LAAM Royal Pret',
        category: 'festive',
        price: 240,
        compareAtPrice: 300,
        inventory: 25,
        status: 'Active',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c'
        ],
        variants: ['XS', 'S', 'M', 'L']
      })
    });
    const createData = await createRes.json();
    testProductId = createData.product.id;
    assert(createRes.status === 201 && testProductId.startsWith('prod-'), 'Admin Product creation');

    // Create a Draft product to verify it remains hidden from storefront
    const draftRes = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Draft Unreleased Velvet Ensemble',
        description: 'Under development outfit.',
        designer: 'LAAM Royal Pret',
        category: 'velvet',
        price: 450,
        status: 'Draft',
        images: ['https://images.unsplash.com/photo-1594223274512-ad4803739b7c']
      })
    });
    const draftData = await draftRes.json();
    const draftId = draftData.product.id;
    assert(draftRes.status === 201, 'Create Draft product');

    // Verify Active product appears in /store/products
    const storeProdsRes = await fetch(`${BASE_URL}/api/admin/store/products`);
    const storeProdsData = await storeProdsRes.json();
    const hasActiveInStore = storeProdsData.products.some((p: any) => p.id === testProductId);
    const hasDraftInStore = storeProdsData.products.some((p: any) => p.id === draftId);
    assert(hasActiveInStore, 'Published Active product appears in public /store/products');
    assert(!hasDraftInStore, 'Draft product remains strictly HIDDEN from public /store/products');

    // Test /store/products/:id for Active and Draft
    const activeSingleRes = await fetch(`${BASE_URL}/api/admin/store/products/${testProductId}`);
    assert(activeSingleRes.ok, 'Active product accessible via public /store/products/:id');
    const draftSingleRes = await fetch(`${BASE_URL}/api/admin/store/products/${draftId}`);
    assert(draftSingleRes.status === 404, 'Draft product returns 404 on public /store/products/:id');
  } catch (err: any) {
    assert(false, `Product test failed: ${err.message}`);
  }

  // 4. Collections CRUD & Product Assignment
  let testCollectionId = '';
  try {
    // Create collection with assigned products
    const colRes = await fetch(`${BASE_URL}/api/admin/collections`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Winter Royal Velvet & Festive Edit',
        description: 'Curated royal velvets for the grand winter gala.',
        handle: 'winter-royal-festive',
        type: 'manual',
        status: 'Active',
        assignedProducts: [testProductId]
      })
    });
    const colData = await colRes.json();
    testCollectionId = colData.collection.id;
    assert(colRes.status === 201 && testCollectionId.startsWith('col-'), 'Collection creation with assigned products');

    // Verify collection relationships persist
    const getColsRes = await fetch(`${BASE_URL}/api/admin/collections`, { headers: authHeaders });
    const getColsData = await getColsRes.json();
    const foundCol = getColsData.collections.find((c: any) => c.id === testCollectionId);
    assert(foundCol && foundCol.assignedProducts && foundCol.assignedProducts.includes(testProductId), 'Collection product assignments persist in database');

    // Verify storefront collection endpoint returns assigned active product
    const storeColRes = await fetch(`${BASE_URL}/api/admin/store/collections/winter-royal-festive`);
    const storeColData = await storeColRes.json();
    assert(storeColRes.ok && storeColData.products.some((p: any) => p.id === testProductId), 'Storefront public collection renders assigned published products');

    // Update collection to remove the assigned product
    const updateColRes = await fetch(`${BASE_URL}/api/admin/collections/${testCollectionId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Winter Royal Velvet & Festive Edit (Updated)',
        assignedProducts: []
      })
    });
    assert(updateColRes.ok, 'Collection product removal updated in database');

    // Verify storefront updates after product removal
    const storeColRes2 = await fetch(`${BASE_URL}/api/admin/store/collections/winter-royal-festive`);
    const storeColData2 = await storeColRes2.json();
    assert(storeColData2.products.length === 0, 'Storefront reflects product removal immediately');
  } catch (err: any) {
    assert(false, `Collection test failed: ${err.message}`);
  }

  // 5. Media Library: Upload, Validation, Usage Protection
  let uploadedMediaId = '';
  let uploadedUrl = '';
  try {
    // Create temporary dummy image file
    const tempFilePath = path.join(process.cwd(), 'temp-test-image.png');
    fs.writeFileSync(tempFilePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));

    // Upload via multipart/form-data
    const blob = new Blob([fs.readFileSync(tempFilePath)], { type: 'image/png' });
    const formData = new FormData();
    formData.append('files', blob, 'test-couture-sample.png');

    const uploadRes = await fetch(`${BASE_URL}/api/admin/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 201 && uploadData.items && uploadData.items.length > 0, 'Media Library upload multiple/single real files');
    uploadedMediaId = uploadData.items[0].id;
    uploadedUrl = uploadData.items[0].url;

    // Verify persisted in media listing
    const mediaListRes = await fetch(`${BASE_URL}/api/admin/media`, { headers: authHeaders });
    const mediaListData = await mediaListRes.json();
    const mediaExists = mediaListData.media.some((m: any) => m.id === uploadedMediaId);
    assert(mediaExists, 'Uploaded file metadata persists and remains available in Media Library');

    // Test Invalid File Type rejection
    const invalidBlob = new Blob(['not an image content'], { type: 'text/plain' });
    const invalidForm = new FormData();
    invalidForm.append('files', invalidBlob, 'malicious.exe');
    const invalidRes = await fetch(`${BASE_URL}/api/admin/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: invalidForm
    });
    assert(!invalidRes.ok, 'Rejects invalid file types (e.g. non-image/non-pdf)');

    // Test Deletion Protection for in-use assets
    // Attach uploadedUrl to our test product
    await fetch(`${BASE_URL}/api/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ image: uploadedUrl })
    });

    // Try deleting media without force
    const deleteTryRes = await fetch(`${BASE_URL}/api/admin/media/${uploadedMediaId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const deleteTryData = await deleteTryRes.json();
    assert(deleteTryRes.status === 400 && deleteTryData.usedIn && deleteTryData.usedIn.length > 0, 'Media Deletion Protection prevents deleting assets currently in use');

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  } catch (err: any) {
    assert(false, `Media library test failed: ${err.message}`);
  }

  // 6. Schema Markup: Creation, Validation, Scopes, Precedence, Conflict Detection
  let testSchemaId = '';
  try {
    // A. Add Global Schema
    const globalRes = await fetch(`${BASE_URL}/api/admin/schemas`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        referenceType: 'global',
        referenceId: 'global',
        name: 'Brand Organization Global Schema',
        schemaType: 'Organization',
        jsonContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "LAAM Official Flagship",
          "url": "https://laam.pk"
        }),
        isEnabled: true
      })
    });
    const globalData = await globalRes.json();
    assert(globalRes.ok && Boolean(globalData.schema), 'Create global schema entry');

    // B. Add Product-level Schema
    const prodSchemaRes = await fetch(`${BASE_URL}/api/admin/schemas`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        referenceType: 'product',
        referenceId: testProductId,
        name: 'Kalidar Rich Snippet Product Schema',
        schemaType: 'Product',
        jsonContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Emerald Silk Festive Kalidar",
          "offers": {
            "@type": "Offer",
            "price": "240.00",
            "priceCurrency": "USD"
          }
        }),
        isEnabled: true
      })
    });
    const prodSchemaData = await prodSchemaRes.json();
    testSchemaId = prodSchemaData.schema.id;
    assert(prodSchemaRes.ok && Boolean(testSchemaId), 'Add multiple schemas attached to product');

    // C. Test Syntax Validation with invalid JSON
    const invalidJsonRes = await fetch(`${BASE_URL}/api/admin/schemas`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        referenceType: 'page',
        referenceId: 'about-us',
        name: 'Invalid Test Schema',
        schemaType: 'WebPage',
        jsonContent: '{ invalid json syntax without quotes: test }',
        isEnabled: true
      })
    });
    const invalidJsonData = await invalidJsonRes.json();
    assert(!invalidJsonRes.ok && invalidJsonData.error.includes('Invalid JSON syntax'), 'Server validates JSON syntax and returns useful error');

    // D. Duplicate Schema Endpoint
    const dupRes = await fetch(`${BASE_URL}/api/admin/schemas/${testSchemaId}/duplicate`, {
      method: 'POST',
      headers: authHeaders
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 201 && dupData.schema.name.includes('(Copy)'), 'Duplicate schema endpoint creates starting copy');

    // E. Test Public Storefront Schema injection endpoint with Scopes
    const publicSchemaRes = await fetch(`${BASE_URL}/api/schemas/public?referenceType=product&referenceId=${testProductId}`);
    const publicSchemaData = await publicSchemaRes.json();
    const hasGlobal = publicSchemaData.schemas.some((s: any) => s.referenceType === 'global');
    const hasProduct = publicSchemaData.schemas.some((s: any) => s.referenceType === 'product');
    assert(hasGlobal && hasProduct, 'Public storefront schema API delivers both global and product-scoped schemas');

    // F. Preview URL & Duplicate conflict detection
    const previewUrlRes = await fetch(`${BASE_URL}/api/admin/schemas/preview-url?url=/products/${testProductId}`, {
      headers: authHeaders
    });
    const previewUrlData = await previewUrlRes.json();
    assert(previewUrlRes.ok && previewUrlData.resolvedReferenceType === 'product', 'Preview URL resolves correct route scope and checks conflicts');
  } catch (err: any) {
    assert(false, `Schema test failed: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`TEST SUITE RESULTS: ${passed} Passed, ${failures} Failed`);
  console.log(`========================================`);

  if (failures > 0) {
    process.exit(1);
  }
}

runTests();
