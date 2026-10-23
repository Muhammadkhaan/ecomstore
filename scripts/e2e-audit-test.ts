import { PRODUCTS } from '../src/data/products.ts';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, test: string, details?: string) {
  if (!condition) {
    results.push({ suite, test, passed: false, details });
    console.error(`❌ [${suite}] ${test} FAILED: ${details || ''}`);
  } else {
    results.push({ suite, test, passed: true });
    console.log(`✅ [${suite}] ${test}`);
  }
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END AUDIT TEST SUITE');
  console.log('====================================================\n');

  // --- 1. AUTHENTICATION & ACCESS CONTROL AUDIT ---
  console.log('--- 1. Testing Admin Authentication & Route Protection ---');
  
  // 1.1 Unauthenticated requests to protected endpoints
  const unauthRes = await fetch(`${BASE_URL}/api/admin/storefront/pages`);
  assert(unauthRes.status === 401, 'Auth', 'Rejects unauthenticated requests with 401', `Status: ${unauthRes.status}`);

  // 1.2 Invalid password
  const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@laam.com', password: 'wrongpassword' })
  });
  assert(badLoginRes.status === 401, 'Auth', 'Rejects bad password with 401', `Status: ${badLoginRes.status}`);

  // 1.3 Valid login
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@laam.com', password: 'admin123' })
  });
  assert(loginRes.status === 200, 'Auth', 'Successful login with valid credentials', `Status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(Boolean(token), 'Auth', 'Login returns valid JWT token');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 1.4 Verify /api/admin/me
  const meRes = await fetch(`${BASE_URL}/api/admin/me`, { headers: authHeaders });
  assert(meRes.status === 200, 'Auth', 'GET /api/admin/me returns current admin user');

  // --- 2. PAGE BUILDER & STOREFRONT RENDERING WORKFLOW AUDIT ---
  console.log('\n--- 2. Testing Page Builder, Publishing, and Storefront Lifecycle ---');

  const testSlug = `audit-test-page-${Date.now()}`;
  let createdPageId = '';

  // 2.1 Create new Page Builder page
  const createPageRes = await fetch(`${BASE_URL}/api/admin/storefront/pages`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Audit Luxury Showcase',
      handle: testSlug,
      type: 'page',
      seoTitle: 'Audit Luxury Showcase | LAAM Official',
      seoDescription: 'Exclusive artisan couture previewed for end-to-end testing.'
    })
  });
  assert(createPageRes.status === 201, 'Page Builder', 'Create new page returns 201 Created', `Status: ${createPageRes.status}`);
  const createdPageData = await createPageRes.json();
  createdPageId = createdPageData.page.id;
  assert(createdPageData.page.status === 'Draft', 'Page Builder', 'Newly created page defaults to Draft status');
  assert(createdPageData.page.version === 1, 'Page Builder', 'Newly created page starts at version 1');

  // 2.2 Public Storefront Access on Draft Page (Must be 404 for public visitors)
  const publicDraftRes = await fetch(`${BASE_URL}/api/admin/store/pages/${testSlug}`);
  assert(publicDraftRes.status === 404, 'Page Publishing', 'Public visitor gets 404 for unpublished Draft page', `Status: ${publicDraftRes.status}`);

  // 2.3 Admin Preview on Draft Page (Must be 200 with isPreview: true)
  const adminDraftPreviewRes = await fetch(`${BASE_URL}/api/admin/store/pages/${testSlug}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(adminDraftPreviewRes.status === 200, 'Page Publishing', 'Admin gets 200 for Draft preview', `Status: ${adminDraftPreviewRes.status}`);
  const adminDraftPreviewData = await adminDraftPreviewRes.json();
  assert(adminDraftPreviewData.isPreview === true, 'Page Publishing', 'Draft preview returns isPreview === true');
  assert(adminDraftPreviewData.isPublished === false, 'Page Publishing', 'Draft preview returns isPublished === false');

  // 2.4 Add sections and save draft update
  const sectionsPayload = [
    {
      id: 'sec-hero-1',
      type: 'hero',
      settings: {
        heading: 'Heritage Couture 2026',
        subheading: 'Handcrafted zardozi and pure organza',
        buttonText: 'Shop New Arrivals',
        buttonLink: '/collections/pret'
      }
    },
    {
      id: 'sec-prod-1',
      type: 'product_grid',
      settings: {
        heading: 'Handpicked Luxury Edit',
        limit: 4,
        columnCount: 4
      }
    },
    {
      id: 'sec-faq-1',
      type: 'faq',
      settings: {
        heading: 'Bespoke Inquiries',
        items: [
          { q: 'How long does custom tailoring take?', a: 'Standard custom bridal takes 4-6 weeks with DHL express.' }
        ]
      }
    }
  ];

  const updateDraftRes = await fetch(`${BASE_URL}/api/admin/storefront/pages/${createdPageId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'draft',
      expectedVersion: 1,
      builderContent: {
        schemaVersion: 1,
        sections: sectionsPayload,
        globalStyles: { maxWidth: '1280px', paddingY: '48px', backgroundColor: '#FAF9F6' }
      }
    })
  });
  assert(updateDraftRes.status === 200, 'Page Builder', 'Saving draft updates version to 2', `Status: ${updateDraftRes.status}`);
  const draftV2Data = await updateDraftRes.json();
  assert(draftV2Data.page.version === 2, 'Page Builder', 'Page version incremented to 2');
  assert(draftV2Data.page.status === 'Draft', 'Page Builder', 'Status remains Draft');

  // 2.5 Optimistic Version Locking Check (conflicting expectedVersion)
  const conflictRes = await fetch(`${BASE_URL}/api/admin/storefront/pages/${createdPageId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'draft',
      expectedVersion: 1, // Already v2!
      builderContent: { schemaVersion: 1, sections: [] }
    })
  });
  assert(conflictRes.status === 409, 'Page Builder', 'Rejects concurrent edit with 409 Version Conflict', `Status: ${conflictRes.status}`);

  // 2.6 Publish the Page
  const publishRes = await fetch(`${BASE_URL}/api/admin/storefront/pages/${createdPageId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'publish',
      expectedVersion: 2,
      builderContent: {
        schemaVersion: 1,
        sections: sectionsPayload,
        globalStyles: { maxWidth: '1280px', paddingY: '48px', backgroundColor: '#FAF9F6' }
      }
    })
  });
  assert(publishRes.status === 200, 'Page Publishing', 'Publish page returns 200 OK', `Status: ${publishRes.status}`);
  const publishedData = await publishRes.json();
  assert(publishedData.page.status === 'Published', 'Page Publishing', 'Page status is now Published');
  assert(publishedData.page.version === 3, 'Page Publishing', 'Page version incremented to 3');

  // 2.7 Public Storefront Access (Must now be 200 with published content)
  const publicLiveRes = await fetch(`${BASE_URL}/api/admin/store/pages/${testSlug}`);
  assert(publicLiveRes.status === 200, 'Page Storefront', 'Public visitor can now load live published page', `Status: ${publicLiveRes.status}`);
  const publicLiveData = await publicLiveRes.json();
  assert(publicLiveData.isPublished === true, 'Page Storefront', 'Response indicates isPublished === true');
  assert(publicLiveData.isPreview === false, 'Page Storefront', 'Response indicates isPreview === false');
  assert(publicLiveData.page.builderContent.sections.length === 3, 'Page Storefront', 'All 3 published sections returned to public');

  // 2.8 Make a DRAFT modification on published page (Requirement 13)
  const draftModifiedSections = [
    ...sectionsPayload,
    {
      id: 'sec-newsletter-1',
      type: 'newsletter',
      settings: {
        heading: 'Draft Exclusive VIP List'
      }
    }
  ];

  const draftOnPublishedRes = await fetch(`${BASE_URL}/api/admin/storefront/pages/${createdPageId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'draft',
      expectedVersion: 3,
      builderContent: {
        schemaVersion: 1,
        sections: draftModifiedSections
      }
    })
  });
  assert(draftOnPublishedRes.status === 200, 'Page Publishing', 'Draft saved on published page returns 200', `Status: ${draftOnPublishedRes.status}`);
  const draftOnPublishedData = await draftOnPublishedRes.json();
  assert(draftOnPublishedData.page.status === 'Published', 'Page Publishing', 'Status stays Published for live site');
  assert(draftOnPublishedData.page.version === 4, 'Page Publishing', 'Version incremented to 4');

  // 2.9 Verify Public Storefront STILL shows 3 sections (NOT the 4th draft section!)
  const publicStorefrontStillOld = await fetch(`${BASE_URL}/api/admin/store/pages/${testSlug}`);
  const publicStillOldData = await publicStorefrontStillOld.json();
  assert(
    publicStillOldData.page.builderContent.sections.length === 3,
    'Page Storefront',
    'Public storefront isolates draft: still displays 3 published sections',
    `Sections count: ${publicStillOldData.page.builderContent.sections.length}`
  );

  // 2.10 Verify Admin Preview WITH ?preview=true shows the new 4th draft section!
  const adminPreviewDraftRes = await fetch(`${BASE_URL}/api/admin/store/pages/${testSlug}?preview=true`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const adminPreviewDraftData = await adminPreviewDraftRes.json();
  assert(adminPreviewDraftData.isPreview === true, 'Page Preview', 'Admin preview returns isPreview === true');
  assert(
    adminPreviewDraftData.page.builderContent.sections.length === 4,
    'Page Preview',
    'Admin preview delivers latest draft with 4 sections',
    `Sections count: ${adminPreviewDraftData.page.builderContent.sections.length}`
  );
  assert(adminPreviewDraftData.hasDraftChanges === true, 'Page Preview', 'Flag hasDraftChanges is true');

  // 2.11 Unpublish Page (Revert to Draft)
  const unpublishRes = await fetch(`${BASE_URL}/api/admin/storefront/pages/${createdPageId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'unpublish',
      expectedVersion: 4
    })
  });
  assert(unpublishRes.status === 200, 'Page Publishing', 'Unpublish page returns 200 OK');
  const unpublishedData = await unpublishRes.json();
  assert(unpublishedData.page.status === 'Draft', 'Page Publishing', 'Page status reverted to Draft');

  // 2.12 Verify Public Storefront immediately returns 404 again
  const publicAfterUnpublish = await fetch(`${BASE_URL}/api/admin/store/pages/${testSlug}`);
  assert(publicAfterUnpublish.status === 404, 'Page Publishing', 'Public visitor gets 404 after page is unpublished');

  // 2.13 Delete Page
  const deletePageRes = await fetch(`${BASE_URL}/api/admin/storefront/pages/${createdPageId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert(deletePageRes.status === 200, 'Page Builder', 'DELETE page returns 200 OK');

  // --- 3. PRODUCTS CRUD & INVENTORY AUDIT ---
  console.log('\n--- 3. Testing Products CRUD & Inventory ---');

  const prodRes = await fetch(`${BASE_URL}/api/admin/products`, { headers: authHeaders });
  assert(prodRes.status === 200, 'Products', 'List products returns 200 OK');
  const prodData = await prodRes.json();
  assert(Array.isArray(prodData.products) && prodData.products.length > 0, 'Products', 'Products array populated');

  // Create Product
  const newProdRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Audited Silk Organza Kaftan',
      designer: 'Farah Talib Aziz',
      category: 'pret',
      occasion: 'Festive Eid',
      fabric: 'Pure Silk Organza',
      priceUSD: 285,
      originalPriceUSD: 350,
      image: PRODUCTS[0].image,
      secondaryImage: PRODUCTS[1].image,
      inStock: true,
      readyToShip: true,
      dispatchDays: 2,
      colors: ['Sage Green', 'Dusty Rose'],
      sizes: ['S', 'M', 'L'],
      description: 'Hand-embellished silk organza with gota and cutdana detail.',
      inventory: 15
    })
  });
  const newProdText = await newProdRes.text();
  let newProdData: any = {};
  try { newProdData = JSON.parse(newProdText); } catch {}
  assert(newProdRes.status === 201, 'Products', 'Create product returns 201 Created', `Status: ${newProdRes.status}, Body: ${newProdText}`);
  const createdProdId = newProdData.product?.id;

  // Read created product
  const getProdRes = await fetch(`${BASE_URL}/api/admin/products/${createdProdId}`, { headers: authHeaders });
  assert(getProdRes.status === 200, 'Products', 'Fetch created product by ID returns 200 OK');

  // Update product inventory
  const updateProdRes = await fetch(`${BASE_URL}/api/admin/products/${createdProdId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      ...newProdData.product,
      inventory: 25,
      priceUSD: 295
    })
  });
  assert(updateProdRes.status === 200, 'Products', 'Update product returns 200 OK');

  // Delete product
  const delProdRes = await fetch(`${BASE_URL}/api/admin/products/${createdProdId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert(delProdRes.status === 200, 'Products', 'Delete product returns 200 OK');

  // --- 4. COLLECTIONS AUDIT ---
  console.log('\n--- 4. Testing Collections & Product Associations ---');

  const getCollsRes = await fetch(`${BASE_URL}/api/admin/collections`, { headers: authHeaders });
  assert(getCollsRes.status === 200, 'Collections', 'List collections returns 200 OK');

  const createCollRes = await fetch(`${BASE_URL}/api/admin/collections`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Audit Spring Pret 2026',
      handle: `audit-spring-pret-${Date.now()}`,
      description: 'Lightweight breathable lawn and raw silk luxury pret.',
      type: 'manual',
      productIds: [PRODUCTS[0].id, PRODUCTS[1].id]
    })
  });
  assert(createCollRes.status === 201, 'Collections', 'Create collection returns 201 Created');
  const createCollData = await createCollRes.json();
  const createdCollId = createCollData.collection.id;

  // Delete collection
  const delCollRes = await fetch(`${BASE_URL}/api/admin/collections/${createdCollId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert(delCollRes.status === 200, 'Collections', 'Delete collection returns 200 OK');

  // --- 5. MEDIA LIBRARY AUDIT ---
  console.log('\n--- 5. Testing Media Library ---');

  const mediaListRes = await fetch(`${BASE_URL}/api/admin/media?type=image&sort=newest`, { headers: authHeaders });
  assert(mediaListRes.status === 200, 'Media Library', 'List media returns 200 OK');
  const mediaData = await mediaListRes.json();
  assert(Array.isArray(mediaData.media) && mediaData.media.length > 0, 'Media Library', 'Media array returned');

  // Test Delete Protection: media-1 is used by PRODUCTS[0]
  const protectedMediaRes = await fetch(`${BASE_URL}/api/admin/media/media-1`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert(protectedMediaRes.status === 400, 'Media Library', 'Blocks deletion of media currently in use across storefront content', `Status: ${protectedMediaRes.status}`);
  const protectedData = await protectedMediaRes.json();
  assert(Array.isArray(protectedData.usedIn) && protectedData.usedIn.length > 0, 'Media Library', 'Returns usedIn references detailing where file is used');

  // --- 6. SEO & SCHEMA MARKUP AUDIT ---
  console.log('\n--- 6. Testing SEO & Schema Markup ---');

  // 6.1 Reject invalid JSON syntax
  const badJsonRes = await fetch(`${BASE_URL}/api/admin/schemas`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      referenceType: 'global',
      referenceId: 'global',
      name: 'Bad Schema',
      schemaType: 'Organization',
      jsonContent: '{ invalid json syntax here'
    })
  });
  assert(badJsonRes.status === 400, 'Schema Markup', 'Rejects schema with invalid JSON syntax with 400 Bad Request');

  const schemaPayload = {
    referenceType: 'global',
    referenceId: 'global',
    name: 'Audit Storefront Organization Schema',
    schemaType: 'Organization',
    jsonContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LAAM Luxury Fashion',
      url: 'https://laam.com'
    }),
    isEnabled: true
  };

  const createSchemaRes = await fetch(`${BASE_URL}/api/admin/schemas`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(schemaPayload)
  });
  assert(createSchemaRes.status === 200, 'Schema Markup', 'Create schema markup returns 200 OK');
  const createSchemaData = await createSchemaRes.json();
  const schemaId = createSchemaData.schema.id;

  // Toggle schema
  const toggleSchemaRes = await fetch(`${BASE_URL}/api/admin/schemas/${schemaId}/toggle`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ isEnabled: false })
  });
  assert(toggleSchemaRes.status === 200, 'Schema Markup', 'Toggle schema disabled returns 200 OK');

  // Toggle back to enabled
  await fetch(`${BASE_URL}/api/admin/schemas/${schemaId}/toggle`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ isEnabled: true })
  });

  // Verify public schemas endpoint returns it
  const publicSchemasRes = await fetch(`${BASE_URL}/api/schemas/public?referenceType=global&referenceId=global`);
  assert(publicSchemasRes.status === 200, 'Schema Markup', 'Public /api/schemas/public returns 200 OK');
  const publicSchemasData = await publicSchemasRes.json();
  const foundSchema = publicSchemasData.schemas.find((s: any) => s.id === schemaId);
  assert(Boolean(foundSchema), 'Schema Markup', 'Newly created enabled schema is returned on public endpoint');

  // Cleanup schema
  const delSchemaRes = await fetch(`${BASE_URL}/api/admin/schemas/${schemaId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert(delSchemaRes.status === 200, 'Schema Markup', 'Delete schema returns 200 OK');

  // --- 7. TECHNICAL SEO & STOREFRONT HEALTH AUDIT ---
  console.log('\n--- 7. Testing Technical SEO & Storefront Health ---');

  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert(healthRes.status === 200, 'Technical SEO', 'GET /api/health returns 200 OK');

  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  assert(sitemapRes.status === 200, 'Technical SEO', 'GET /sitemap.xml returns 200 OK');
  const sitemapText = await sitemapRes.text();
  assert(sitemapText.includes('urlset') && sitemapText.includes('https://laam.com/'), 'Technical SEO', 'Sitemap contains valid XML urlset');

  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  assert(robotsRes.status === 200, 'Technical SEO', 'GET /robots.txt returns 200 OK');
  const robotsText = await robotsRes.text();
  assert(robotsText.includes('Disallow: /admin') && robotsText.includes('Sitemap:'), 'Technical SEO', 'Robots.txt protects admin and references sitemap');

  // Summary
  console.log('\n====================================================');
  const failed = results.filter((r) => !r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`);
  console.log('====================================================');

  if (failed.length > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
