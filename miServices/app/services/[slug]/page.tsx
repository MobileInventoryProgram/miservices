import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServiceBySlug, getAllServiceSlugs, urlFor } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import { FiCheckCircle, FiClipboard, FiShield, FiHome, FiKey, FiFileText, FiCamera, FiClock, FiTool, FiEye, FiAlertTriangle, FiUsers, FiLayers, FiTrendingUp } from 'react-icons/fi';
import JsonLd from '@/components/JsonLd';
import { FAQItem, ProcessStep } from '@/components/tenancy/TenancyPageComponents';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

// Static content for each service
const staticContent: Record<string, {
  featuresHeading: string;
  features: { icon: React.ReactNode; text: string }[];
  benefitsHeading: string;
  benefits: { icon: React.ReactNode; title: string; description: string }[];
  relatedServices: { slug: string; title: string; description: string }[];
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  prose?: {
    heading: string;
    intro: string;
    paragraphs: string[];
    image?: { src: string; alt: string };
  };
  processSteps?: { number: string; title: string; description: string }[];
  faqs?: { question: string; answer: string }[];
  whoUsesThis?: { href: string; title: string; description: string }[];
}> = {
  'pre-tenancy': {
    featuresHeading: 'What Happens During Pre-Tenancy',
    features: [
      { icon: <FiFileText className="w-6 h-6" />, text: 'Property documentation (inventory)' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety compliance checks' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key & access preparation' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Utility readings' },
      { icon: <FiHome className="w-6 h-6" />, text: 'Initial condition records' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Move-in readiness assessment' },
    ],
    benefitsHeading: 'Why Pre-Tenancy Matters',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Protects Deposits', description: 'Creates a clear baseline to resolve deposit disputes fairly at the end of tenancy' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Reduces Disputes', description: 'Clear documentation prevents misunderstandings between landlords and tenants' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Ensures Legal Compliance', description: 'Helps meet legal obligations for safety checks and property condition reporting' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Clear Baseline', description: 'Creates a comprehensive record for all future inspections and comparisons' },
    ],
    relatedServices: [
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Comprehensive property documentation with detailed condition records and high-quality photography' },
      { slug: 'check-ins', title: 'Check-In Services', description: 'Professional move-in inspections to verify property condition and ensure compliance' },
    ],
    ctaHeading: 'Ready to Prepare Your Property?',
    ctaDescription: 'Get professional pre-tenancy documentation and inspections to start your tenancy right',
    ctaButtonText: 'Book Pre-Tenancy Service',
    prose: {
      heading: 'What Happens Before a Tenancy Begins',
      intro: 'The pre-tenancy stage is one of the most important phases of any rental agreement. Before a tenant receives the keys, the property must be thoroughly documented, inspected for safety compliance, and prepared for occupation. This process creates a legally recognised baseline that protects both landlords and tenants throughout the tenancy and beyond.',
      paragraphs: [
        'A professional pre-tenancy inspection typically involves creating a detailed inventory report that records the condition of every room, fixture, fitting, and appliance. This inventory serves as the reference point for the entire tenancy — it is the document that deposit protection schemes such as the Tenancy Deposit Scheme (TDS), Deposit Protection Service (DPS), and mydeposits rely upon when adjudicating disputes at the end of a tenancy.',
        'Beyond documentation, the pre-tenancy stage includes essential safety compliance checks. Landlords have legal obligations to ensure that gas safety certificates are current, electrical installations have been inspected within the required timeframe, smoke and carbon monoxide alarms are fitted and working, and Energy Performance Certificates (EPCs) are in place. Failing to meet these requirements can result in penalties and may affect a landlord\'s ability to serve valid Section 21 notices.',
        'Key handover preparation, utility meter readings, and move-in readiness assessments complete the pre-tenancy process. When done properly, this groundwork prevents misunderstandings, reduces the likelihood of deposit disputes, and gives all parties confidence that the tenancy is starting on solid, well-documented foundations.',
      ],
      image: { src: '/stock_images/elegant_modern_prope_3e4b8cbe.jpg', alt: 'Modern property exterior prepared for new tenancy' },
    },
    processSteps: [
      { number: '1', title: 'Book Your Service', description: 'Schedule your pre-tenancy inspection online for a date before the tenancy start' },
      { number: '2', title: 'Property Inspection', description: 'Our trained clerk attends the property to document condition, take photos, and complete safety checks' },
      { number: '3', title: 'Report Produced', description: 'A comprehensive inventory and condition report is compiled and quality-checked' },
      { number: '4', title: 'Ready for Move-In', description: 'The report is delivered digitally, providing a clear baseline for the tenancy ahead' },
    ],
    faqs: [
      { question: 'Is a pre-tenancy inventory legally required?', answer: 'While there is no law that specifically mandates an inventory report, it is considered essential best practice. Without one, landlords have very limited ability to make deposit deductions at the end of a tenancy. Deposit protection schemes consistently advise that a detailed inventory is the single most important document in any deposit dispute, and adjudicators will typically side with the tenant if no inventory exists.' },
      { question: "What's included in a pre-tenancy inspection?", answer: 'A thorough pre-tenancy inspection covers the full condition of the property: room-by-room documentation of walls, floors, ceilings, windows, and doors; the condition of all fixtures, fittings, and appliances; high-resolution photographs; meter readings for gas, electricity, and water; key and access device inventories; smoke and carbon monoxide alarm checks; and any existing damage or maintenance issues.' },
      { question: 'Who pays for the inventory — landlord or tenant?', answer: 'The inventory is typically paid for by the landlord or the letting agent on behalf of the landlord. Under the Tenant Fees Act 2019 in England, tenants cannot be charged for inventory reports. This cost is considered part of the landlord\'s responsibility in setting up a tenancy properly.' },
      { question: 'How long does a pre-tenancy inspection take?', answer: 'The duration depends on the size and condition of the property. A standard one-bedroom flat typically takes around 45 minutes to an hour, while a larger three or four-bedroom house may take two to three hours. Furnished properties take longer than unfurnished ones due to the additional items that need documenting.' },
      { question: 'What happens if no inventory is done before move-in?', answer: "Without a pre-tenancy inventory, landlords have little evidence to support deposit deductions at the end of the tenancy. Deposit protection scheme adjudicators require clear, dated evidence of the property's condition at the start of the tenancy. Without this baseline, disputes almost always resolve in the tenant's favour, regardless of the actual condition of the property at check-out." },
    ],
    whoUsesThis: [
      { href: '/lettings-agents', title: 'Lettings Agents', description: 'Streamline tenancy onboarding with professional pre-tenancy documentation' },
      { href: '/property-managers', title: 'Property Managers', description: 'Consistent pre-tenancy standards across your entire portfolio' },
      { href: '/landlords', title: 'Landlords', description: 'Protect your investment with professional move-in preparation' },
    ],
  },
  'check-ins': {
    featuresHeading: "What's Included in a Check-In",
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Detailed condition comparison against inventory' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence of current state' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key handover and meter readings' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Tenant signature and acknowledgement' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety equipment verification' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Digital report delivery within 24 hours' },
    ],
    benefitsHeading: 'Why Professional Check-Ins Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Dispute Prevention', description: 'Clear documentation at move-in prevents disagreements at check-out' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Tenant Confidence', description: 'Professional process builds trust and sets expectations from day one' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Legal Protection', description: 'Impartial third-party evidence supports deposit claims if needed' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Complete Records', description: 'Comprehensive documentation for your property management files' },
    ],
    relatedServices: [
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Detailed property documentation to compare against at check-in' },
      { slug: 'check-outs', title: 'Check-Out Services', description: 'End of tenancy inspections to complete the tenancy cycle' },
    ],
    ctaHeading: 'Ready to Book a Check-In?',
    ctaDescription: 'Professional check-in services delivered by our nationwide network of trained operatives',
    ctaButtonText: 'Book Check-In Service',
    prose: {
      heading: 'What Is a Check-In?',
      intro: 'A check-in inspection confirms the property condition against the inventory at the moment tenants receive the keys. It includes safety checks, meter readings, and photographs to verify the move-in status. The check-in is a legally significant document — it establishes the agreed condition of the property at the start of the tenancy and becomes the benchmark against which any deposit deductions are measured at the end.',
      paragraphs: [
        "Without a proper check-in, landlords risk losing the ability to make legitimate deposit claims at the end of the tenancy. Deposit protection scheme adjudicators look for a signed or acknowledged check-in report as evidence that both parties agreed on the property's condition at the start. If no check-in was conducted, tenants can argue that any damage or issues were pre-existing.",
        'A check-in can be carried out as a standalone service or combined with the inventory itself — known as a combined inventory and check-in. The combined approach is common for new tenancies where the inventory has not yet been created, while a standalone check-in is used when an existing inventory simply needs to be verified against the current condition of the property.',
        "Tenants have the right to annotate the check-in report with their own observations, and it is good practice to encourage them to do so. Any notes the tenant adds — such as a scratch they noticed on a worktop or a stain on the carpet that was not recorded in the inventory — become part of the agreed record. This transparency benefits all parties and significantly reduces the potential for disputes later.",
      ],
      image: { src: '/stock_images/modern_bedroom_inter_d9a06b25.jpg', alt: 'Professional bedroom check-in inspection' },
    },
    processSteps: [
      { number: '1', title: 'Book Online', description: "Schedule the check-in for the tenant's move-in date at a convenient time" },
      { number: '2', title: 'Clerk Meets Tenant', description: 'Our trained clerk attends the property, walks through each room with the inventory, and records the condition' },
      { number: '3', title: 'Tenant Signs Off', description: 'The tenant reviews the report, adds any comments or observations, and acknowledges the record' },
      { number: '4', title: 'Report Delivered', description: 'The completed digital check-in report is delivered to all parties for their records' },
    ],
    faqs: [
      { question: "What's the difference between an inventory and a check-in?", answer: 'An inventory report documents the condition and contents of the property — it is the baseline record of what is in the property and what state it is in. A check-in is the process of verifying that baseline with the tenant on the day they move in, confirming that the property matches the inventory description. The inventory creates the record; the check-in confirms it.' },
      { question: 'Can a check-in be combined with the inventory?', answer: 'Yes. A combined inventory and check-in is common for new tenancies where the inventory has not yet been prepared. The clerk creates the inventory on the day of the check-in, and the tenant reviews and acknowledges it during the same visit. This is more efficient for new properties or when a previous inventory is outdated. For renewal tenancies, a standalone check-in against the existing inventory is usually sufficient.' },
      { question: 'What should tenants look for during check-in?', answer: 'Tenants should carefully check the condition of walls, floors, and ceilings for marks or damage; test all appliances and fixtures; check windows and doors open and close properly; inspect bathrooms for mould or sealant issues; and note any existing stains, scratches, or wear. Any discrepancies between the inventory and the actual condition of the property should be recorded on the check-in report before signing.' },
      { question: 'How quickly is the check-in report delivered?', answer: 'miServices typically delivers digital check-in reports within 24 to 48 hours of the inspection. The report is sent electronically to the agent, landlord, and tenant, and is also available through our digital reporting system. Urgent or same-day delivery can be arranged for time-sensitive tenancies.' },
      { question: 'What if the tenant finds issues not on the inventory?', answer: "If the tenant identifies issues that were not recorded on the original inventory — such as a mark on a wall or a damaged fitting — these observations should be added to the check-in report as tenant comments. This ensures the record accurately reflects the property's true condition at the start of the tenancy. Tenants are typically given a short window (often 7 days) to submit any additional observations after the check-in." },
    ],
    whoUsesThis: [
      { href: '/lettings-agents', title: 'Lettings Agents', description: 'Streamline your portfolio management with professional check-in services' },
      { href: '/property-managers', title: 'Property Managers', description: 'Consistent check-in quality across your entire portfolio' },
      { href: '/landlords', title: 'Landlords', description: 'Protect your investment with professional move-in documentation' },
    ],
  },
  'mid-tenancy': {
    featuresHeading: 'What We Inspect',
    features: [
      { icon: <FiHome className="w-6 h-6" />, text: 'General property condition' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Maintenance issues identification' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety compliance verification' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic documentation' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Tenant care assessment' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Detailed report with recommendations' },
    ],
    benefitsHeading: 'Why Mid-Tenancy Inspections Matter',
    benefits: [
      { icon: <FiEye className="w-12 h-12 text-brand-light-blue" />, title: 'Early Issue Detection', description: 'Identify maintenance problems before they become expensive repairs' },
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Compliance Assurance', description: 'Verify ongoing compliance with safety regulations and tenancy terms' },
      { icon: <FiHome className="w-12 h-12 text-brand-light-blue" />, title: 'Property Protection', description: 'Ensure your property is being maintained to expected standards' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Tenant Relations', description: 'Professional inspections maintain positive landlord-tenant relationships' },
    ],
    relatedServices: [
      { slug: 'property-visits', title: 'Property Visits', description: 'Regular routine checks between formal inspections' },
      { slug: 'check-outs', title: 'Check-Out Services', description: 'End of tenancy inspections when the tenant moves out' },
    ],
    ctaHeading: 'Schedule a Mid-Tenancy Inspection',
    ctaDescription: 'Keep your property protected with regular professional inspections',
    ctaButtonText: 'Book Mid-Tenancy Inspection',
    prose: {
      heading: 'Understanding Mid-Tenancy Inspections',
      intro: 'Mid-tenancy inspections — sometimes called routine property visits or periodic inspections — are carried out during an active tenancy to assess the condition of the property and identify any emerging issues. They serve as an early warning system that helps landlords and letting agents protect their investment while maintaining a positive relationship with tenants.',
      paragraphs: [
        "Most letting agents and experienced landlords schedule mid-tenancy visits every three to six months, though the frequency can vary depending on the property, the tenancy agreement, and the tenant's track record. The purpose is not to catch tenants out — it is to ensure the property is being maintained to a reasonable standard, to identify repairs before they escalate, and to check that safety equipment such as smoke alarms and carbon monoxide detectors remains functional.",
        'During a mid-tenancy inspection, a trained clerk or property inspector will walk through the property, noting its general condition, photographing any areas of concern, and recording maintenance requirements. They will check for signs of damp, mould, or condensation, confirm that ventilation is adequate, and look for any unauthorised alterations or occupancy changes. The findings are compiled into a structured report that is shared with the landlord or managing agent.',
        'It is important to understand the distinction between a routine property visit and a formal mid-tenancy inspection. A routine visit is typically a lighter-touch check conducted by the agent to confirm all is well, while a formal inspection produces a detailed, dated report with photographic evidence — similar in rigour to an inventory report. Both serve valuable purposes, but the formal inspection provides stronger evidence should issues need to be addressed later.',
      ],
      image: { src: '/stock_images/professional_propert_9156a3d3.jpg', alt: 'Professional property inspector conducting mid-tenancy inspection' },
    },
    processSteps: [
      { number: '1', title: 'Schedule Visit', description: 'Book a convenient date and notify the tenant with the required notice period' },
      { number: '2', title: 'Property Inspection', description: 'Our trained operative conducts a thorough walkthrough, checking condition and safety' },
      { number: '3', title: 'Report Compiled', description: 'Findings are documented with photographs and compiled into a clear, structured report' },
      { number: '4', title: 'Report Delivered', description: 'The digital report is delivered to the landlord or agent with any recommended actions' },
    ],
    faqs: [
      { question: 'How often should mid-tenancy inspections happen?', answer: "Most letting agents conduct mid-tenancy inspections every three to six months. The frequency depends on several factors including the condition of the property, the length of the tenancy, and the tenant's history. Some agents prefer quarterly visits for the first year and then move to six-monthly visits once a reliable track record has been established." },
      { question: 'Does the tenant have to be present during a mid-tenancy inspection?', answer: "Tenants do not have to be present, but many prefer to be. Landlords and agents must provide at least 24 hours' written notice before visiting (though 48 hours is considered best practice), and the visit must take place at a reasonable time of day. If the tenant is not available, the inspection can still go ahead provided proper notice has been given and access arrangements are in place." },
      { question: 'Can a tenant refuse a mid-tenancy inspection?', answer: 'Tenants have a right to quiet enjoyment of the property, and technically they can refuse entry. However, most tenancy agreements include a clause allowing the landlord or agent to conduct periodic inspections with reasonable notice. Persistent refusal may be a breach of the tenancy agreement. In practice, good communication and flexibility around scheduling usually resolves any reluctance.' },
      { question: 'What happens if damage is found during a mid-tenancy visit?', answer: 'If damage beyond fair wear and tear is identified, the findings are documented with photographs and included in the report. The landlord or agent can then raise the issue with the tenant, request that repairs are made, or arrange for professional maintenance. The mid-tenancy report serves as dated evidence that can be referenced later if the damage affects the deposit at the end of the tenancy.' },
      { question: 'Are mid-tenancy inspections a legal requirement?', answer: 'Mid-tenancy inspections are not a specific legal requirement, but landlords do have a general duty to maintain the property in a safe and habitable condition. Regular inspections are the most practical way to fulfil this obligation. Many letting agent professional bodies and landlord insurance policies recommend or require periodic property visits as part of good practice.' },
    ],
    whoUsesThis: [
      { href: '/lettings-agents', title: 'Lettings Agents', description: 'Outsource routine inspections while maintaining consistent reporting standards' },
      { href: '/property-managers', title: 'Property Managers', description: 'Manage large portfolios with scheduled mid-tenancy visits across multiple properties' },
      { href: '/landlords', title: 'Landlords', description: "Stay informed about your property's condition without conducting visits yourself" },
    ],
  },
  'check-outs': {
    featuresHeading: "What's Included in a Check-Out",
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Room-by-room condition comparison' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence of changes' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Fair wear and tear assessment' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Cleaning standards evaluation' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key return and meter readings' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Deposit recommendation summary' },
    ],
    benefitsHeading: 'Why Professional Check-Outs Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Deposit Clarity', description: 'Clear, evidence-based recommendations for deposit deductions' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Dispute Resolution', description: 'Impartial third-party evidence accepted by deposit schemes' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Fair Assessment', description: 'Professional distinction between damage and fair wear and tear' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Complete Documentation', description: 'Comprehensive report comparing start and end of tenancy' },
    ],
    relatedServices: [
      { slug: 'check-ins', title: 'Check-In Services', description: 'Start the next tenancy with professional move-in documentation' },
      { slug: 'end-tenancy', title: 'End-Tenancy Services', description: 'Complete end of tenancy management and reporting' },
    ],
    ctaHeading: 'Book Your Check-Out Inspection',
    ctaDescription: 'Professional check-out services to protect deposits and resolve disputes fairly',
    ctaButtonText: 'Book Check-Out Service',
    ctaSecondaryText: 'View Sample Reports',
    ctaSecondaryHref: '/sample-documents',
    prose: {
      heading: 'What Is a Check-Out Inspection?',
      intro: 'A check-out inspection is the final property assessment at the end of a tenancy. It documents the property condition, compares it against the original inventory, and provides evidence for fair deposit negotiations and dispute resolution. The check-out report is the most important document in determining how the deposit is divided between landlord and tenant.',
      paragraphs: [
        'The comparison methodology used in a professional check-out is systematic and thorough. Each room is assessed against its description in the original inventory, with the clerk noting where the condition has changed, whether those changes constitute fair wear and tear or damage, and what remedial work (if any) may be required. High-resolution photographs are taken alongside the inventory photographs for direct visual comparison.',
        'Cleaning standards are a frequent area of dispute at the end of a tenancy. A professional check-out report will assess cleaning against the standard recorded at check-in — not against an arbitrary "professional clean" standard. If the property was not professionally cleaned at the start of the tenancy, a landlord generally cannot require it to be professionally cleaned at the end. Our clerks are trained to apply this principle fairly and consistently.',
        'A report that is "dispute-ready" means it contains sufficient detail, photographic evidence, and objective commentary to withstand scrutiny by a deposit protection scheme adjudicator. This includes clear descriptions of changes, appropriate fair wear and tear concessions, and a professional, impartial tone. Landlords are required to return the deposit (or propose deductions) within a reasonable timeframe — typically 10 working days — and the check-out report is the foundation for that process.',
      ],
      image: { src: '/stock_images/clean_empty_kitchen_1910f773.jpg', alt: 'Clean kitchen check-out inspection' },
    },
    processSteps: [
      { number: '1', title: 'Book Check-Out', description: "Schedule the inspection for the tenant's move-out date or as soon after as possible" },
      { number: '2', title: 'Condition Compared', description: 'Our clerk walks through the property with the original inventory, noting all changes room by room' },
      { number: '3', title: 'Report Compiled', description: 'A detailed comparison report is produced with photographs, fair wear and tear notes, and cleaning assessments' },
      { number: '4', title: 'Deposit Clarity', description: 'The completed report is delivered to support fair, evidence-based deposit negotiations' },
    ],
    faqs: [
      { question: 'How is the check-out compared to the inventory?', answer: 'The check-out clerk works through the property room by room using the original inventory and check-in report as a reference. For each item — walls, floors, fixtures, fittings, appliances, and furnishings — the clerk records the current condition and notes any changes from the original description. Photographs are taken alongside the original images for direct comparison. The resulting report provides a clear, side-by-side record of the property at the start and end of the tenancy.' },
      { question: 'What counts as damage vs fair wear and tear?', answer: 'Fair wear and tear is the natural deterioration that occurs through normal everyday use — for example, light scuff marks on skirting boards, slight carpet wear in hallways, or minor fading of curtains. Damage, by contrast, results from negligence, misuse, or failure to maintain — such as large holes in walls, cigarette burns, pet damage, or heavy staining. The distinction depends on factors including the age and quality of the item, the length of the tenancy, and the number of occupants.' },
      { question: 'How soon after move-out should the check-out happen?', answer: 'Ideally, the check-out should take place on the day the tenant vacates or within 24 hours. The sooner the inspection is conducted, the more accurate the record — and the harder it is for either party to dispute the findings. If there is a gap between the tenant leaving and the check-out, any changes to the property during that time (such as cleaning or repairs carried out by the landlord) could complicate the record.' },
      { question: 'Can the landlord do the check-out themselves?', answer: 'Landlords can conduct their own check-out, but this approach carries significant risks. Deposit protection scheme adjudicators place far greater weight on reports produced by independent, professional inspectors. A self-conducted check-out is often challenged on the grounds of bias, as the landlord has a direct financial interest in the outcome. For this reason, most letting agents and experienced landlords use an independent third-party service.' },
      { question: 'How does the check-out support deposit claims?', answer: "The check-out report is the primary evidence used in deposit negotiations and disputes. It provides a dated, photographic record of the property's condition at the end of the tenancy, compared against the condition at the start. If the landlord proposes deductions, the check-out report must demonstrate that the damage or issues go beyond fair wear and tear and that the tenant is liable. Without a professional check-out, landlords have very limited evidence to support their claims." },
    ],
    whoUsesThis: [
      { href: '/lettings-agents', title: 'Lettings Agents', description: 'Professional end-of-tenancy reporting for smooth deposit negotiations' },
      { href: '/property-managers', title: 'Property Managers', description: 'Portfolio-wide check-out services with consistent standards' },
      { href: '/landlords', title: 'Landlords', description: 'Protect your deposit with independent, evidence-based inspections' },
    ],
  },
  'inventory-reports': {
    featuresHeading: "What's Included",
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Room-by-room detailed inventory' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'High-resolution photography' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Condition ratings and descriptions' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Fixture and fitting documentation' },
      { icon: <FiHome className="w-6 h-6" />, text: 'Meter readings and key counts' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Digital delivery within 24-48 hours' },
    ],
    benefitsHeading: 'Why Professional Inventories Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Deposit Protection', description: 'Essential evidence for deposit dispute resolution with schemes' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Impartial Record', description: 'Third-party documentation accepted by courts and adjudicators' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Legal Compliance', description: 'Meet your obligations under deposit protection legislation' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Professional Standards', description: 'Consistent quality from our network of trained inventory clerks' },
    ],
    relatedServices: [
      { slug: 'check-ins', title: 'Check-In Services', description: 'Use the inventory as the basis for move-in inspections' },
      { slug: 'check-outs', title: 'Check-Out Services', description: 'Compare end-of-tenancy condition against the inventory' },
    ],
    ctaHeading: 'Get Your Inventory Report',
    ctaDescription: 'Professional inventory services delivered fast by our nationwide network',
    ctaButtonText: 'Book Inventory Report',
    prose: {
      heading: 'What Is an Inventory Report?',
      intro: 'An inventory report is a professional document that records the full condition and contents of a rental property before move-in. It provides evidence for deposit disputes, ensures transparency, and protects all parties by creating a legally recognised baseline. The inventory is widely considered the most important document in any tenancy — it is the foundation upon which all future condition comparisons and deposit decisions are made.',
      paragraphs: [
        'A comprehensive inventory follows the standards set by professional bodies such as the Association of Independent Inventory Clerks (AIIC). This means recording not just what is present in each room, but the specific condition of every item — noting marks, wear, stains, and any pre-existing damage with clear descriptions and supporting photographs. The level of detail matters: the more precise the inventory, the stronger the evidence in any future dispute.',
        'There are important differences between furnished and unfurnished inventories. A furnished property requires significantly more detailed documentation because every item of furniture, soft furnishing, kitchenware, and decoration needs to be individually recorded and assessed. An unfurnished inventory focuses primarily on the fixed elements — walls, floors, ceilings, doors, windows, fitted appliances, and bathroom suites — but must still be thorough in recording their condition.',
        'Digital reporting offers substantial advantages over traditional paper-based inventories. Digital reports are timestamped, searchable, easy to share between parties, and can include unlimited photographs embedded directly alongside their descriptions. They are also more difficult to tamper with, which strengthens their credibility in deposit disputes. miServices delivers all reports digitally through our integrated platform, ensuring fast turnaround and secure storage.',
      ],
      image: { src: '/stock_images/modern_living_room_i_0f00951f.jpg', alt: 'Professional living room inventory inspection' },
    },
    processSteps: [
      { number: '1', title: 'Book Online', description: 'Choose a convenient date and time for your property inspection' },
      { number: '2', title: 'Clerk Attends', description: 'Our trained operative conducts a thorough property inspection' },
      { number: '3', title: 'Quality Check', description: 'Report is produced and quality checked by our team' },
      { number: '4', title: 'Report Delivered', description: 'Final digital report delivered quickly to your inbox' },
    ],
    faqs: [
      { question: 'What does an inventory report include?', answer: "A professional inventory report includes a room-by-room assessment of the property's condition, covering walls, floors, ceilings, doors, and windows; the state of all fixtures, fittings, and appliances; descriptions and photographs of furnishings (in furnished properties); meter readings for gas, electricity, and water; a record of all keys and access devices; smoke and carbon monoxide alarm checks; and any notes about existing damage, maintenance issues, or cleanliness." },
      { question: 'How long does an inventory take to complete?', answer: 'The time required depends on the size, type, and condition of the property. A one-bedroom unfurnished flat typically takes around 45 minutes, while a three-bedroom furnished house may take two to three hours. Properties with extensive furnishings, multiple storage areas, or outdoor spaces will take longer. The written report is then compiled and quality-checked before delivery, which is typically within 24 to 48 hours.' },
      { question: 'Is an inventory report legally required?', answer: 'There is no specific law mandating an inventory report for private residential tenancies. However, it is strongly recommended by all three government-approved deposit protection schemes (TDS, DPS, and mydeposits) and is considered essential best practice. Without an inventory, landlords have very limited evidence to support deposit deductions, and adjudicators will almost always find in favour of the tenant if no inventory exists.' },
      { question: "What's the difference between furnished and unfurnished inventories?", answer: "A furnished inventory is more detailed and takes longer to complete because it must record every item of furniture, soft furnishing, kitchenware, linen, decoration, and other moveable content — including the condition of each individual item. An unfurnished inventory focuses on the fixed elements of the property: walls, floors, ceilings, fitted kitchens, bathrooms, built-in wardrobes, and any appliances included with the property. Both types require the same rigour in condition descriptions and photography." },
      { question: 'How are inventory reports used in deposit disputes?', answer: 'In a deposit dispute, the inventory report is compared against the check-out report to determine what has changed during the tenancy. Adjudicators look at the descriptions and photographs from both reports to assess whether changes constitute fair wear and tear or damage caused by the tenant. The quality and detail of the inventory is often the deciding factor — a vague or incomplete inventory gives the landlord very little to work with, while a thorough, well-photographed report provides strong evidence.' },
      { question: 'Can I use my own photos instead of an inventory?', answer: 'While personal photographs are better than nothing, they are not a substitute for a professional inventory report. Adjudicators at deposit protection schemes look for structured, dated documentation that systematically records the condition of every area and item in the property. Informal photos lack the context, descriptions, and systematic approach that give inventory reports their evidential weight. A professional inventory also carries more credibility because it is produced by an independent third party with no financial interest in the outcome.' },
    ],
    whoUsesThis: [
      { href: '/lettings-agents', title: 'Lettings Agents', description: 'Streamline your portfolio management with professional inventory services' },
      { href: '/property-managers', title: 'Property Managers', description: 'Portfolio-wide reporting with consistent quality standards' },
      { href: '/landlords', title: 'Landlords', description: 'Protect your investment with detailed property documentation' },
    ],
  },
  'property-visits': {
    featuresHeading: 'What We Check',
    features: [
      { icon: <FiHome className="w-6 h-6" />, text: 'General property condition' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Maintenance requirements' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety equipment checks' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Tenant compliance verification' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Actionable recommendations' },
    ],
    benefitsHeading: 'Why Regular Property Visits Matter',
    benefits: [
      { icon: <FiEye className="w-12 h-12 text-brand-light-blue" />, title: 'Proactive Management', description: 'Identify issues before they become costly problems' },
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Compliance Monitoring', description: 'Ensure ongoing adherence to tenancy terms and regulations' },
      { icon: <FiHome className="w-12 h-12 text-brand-light-blue" />, title: 'Asset Protection', description: 'Regular oversight helps maintain property value' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Peace of Mind', description: 'Professional reports keep you informed about your property' },
    ],
    relatedServices: [
      { slug: 'mid-tenancy', title: 'Mid-Tenancy Inspections', description: 'More detailed formal inspections during the tenancy' },
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Comprehensive property documentation for comparison' },
    ],
    ctaHeading: 'Schedule a Property Visit',
    ctaDescription: 'Regular property visits to keep you informed and your investment protected',
    ctaButtonText: 'Book Property Visit',
  },
  'block-management': {
    featuresHeading: 'Our Block Management Services',
    features: [
      { icon: <FiLayers className="w-6 h-6" />, text: 'Multi-unit inspection coordination' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Communal area assessments' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Health & safety compliance checks' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic documentation' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Consolidated reporting' },
      { icon: <FiTrendingUp className="w-6 h-6" />, text: 'Portfolio-wide consistency' },
    ],
    benefitsHeading: 'Why Choose miServices for Block Management',
    benefits: [
      { icon: <FiUsers className="w-12 h-12 text-brand-light-blue" />, title: 'Nationwide Coverage', description: 'Consistent service quality across all your properties, wherever they are' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Standardised Reporting', description: 'Uniform report formats for easy comparison across your portfolio' },
      { icon: <FiTrendingUp className="w-12 h-12 text-brand-light-blue" />, title: 'Scalable Service', description: 'From single blocks to large portfolios, we scale with your needs' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Reliable Scheduling', description: 'Dependable inspection schedules that fit your management calendar' },
    ],
    relatedServices: [
      { slug: 'property-visits', title: 'Property Visits', description: 'Individual unit inspections within your blocks' },
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Detailed unit documentation for tenancy management' },
    ],
    ctaHeading: 'Partner With miServices',
    ctaDescription: 'Reliable block management inspection services for your entire portfolio',
    ctaButtonText: 'Discuss Your Requirements',
  },
  'end-tenancy': {
    featuresHeading: 'End-Tenancy Process',
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Final condition assessment' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Comprehensive photography' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Inventory comparison report' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Damage vs wear assessment' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key collection and meters' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Deposit recommendations' },
    ],
    benefitsHeading: 'Why Professional End-Tenancy Services Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Deposit Resolution', description: 'Clear evidence for fair deposit allocation between parties' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Scheme Compliance', description: 'Reports accepted by all major deposit protection schemes' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Fair Assessment', description: 'Impartial evaluation distinguishing damage from normal wear' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Complete Record', description: 'Full documentation closing out the tenancy professionally' },
    ],
    relatedServices: [
      { slug: 'check-outs', title: 'Check-Out Services', description: 'Detailed check-out inspections as part of the end-tenancy process' },
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Start the next tenancy with fresh property documentation' },
    ],
    ctaHeading: 'Book End-Tenancy Services',
    ctaDescription: 'Professional end-tenancy management to close out tenancies smoothly',
    ctaButtonText: 'Book End-Tenancy Service',
    prose: {
      heading: 'The End-of-Tenancy Process Explained',
      intro: "The end of a tenancy is the point at which the property's condition is formally assessed and compared to the baseline established at check-in. This process determines whether the deposit is returned in full, whether deductions are justified, and — if there is a disagreement — what evidence is available to support either side. Getting this stage right is essential for fair outcomes and efficient property turnarounds.",
      paragraphs: [
        'A professional end-of-tenancy check-out should ideally take place on the day the tenant vacates, or as close to that date as possible. The inspector compares the current condition of the property against the original inventory and check-in report, noting any changes room by room. This includes the condition of walls, floors, and ceilings; the state of fixtures, fittings, and appliances; cleaning standards; and any missing or damaged items.',
        'One of the most common areas of dispute at end of tenancy is the distinction between fair wear and tear and actual damage. Fair wear and tear refers to the natural deterioration that occurs through normal, everyday use of a property — for example, slight fading of paintwork, minor scuff marks on walls, or light carpet wear in high-traffic areas. Damage, by contrast, is deterioration caused by negligence, misuse, or abuse. A professional inspector is trained to make this distinction objectively and to document their assessment with supporting photographs.',
        'If there is a disagreement about the deposit, the check-out report becomes the primary piece of evidence submitted to the relevant deposit protection scheme. In England and Wales, all tenancy deposits must be registered with one of three government-approved schemes: the Tenancy Deposit Scheme (TDS), the Deposit Protection Service (DPS), or mydeposits. Each scheme offers a free alternative dispute resolution (ADR) service, and adjudicators rely heavily on the quality and detail of the check-out report when making their decision.',
      ],
      image: { src: '/stock_images/modern_luxury_kitche_2302410a.jpg', alt: 'Clean modern kitchen at end of tenancy' },
    },
    processSteps: [
      { number: '1', title: 'Book Check-Out', description: 'Schedule the inspection for the day the tenant vacates or as close as possible' },
      { number: '2', title: 'Condition Assessed', description: "Our clerk compares the property's current state against the original inventory and check-in report" },
      { number: '3', title: 'Report Produced', description: 'A detailed comparison report is compiled with photographs and fair wear and tear assessments' },
      { number: '4', title: 'Deposit Resolution', description: 'The report supports fair deposit negotiations or provides evidence for formal dispute resolution' },
    ],
    faqs: [
      { question: 'What is fair wear and tear?', answer: 'Fair wear and tear refers to the natural and reasonable deterioration of a property that occurs through normal, everyday use. Examples include slight fading of paint or wallpaper due to sunlight, light scuffing on floors in high-traffic areas, and minor marks on walls from everyday living. It does not include damage caused by negligence, misuse, or failure to maintain the property — such as large holes in walls, burn marks, or stained carpets from spills that were not cleaned.' },
      { question: 'How long after the tenancy ends can deposit deductions be made?', answer: "There is no specific legal deadline for proposing deductions, but best practice is to raise any proposed deductions within 10 working days of the tenancy ending. The deposit protection schemes require that the deposit is returned or a dispute raised within the scheme's prescribed timescales. If the landlord and tenant cannot agree, either party can raise a dispute with the scheme, which will then adjudicate based on the evidence provided." },
      { question: 'What if the tenant disagrees with the check-out report?', answer: 'If the tenant disagrees with the check-out findings or the proposed deposit deductions, they can raise a dispute with the deposit protection scheme that holds their deposit. The scheme will review the evidence — including the inventory, check-in report, check-out report, and any supporting photographs — and make a binding decision. Having a professional, impartial check-out report significantly helps ensure a fair outcome.' },
      { question: 'Do I need a professional check-out or can I do it myself?', answer: "While landlords and agents can conduct their own check-out, a professional third-party inspection carries significantly more weight in deposit disputes. Adjudicators at deposit protection schemes place greater trust in reports produced by independent, trained inspectors who have no financial interest in the outcome. Self-conducted check-outs are often challenged on the grounds of bias." },
      { question: 'How does the deposit dispute process work?', answer: 'If there is a disagreement about deposit deductions, either the landlord or tenant can raise a dispute with the deposit protection scheme (TDS, DPS, or mydeposits). The adjudicator reviews all evidence submitted by both parties — typically the inventory, check-in report, check-out report, photographs, receipts for repairs or cleaning, and any relevant correspondence. The adjudicator makes a decision on how the deposit should be divided, and this decision is binding on both parties.' },
    ],
    whoUsesThis: [
      { href: '/lettings-agents', title: 'Lettings Agents', description: 'Professional end-of-tenancy reporting for smooth deposit negotiations' },
      { href: '/property-managers', title: 'Property Managers', description: 'Portfolio-wide end-of-tenancy services with consistent standards' },
      { href: '/landlords', title: 'Landlords', description: 'Protect your deposit with independent, evidence-based inspections' },
    ],
  },
};

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  // Include static fallbacks
  const staticSlugs = Object.keys(staticContent);
  const allSlugs = Array.from(new Set([...slugs, ...staticSlugs]));
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  const content = staticContent[params.slug];

  if (!service && !content) {
    return { title: 'Service Not Found' };
  }

  const title = service?.title || params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const metaTitle = service?.seo?.metaTitle || `${title} | miServices`;
  const metaDescription = service?.seo?.metaDescription || service?.heroDescription || `Professional ${title.toLowerCase()} from miServices. Nationwide coverage, fast turnaround, quality reports.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: service?.seo?.keywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${BASE_URL}/services/${params.slug}`,
      siteName: 'miServices',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
    alternates: {
      canonical: `${BASE_URL}/services/${params.slug}`,
    },
  };
}

