/**
 * Seed script to populate Sanity with the Terms & Conditions page.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-terms.ts
 *
 * Requires SANITY_API_TOKEN in .env
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function block(
  text: string,
  style: string = 'normal',
  markDefs: any[] = [],
  children?: any[]
): any {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs,
    children: children || [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text,
        marks: [],
      },
    ],
  };
}

function boldSpan(text: string, boldKey?: string): any {
  return {
    _type: 'span',
    _key: Math.random().toString(36).slice(2, 10),
    text,
    marks: boldKey ? [boldKey] : ['strong'],
  };
}

function plainSpan(text: string): any {
  return {
    _type: 'span',
    _key: Math.random().toString(36).slice(2, 10),
    text,
    marks: [],
  };
}

function heading(text: string, level: 'h2' | 'h3' | 'h4' = 'h2'): any {
  return block(text, level);
}

function paragraph(text: string): any {
  return block(text, 'normal');
}

const body: any[] = [
  // 1. General
  heading('1. General'),
  paragraph('1.1. These Terms and Conditions govern the sale and provision of services by us and will form the basis of the Contract between us and you. Please ensure that you have read these Terms and Conditions carefully.'),
  paragraph('1.2. An agreement with these Terms and Conditions is created when a work order is received from any instructing principal on behalf of a client, the client directly or the client\'s legal representative.'),
  paragraph('1.3. If an instructing principal submits a work order on behalf of a client, it is the instructing principal\'s responsibility to ensure the client is aware of these Terms and Conditions.'),
  paragraph('1.4. We are unable to accept a plea of ignorance from any party subject to the provision of services.'),
  paragraph('1.5. Nothing provided by us including, but not limited to, sales and marketing literature, price lists and other documents constitutes a contractual offer capable of acceptance. Your order constitutes a contractual offer that we may, at our discretion, accept or decline.'),
  paragraph('1.6. If you are unsure about any part of these Terms and Conditions, please ask us for clarification.'),

  // 2. Work Orders/Instructions
  heading('2. Work Orders/Instructions'),
  paragraph('2.1. All orders for service made by you will be subject to these Terms and Conditions.'),
  paragraph('2.2. We can accept a tentative booking over the phone but this must be confirmed by email. Bookings must be sent to the Mobile Inventory Services Limited South contact centre email: bookings@mobileinventory.co.uk or office@mobileinventory.co.uk'),
  paragraph('2.3. Individual clerks are unable to accept bookings, only the contact centre can book jobs.'),
  paragraph('2.4. If no email booking is received we will not carry out the job.'),
  paragraph('2.5. The email confirmation must include the following details:'),
  paragraph('2.5.1. service requested'),
  paragraph('2.5.2. property address including postcode'),
  paragraph('2.5.3. date job can be completed'),
  paragraph('2.5.4. time of job if meeting someone at the property (to be mutually agreed)'),
  paragraph('2.5.5. special instructions or requests'),
  paragraph('2.5.6. number of bedrooms'),
  paragraph('2.5.7. if the property is furnished or unfurnished'),
  paragraph('2.5.8. additional areas requiring checking e.g. garage or garden'),
  paragraph('2.5.9. location of keys or other access details'),
  paragraph('2.5.10. name of person making booking and their contact details'),
  paragraph('2.6. A legally binding contract between us and you will be created upon our acceptance of your order, indicated by our order confirmation. Order confirmation will be provided in writing by email.'),
  paragraph('2.7. If we require any information from you in order to provide the services, we will inform you of this as soon as is reasonably possible. If the information you provide is delayed, incomplete or otherwise incorrect, we will not be responsible for any delay caused as a result. If additional work is required from us to correct or compensate for a mistake made as a result of incomplete or otherwise incorrect information that you have provided we may charge you a reasonable additional sum for that work.'),

  // 3. Service types
  heading('3. Service types'),
  paragraph('We offer the following service types:'),
  paragraph('3.1. Inventory (schedule of condition) - a visit to the rental property before the start of the tenancy to produce a report documenting a full record of the condition, contents and cleanliness.'),
  paragraph('3.2. Check-in - includes meeting the new tenants at the start of the tenancy, showing them key features of the property, collecting a digital signature to confirm the process, sending a digital copy of the inventory for the tenant to review and submit additional comments online, and providing keys if required.'),
  paragraph('3.2.1. When a face-to-face check-in appointment is not possible, a remote check-in, where a digital copy of the inventory is sent for the tenant to review and submit additional comments online, may be carried out instead.'),
  paragraph('3.2.2. We can only carry out a check in when we have been instructed to prepare a new inventory for the same tenancy.'),
  paragraph('3.3. Check-out - visiting the property at the end of the tenancy or as soon as possible afterwards to compile another report identifying differences between the state of the property at that point with the original inventory.'),
  paragraph('3.4. Management visit - visiting the property during the tenancy to ensure it is being looked after in an acceptable way and that the terms of the tenancy agreement are being followed.'),

  // 4. General service terms
  heading('4. General service terms'),
  paragraph('4.1. Mobile Inventory Services Limited offers an independent property inspection service, which is fundamentally impartial and equitable to both the tenant and the landlord involved in the property agreement. We are committed to conducting inspections based on tangible evidence and factual findings derived during the inspection process.'),
  paragraph('4.2. While we acknowledge the value of feedback and comments from both the tenant and the landlord, and may consider such feedback as part of the inspection process, we retain absolute discretion and are under no obligation to incorporate or reflect any of the comments provided by either party in the final inspection report. Our primary objective is to ensure that the inspection report is a true, unbiased representation of the property\'s condition at the time of inspection, taking into account only verifiable evidence and professional assessments.'),
  paragraph('4.3. Our commitment to impartiality ensures that the inspection report is produced with the utmost integrity, free from any influence or bias towards either the tenant or the landlord. This clause underscores our dedication to maintaining the highest standards of independence and fairness in the delivery of its property inspection services.'),
  paragraph('4.4. Our inspections are exclusively based upon a visual examination of the property\'s fixtures, fittings and contents. This visual inspection is limited to the assessment of the apparent condition of the property\'s visible elements at the time of the inspection. It is important for both the tenant and the landlord to understand that this inspection does not include invasive or destructive testing methods and is not designed to assess the hidden conditions or the internal workings of any element.'),
  paragraph('The property inspection reports generated by Mobile Inventory Services Limited must not be construed or used as a guarantee or certification of the underlying safety, functionality, or compliance of the property elements, including but not limited to gas, electrical features, plumbing, heating, and structural components. The inspection is not a substitute for specialised safety inspections or evaluations that are required to be conducted by licensed professionals in their respective fields, such as gas safety checks or electrical system inspections.'),
  paragraph('4.6. Clients (tenants, and landlords) are strongly advised to engage qualified professionals to conduct comprehensive safety inspections of the property\'s critical systems and components to ensure compliance with all applicable laws, regulations and safety standards. Our property inspection reports are intended to inform the client of the general condition of the property\'s visible aspects at the time of inspection and should not be relied upon for any other purpose.'),
  paragraph('4.7. By agreeing to these terms and conditions, the client acknowledges the limitations of the property inspection report and agrees not to hold Mobile Inventory Services Limited liable for any issues, defects or non-compliance that are not detectable through visual inspection alone.'),
  paragraph('4.8. Our reports provide a fair and independent record of the contents and condition of the property and its internal condition. They should not be used as an accurate description of each and every item of furniture and equipment, for marketing purposes, or as a structural survey. That is to say, the person preparing the inventory is not an expert in fabrics, woods, materials, antiques, etc., nor a qualified surveyor.'),
  paragraph('4.9. The reports are prepared in the understanding that, in the absence of comments or pictures to the contrary, a listed item is free from obvious defects, damage or soiling, and will be considered to be in good, clean condition.'),
  paragraph('4.10. The reports relate only to the furniture and all the landlord\'s equipment and contents in the property. It is neither a guarantee, nor a report on, the adequacy of, or safety of, any such equipment or contents. It is merely a record that such items exist in the property at the date of preparing the inventory and the superficial (visual) condition of the same.'),
  paragraph('4.11. Rooms which are locked or unable to be seen, such as lofts, cellars, etc., are the sole responsibility of the landlord. Areas only accessible by a trap door or ladder will not be inspected, nor will excessively full cupboards, drawers or storage areas. Packed boxes and bagged or packaged items will not be opened and checked. The clerk will not inspect any areas or features which they feel are unsafe due to the condition of the item or surrounding area.'),
  paragraph('4.12. The clerk will not test the plumbing, any utility, appliance or electrical appliance and will not comment on whether any of these items are in working order or comply with safety regulations. Superficial defects may be noted as part of the inventory process.'),
  paragraph('4.13. We will check the mains light bulbs and switches within the property. Testing will be carried out only when it is deemed safe to do so, without risk to the inspector or damage to the property\'s electrical system. The scope of testing for mains light bulbs and switches will be limited to verifying their operational status at the time of inspection. We will document and report any light bulbs that are found to be non-functional or missing. No further diagnostics or testing on the electrical system, appliances or fixtures, beyond the operational check of the mains light bulbs and switches, will be undertaken as part of this service.'),
  paragraph('4.14. The clerk will not move items of furniture or freestanding appliances to check behind, underneath or either side of them. If you wish us to inspect these areas, please make arrangements for the item to be moved before our arrival. Unless instructed otherwise, we will always attempt to locate, take and picture meter readings in the course of inventory, check-in and check-out inspections. This is subject to meters being readily accessible, identifiable and with suitable lighting conditions to take a clear reading and picture. We are unable to accept responsibility for any loss to the client, or arrange a revisit, when the clerk was unable to locate or identify the correct meter, unless we were informed of the relevant details in writing before the time of the appointment.'),
  paragraph('4.15.1. For properties/buildings where meters can only be accessed by a concierge, porter or managing agent, it is the responsibility of the said individual to obtain and provide the meter reading at the start and end of tenancy. We can include this meter reading in our reports if it is provided to us within our standard notice period for updating reports.'),
  paragraph('4.16. External areas: while we will inspect areas of properties which logically belong to it, some properties include extra areas which are not immediately obvious. Please inform us of the location of any external areas which also need to be included in the inspection. Examples of these include: garages not attached to the property, such as en-bloc garages; allocated parking spaces; cupboards and rooms that cannot be directly accessed from the property; and sections of communal gardens which are the responsibility of the property occupant. We are unable to accept responsibility for any loss to the client or arrange a revisit for any external areas not inspected, unless we were informed of the relevant details in writing before the time of the appointment.'),
  paragraph('4.17. Signing of documents by tenants: we will only arrange for the tenant to sign an inventory report when we have been instructed to carry out a check-in. When we have been instructed to carry out an inventory-only service, it is the responsibility of the agent and/or landlord to arrange for the tenant (and other parties, if applicable) to sign the document. The inventory may be signed digitally via a smartphone/tablet or via our online signing platform. We do not arrange for the tenant or any other parties to sign management visit or check-out reports.'),
  paragraph('4.18. Key collection, return and holding: we can collect and return keys to a location within 2 miles of the property address at no extra charge. A surcharge may apply if key collection and/or return is required from and/or to a location further away from the property. We will attempt to return keys as soon as possible after completing a job, and will generally aim to do so by the end of the day, though we cannot guarantee a specific time because it depends on the clerk\'s workload on the day. Upon request, keys can be posted by Royal Mail (1st Class Signed For) for an additional charge. We may agree to hold keys for a short period of time before or after completing a job, but the terms for this must be agreed in advance.'),
  paragraph('4.19. Reports are provided as PDF documents and will be sent by email or made available on the client\'s server. A hard copy of any document can be ordered and delivered by Royal Mail at the cost of \u00A325 + VAT per copy.'),

  // 5. Using the inventory
  heading('5. Using the inventory'),
  paragraph('5.1. Multiple items may be grouped together for inspection and photographic purposes.'),
  paragraph('5.2. It is assumed that all door hinges have the appropriate number of screws in place unless otherwise stated.'),
  paragraph('5.3. Fixed items such as light switches, electrical sockets, telephone points, electric, blanking plates and fuse boxes are deemed serviceable and in place unless otherwise commented. Light fittings are assumed to come complete with a serviceable bulb(s) unless otherwise stated.'),
  paragraph('5.4. Carpets, furnishings and other fittings are deemed to be of a medium-to-good quality and in a serviceable condition unless otherwise commented.'),
  paragraph('All window casement stays, catches and locks are assumed to be intact and in an undamaged state, unless indicated otherwise. For security reasons, window openers will not be tested. The responsibility for checking and reporting window opener defects lies with the tenant or landlord.'),
  paragraph('5.6. Settling cracks to walls and ceilings are accepted, and may not be mentioned unless necessary due to their size (the measure we use is if they are thicker than a \u00A31 coin).'),
  paragraph('5.7. Consumables and items of no commercial value are not listed.'),
  paragraph('5.8. Condition ratings are based on information made available to the clerk at the time of booking, e.g. new appliances or fittings, professionally cleaned areas of the property.'),
  paragraph('5.9. A smoke detector/CO detector listed as \'Working\' only confirms the testing button is in working order. It does not confirm the device is in a fully operational condition.'),
  paragraph('5.10. Items will only be listed as \'Brand New\' if a receipt is provided or they are still in the original packaging at the time of our visit.'),

  // 6. Furnishings
  heading('6. Furnishings'),
  paragraph('6.1. The fire and safety regulations regarding furnishing, gas, electrical and similar services are ultimately the responsibility of the instructing principal. Where the inventory notes "Fire Regulation Label Attached", this should not be interpreted to mean the item complies with the "furniture and furnishings (fire) (safety) (amendments) 1993". It is a record that the item had a label as described or similar to that detailed in the "guide" published by the Department of Trade and Industry January 1997 (or subsequent date). It is not a statement that the item can be considered to comply with the Regulations.'),
  paragraph('6.2. Furniture, large objects, carpets and rugs will not be moved by the clerk. We will not be able to comment on an issue which may not be visible because of this.'),
  paragraph('6.3. Beds and mattresses will be inspected if not \'dressed\' at the time of visit. Otherwise, we will make a record of their presence in the property and their external appearance. Likewise, linen, towels, tables or similar will be recorded as being in the property but not inspected if they are \'dressed\'.'),
  paragraph('6.4. Unless we are instructed otherwise, the contents of shelves, cupboards or drawers - including, but not exclusively, crockery, cutlery, pots, pans, utensils, ornaments or other miscellaneous items - will not be individually counted but instead grouped together as an assortment with an accompanying photograph.'),
  paragraph('6.5. We are unable to comment on the value, brand (except kitchen appliances) or authenticity of furnishings.'),

  // 7. Using the check out
  heading('7. Using the check out'),
  paragraph('7.1. Check out reports are based on the ingoing inventory, if one is provided by the client or was previously carried out by Mobile Inventory Services Limited. Check out reports only note items identified as being in a different condition to that described in the ingoing inventory.'),
  paragraph('7.2. A check out report completed without an ingoing inventory will provide a general list of major cleaning and maintenance issues at the property, though we will not be able to comment about whether there are any missing/altered items or furnishings.'),
  paragraph('7.3. Check out reports are advisory only and are based on the information available to the clerk. We do not apportion responsibility or liability for any issues noted therein. It must not be treated as a final statement of tenant responsibility. It is the responsibility of the landlord and tenant to fully agree to all issues and deductions from the deposit.'),
  paragraph('7.4. Amendments or clarifications to the report should be submitted as per section 8 below.'),

  // 8. Report amendments and clarifications
  heading('8. Report amendments and clarifications'),
  paragraph('8.1. Occasionally, one of our reports may need additions, amendments or clarifications. This is a natural part of the process. We reserve the right to decline making amendments if we feel they constitute bias in favour of one party or they are requests not included in our standard service.'),
  paragraph('8.1.1. Inventory amendments can be accepted from tenants, letting agents and landlords. Check out amendments can be accepted from letting agents and landlords.'),
  paragraph('8.1.2. When a check-in has been completed, tenants can submit their comments to the inventory via our online portal; amendment requests from landlords and letting agents must be submitted by the process described in clause 8.2. When a check-in has not been completed, inventory amendment requests from all parties must be submitted by the process described in clause 8.2.'),
  paragraph('8.2. All amendment requests must be sent by email to bookings@mobileinventory.co.uk or office@mobileinventory.co.uk within 5 working days of the report being sent to the instructing principal.'),
  paragraph('8.3. We are unable to accept amendment requests relating to our inspection reports if we were not informed of them within the 5 working day notice period. We will not be able to comment or respond to any questions or concerns raised after the 5 working day notice period or after the next occupant has moved into the property. Please see our complaint procedure (section 17) for more information.'),

  // 9. Right to refuse
  heading('9. Right to refuse'),
  paragraph('9.1. We have the right to leave an appointment immediately in the following circumstances:'),
  paragraph('9.1.1. If the tenant, landlord or any other party acts in an aggressive or threatening manner, or if the clerk feels in any way unsafe;'),
  paragraph('9.1.2. If the clerk has reason to believe the tenant, landlord or any other party is under the influence of drugs or alcohol;'),
  paragraph('9.1.3. If the clerk feels unsafe due to the condition of the property, including gas and electrical faults, infectious health, and similar reasons;'),
  paragraph('9.1.4. If the clerk deems the property is not ready for the appointment e.g. there are contractors working at the property, building equipment present or a previous occupant has not fully vacated;'),
  paragraph('9.1.5. Should a block be placed on your account by credit control due to non-payment of overdue invoices;'),
  paragraph('9.1.6. In these circumstances we will inform the instructing principal at the earliest opportunity.'),

  // 10. Waiting Time Policy
  heading('10. Waiting Time Policy'),
  paragraph('10.1. We accept there will be occasions when jobs are delayed. Our procedure when this happens is set out below.'),
  paragraph('10.2. If the clerk turns up to an appointment booked for a specific date and time and finds the job cannot go ahead, the clerk will wait 20 minutes to see if the job can proceed. If needed, we will attempt to contact the instructing principal and/or person providing access for assistance and further instruction.'),
  paragraph('10.3. This includes times when: the person providing access is not at the property to let the clerk in; the property is not ready for the booked service to be carried out; or the access instructions provided at the time of booking do not work.'),
  paragraph('10.4. If at the end of the 20 minute waiting period we have been unable to establish contact with the instructing principal, the person providing access has not arrived at the property, and/or the property is still not ready for the booked service to be carried out, the clerk reserves the right to walk away from the property.'),
  paragraph('10.5. Additional waiting time beyond the 20 minute waiting period may be possible at our discretion. However, we are unable to guarantee this. Any agreed additional waiting time may be subject to a surcharge.'),
  paragraph('10.6. If the job does not go ahead, a cancellation fee may be issued. (See section 12.)'),

  // 11. Property sizes
  heading('11. Property sizes'),
  paragraph('11.1. Our prices are based on the following scale relating to the number of rooms and bedrooms at the property:'),
  paragraph('11.1.1. studio/1 bed property - 8 x rooms max.'),
  paragraph('11.1.2. 2 bed property - 9 x rooms max.'),
  paragraph('11.1.3. 3 bed property - 10 x rooms max.'),
  paragraph('11.1.4. 4 bed property - 11 x rooms max.'),
  paragraph('11.1.5. 5 bed property - 12 x rooms max.'),
  paragraph('11.1.6. Please contact us for a specific quote for any larger properties.'),
  paragraph('11.1.7. Stairs and landings are classed as one room.'),
  paragraph('11.2. We reserve the right to charge an additional price, on a per room basis, for any properties with more rooms than allowed as per the above scale.'),

  // 12. Cancellations and aborted appointments
  heading('12. Cancellations and aborted appointments'),
  paragraph('12.1. You may cancel or change your order at any time before we begin providing the services by contacting us at least 24 hours before the appointment. If your order is changed we will inform you of any change to the price.'),
  paragraph('12.2. We may charge a cancellation fee of up to \u00A350 plus VAT or the equivalent price of the job (whichever is the smaller amount) in the following circumstances:'),
  paragraph('12.2.1. if a job is cancelled with less than 24 hours notice;'),
  paragraph('12.2.2. if a job is cancelled or fails to go ahead on the same day;'),
  paragraph('12.2.3. a cancellation fee may also be charged should the appointment be cancelled as per the above section referred to as \'Right to refuse\'.'),
  paragraph('12.3. At our discretion, we reserve the right to add a surcharge to any quoted/agreed price for any job where the clerk incurs a time delay due to client error, for example, incorrect information being provided.'),

  // 13. Payment terms
  heading('13. Payment terms'),
  paragraph('13.1. You will be charged according to our standard rates or at agreed rates arranged and confirmed separately. If we quote a special price which is different to our standard rates the special price will be valid for thirty days or, if the special price is part of an advertised special offer, for the period shown in the advertisement. Orders placed during this period will be accepted at the special price even if we do not accept the order until after the period has expired.'),
  paragraph('13.2. Our prices may change at any time but these changes will not affect orders that we have already accepted.'),
  paragraph('13.3. Our advertised prices are based on the size and value of a standard residential property. We reserve the right to add additional surcharges to our advertised rates for jobs completed at properties where special care, attention and time is needed. Examples include, but are not limited to, properties which are Grade-listed, those with particularly large acreage and/or square footage, those with a high number of outbuildings, those with an exceptionally high value or valuable contents, and commercial premises.'),
  paragraph('13.4. All prices are subject to VAT. If the rate of VAT changes between the date of your order and the date of your payment, we will adjust the rate of VAT that you must pay. Changes in VAT will not affect any prices where we have already received payment in full from you.'),
  paragraph('13.5. You will be issued with an invoice by email with the balance amount and payment terms. The balance of the price will be payable by the due date on the invoice. The invoice can be issued on a per-job or monthly basis depending on your preference.'),
  paragraph('13.5.1. For new customers, or those without an account, we may require payment in advance. You will be sent an invoice shortly after booking, but before the appointment. If you do not pay the invoice before the day of the appointment, we reserve the right not to attend the appointment. Due to time constraints, we are not always able to inform you of non-attendance in advance. Please inform us when you have paid for an advance booking so we can verify and confirm your appointment.'),
  paragraph('13.6. All payments must be made by bank transfer.'),
  paragraph('13.7. If you do not make payment to us by the due date as shown on the invoice, we may charge you interest on the overdue sum at the rate of 4% per annum above the base lending rate of the Bank of England from time to time. Interest will accrue on a daily basis from the due date for payment until the actual date of payment of the overdue sum, whether before or after judgement. You must pay any interest due when paying an overdue sum.'),
  paragraph('13.8. \'First Inventory Free\' promotions:'),
  paragraph('13.8.1. Occasionally we may offer \'First Inventory Free\' promotions to potential customers. This promotion is only available to letting agents or property managers and you must provide a copy of a promotional leaflet and/or email/webpage link at the time of booking.'),
  paragraph('13.8.2. The promotion is only valid for inventories for a property size of up to two bedrooms and must be unfurnished. If your first job is for a specification larger than this, you can either pay the full price and wait until a property matching the specification is ready for an inventory and claim the offer then, or you can instead claim a credit note of \u00A360 + VAT against the value of the inventory actually booked.'),
  paragraph('13.8.3. This promotion can only be used once per customer, regardless of how many departments or branches the customer operates.'),

  // 14. Ownership and copyright
  heading('14. Ownership and copyright'),
  paragraph('All reports and their respective copyrights will remain the property of Mobile Inventory Services Limited. Upon full receipt of payment, we will grant you a non-exclusive, non-transferable licence to use the report solely for the purpose for which it was provided by us. You must not sublicense, assign, sell, or transfer the licence or the report to any third party without the prior written consent of us. You shall not decompile, reverse engineer, disassemble, or attempt to derive the source code of the report, and shall not remove or alter any copyright or proprietary notices. Mobile Inventory Services Limited retains all rights, title, and interest in and to the reports, including all intellectual property rights such as copyright, trademarks, and trade secrets. We reserve the right to terminate this licence if you breach any of the terms and conditions contained herein.'),

  // 15. Events outside of our control (Force Majeure)
  heading('15. Events outside of our control (Force Majeure)'),
  paragraph('We will not be liable for any failure or delay in performing our obligations where that failure or delay results from any cause that is beyond our reasonable control. Such causes include, but are not limited to: medical emergencies affecting our employees/contractors and/or their dependants, power failure, internet service provider failure, industrial action, civil unrest, fire, explosion, flood, storms, earthquakes, subsidence, acts of terrorism, acts of war, governmental action, epidemic or other natural disaster, or any other event that is beyond our control.'),
  paragraph('15.2. If any event described under this clause occurs that is likely to adversely affect our performance of any of our obligations under these Terms and Conditions:'),
  paragraph('15.2.1. We will inform you as soon as is reasonably possible;'),
  paragraph('15.2.2. Our obligations under these Terms and Conditions will be suspended and any time limits that We are bound by will be extended accordingly;'),
  paragraph('15.2.3. We will inform you when the event outside of our control is over and provide details of any new dates, times or availability of services as necessary;'),
  paragraph('15.2.4. If an event outside of our control occurs and you wish to cancel the Contract, you may do so in accordance with your right to cancel.'),
  paragraph('15.3. When a job is booked in for a time, the agreed schedule only indicates tentative timing as the actual arrival time can vary on a number of factors that are outside our control, including but not exclusively:'),
  paragraph('15.3.1.1. traffic jams, road works or delays in public transport;'),
  paragraph('15.3.1.2. a previous job overrunning.'),
  paragraph('15.3.2. It is the nature of the business there will be occasions when a job is delayed when a property is not ready for inspection or if the person we are meeting for an appointment is late themselves, causing a knock-on effect.'),
  paragraph('15.3.3. When a clerk is running late we will make every effort to make alternative arrangements or inform you at the earliest opportunity; unfortunately this may not be possible in certain circumstances.'),
  paragraph('15.3.4. We will not be liable for any delayed appointments where that delay results from any cause that is beyond our reasonable control.'),

  // 16. Data Protection Statement
  heading('16. Data Protection Statement'),
  paragraph('We may need to collect and store personal information about you, and other parties if applicable, solely to enable us to carry out your requested services. This may include personal names, phone numbers and email addresses. This personal data will only be used to contact the individuals concerned to enable us to complete the services you instructed us to carry out; it will not be used for any other purpose. Personal data may be stored on our online booking platform, email account, or web server, if it is documented in one of our reports. Otherwise, it will not be shared with other organisations outside the Mobile Inventory Services Limited group, unless we are required to do so by law. For more information, please refer to our Data Protection Policy (available on request).'),

  // 17. Complaint Procedure
  heading('17. Complaint Procedure'),
  paragraph('We hope you will be very happy with our service but if you feel the need to raise a concern, we ask that you submit your concerns by email to bookings@mobileinventory.co.uk or office@mobileinventory.co.uk in the first instance. We will attempt to resolve your issue informally. If you are still dissatisfied and feel the need to start a formal procedure, you may request a copy of our complaints policy. The policy contains all the details of the formal complaints process.'),

  // 18. Contact Information
  heading('18. Contact Information'),
  paragraph('18.1. Mobile Inventory Services Limited can be contacted by phone +44 (0)345 680 7976 or by email bookings@mobileinventory.co.uk or office@mobileinventory.co.uk.'),
  paragraph('18.2. Phone calls to and from Mobile Inventory Services Limited South may be recorded for quality assurance, training purposes and to ensure accurate record-keeping. By phoning Mobile Inventory Services Limited, you consent to this recording. If you do not wish to be recorded, please inform the operator upon starting the call or consider contacting us by email.'),

  // 19. Company Information
  heading('19. Company Information'),
  paragraph('19.1. Mobile Inventory Services Limited is a registered company in England and Wales. Our company number is 07884266 and our registered office address is Third Floor Suite A3 (3) Chester Steam Mill, Steam Mill Street, Chester, England, CH3 5AN.'),
  paragraph('19.2. Mobile Inventory Services Limited holds Professional Indemnity Insurance, Cyber and Data Insurance and Public and Products Liability Insurance through accredited providers. Further details are available on request.'),
];

async function seed() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  // Check if document already exists
  const existing = await client.fetch(
    `*[_type == "page" && slug.current == "terms-conditions"][0]._id`
  );

  const doc = {
    _type: 'page' as const,
    title: 'Terms & Conditions',
    slug: { _type: 'slug' as const, current: 'terms-conditions' },
    body,
    publishedAt: new Date().toISOString(),
  };

  if (existing) {
    console.log(`Updating existing document: ${existing}`);
    await client
      .patch(existing)
      .set({
        title: doc.title,
        body: doc.body,
        publishedAt: doc.publishedAt,
      })
      .commit();
    console.log('Terms & Conditions page updated successfully.');
  } else {
    console.log('Creating new Terms & Conditions page...');
    const result = await client.create(doc);
    console.log(`Created document: ${result._id}`);
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
