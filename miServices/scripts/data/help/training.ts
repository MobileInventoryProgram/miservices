import type { SeedHelpArticle } from './types';

/**
 * Starter Help Centre answers drawn from the training and operating-procedure
 * documents: AIP Training Guide, QuickBooks Guide, Ordering Uniforms and
 * OpenRent Procedures. Every answer only restates what the source says.
 */
export const TRAINING_ARTICLES: SeedHelpArticle[] = [
  // ---------------------------------------------------------------------------
  // AIP Training Guide: background
  // ---------------------------------------------------------------------------
  {
    id: 'trn-what-is-an-inventory',
    topic: 'inspections',
    question: 'What is an inventory and what should it record?',
    answer: [
      'An inventory is an important document forming part of the lettings process. It:',
      '- Records all items within a property\n- Details the condition of the property and the items within it\n- Reports on all defects and issues\n- Records meter readings\n- Uses supporting photographs',
      'A good inventory reduces disputes between landlords and tenants and should always be prepared at the beginning of every tenancy by a trained professional.',
      'Strictly, an ‘Inventory’ is a catalogue of the property and its contents and a ‘Schedule of Condition’ is a record of the condition of those contents. Most commonly the two are combined into one report, which the AIP guide simply calls the ‘Inventory’.',
    ],
    keywords: ['schedule of condition', 'inventory report', 'what goes in', 'purpose'],
    sources: [
      { doc: 'aip-training-guide', heading: 'What is an Inventory?' },
      { doc: 'aip-training-guide', heading: 'Inventory and Schedule of Condition' },
    ],
  },
  {
    id: 'trn-why-inventory-matters',
    topic: 'inspections',
    question: 'Why does a full inventory at the start of a tenancy matter so much?',
    answer: [
      'Without a record of condition at the start of the tenancy, the landlord has no evidence if there is a dispute over the deposit. In the guide’s example, a landlord with no inventory could not win a claim for a filthy oven, an overgrown garden, a hole in a door and a stained carpet, and the deposit was returned in full to the tenant.',
      'The guide’s key rule: **anything not described in an original inventory cannot be referenced at the check-out, as there is no evidence to uphold a claim.**',
    ],
    keywords: ['deposit dispute', 'evidence', 'landlord claim', 'adjudicator'],
    sources: [{ doc: 'aip-training-guide', heading: 'Why do we create and Inventory' }],
  },
  {
    id: 'trn-are-inventories-compulsory',
    topic: 'inspections',
    question: 'Are inventories compulsory, and who has to prove a deposit claim?',
    answer: [
      'Inventories are not compulsory, but in practice they are essential. In a dispute over the return of a deposit, the burden of proof lies with the landlord, and the evidence must be submitted promptly.',
      'Each tenancy deposit scheme is supported by an Alternative Dispute Resolution (ADR) service. Its adjudicator needs good quality evidence, and a well prepared inventory that has been checked at the start and end of a tenancy is a key part of the process.',
    ],
    keywords: ['burden of proof', 'ADR', 'deposit scheme', 'adjudication', 'legal requirement'],
    sources: [{ doc: 'aip-training-guide', heading: 'Alternate Dispute Resolution' }],
  },
  {
    id: 'trn-aip-membership',
    topic: 'inspections',
    question: 'How do I become a full member of the AIP?',
    answer: [
      'To complete the AIP ‘How to create an Inventory’ course and become a full Member of the Association of Inventory Professionals, you need to pass a multiple choice examination (pass mark 90%), followed by a peer reviewed inventory created by you.',
      'You will then receive a copy of your AIP certificate along with an AIP logo, which can be added to your emails, website, business cards and documents.',
    ],
    keywords: ['Association of Inventory Professionals', 'exam', 'qualification', 'certificate', 'pass mark', 'training course'],
    sources: [{ doc: 'aip-training-guide', heading: 'Introduction' }],
  },
  {
    id: 'trn-fair-wear-and-tear',
    topic: 'inspections',
    question: 'What is fair wear and tear, and do I have to decide it?',
    answer: [
      'Fair wear and tear is the change in a property’s condition caused by reasonable use by the tenant and the ordinary operation of natural forces (the passage of time). It is distinct from careless damage or cleaning issues caused by the tenant. Judging it depends on things like length of tenancy, number/ages of tenants, whether smokers/pets were allowed, the condition/age of items at the start, usual lifespan of items, and work/repairs carried out during the tenancy.',
      'As a clerk you are not obliged to judge whether changes are due to fair wear and tear, or what share of a repair or replacement should come from the deposit (this is called ‘apportionment’). The letting agent makes those decisions. Your role is to record the information impartially and factually, although you should understand the concept. The guide does say to add in notes on fair wear and tear.',
      '**Betterment:** repairs and replacements are assumed to be like for like. For example, if a tenant burns a carpet that was already worn, the landlord cannot use the deposit to pay for the whole cost of a new carpet.',
    ],
    keywords: ['apportionment', 'betterment', 'deductions', 'damage vs wear', 'like for like'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Fair Wear and Tear' },
      { doc: 'aip-training-guide', heading: 'Apportionment' },
      { doc: 'aip-training-guide', heading: 'Betterment' },
    ],
  },

  // ---------------------------------------------------------------------------
  // AIP Training Guide: the report itself
  // ---------------------------------------------------------------------------
  {
    id: 'trn-front-page-and-footer',
    topic: 'inspections',
    question: 'What should go on the front page and the foot of each page of an inventory?',
    answer: [
      'The front page should have:',
      '- The title of the document\n- Full property address and details\n- Name of the clerk and/or the company who carried out the visit\n- Letting agency details\n- Photographs of the exterior of the property for reference',
      'The foot of each page should show the property address, the date of the inventory and the page number. It is best practice for the tenant to read and sign/initial each page to agree its content, to avoid any dispute later.',
    ],
    keywords: ['cover page', 'report layout', 'footer', 'logo', 'initial each page'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Front Page' },
      { doc: 'aip-training-guide', heading: 'Foot of the Page' },
    ],
  },
  {
    id: 'trn-disclaimer',
    topic: 'inspections',
    question: 'What should the inventory disclaimer include?',
    answer: [
      'The disclaimer makes clear what the inventory can and cannot be used for, and protects the clerk. It should include:',
      '- A statement that the inventory is created in a fair, objective and impartial way\n- The benefits of the report, advising the tenant to check it carefully for accuracy\n- How long the tenant has to check, sign and return it (standard practice is 7 days to note any discrepancies)\n- That the report is independent and can be used by the landlord, tenant and agent\n- That the clerk does not test any appliances, including bathroom fittings\n- What the inventory does and does not include\n- A statement regarding fire safety\n- Definitions for the commonly used conditions and cleaning statements',
      'The inventory does cover condition statements, highlighting defects, a visual inspection of the property and contents, and cosmetic appearance. It does not cover PAT/electrical safety tests, gas safety tests, the structural soundness of the property, or moving carpets, floor coverings or large items.',
    ],
    keywords: ['terms of business', 'what is not covered', 'exclusions', 'small print', 'limitations'],
    sources: [{ doc: 'aip-training-guide', heading: 'Disclaimer' }],
  },
  {
    id: 'trn-condition-definitions',
    topic: 'inspections',
    question: 'What condition terms should I use to describe items?',
    answer: [
      'The inventory should include a summary of the condition terms so there is no confusion. The AIP guide recommends:',
      '- **Brand new** – possibly still in wrapper or with new tags/labels attached\n- **As new** – in perfect condition, but no obvious signs of being brand new and you have not been told by the letting agent that it is brand new\n- **Good** – signs of slight wear/usage, generally lightly worn rather than marked/scuffed\n- **Fair** – signs of age, frayed, small light stains and marks, discolouration\n- **Aged** – extensive signs of wear and tear, extensive stains/marks/tears/chips/damage; still functional\n- **Poor** – extensively damaged/faulty items, large stains, upholstery torn and/or dirty, pet odours/hairs',
      'Other conditions can be used, but these are the most common and useful. If you state a condition as poor, add your reasons in the comments and back them up with photographs.',
    ],
    keywords: ['describe condition', 'good fair poor', 'grading', 'wording', 'condition scale'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Conditions' },
      { doc: 'aip-training-guide', heading: 'Photographs', occurrence: 2 },
    ],
  },
  {
    id: 'trn-photographs',
    topic: 'inspections',
    question: 'What should I photograph, and where should photos go in the report?',
    answer: [
      'Any comments or notes you make need to be backed up with photographs. For example, if a carpet is in poor condition due to rips and an iron burn, include images of the rips and the burn.',
      'Place each photograph next to the item it relates to (e.g. a window’s photo immediately below its written detail). Avoid mixing photographs together at the end of the document, as this makes them less useful and harder to identify.',
      'Make sure your photos have:',
      '- **Information** – the supporting evidence for your comment\n- **Clarity** – decent lighting (use a torch or flash if needed); check they are not blurred before moving on\n- **Context** – placed in the relevant position in the inventory',
    ],
    keywords: ['pictures', 'images', 'evidence', 'camera', 'embed photos'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Photographs', occurrence: 1 },
      { doc: 'aip-training-guide', heading: 'Photographs', occurrence: 2 },
    ],
  },
  {
    id: 'trn-room-order',
    topic: 'inspections',
    question: 'What order should I go through the rooms in?',
    answer: [
      'Be systematic and use an order that fits each property during a walkthrough. For a terrace house the order would usually be: Exterior; Property details (smoke and CO alarms, keys, meter readings and so on); Hallway; Living Room; Dining Room; Kitchen; Stairs and Landing; Bathroom; Bedrooms 1, 2, 3.',
      'An open plan kitchen/living room can be done as one room, and stairs and landing can be set out as one room. A consistent order makes the job easier, means you are less likely to miss anything, gives every inventory a familiar layout, and makes the check-out easier to follow.',
    ],
    keywords: ['layout', 'sequence', 'walkthrough', 'room order', 'systematic'],
    sources: [{ doc: 'aip-training-guide', heading: 'Be systematic' }],
  },
  {
    id: 'trn-overview-comments',
    topic: 'inspections',
    question: 'How should I start each room?',
    answer: [
      'It is best practice to start each room with overview comments and images. Take three to four pictures at the start of each room to show the general layout and identify which room it is.',
      'Overview comments can include things like ‘Room has had carpets professionally cleaned’, damp issues and smells, or that the room has been recently redecorated. They are not always necessary if there is nothing to highlight. If something applies to the whole property (e.g. professionally cleaned throughout or completely repainted), you can say it once rather than in every room.',
    ],
    keywords: ['room overview', 'general comments', 'first photos', 'room layout'],
    sources: [{ doc: 'aip-training-guide', heading: 'Overview comments and images' }],
  },
  {
    id: 'trn-doors-and-windows',
    topic: 'inspections',
    question: 'What do I need to record for doors and windows?',
    answer: [
      '**Doors:** each door belongs to the room it opens into, so only add doors that belong to that room. Describe the door (colour and type), frame, handles and locks. External doors may also have a letterbox, chain, peephole and so on. Check security features are working and note (with images) if not, and check sealant on external doors for damp or mould.',
      '**Windows:** describe the type of glazing (note any blown panels showing condensation), frame and sill type and colour, openers, handles and lock, and any keys. Check sealant around frames and sills for damp/mould. Also record curtains (check front and back for damp/mould), poles, rails, tiebacks and blinds.',
      '**Do not check whether windows open/close properly** – if one can’t be closed again you will have to stay until the property is made secure. This should be stated in your disclaimer.',
    ],
    keywords: ['glazing', 'locks', 'curtains', 'blinds', 'window test', 'sealant'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Doors' },
      { doc: 'aip-training-guide', heading: 'Windows' },
    ],
  },
  {
    id: 'trn-walls-ceilings-floors',
    topic: 'inspections',
    question: 'What should I look for on walls, ceilings and floors?',
    answer: [
      '**Walls:** give a general description of finish and colour (e.g. painted plaster, white), feature walls, exposed brick, dado/picture rails and panelling. Count screws, nails, picture hooks and holes – many tenancy contracts require holes to be fixed and a tenant could be charged if they weren’t previously noted. Note small marks and scuffs and any fresh paint. Photograph each wall and zoom in on significant defects.',
      '**Ceilings:** list the ceiling type (e.g. plaster, artex, exposed beams), defects such as cracks, signs of damp, lighting and shades, whether bulbs work, and fittings like fans, coving and ceiling roses.',
      '**Flooring:** note type and colour, and look for discolouration, marks, stains, burns, fraying and rips. Gently pull a carpet corner to check it is fitted properly, as a loose carpet could be a tripping hazard. Check tiles for cracks (note how many) and wooden or laminate floors for splits, swelling, cuts and tears.',
    ],
    keywords: ['picture hooks', 'nail holes', 'carpet', 'damp', 'scuffs', 'decoration'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Walls' },
      { doc: 'aip-training-guide', heading: 'Windows' },
      { doc: 'aip-training-guide', heading: 'Flooring' },
    ],
  },
  {
    id: 'trn-fixtures-and-furnishings',
    topic: 'inspections',
    question: 'How do I record fixtures, fittings and furniture?',
    answer: [
      '**Fixtures and fittings** are anything fixed to the walls, floor or ceiling – sockets, switches, radiators, thermostats, intercoms, shelving and so on. State their existence, condition and quantity. You are not expected to test them, but note obvious issues and, as part of your duty of care, tell the agent where something appears dangerous (e.g. exposed wiring or loose banisters).',
      '**Furnishings:** record every piece of furniture in each room, as anything that goes missing needs to be accounted for. Photograph everything you list, especially worn or damaged items.',
      '**Cupboards:** record the cupboard door in the ‘Doors’ section and describe the interior in a separate cupboards section. Where a cupboard is full of junk, simply state ‘numerous miscellaneous items’ or similar and take an overview photograph.',
    ],
    keywords: ['radiators', 'sockets', 'furniture', 'cupboard contents', 'fittings'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Fixtures and Fittings' },
      { doc: 'aip-training-guide', heading: 'Furnishings' },
      { doc: 'aip-training-guide', heading: 'Cupboards' },
    ],
  },
  {
    id: 'trn-kitchen-items',
    topic: 'inspections',
    question: 'Do I need to count every piece of cutlery and crockery in a furnished kitchen?',
    answer: [
      'Best practice in theory is to itemise each piece individually, but in practice you may need to be pragmatic. When you are told the property is furnished with kitchen items, ask the agent whether they or the landlord need the items individually itemised or whether more general comments will do.',
      'If general comments are fine, you can list items such as ‘Assorted cutlery’, ‘Assorted crockery’, ‘Assorted utensils’ and ‘Assorted glassware’, adding more specific or expensive items if you feel necessary (e.g. coffee pots, knife block, chopping boards).',
      'Always check drawers and cupboards regardless, just in case.',
    ],
    keywords: ['crockery', 'glassware', 'utensils', 'itemise', 'furnished kitchen', 'assorted'],
    sources: [{ doc: 'aip-training-guide', heading: 'Kitchen Furnishings' }],
  },
  {
    id: 'trn-kitchen-appliances',
    topic: 'inspections',
    question: 'Do I have to test kitchen appliances, and what should I check?',
    answer: [
      'It is not your responsibility to test appliances to see if they work. Record each white good/appliance with its brand, colour and condition, and take multiple images, especially of any problem areas. What to look for:',
      '- **Cooker hood** – filters clean; you can check the light works\n- **Dishwasher** – drawers roll out, clean inside, no unpleasant smells\n- **Fridge/freezer** – best done last; check drawers and shelves for damage, no food inside, note if the freezer needs defrosting\n- **Hob** – burnt grease/food deposits, missing knobs or rubbed-off writing\n- **Microwave** – always open it and check it has been fully cleaned, especially the top\n- **Oven** – door and inside cleaned thoroughly; note any cleaning residue, or if not cleaned at all, as tenants can be charged for oven cleaning\n- **Tumble drier** – lint and water trays empty\n- **Washing machine** – soap tray and door seal for residue or mould',
      'Count worktops, base units, wall units and drawers, and open each to check they work and are clean and empty (unless furnished).',
    ],
    keywords: ['white goods', 'oven', 'fridge', 'washing machine', 'dishwasher', 'cleanliness'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Kitchen Appliances' },
      { doc: 'aip-training-guide', heading: 'Kitchens' },
    ],
  },
  {
    id: 'trn-bathrooms',
    topic: 'inspections',
    question: 'What should I check in bathrooms?',
    answer: [
      'Check all surfaces and sanitary ware for cleanliness, and note any limescale, mould/damp and discolouration to grouting. List the fixtures with photographs as evidence of condition and cleanliness – for example baths, shower units (note the shower type), shower screens and curtains, basin, toilet, toilet roll holders, shelving, mirrors, extractor fans, light and shower isolator cords/switches, cabinets, cupboards, boilers and water tanks.',
      'Check inside cupboards and drawers for cleanliness and any items to add (e.g. towels, candles). Cleaning supplies and toiletries do not need to be added to the inventory.',
    ],
    keywords: ['shower', 'toilet', 'limescale', 'mould', 'grouting', 'toiletries'],
    sources: [{ doc: 'aip-training-guide', heading: 'Bathrooms' }],
  },
  {
    id: 'trn-exterior-and-garden',
    topic: 'inspections',
    question: 'What should I record outside the property, including gardens and garages?',
    answer: [
      'Record external features (e.g. satellite dishes, alarm boxes, security lighting, potted plants, garden ornaments, sheds, storage boxes, hoses and taps), the condition and type of surfaces (lawns, driveways, pathways) and boundaries (fencing, hedges, gates).',
      'Garages can be recorded like a normal room but with less detail – doors, windows, appliances, electrical fixtures and a general statement of contents – with plenty of photographs. Balconies usually have railings and lighting, which should be recorded accurately and photographed.',
    ],
    keywords: ['garden', 'garage', 'fences', 'driveway', 'balcony', 'outside'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Exterior', occurrence: 1 },
      { doc: 'aip-training-guide', heading: 'Exterior', occurrence: 2 },
    ],
  },
  {
    id: 'trn-stairs-and-safety-items',
    topic: 'inspections',
    question: 'What do I need to look out for on stairs and landings?',
    answer: [
      'As part of your duty of care, check whether banisters and railings are safe and note issues such as loose rails or nails/screws sticking out. Watch for fraying or loose carpet on or near steps, which could become a trip hazard. Loose banisters and handrails should be relayed back to the letting agent/landlord.',
      'It is best practice to record stairs and landing as one room where practical. In a house with more than two storeys, split them as ‘Stairs and Landing 1’, ‘Stairs and Landing 2’ and so on. Loft hatches are often on the landing, so note them in the ceiling fittings.',
    ],
    keywords: ['banisters', 'handrail', 'trip hazard', 'loft hatch', 'staircase'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Stairs and Landing' },
      { doc: 'aip-training-guide', heading: 'Fixtures and Fittings' },
    ],
  },
  {
    id: 'trn-before-moving-on-and-leaving',
    topic: 'inspections',
    question: 'What should I do before leaving a room and before leaving the property?',
    answer: [
      'Before moving on from a room, double check everything and do a last scan to make sure nothing has been left out. If an item is not included in the inventory and is later damaged or goes missing, a claim for it may be turned down by an adjudicator.',
      'Before leaving the property:',
      '- Check all rooms have been inspected – open every door, as utility rooms and annexes can be hidden\n- Make sure all windows are closed and lights are switched off\n- Leave the property in the same state you found it\n- Double check all doors are locked and secure\n- Return the keys and pass any important messages to the agent\n- Finalise the report ready to be viewed by the agent and tenant',
    ],
    keywords: ['lock up', 'final check', 'missed items', 'end of visit', 'secure property'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Before moving on' },
      { doc: 'aip-training-guide', heading: 'Leaving the Property' },
    ],
  },

  // ---------------------------------------------------------------------------
  // AIP Training Guide: meters, keys, alarms
  // ---------------------------------------------------------------------------
  {
    id: 'trn-meter-readings',
    topic: 'inspections',
    question: 'Which meter readings do I need, and what if I can’t find the meters?',
    answer: [
      'Get ALL readings – some meters have several (a day, a night and a total reading).',
      'If you can’t find the meters, call the agent, who often has information on where they are. It’s worth asking the agent when you pick up the keys whether they hold any meter location information.',
      'In flats, meters are commonly in communal meter cupboards (you may need a key, sometimes FB or star keys), outside, in underground car parks (you may need a code) or inside by the front door. Gas meters can be outside in brown boxes needing a meter key. Many modern apartments only have electric – if there is no boiler, radiators or gas hob/fire, there is probably no gas. In houses, meters can be in the hallway or living room, in small outside cupboards needing a meter key, and water meters are usually outside in small grids or sometimes under the kitchen sink.',
    ],
    keywords: ['gas meter', 'electric meter', 'water meter', 'utility readings', 'meter cupboard', 'meter key'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Utility Meter Readings' },
      { doc: 'aip-training-guide', heading: 'Meter Locations' },
    ],
  },
  {
    id: 'trn-smart-meters',
    topic: 'inspections',
    question: 'How do I read a smart meter?',
    answer: [
      'Even though smart meters send readings automatically, we still need to take readings if possible.',
      '- **Smart gas meter with keypad** – press 9; VOLUME appears; you’ll see 6 digits followed by m3 – you only need the first 5 digits\n- **Smart gas meter without keypad** – press the red button until the display reads ‘xxxxx meter index m3’\n- **Smart electric meter with keypad (standard tariff)** – press 9; IMP KWH shows with 8 digits followed by kWh – you only need the first 7 digits\n- **Smart electric meter with keypad (Economy 7)** – press 6; IMP R01 is the night/off-peak reading and IMP R02 the day/peak reading – you only need the first 7 digits of each, and you need to give both readings whatever time of day it is\n- **Smart electric meter without keypad** – press the green button; the reading is the display labelled ‘TOTAL ACT IMPORT’',
    ],
    keywords: ['economy 7', 'keypad', 'kWh', 'digital meter', 'day night reading'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Smart Meters' },
      { doc: 'aip-training-guide', heading: 'Smart gas meters with key pads' },
      { doc: 'aip-training-guide', heading: 'Smart gas meter without key pad' },
      { doc: 'aip-training-guide', heading: 'Smart electric meters with key pads' },
      { doc: 'aip-training-guide', heading: 'Smart electric meters without key pads' },
    ],
  },
  {
    id: 'trn-prepay-meters',
    topic: 'inspections',
    question: 'What do I record on a pre-pay meter?',
    answer: [
      'As well as the credit/debt reading, you must also record the actual reading.',
      '- Gas meters will just have a cubic metre (m3) display – press the red button to cycle the display. Some gas meters have a digital (credit) and analogue (index) display; note down both.\n- Electric meters will have several different rates – press the blue button to find the reading.',
    ],
    keywords: ['prepayment', 'key meter', 'card meter', 'credit reading', 'debt'],
    sources: [{ doc: 'aip-training-guide', heading: 'Pre-Pay meters' }],
  },
  {
    id: 'trn-keys-list',
    topic: 'inspections',
    question: 'How should I record the keys?',
    answer: [
      'The inventory should include a key list completed by the clerk. You are sometimes given only a partial set or the agency’s management keys, so make sure the keys you’ve been given are the tenant set before adding them.',
      'Note what each key is and what it is for, for example: 2x yale keys for front door, 1x chubb key for back door, 1x padlock key for shed, 1x yale key for garage door.',
      'At check-out, take the keys from the tenant and cross reference them with the inventory to make sure the complete set has been returned.',
    ],
    keywords: ['key list', 'key schedule', 'yale', 'chubb', 'returned keys'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Keys List' },
      { doc: 'aip-training-guide', heading: 'Checkout Procedure' },
    ],
  },
  {
    id: 'trn-testing-alarms',
    topic: 'inspections',
    question: 'How do I test smoke and CO alarms, and what if I can’t reach them?',
    answer: [
      'Include a separate section listing the location and any obvious condition of the smoke detectors. Test alarms at the inventory, check-in and check-out stages when it is safe to do so – meaning you can reach the tester button yourself or with an extending stick, without climbing on furniture/ladders or putting yourself at risk.',
      'Press the tester button, wait to see if the alarm sounds, and note accordingly. Some systems sound every alarm when one is pressed – you still need to press the tester on all alarms. We do not test using any heat/smoke/CO source unless you are trained to do so.',
      'If you can’t reach an alarm, still add it to the report and note: ‘Unable to reach alarm and test due to height.’ For hardwired alarms linked to others in the building that can’t be tested individually, put: ‘Central alarm system - unable to test’.',
    ],
    keywords: ['smoke detector', 'carbon monoxide', 'fire alarm', 'test button', 'height', 'hardwired'],
    sources: [
      { doc: 'aip-training-guide', heading: 'How to test smoke alarms and CO alarms?' },
      { doc: 'aip-training-guide', heading: 'Smoke Detectors and CO Alarms' },
    ],
  },
  {
    id: 'trn-alarm-working-wording',
    topic: 'inspections',
    question: 'Can I say a smoke or CO alarm is working properly?',
    answer: [
      'No. Legally we can’t and don’t. Pressing the button and hearing it beep is the extent of our testing, and this needs to be stated clearly in your reports.',
      'Our terms and conditions state: “A smoke detector/CO detector listed as ‘Working’ only confirms the testing button is in working order. It does not confirm the device is in a fully operational condition.” This is because it can only really be tested by real smoke.',
    ],
    keywords: ['alarm wording', 'working', 'fully operational', 'terms and conditions', 'liability'],
    sources: [
      { doc: 'aip-training-guide', heading: 'How can we say an alarm is working properly?' },
      { doc: 'aip-training-guide', heading: 'Smoke Detectors and CO Alarms' },
    ],
  },
  {
    id: 'trn-alarm-faults',
    topic: 'inspections',
    question: 'What should I do if an alarm is beeping, disabled or damaged?',
    answer: [
      'Note the presence of smoke and CO alarms. If an alarm is indicating low charge with intermittent beeps, or has been disabled or damaged, it is not your responsibility to fix it. Record the issue on the report and notify the letting agent/landlord.',
    ],
    keywords: ['low battery', 'chirping', 'missing alarm', 'broken detector', 'report to agent'],
    sources: [{ doc: 'aip-training-guide', heading: 'Smoke and CO Alarms' }],
  },
  {
    id: 'trn-what-counts-as-storey',
    topic: 'inspections',
    question: 'What counts as a storey for smoke alarm purposes?',
    answer: [
      '- Cellar/basement fitted for habitable use (e.g. with appliances, carpets, nicely decorated) – **yes**\n- Separate floor with one room (e.g. loft converted into a bedroom) – **yes**\n- Cellar/basement not regularly used – **no**\n- Mezzanine level / half landing – **no**\n- Porch with stairs straight away on entry (no rooms on the ground/entry floor) – **no**',
      'Mezzanines and porches with stairs do not need a separate smoke detector. Heat detectors are not a replacement for smoke alarms.',
    ],
    keywords: ['basement', 'loft conversion', 'mezzanine', 'floor', 'heat alarm', 'compliance'],
    sources: [
      { doc: 'aip-training-guide', heading: 'What counts as a ‘storey’ for compliance purposes?' },
      { doc: 'aip-training-guide', heading: 'Can heat alarms be used instead of smoke detectors?' },
    ],
  },

  // ---------------------------------------------------------------------------
  // AIP Training Guide: check-ins, check-outs, midterms
  // ---------------------------------------------------------------------------
  {
    id: 'trn-when-to-do-inventory',
    topic: 'inspections',
    question: 'When should the inventory be carried out?',
    answer: [
      'Ideally after the property has been fully prepared for the next tenant (items removed, property cleaned, etc.), as close as possible to the start of the tenancy, but with enough time to compile and finalise the inventory ready for the check-in.',
      'A new inventory must be created at the beginning of each tenancy. Without a proper check-in and check-out, the validity of the inventory is greatly reduced.',
    ],
    keywords: ['timing', 'new tenancy', 'before move in', 'inventory creation'],
    sources: [{ doc: 'aip-training-guide', heading: 'Inventory Creation' }],
  },
  {
    id: 'trn-check-in',
    topic: 'inspections',
    question: 'What happens at a check-in, and how long does the tenant have to sign?',
    answer: [
      'The tenant should have the chance to read, add comments to and sign the inventory when they move in. Either the clerk/agent goes through it with them at an appointment, or the tenant collects the keys and a copy of the inventory and is given a number of days to agree or add comments and amendments.',
      'At an accompanied check-in, go through the inventory with the tenant so they agree with each statement. Any handwritten amendments should be initialled and documented. Take the opportunity to retake the meter readings, especially if a lot of time has passed since the inventory. Return the signed inventory to the letting agent.',
      'A seven day window for the tenant to return the signed document is usually reasonable (some agents allow longer or shorter), and this must be stated on the report. If the tenant does not return it in time, it is presumed they agree with its content. The tenant must not be forced into signing.',
      'Stay neutral if the tenant is unhappy with the property or the agent – refer them back to the agent/landlord.',
    ],
    keywords: ['move in', 'start of tenancy', 'sign inventory', '7 days', 'amendments', 'tenant signature'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Check Ins' },
      { doc: 'aip-training-guide', heading: 'Declaration' },
      { doc: 'aip-training-guide', heading: 'Disclaimer' },
    ],
  },
  {
    id: 'trn-check-out-no-original',
    topic: 'inspections',
    question: 'Do I need the original inventory for a check-out, and what if there isn’t one?',
    answer: [
      'You MUST take a copy of the original inventory with you, otherwise your check-out may be inaccurate. If the tenant claims something was already like that when they moved in, you have to be able to cross-reference it – you cannot take the tenant’s word for it.',
      'If no original inventory is available, prepare the report on the assumption that everything was brand new at the start of the tenancy, detailing all maintenance and cleaning issues present at your visit. It is the agent or landlord’s responsibility to provide the inventory, so if they don’t, it becomes their responsibility to cross-reference.',
      'Only items actually on the original inventory can be commented on at check-out – anything omitted in error cannot be added at the end of the tenancy.',
    ],
    keywords: ['move out', 'end of tenancy', 'missing inventory', 'cross reference', 'comparison'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Checkouts' },
      { doc: 'aip-training-guide', heading: 'Check Out' },
    ],
  },
  {
    id: 'trn-check-out-procedure',
    topic: 'inspections',
    question: 'How do I carry out a check-out?',
    answer: [
      'The check-out should be done promptly after the tenancy ends and before anyone else enters for cleaning or repairs. The property must be completely vacated. The tenant is entitled, but not required, to be present.',
      'If the tenant is there, start by asking what they think needs noting (anything fixed, replaced, cleaned or redecorated) and photograph any receipts for professional services. Tenant information can be noted as ‘Tenant’s comments’. The tenant must not re-enter rooms you have inspected.',
      'Work through the original inventory and compare everything:',
      '- Condition of fixed items (doors, walls, ceilings) – additional or excessive marks\n- Condition of appliances – e.g. is the oven cleaned to the same standard as at check-in\n- Existence and condition of furnishings – check all cupboards and drawers\n- Cleanliness – carpets, dust, windows, mould and limescale, under rugs (don’t move large items yourself)\n- Garden and outdoors – bearing bin day in mind\n- Ask for a forwarding address (voluntary)\n- Meter readings with the tenant present\n- Keys – check the complete set is returned; ask the tenant to leave before you\n- Lock up and switch off all lights',
      'Provide the report promptly to the agent, and tell them directly about urgent repairs or concerns such as leaks.',
    ],
    keywords: ['move out', 'end of tenancy', 'vacate', 'deposit deductions', 'check out report'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Checkout Procedure' },
      { doc: 'aip-training-guide', heading: 'Checkouts' },
      { doc: 'aip-training-guide', heading: 'Check Out' },
    ],
  },
  {
    id: 'trn-tenant-disagrees',
    topic: 'inspections',
    question: 'What do I do if a tenant disagrees with me or wants to argue about their deposit?',
    answer: [
      'If you spot a change from the original inventory and the tenant disagrees, show them the inventory. You may need to remind them that when they signed it they were agreeing to all of its contents, and that you are third party – decisions about deposits are made by the agent/landlord, not you.',
      'At any visit you are third party and it is not your place to get involved in discussions with the tenant or landlord. Report everything back to the agency for them to decide. You are there to state fact, not give your opinion. Do not get involved, always be polite and kind, and avoid unnecessary confrontation.',
      'If a tenant hinders the check-out, they should be told they may be liable to pay for the clerk’s time.',
    ],
    keywords: ['dispute', 'confrontation', 'argument', 'third party', 'deposit deduction'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Checkout Procedure' },
      { doc: 'aip-training-guide', heading: 'Midterms', occurrence: 2 },
    ],
  },
  {
    id: 'trn-midterm-inspections',
    topic: 'inspections',
    question: 'What is a midterm inspection and what should I record?',
    answer: [
      'A midterm is a visit during the tenancy, using a summarised checklist rather than a full inventory. It is similar to a check-out but needs far less detail. The tenant is entitled to a minimum of 24 hours’ notice, and is within their rights to refuse access – if so, go back to the letting agency.',
      'Usually the tenant is present, and you can ask about any issues to relay to the agency/landlord. Record things like:',
      '- Mould/damp\n- Anything broken or damaged\n- Any redecorating\n- Pets or signs of pets\n- Any major cleaning issues (minor cleaning does not need to be recorded, as standards vary person to person)',
    ],
    keywords: ['mid-term', 'interim inspection', 'periodic visit', 'property visit', 'during tenancy'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Midterms', occurrence: 1 },
      { doc: 'aip-training-guide', heading: 'Midterms', occurrence: 2 },
    ],
  },

  // ---------------------------------------------------------------------------
  // AIP Training Guide: health, safety and practicalities
  // ---------------------------------------------------------------------------
  {
    id: 'trn-duty-of-care',
    topic: 'inspections',
    question: 'What does my duty of care as a clerk cover?',
    answer: [
      'Your duty of care means carrying out your job in a way that does not result in foreseeable injury to others or yourself, or damage to a property, and respecting confidentiality. You are expected to be practical and reasonable – it does not mean testing every item for safety.',
      'The guide’s examples of neglecting duty of care: noticing a potentially dangerous loose banister and not reporting it immediately to the agent; leaving the property unlocked after a visit; and trying to access an attic with no safe means of access and getting injured.',
      'Where something appears dangerous (e.g. exposed wiring), note it and inform the agent – do not attempt to repair it.',
    ],
    keywords: ['health and safety', 'dangerous', 'report hazards', 'responsibility', 'exposed wiring'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Duty of Care' },
      { doc: 'aip-training-guide', heading: 'Fixtures and Fittings' },
    ],
  },
  {
    id: 'trn-furniture-fire-labels',
    topic: 'inspections',
    question: 'Do I need to check furniture for fire safety labels?',
    answer: [
      'Yes – check upholstered or padded furnishings for appropriate fire safety labels, though your disclaimer should make clear you are not an expert in this area. The rules apply to items such as beds, headboards, mattresses, sofa-beds, futons, nursery furniture, garden furniture with covers or pads, scatter cushions, seat pads, pillows, and loose and stretch covers for furniture.',
      'They do not apply to antique furniture or furniture made before 1950, bed-clothes (including duvets), loose covers for mattresses, pillowcases and cushion covers, curtains, carpets or sleeping bags.',
      'If a label is absent, highlight this and include the symbol (****) in the comments. A label saying ‘Careless use of matches could set fire to this furniture’ may mean the furniture was made before 1988 and does not meet current requirements – inform the agent as soon as possible.',
    ],
    keywords: ['fire label', 'upholstery', 'sofa', 'mattress', 'non-compliant furniture'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Upholstery Fire Regulations' },
      { doc: 'aip-training-guide', heading: 'Fire Safety' },
    ],
  },
  {
    id: 'trn-fire-extinguishers',
    topic: 'inspections',
    question: 'Do properties need fire extinguishers or fire blankets?',
    answer: [
      'There is no compulsory requirement to provide fire blankets or fire extinguishers in normal tenanted properties unless the property is an HMO. Where you see them, check the label for evidence that they are being serviced annually.',
      'HMOs have special fire regulation requirements, such as door closer arms or chains and special strips along door frames. Without specialist training, your responsibility is limited to listing what you see.',
    ],
    keywords: ['fire blanket', 'extinguisher', 'HMO', 'servicing', 'fire door'],
    sources: [
      { doc: 'aip-training-guide', heading: 'Fire Extinguishers and Safety Blankets' },
      { doc: 'aip-training-guide', heading: 'House in Multiple Occupancy (HMO)' },
    ],
  },
  {
    id: 'trn-personal-safety',
    topic: 'inspections',
    question: 'How do I keep myself safe when working alone at properties?',
    answer: [
      '- Give a responsible person a daily schedule of properties and your expected finish time\n- Share your location via GPS with a trusted person\n- Note entrances and exits when you enter a property\n- Don’t get involved in discussions with tenants – refer them to the letting agency\n- Liaise with the agent beforehand about who may be there and any known problems\n- Keep doors locked while you carry out visits\n- Keep your mobile phone with you\n- Schedule inventories for daylight hours only\n- Only inspect areas with normal, safe access – no loft ladders, dark stairways, or unlit cellars/basements\n- Don’t move furniture on your own\n- Use appropriate equipment, e.g. a torch, or a stepladder for a meter above head height\n- Leave gas, electricity and plumbing to qualified professionals – record the issue and inform the agent',
    ],
    keywords: ['lone working', 'safety tips', 'risk', 'loft', 'daylight', 'emergency'],
    sources: [{ doc: 'aip-training-guide', heading: 'Personal Safety' }],
  },
  {
    id: 'trn-kit-list',
    topic: 'inspections',
    question: 'What equipment should I take to every job?',
    answer: [
      'The AIP guide recommends:',
      '- A key carrier (e.g. a carabiner) and care with property keys, as doors may autolock\n- Your device, a charger, car charger and a portable backup charger\n- Meter cupboard key, star keys and FB keys\n- Business cards as ID\n- A ruler or coin for scale in close-up photos\n- A pen knife or screwdriver and a long handled brush for water meters\n- A torch\n- Waterproof coat/umbrella\n- Shoe covers\n- Notepad and pen\n- Sat nav\n- Soap, hand sanitiser, tissues and baby wipes\n- Smart, practical clothing and comfortable shoes\n- Measuring tape (for oil tanks)\n- Envelopes, in case you need to post keys after an agent has closed\n- First aid kit\n- Small collapsible steps and an extendable stick for high meters and alarms',
    ],
    keywords: ['kit', 'tools', 'what to bring', 'star key', 'FB key', 'essentials'],
    sources: [{ doc: 'aip-training-guide', heading: 'Practicalities of the Job' }],
  },
  {
    id: 'trn-software-vs-dictaphone',
    topic: 'inspections',
    question: 'Should I use a dictaphone and separate camera, or inventory software?',
    answer: [
      'The course advocates using a device with specialist inventory software. A dictaphone and separate digital camera are now deemed an outdated method that often doubles, or even triples, the time taken to create a finished report.',
      'Benefits of software include speed and efficiency, a legible and professional presentation, prompts so you don’t miss details, photographs embedded next to the item you’ve commented on, and suggested wording for items.',
    ],
    keywords: ['app', 'inventory software', 'device', 'efficiency', 'dictaphone'],
    sources: [{ doc: 'aip-training-guide', heading: 'Software Benefits' }],
  },

  // ---------------------------------------------------------------------------
  // Operating procedures: uniforms, OpenRent, QuickBooks
  // ---------------------------------------------------------------------------
  {
    id: 'trn-ordering-uniforms',
    topic: 'getting-started',
    question: 'How do I order uniforms?',
    answer: [
      'Uniforms are standardised across the miServices network. All uniforms should be purchased via the uniform portal, using the login provided to you by email: theportal.strongholdglobal.com/login',
      'The range includes caps, polos, sweatshirts and waterproofs in various colours.',
      'If you need help logging in, contact Marta Janes (Franchise Operations) by email at marta.janes@mobileinventory.co.uk or on 0345 680 7976.',
    ],
    keywords: ['uniform portal', 'workwear', 'clothing', 'polo shirts', 'Stronghold', 'branded clothing'],
    sources: [
      { doc: 'ordering-uniforms', heading: 'Standardisation of uniforms' },
      { doc: 'ordering-uniforms', heading: 'Our uniform' },
      { doc: 'ordering-uniforms', heading: 'Who to call' },
    ],
  },
  {
    id: 'trn-openrent-landlord-contact',
    topic: 'getting-started',
    question: 'Can I work directly for a landlord I met through an OpenRent job?',
    answer: [
      'No. miServices has a Service Level Agreement (SLA) with OpenRent which states that direct business with landlords who have previously used our services through OpenRent is not permitted. Franchise Owners must not attempt to conduct any business with these landlords directly.',
      'Doing so is a breach of the SLA and may lead to early termination of your Franchise Agreement. It could also cause miServices to lose OpenRent as a customer, affecting many Franchise Owners across the network.',
      'If a landlord contacts you directly, politely direct them to OpenRent and explain the agreement, and inform the appropriate department at miServices immediately.',
    ],
    keywords: ['OpenRent SLA', 'direct business', 'landlord approach', 'franchise agreement', 'breach'],
    sources: [{ doc: 'openrent-procedures', heading: 'OpenRent' }],
  },
  {
    id: 'trn-openrent-24-hours',
    topic: 'getting-started',
    question: 'How quickly do I need to respond to an OpenRent job?',
    answer: [
      'Under our SLA with OpenRent, jobs must be accepted/booked within 24 hours. When you receive work orders from head office, contact head office to confirm whether you can or cannot fit the job in, and contact the landlord or tenant if you manage your own bookings.',
    ],
    keywords: ['work order', '24h', 'accept job', 'booking', 'response time'],
    sources: [{ doc: 'openrent-procedures', heading: 'OpenRent' }],
  },
  {
    id: 'trn-quickbooks-help',
    topic: 'getting-started',
    question: 'Where can I get help with QuickBooks?',
    answer: [
      'miServices franchisees use QuickBooks for accounts and invoicing. Intuit publish and keep their own guides up to date, so please use their official help centre: quickbooks.intuit.com/learn-support/en-uk',
      'For anything specific to how miServices uses QuickBooks – such as invoicing head office or franchise reporting – please contact head office.',
    ],
    keywords: ['accounts', 'invoicing', 'bookkeeping', 'Intuit', 'accounting software'],
    sources: [{ doc: 'quickbooks-guide' }],
  },
];
