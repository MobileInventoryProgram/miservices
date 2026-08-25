/**
 * Verify the Head Office member login chain works end-to-end:
 * 1. getMemberByEmail → member with franchiseeId set
 * 2. verifyPassword → password matches
 * 3. getFranchiseeForSession (simulated) → resolves via reference
 * 4. getPriceListsForFranchisee → returns shared templates (no owned lists initially)
 * 5. Shared template exists with correct data
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/verify-headoffice-login.ts
 */

// Patch module resolution for @ alias
import { createClient } from '@sanity/client';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function verifyPassword(supplied: string, stored: string): Promise<boolean> {
  const [hash, salt] = stored.split('.');
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString('hex') === hash;
}

const EMAIL = 'headoffice@mobileinventoryservices.co.uk';
const PASSWORD = 'HeadOffice2025!';
const FRANCHISEE_ID = 'afH2HH6ETPTX8FYNV3S9EO';

const franchiseeFields = `
  _id,
  companyName,
  "slug": slug.current,
  territory,
  postCodes,
  townsCities,
  tags,
  isActive,
  locationDescription,
  owners[] {
    firstName,
    lastName,
    email,
    phone,
    profilePicture {
      asset->{
        _ref,
        url
      }
    }
  }
`;

const priceListFields = `
  _id,
  title,
  isDefault,
  "ownerRef": owner._ref,
  availableToFranchisees,
  serviceRows[] {
    _key,
    serviceType,
    bedrooms,
    maxRooms,
    unfurnishedPrice,
    furnishedPrice
  },
  flatRates[] {
    _key,
    name,
    price,
    unit
  },
  additionalRoomRates {
    unfurnishedPerRoom,
    furnishedPerRoom
  },
  cancellationFee,
  terms
`;

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail?: string) {
  if (ok) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

async function verify() {
  console.log('Verifying Head Office login chain...\n');

  // Step 1: getMemberByEmail
  console.log('Step 1: Fetch member by email');
  const member = await client.fetch(
    `*[_type == "member" && email == $email && isActive == true][0] {
      _id,
      email,
      name,
      hashedPassword,
      role,
      "franchiseeId": franchisee->._id,
      territory,
      isActive
    }`,
    { email: EMAIL }
  );

  check('Member found', !!member, member ? undefined : 'member is null');
  if (!member) { process.exit(1); }

  check('Email matches', member.email === EMAIL, member.email);
  check('Role is franchisee', member.role === 'franchisee', member.role);
  check('franchiseeId is set', !!member.franchiseeId, member.franchiseeId || 'null');
  check('franchiseeId matches expected', member.franchiseeId === FRANCHISEE_ID,
    `got ${member.franchiseeId}, expected ${FRANCHISEE_ID}`);
  check('territory is set', !!member.territory, member.territory || 'null');

  // Step 2: Password verification
  console.log('\nStep 2: Verify password');
  const passwordValid = await verifyPassword(PASSWORD, member.hashedPassword);
  check('Password matches', passwordValid);

  // Step 3: Franchisee resolution via reference (simulating getFranchiseeForSession)
  console.log('\nStep 3: Resolve franchisee via reference');
  const franchisee = await client.fetch(
    `*[_type == "franchisee" && _id == $id && isActive == true][0] {
      ${franchiseeFields}
    }`,
    { id: member.franchiseeId }
  );

  check('Franchisee resolved via reference', !!franchisee, franchisee ? undefined : 'null');
  if (franchisee) {
    check('companyName is Head Office', franchisee.companyName === 'Head Office', franchisee.companyName);
    check('territory is Head Office', franchisee.territory === 'Head Office', franchisee.territory);
    check('isActive is true', franchisee.isActive === true);
    check('Has owners array', Array.isArray(franchisee.owners), typeof franchisee.owners);
  }

  // Step 4: getPriceListsForFranchisee — shared templates + owned lists
  console.log('\nStep 4: Fetch price lists for franchisee');

  const allLists = await client.fetch(
    `*[_type == "priceList" && (
      owner._ref == $franchiseeId ||
      (!defined(owner) && availableToFranchisees == true)
    )] | order(title asc) {
      _id,
      title,
      isDefault,
      "isOwned": defined(owner)
    }`,
    { franchiseeId: FRANCHISEE_ID }
  );

  check('Price lists query returns results', Array.isArray(allLists) && allLists.length > 0,
    `${allLists?.length || 0} lists`);

  const sharedTemplates = (allLists || []).filter((l: any) => !l.isOwned);
  const ownedLists = (allLists || []).filter((l: any) => l.isOwned);

  check('At least one shared template exists', sharedTemplates.length > 0,
    `${sharedTemplates.length} templates`);
  console.log(`  (${ownedLists.length} owned list(s), ${sharedTemplates.length} shared template(s))`);

  // Step 5: Verify shared template data
  console.log('\nStep 5: Verify Standard Pricing template');

  const standardTemplate = await client.fetch(
    `*[_type == "priceList" && title == "Standard Pricing" && !defined(owner) && availableToFranchisees == true][0] {
      ${priceListFields}
    }`
  );

  check('Standard Pricing template exists', !!standardTemplate);
  if (standardTemplate) {
    check('availableToFranchisees is true', standardTemplate.availableToFranchisees === true);
    check('No owner set (admin template)', !standardTemplate.ownerRef);
    check('isDefault is true', standardTemplate.isDefault === true);
    check('Has 15 service rows', Array.isArray(standardTemplate.serviceRows) && standardTemplate.serviceRows.length === 15,
      `${standardTemplate.serviceRows?.length || 0} rows`);

    // Spot check: inventory studio_1 should be 69/81
    const invStudio = (standardTemplate.serviceRows || []).find(
      (r: any) => r.serviceType === 'inventory' && r.bedrooms === 'studio_1'
    );
    check('Inventory Studio/1Bed unfurnished = £69', invStudio?.unfurnishedPrice === 69,
      `£${invStudio?.unfurnishedPrice}`);
    check('Inventory Studio/1Bed furnished = £81', invStudio?.furnishedPrice === 81,
      `£${invStudio?.furnishedPrice}`);

    // Spot check: checkout 5bed should be 105/118
    const co5 = (standardTemplate.serviceRows || []).find(
      (r: any) => r.serviceType === 'checkout' && r.bedrooms === '5'
    );
    check('Checkout 5Bed unfurnished = £105', co5?.unfurnishedPrice === 105,
      `£${co5?.unfurnishedPrice}`);
    check('Checkout 5Bed furnished = £118', co5?.furnishedPrice === 118,
      `£${co5?.furnishedPrice}`);

    check('Flat rates present', Array.isArray(standardTemplate.flatRates) && standardTemplate.flatRates.length > 0,
      `${standardTemplate.flatRates?.length || 0} rates`);
    check('Additional room rates present', !!standardTemplate.additionalRoomRates,
      standardTemplate.additionalRoomRates ? `unfurn £${standardTemplate.additionalRoomRates.unfurnishedPerRoom}, furn £${standardTemplate.additionalRoomRates.furnishedPerRoom}` : 'missing');
    check('Cancellation fee = £45', standardTemplate.cancellationFee === 45, `£${standardTemplate.cancellationFee}`);
  }

  // Step 6: Simulate what /members/pricing page.tsx does
  console.log('\nStep 6: Simulate pricing page server component');
  const simulatedSession = {
    user: {
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role as 'franchisee',
      franchiseeId: member.franchiseeId,
      territory: member.territory,
    }
  };

  const hasFranchiseeId = !!simulatedSession.user.franchiseeId;
  const hasTerritory = !!simulatedSession.user.territory;
  check('Session has franchiseeId OR territory', hasFranchiseeId || hasTerritory);
  check('Would NOT redirect (gate passes)', hasFranchiseeId || hasTerritory);
  check('getFranchiseeForSession would resolve (franchisee found above)', !!franchisee);
  check('Would NOT show "Profile Not Found"', !!franchisee);
  check('getPriceListsForFranchisee returns results', allLists.length > 0);
  check('PricingListing would receive valid props', !!(allLists && franchisee));

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('\nSome checks failed — review the output above.');
    process.exit(1);
  } else {
    console.log('\nAll checks passed. Head Office login chain is fully functional.');
  }
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