export const revalidate = 60;

export default async function ServicePage({ params }: Props) {
  const service = await getServiceBySlug(params.slug);
  const content = staticContent[params.slug];

  if (!content) {
    notFound();
  }

  const title = service?.title || params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const heroDescription = service?.heroDescription || 'Professional property inspection services delivered by our nationwide network of trained operatives.';

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description: heroDescription,
    provider: {
      '@type': 'Organization',
      name: 'miServices',
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
    serviceType: title,
    url: `${BASE_URL}/services/${params.slug}`,
  };

  // Build FAQ schema if FAQs exist
  const faqSchema = content.faqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen">
      <JsonLd data={serviceSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">{title}</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Prose Section — static longform content */}
      {content.prose && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">
              {content.prose.heading}
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-8">
              {content.prose.intro}
            </p>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {content.prose.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
              </div>
              {content.prose.image && (
                <div className="relative">
                  <Image
                    src={content.prose.image.src}
                    alt={content.prose.image.alt}
                    width={800}
                    height={600}
                    className="rounded-xl shadow-lg border-4 border-brand-light-blue/20 w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Body Content Section - from CMS (fallback if no static prose) */}
      {!content.prose && service?.bodyHeading && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">
              {service.bodyHeading}
            </h2>
            {service.bodyIntro && (
              <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-12">
                {service.bodyIntro}
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {service.bodySubheading && (
                  <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">
                    {service.bodySubheading}
                  </h3>
                )}
                {service.bodyText && (
                  <div className="text-gray-700 leading-relaxed prose prose-lg">
                    <PortableText value={service.bodyText} />
                  </div>
                )}
              </div>
              {service.bodyImage?.asset && (
                <div className="relative">
                  <Image
                    src={urlFor(service.bodyImage).width(800).height(600).url()}
                    alt={service.bodyImage.alt || `${service.title} service`}
                    width={800}
                    height={600}
                    className="rounded-xl shadow-lg border-4 border-brand-light-blue/20 w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">
            {content.featuresHeading}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, idx) => (
              <div key={idx} className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-brand-light-blue mt-1 mr-3 flex-shrink-0">
                  {feature.icon}
                </div>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      {content.processSteps && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {content.processSteps.map((step) => (
                <ProcessStep key={step.number} number={step.number} title={step.title} description={step.description} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">
            {content.benefitsHeading}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {content.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg hover:shadow-lg transition-all">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {content.faqs && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-brand-dark-blue font-helvetica text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              {content.faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who Uses This Service */}
      {content.whoUsesThis && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Who Uses This Service</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {content.whoUsesThis.map((user) => (
                <Link key={user.href} href={user.href} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
                  <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">{user.title}</h3>
                  <p className="text-gray-600">{user.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Related Services</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {content.relatedServices.map((related) => (
              <Link
                key={related.slug}
                href={`/services/${related.slug}`}
                className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group"
              >
                <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">
                  {related.title}
                </h3>
                <p className="text-gray-600 mb-4">{related.description}</p>
                <span className="text-brand-light-blue font-bold group-hover:underline">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">{content.ctaHeading}</h2>
          <p className="text-xl mb-8 opacity-95">{content.ctaDescription}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              {content.ctaButtonText}
            </Link>
            <Link
              href={content.ctaSecondaryHref || '/our-network'}
              className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
            >
              {content.ctaSecondaryText || 'Find Your Local Operative'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
