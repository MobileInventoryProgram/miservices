import type { SeedHelpArticle } from './types';

const HB = 'employee-handbook';
const VR = 'company-vehicle-rules';
const ED = 'issuing-employment-documentation';
const SA = 'staff-appraisal';
const EQ = 'equality-diversity-and-inclusion-policy';

export const PEOPLE_ARTICLES: SeedHelpArticle[] = [
  // ─── Staff, HR & pay ──────────────────────────────────────────────
  {
    id: 'hr-holiday-entitlement',
    topic: 'staff-hr',
    question: "How many days' holiday do I get?",
    answer: [
      'Your annual holiday entitlement is shown in your individual Statement of Main Terms of Employment (Form SMT). Your entitlement to public/bank holidays is shown there too.',
      'Holiday pay is at your normal basic pay unless your Statement of Main Terms says otherwise. You can view your holiday entitlement online at any time in BrightHR.',
    ],
    keywords: ['annual leave', 'days off', 'bank holidays', 'holiday pay', 'SMT', 'allowance'],
    sources: [
      { doc: HB, heading: 'Annual Holidays' },
      { doc: HB, heading: 'Public/Bank Holidays' },
    ],
  },
  {
    id: 'hr-booking-holiday',
    topic: 'staff-hr',
    question: 'How do I book holiday, and how much notice do I need to give?',
    answer: [
      'Holidays are booked online through BrightHR. Once you have registered your request you will receive an email from a Manager authorising or declining it.',
      "- Give at least four weeks' notice for holidays of a week or more.\n- Give one week's notice for odd single days.\n- You may not normally take more than two working weeks consecutively.",
      'Holiday dates are normally allocated on a "first come - first served" basis while keeping appropriate staffing levels. If you feel a request has been unreasonably refused, refer the matter to a Manager.',
    ],
    keywords: ['BrightHR', 'annual leave request', 'time off', 'book leave', 'refused holiday'],
    sources: [{ doc: HB, heading: 'Annual Holidays' }],
  },
  {
    id: 'hr-holiday-carry-over',
    topic: 'staff-hr',
    question: 'Can I carry over holiday I haven\'t used, and do I need to save days for Christmas?',
    answer: [
      'No. Holidays cannot be carried forward, and no payment is made for untaken holiday except when your employment ends. You are encouraged to take all of your entitlement in the current holiday year.',
      'You must reserve enough days from your annual entitlement to cover the Christmas/New Year shut-down. If you have not accrued enough holiday to cover it, you will be given unpaid leave of absence.',
    ],
    keywords: ['carry forward', 'unused leave', 'payment in lieu', 'Christmas shutdown', 'New Year'],
    sources: [{ doc: HB, heading: 'Annual Holidays' }],
  },
  {
    id: 'hr-reporting-sickness',
    topic: 'staff-hr',
    question: "What do I do if I'm too ill to come to work?",
    answer: [
      'Let us know on the first day of absence at the earliest opportunity and no later than 8.30 am. Notify us by telephone; texts and emails are also acceptable. Other than in exceptional circumstances, you should tell a Manager personally.',
      'Try to give an idea of when you expect to return, and tell us as soon as possible if that changes. Follow this procedure on each day of absence unless you are covered by a medical certificate.',
      'If you are off for more than seven calendar days, you need to update us on your continued absence once a week after that, unless otherwise agreed.',
    ],
    keywords: ['off sick', 'ill', 'calling in sick', 'absence', 'sickness reporting', '8.30'],
    sources: [{ doc: HB, heading: 'Notification of Incapacity for Work' }],
  },
  {
    id: 'hr-sick-note',
    topic: 'staff-hr',
    question: "When do I need a doctor's note for sickness?",
    answer: [
      'For absences of up to and including seven calendar days, you do not need a medical certificate. Instead you sign a self-certification absence form when you return to work.',
      'If your sickness has lasted (or you know it will last) longer than seven days, whether or not they are working days, see your doctor, get a medical certificate and send it to us without delay. After that you must send consecutive medical certificates covering the whole of your absence.',
    ],
    keywords: ['fit note', 'medical certificate', 'self-certification', 'self cert', 'sick note', 'GP'],
    sources: [{ doc: HB, heading: 'Evidence of Incapacity' }],
  },
  {
    id: 'hr-return-to-work',
    topic: 'staff-hr',
    question: 'What happens when I come back to work after being off sick?',
    answer: [
      'After any sickness or injury absence (including absence covered by a medical certificate) you must complete a self-certification absence form and hand it to a Manager.',
      'You may be asked to attend a "return to work" interview to discuss your health and fitness for work. Information from that interview is treated in the strictest confidence.',
      'If you have had an infectious or contagious illness such as rubella or hepatitis, you must not report for work without clearance from your own doctor. If your return date changes from the one you gave, tell a Manager as soon as you know.',
    ],
    keywords: ['return to work interview', 'back from sick', 'self-certification form', 'infectious', 'contagious'],
    sources: [{ doc: HB, heading: 'Return to Work' }],
  },
  {
    id: 'hr-sickness-absence-levels',
    topic: 'staff-hr',
    question: 'Can someone be disciplined for being off sick a lot?',
    answer: [
      'A medical certificate or self-certification form gives the reason for an absence, but it may not always be regarded as enough to justify it. Continual or repeated absence through sickness may not be acceptable.',
      'When deciding whether absence is acceptable, the reasons for and extent of all absences are taken into account. Sickness or injury leave that is not genuine is taken seriously and will result in disciplinary action. If necessary, you may be asked for permission to contact your doctor and/or to be independently medically examined.',
    ],
    keywords: ['frequent absence', 'repeated sickness', 'attendance', 'medical examination', 'fake sick'],
    sources: [{ doc: HB, heading: 'General' }],
  },
  {
    id: 'hr-pay-date',
    topic: 'staff-hr',
    question: 'When do I get paid?',
    answer: [
      'For salaried staff the pay period is the calendar month, and basic salaries are paid on the last day of the month.',
      'You will receive a payslip showing how your pay has been calculated and any deductions (e.g. Income Tax, National Insurance). Raise any pay queries with a Manager.',
      'At the end of each tax year you will be given a P60 showing your total pay and deductions for the year, and you may also be given a P11D showing non-salary benefits. Keep these somewhere safe.',
    ],
    keywords: ['payday', 'salary', 'wages', 'payslip', 'P60', 'P11D'],
    sources: [
      { doc: HB, heading: 'Administration' },
      { doc: HB, heading: 'Income Tax and National Insurance' },
    ],
  },
  {
    id: 'hr-overpayment',
    topic: 'staff-hr',
    question: "What happens if I've been overpaid?",
    answer: [
      'The full overpayment will normally be deducted from your next payment. If that would cause hardship, arrangements may be made to recover it over a longer period.',
    ],
    keywords: ['overpaid', 'paid too much', 'wages error', 'deduction', 'repay'],
    sources: [{ doc: HB, heading: 'Overpayments' }],
  },
  {
    id: 'hr-pension',
    topic: 'staff-hr',
    question: 'Is there a workplace pension?',
    answer: [
      'Yes. There is a contributory pension scheme which you will be auto-enrolled into (subject to the conditions of the scheme). It lets you save for retirement using your own money, together with tax relief and contributions from the Company. Further details are available separately.',
    ],
    keywords: ['auto-enrolment', 'retirement', 'pension contributions', 'workplace pension'],
    sources: [{ doc: HB, heading: 'Pension Scheme' }],
  },
  {
    id: 'hr-lateness',
    topic: 'staff-hr',
    question: 'What happens if I am late for work?',
    answer: [
      'You must attend work punctually at the specified time(s) and comply strictly with any time recording procedures. All absences must be reported using the sickness reporting procedure.',
      'Lateness or absence may result in disciplinary action and/or loss of appropriate payment. Persistent absenteeism and/or lateness is listed as an example of conduct that can lead to disciplinary action.',
    ],
    keywords: ['late', 'timekeeping', 'punctuality', 'absenteeism', 'time recording'],
    sources: [
      { doc: HB, heading: 'Lateness/Absenteeism' },
      { doc: HB, heading: 'Disciplinary Rules' },
    ],
  },
  {
    id: 'hr-medical-appointments',
    topic: 'staff-hr',
    question: 'Can I have time off for a doctor or dentist appointment?',
    answer: [
      'Where possible, make medical/dental appointments outside normal working hours. If that is not possible, time off may be granted at the discretion of a Manager and will normally be without pay.',
      'You should provide proof of the appointment to a Manager.',
    ],
    keywords: ['dentist', 'doctor appointment', 'hospital appointment', 'unpaid time off'],
    sources: [{ doc: HB, heading: 'Time Off' }],
  },
  {
    id: 'hr-dependants-leave',
    topic: 'staff-hr',
    question: 'Can I take time off to look after a dependant in an emergency?',
    answer: [
      'You may be entitled to take a reasonable amount of unpaid time off during working hours to take action that is necessary to help your dependants. Discuss your situation with a Manager, who will agree the necessary time off if appropriate.',
    ],
    keywords: ['dependants', 'childcare emergency', 'family emergency', 'carer', 'unpaid leave'],
    sources: [{ doc: HB, heading: 'Time Off for Dependants' }],
  },
  {
    id: 'hr-bereavement-leave',
    topic: 'staff-hr',
    question: 'How much bereavement leave can I have?',
    answer: [
      'There are no fixed rules for bereavement time off, because reactions vary greatly with individual circumstances. Discuss your circumstances with a Manager and agree appropriate time off.',
      'Any agreed time off is discretionary and will normally be without pay.',
    ],
    keywords: ['compassionate leave', 'funeral', 'death in the family', 'bereavement'],
    sources: [{ doc: HB, heading: 'Bereavement Leave' }],
  },
  {
    id: 'hr-family-leave',
    topic: 'staff-hr',
    question: 'What do I do about maternity, paternity, adoption or shared parental leave?',
    answer: [
      'You may be entitled to maternity/paternity/adoption leave and pay in line with the current statutory provisions. If you (or your partner) become pregnant, or you are notified of a match date for adoption, tell a Manager at an early stage so your entitlements and obligations can be explained.',
      'For parental or shared parental leave, discuss your needs with a Manager, who will identify your entitlements and look at the proposed leave periods.',
    ],
    keywords: ['pregnant', 'maternity leave', 'paternity leave', 'adoption', 'shared parental leave', 'baby'],
    sources: [
      { doc: HB, heading: 'Maternity/Paternity/Adoption Leave and Pay' },
      { doc: HB, heading: 'Parental/Shared Parental Leave' },
    ],
  },
  {
    id: 'hr-travel-expenses',
    topic: 'staff-hr',
    question: 'How do I claim travel expenses?',
    answer: [
      'Reasonable expenses incurred while travelling on company business are reimbursed. You must provide receipts for any expenditure.',
      'Fill in the provided expense form and submit it for approval on a monthly basis.',
    ],
    keywords: ['expenses claim', 'reimbursement', 'receipts', 'expense form', 'mileage'],
    sources: [{ doc: HB, heading: 'Travel Expenses' }],
  },
  {
    id: 'hr-bad-weather',
    topic: 'staff-hr',
    question: "What if I can't get to work because of bad weather or travel disruption?",
    answer: [
      'Every reasonable effort should be made to attend work. If you cannot, report your absence through the normal absence reporting procedure.',
      'If you have enough annual leave you may request to use it. Otherwise, absence due to adverse weather will ordinarily be unpaid.',
    ],
    keywords: ['snow', 'weather', 'train strike', 'travel disruption', 'cannot get in'],
    sources: [{ doc: HB, heading: 'Inclement Weather/Travel Arrangement Disruption' }],
  },
  {
    id: 'hr-second-job',
    topic: 'staff-hr',
    question: 'Can I have a second job or do private work on the side?',
    answer: [
      'You must discuss any proposal to take up other employment or separate business interests with a Manager first, giving full details. Working hours; competition, reputation and credibility; conflict of interest; and health, safety and welfare will be considered. You will be told the decision in writing, and consent may be refused. Working without consent could result in termination of your employment. If you are unhappy with the decision you can appeal using the Grievance Procedure.',
      'Staff on a zero hour contract must instead tell us about any other employment so the implications under working time legislation can be discussed.',
      'If you are approached to do private work, discuss it with a Manager before accepting. You are not allowed to do any work which could otherwise have been done by the Company.',
    ],
    keywords: ['second job', 'moonlighting', 'side work', 'private work', 'zero hours', 'conflict of interest'],
    sources: [
      { doc: HB, heading: 'Other Employment' },
      { doc: HB, heading: 'Private Work' },
    ],
  },
  {
    id: 'hr-resigning',
    topic: 'staff-hr',
    question: 'How do I resign, and how much notice do I need to give?',
    answer: [
      'All resignations must be in writing, stating your reason for resigning.',
      'Your required notice period is shown in your individual Statement of Main Terms of Employment. If you leave without giving or working your notice, you will forfeit any contractual accrued holiday pay over and above your statutory holiday pay.',
      'When either side gives notice, the Company may require you to take "garden leave" for all or part of the remaining period of your employment.',
    ],
    keywords: ['resignation', 'quit', 'leaving', 'notice period', 'garden leave'],
    sources: [
      { doc: HB, heading: 'Resignations' },
      { doc: HB, heading: 'Terminating Employment Without Giving Notice' },
      { doc: HB, heading: 'Garden Leave' },
    ],
  },
  {
    id: 'hr-returning-property',
    topic: 'staff-hr',
    question: 'What do I have to give back when I leave?',
    answer: [
      '- All company property in your possession or that you are responsible for.\n- Any company vehicle, returned to our premises.\n- Any uniform you were provided with.\n- All company tools.\n- Any material containing confidential information, and any written material made or acquired during your employment.\n- Access rights to authorised work social networking accounts, with any work content and contacts or connections lists.',
      'Failing to return items will result in their cost (or, for a vehicle, the cost of recovering it) being deducted from monies owed to you. These are express written terms of your contract of employment.',
    ],
    keywords: ['leaving', 'return equipment', 'uniform', 'company tools', 'company car', 'deduction'],
    sources: [
      { doc: HB, heading: 'Return of Our Property' },
      { doc: HB, heading: 'Return of Vehicles' },
      { doc: HB, heading: 'Standards of Dress' },
      { doc: HB, heading: 'Company Tools' },
      { doc: HB, heading: 'Company Property and Copyright' },
      { doc: HB, heading: 'Business Use of Social Networking Sites' },
    ],
  },
  {
    id: 'hr-disciplinary-process',
    topic: 'staff-hr',
    question: 'How does the disciplinary process work?',
    answer: [
      'You will only be disciplined after careful investigation of the facts and the chance to present your side. Temporary suspension on contractual pay may sometimes be needed for an uninterrupted investigation; this is not disciplinary action or a penalty. Apart from an "off the record" informal reprimand, you can be accompanied by a fellow employee at all stages of the formal process.',
      'The usual steps by type of offence are:\n- Unsatisfactory conduct: formal verbal warning, then written warning, then final written warning, then dismissal.\n- Misconduct: written warning, then final written warning, then dismissal.\n- Serious misconduct: final written warning, then dismissal.\n- Gross misconduct: dismissal.',
      'The Company can vary the procedure to take account of length of service; staff with a short amount of service may not receive any warnings before dismissal. You have the right to appeal against any disciplinary action.',
    ],
    keywords: ['disciplinary', 'warning', 'verbal warning', 'written warning', 'final warning', 'dismissal', 'sacked'],
    sources: [
      { doc: HB, heading: 'Disciplinary Procedures' },
      { doc: HB, heading: 'Disciplinary Procedure' },
    ],
  },
  {
    id: 'hr-disciplinary-examples',
    topic: 'staff-hr',
    question: 'What kind of behaviour can lead to disciplinary action?',
    answer: [
      'Examples given in the handbook (not an exhaustive list) include:\n- failing to follow health and safety rules;\n- smoking in non-smoking areas or drinking alcohol on the premises;\n- persistent absenteeism and/or lateness;\n- unsatisfactory standards or output of work;\n- rudeness, insulting behaviour, harassment, bullying or bad language;\n- failing to carry out reasonable instructions or follow rules and procedures;\n- unauthorised use, negligent damage or loss of company property;\n- driving-related failures, such as not reporting a driving conviction or an incident in a company vehicle;\n- unauthorised use of e-mail and internet.',
      'Breaking any other rule or procedure in the handbook, or that has otherwise been made known to you, can also be dealt with under the disciplinary procedure.',
    ],
    keywords: ['misconduct', 'rules', 'unacceptable behaviour', 'conduct', 'breach'],
    sources: [{ doc: HB, heading: 'Disciplinary Rules' }],
  },
  {
    id: 'hr-gross-misconduct',
    topic: 'staff-hr',
    question: 'What counts as gross misconduct?',
    answer: [
      'Gross misconduct is behaviour or negligence resulting in a fundamental breach of contractual terms that irrevocably destroys the trust and confidence needed to continue employment. The penalty is dismissal without notice and without any previous warning.',
      'Examples that will normally be gross misconduct include serious instances of:\n- theft or fraud;\n- physical violence or bullying;\n- deliberate damage to property;\n- deliberate acts of unlawful discrimination or harassment;\n- possession, or being under the influence, of drugs at work;\n- breach of health and safety rules that endangers lives or may cause serious injury.',
      'If a rule break is shown to be due to extreme carelessness, or has a serious or substantial effect on the business or its reputation, a final written warning may be given in the first instance.',
    ],
    keywords: ['instant dismissal', 'summary dismissal', 'sacked without notice', 'theft', 'violence', 'serious misconduct'],
    sources: [{ doc: HB, heading: 'Serious Misconduct' }],
  },
  {
    id: 'hr-warning-duration',
    topic: 'staff-hr',
    question: 'How long does a disciplinary warning stay on record?',
    answer: [
      '- Formal verbal warning: normally disregarded after three months.\n- Written warning: normally disregarded after six months.\n- Final written warning: normally disregarded after twelve months.',
    ],
    keywords: ['warning expiry', 'live warning', 'spent warning', 'how long warning lasts'],
    sources: [{ doc: HB, heading: 'Period of Warnings' }],
  },
  {
    id: 'hr-disciplinary-appeal',
    topic: 'staff-hr',
    question: 'How do I appeal against a warning or dismissal?',
    answer: [
      'You have the right to appeal against any capability or disciplinary action. Apply verbally or in writing to the person named in your Statement of Main Terms of Employment, explaining why the penalty is too severe, inappropriate or unfair.',
      'The appeal will normally be heard by someone not previously connected with the process. If you are appealing on the grounds that you did not commit the offence, it may be a complete re-hearing.',
      'You may be accompanied at any stage of the appeal hearing by a fellow employee of your choice. The result will be given to you in writing, normally within five working days after the hearing.',
    ],
    keywords: ['appeal', 'challenge warning', 'unfair dismissal', 'appeal hearing'],
    sources: [{ doc: HB, heading: 'Capability/Disciplinary Appeal Procedure' }],
  },
  {
    id: 'hr-grievance',
    topic: 'staff-hr',
    question: 'How do I raise a complaint or grievance about work?',
    answer: [
      'You can always raise a matter informally first. For a formal grievance, you should normally put it in writing from the outset to the person named in your Statement of Main Terms of Employment, explaining fully the nature and extent of the grievance. (Personal harassment has its own separate procedure.)',
      'You will be invited to a meeting to investigate the grievance and must take all reasonable steps to attend. You can be accompanied by a fellow employee. The decision will be sent in writing, normally within ten working days of the meeting.',
      'To appeal, tell a Manager within five working days. You will be invited to a further meeting (as far as reasonably practicable, with a more senior Manager than at the first meeting) and told the final decision in writing, normally within ten working days.',
    ],
    keywords: ['grievance', 'complaint', 'unhappy at work', 'raise a concern', 'dispute'],
    sources: [{ doc: HB, heading: 'Grievance Procedure' }],
  },
  {
    id: 'hr-harassment',
    topic: 'staff-hr',
    question: "What should I do if I'm being harassed or bullied at work?",
    answer: [
      'Informally: you are encouraged to raise it with a senior colleague of your choice as a confidential helper (but not a Manager who would investigate a formal complaint). For minor harassment, make it clear to the person that their behaviour is unwelcome and ask them to stop, verbally or in a written note.',
      'Formally: if the informal approach fails or the harassment is more serious, make a formal written complaint to a Manager. If possible keep notes, including the name of the alleged harasser, what happened, dates and times, any witnesses and any action you have already taken.',
      'You will be invited to a meeting and can be accompanied by your confidential helper or another colleague. The investigation will normally be concluded within ten working days of that meeting, and the findings sent to you in writing. You will not be victimised for bringing a complaint, although a complaint that is untrue and malicious will lead to disciplinary action.',
    ],
    keywords: ['bullying', 'harassment', 'sexual harassment', 'victimisation', 'confidential helper', 'complaint'],
    sources: [
      { doc: HB, heading: 'Complaining About Personal Harassment' },
      { doc: HB, heading: 'Personal Harassment Policy and Procedure' },
    ],
  },
  {
    id: 'hr-capability',
    topic: 'staff-hr',
    question: "What happens if a member of staff isn't performing well enough?",
    answer: [
      'Concerns about capability will normally first be discussed informally, with the expected level of performance explained, adequate training and supervision, and time to improve.',
      'If performance is still not adequate, a written warning is given that failure to improve could lead to dismissal, and a transfer to more suitable work is considered. If there is still no improvement (or the performance has a serious or substantial effect on the business or its reputation), a final warning is issued. If improvement still does not follow after a reasonable period, the employee will be dismissed with the appropriate notice.',
      'The procedure can be varied for staff with a short amount of service, who may not receive any warnings before dismissal.',
    ],
    keywords: ['capability', 'poor performance', 'underperforming', 'performance management', 'final warning'],
    sources: [
      { doc: HB, heading: 'Job Changes/General Capability Issues' },
      { doc: HB, heading: 'Short Service Staff' },
    ],
  },
  {
    id: 'hr-uniform',
    topic: 'staff-hr',
    question: 'Do staff have to wear a uniform?',
    answer: [
      'Yes. Uniforms are provided at the start of employment and must be worn at all times while at work and laundered regularly, so you present a professional image to clients and the public.',
      'Uniform must be returned when you leave. If it is not, the cost will be deducted from your wages/salary.',
    ],
    keywords: ['uniform', 'dress code', 'appearance', 'workwear', 'clothing'],
    sources: [{ doc: HB, heading: 'Standards of Dress' }],
  },
  {
    id: 'hr-mobile-phones',
    topic: 'staff-hr',
    question: 'Can I use my personal mobile phone at work?',
    answer: [
      'Unless otherwise authorised, you should only use your personal mobile phone during authorised breaks. Personal use of business phones is not permitted under any circumstances.',
      'Friends and relatives should be discouraged from calling you, in person or by phone, except in an emergency. For phone use while driving, see the vehicle rules.',
    ],
    keywords: ['mobile', 'personal calls', 'phone use', 'breaks', 'business phone'],
    sources: [{ doc: HB, heading: 'Friends and Relatives Contact / Telephone Calls / Mobile Phones' }],
  },
  {
    id: 'hr-accident-at-work',
    topic: 'staff-hr',
    question: 'What should I do if I have an accident or injury at work?',
    answer: [
      'Report all accidents and injuries at work, no matter how minor, in the accident book.',
      'Any exposed cut or burn must be covered with a first-aid dressing. You should also make sure you know the fire and evacuation procedures.',
    ],
    keywords: ['accident book', 'injury', 'health and safety', 'first aid', 'hurt at work'],
    sources: [
      { doc: HB, heading: 'Safety' },
      { doc: HB, heading: 'Hygiene' },
    ],
  },
  {
    id: 'hr-keyholding',
    topic: 'staff-hr',
    question: 'What are the rules if I am a keyholder for the office?',
    answer: [
      'Follow all procedures when securing the building and keep keys and alarm codes safe at all times. Do not give them to any third party without authorisation from a Manager.',
      'Report any breach or security issue, including lost or stolen keys or alarm codes, to a Manager immediately. Loss or damage caused by not following procedures, or by negligence, will result in disciplinary action which could lead to summary dismissal, and the cost may be deducted from monies owed to you.',
      'The last person to leave must switch off lights and appropriate electrical equipment, secure windows and doors and set the alarms.',
    ],
    keywords: ['keys', 'alarm code', 'locking up', 'security', 'lost keys'],
    sources: [{ doc: HB, heading: 'Keyholding/Alarm Setting' }],
  },
  {
    id: 'hr-new-starter-documents',
    topic: 'staff-hr',
    question: 'What paperwork do I need to give a new employee?',
    answer: [
      'Each employee needs:\n- an Induction Checklist (one copy), which new employees sign to confirm they have read and understood the Employee Handbook;\n- a Statement of Main Terms of Employment (SMT), two copies, fully completed (e.g. job title and salary/wage) and signed and dated by you; the employee returns one signed copy;\n- a Deductions from Pay Agreement (two copies), with one signed copy returned;\n- access to the Employee Handbook (a copy kept in the workplace or an accessible electronic copy).',
      'Where applicable, also issue two copies each of a Restrictive Covenant, a 48 Hour Opt Out Agreement, a Training Agreement and the Vehicle Rules, with one signed copy of each returned to you.',
      'Request these forms from head office, apart from the Employee Handbook, Training Agreement and Vehicle Rules, which are in the processes documentation.',
    ],
    keywords: ['new starter', 'contract', 'SMT', 'onboarding', 'induction checklist', 'employment documents'],
    sources: [{ doc: ED, heading: 'Employers Guidelines' }],
  },
  {
    id: 'hr-existing-employee-documents',
    topic: 'staff-hr',
    question: 'What do existing employees need to sign when I issue new employment documents?',
    answer: [
      'Give each existing employee one copy of the Form for Existing Employees. It explains why you are issuing new employment documentation and has a section for them to sign confirming they have read and understood the new Employee Handbook.',
      'Complete the date section at the bottom with the latest date you want the signed documents returned. The employee returns one completed and signed copy. Request this form from head office.',
    ],
    keywords: ['existing staff', 'new handbook', 'sign off', 'acknowledgement form'],
    sources: [{ doc: ED, heading: 'Form for Existing Employees – one copy' }],
  },
  {
    id: 'hr-pay-deductions',
    topic: 'staff-hr',
    question: "Can deductions be made from an employee's pay?",
    answer: [
      'Employees must give express written permission for deductions from pay. The Deductions from Pay Agreement (two copies, one signed copy returned) reflects the clauses in the Employee Handbook that refer to possible deductions.',
      'Examples in the handbook include: overpayments; costs of loss or damage caused by negligence or failure to follow rules; the insurance excess (up to a maximum of £250) after an at fault accident in a company vehicle; fines such as speeding and parking; and unreturned uniform, tools, property or vehicles.',
    ],
    keywords: ['deductions', 'deduct from wages', 'pay deduction agreement', 'insurance excess', 'written permission'],
    sources: [
      { doc: ED, heading: 'Deductions from Pay Agreement - two copies' },
      { doc: HB, heading: 'Wastage' },
      { doc: HB, heading: 'Fines' },
    ],
  },
  {
    id: 'hr-optional-agreements',
    topic: 'staff-hr',
    question: 'When do I need a 48 hour opt-out, training agreement or restrictive covenant?',
    answer: [
      '- 48 Hour Opt Out Agreement: employees can voluntarily opt out of the maximum 48 hour working week under the Working Time Regulations. Where applicable, issue two copies; one signed copy is returned.\n- Training Agreement: issue it at the time the training takes place (not as a blanket agreement), including the actual cost or an accurate pre-estimate of the cost. Two copies; one signed copy is returned.\n- Restrictive Covenant: where employees have not previously had restrictive covenants, seek advice before using the Restrictive Covenant Agreement for the first time. Two copies; one signed copy is returned.',
      'The 48 Hour Opt Out and Restrictive Covenant are requested from head office. The Training Agreement is in the processes documentation.',
    ],
    keywords: ['working time', '48 hours', 'opt out', 'training costs', 'restrictive covenant', 'non-compete'],
    sources: [
      { doc: ED, heading: '48 Hour Opt Out Agreement (if applicable) – two copies' },
      { doc: ED, heading: 'Training Agreement (if applicable) – two copies' },
      { doc: ED, heading: 'Restrictive Covenant (if applicable) - two copies' },
    ],
  },
  {
    id: 'hr-employment-advice',
    topic: 'staff-hr',
    question: 'Where can I get help with employment law and HR questions?',
    answer: [
      'miServices has access to various legal documents and support from its HR advisors. Refer to miServices head office for help with things like employment rights, hiring your first employee, job descriptions, recruiting and interviewing, background checks, paying employees (including minimum wage), discipline, resignations, terminations and giving references.',
      'Head office contact details are listed under "Who to call" in the Issuing Employment Documentation guide.',
    ],
    keywords: ['HR advice', 'employment law', 'head office', 'hiring', 'references', 'recruitment'],
    sources: [
      { doc: ED, heading: 'Employment law' },
      { doc: ED, heading: 'Who to call' },
    ],
  },
  {
    id: 'hr-appraisals',
    topic: 'staff-hr',
    question: 'How do staff appraisals work?',
    answer: [
      'Appraisals should be positive, with no nasty surprises. The meeting is a chance to formally record the informal discussions from the past few months on the appraisal form, and to agree specific action points and objectives for the future.',
      'On the Performance Appraisal Form, rate each key skill (job knowledge, communication, problem-solving, initiative, customer service, attendance and time keeping) and overall performance as E = Excellent, G = Good, S = Satisfactory, I = Improvement Needed or U = Unsatisfactory. Record what went well and areas for improvement.',
      'Agree specific objectives for the next review period during the meeting. They should be SMART (Specific, Measurable, Agreed, Realistic, Time-bound), with any support needed noted. Both appraisee and appraiser sign the form. A personal development plan and training plan templates are also available.',
    ],
    keywords: ['appraisal', 'performance review', 'annual review', 'SMART objectives', 'rating'],
    sources: [
      { doc: SA },
      { doc: SA, heading: 'Performance Evaluation' },
      { doc: SA, heading: 'Objectives' },
    ],
  },
  {
    id: 'hr-self-appraisal',
    topic: 'staff-hr',
    question: 'What does an employee need to fill in before their appraisal?',
    answer: [
      'The employee completes a self-appraisal form, being as honest and constructive as possible. It covers:\n- their understanding of their main duties and responsibilities;\n- the discussion points, plus any they want to add;\n- objectives from the past 12 months (or the review period), with comments on achievement and a score for each;\n- a score for their own capability and knowledge against their role, with evidence if appropriate;\n- what they would like to focus on over the next year.',
      'Scores use this scale: 1–3 Poor, 4–6 Satisfactory, 7–9 Good, 10 Excellent.',
    ],
    keywords: ['self-appraisal', 'self assessment', 'appraisee', 'scoring', 'preparation'],
    sources: [
      { doc: SA, heading: 'Staff Performance Appraisal Form: Guidance Notes for Appraisee' },
      { doc: SA, heading: 'Scoring Table' },
    ],
  },

  // ─── Policies ─────────────────────────────────────────────────────
  {
    id: 'hr-confidentiality',
    topic: 'policies',
    question: 'What information do I have to keep confidential?',
    answer: [
      'Information you acquire during your employment (or in confidence) that relates to our business, or to anyone we deal with, and that has not been made public by us or with our authority, is confidential. You must not disclose it to anyone without prior written consent, either during or after your employment, except in the course of business or as required by law.',
      'Take reasonable care to keep confidential material safe and return it when you leave or whenever asked. You must also follow the data protection policies on personal data at all times.',
    ],
    keywords: ['confidential', 'client information', 'data protection', 'non-disclosure', 'privacy'],
    sources: [{ doc: HB, heading: 'Confidentiality' }],
  },
  {
    id: 'hr-social-media',
    topic: 'policies',
    question: 'Can I post about work on social media?',
    answer: [
      'No. Any work-related issue or material that could identify a client or colleague, or could adversely affect the Company, a client or our relationship with a client, must not be put on a social networking site at any time, during or outside working hours, from any device.',
      'Do not add or accept "friend requests" from clients on your private social media accounts. Only authorised employees can use the Company social networking accounts, and work content and contacts created on authorised accounts belong to the Company.',
    ],
    keywords: ['Facebook', 'Instagram', 'social networking', 'posting', 'friend requests', 'LinkedIn'],
    sources: [
      { doc: HB, heading: 'Use of Social Networking Sites' },
      { doc: HB, heading: 'Business Use of Social Networking Sites' },
    ],
  },
  {
    id: 'hr-internet-email',
    topic: 'policies',
    question: 'Can I use the work computer, internet or email for personal things?',
    answer: [
      'No. Private use of the internet is not permitted at any time, and personal use of the e-mail system (e.g. social invitations, personal messages, jokes, chain letters) is not allowed. Accessing offensive or non-work material, online gambling and posting confidential information are also prohibited. Unauthorised or inappropriate use may result in disciplinary action, which could include summary dismissal.',
      'Only authorised software may be used on company computers, and new software must be checked and authorised by a Manager first. Unauthorised software, USBs, external hard drives, CDs or internet downloads must not be used.',
      'All email and internet activity may be monitored, and information from monitoring may be used as evidence in disciplinary proceedings.',
    ],
    keywords: ['personal email', 'browsing', 'IT policy', 'USB', 'software', 'monitoring'],
    sources: [
      { doc: HB, heading: 'Procedures – Acceptable/Unacceptable Use' },
      { doc: HB, heading: 'Procedures - Authorised Use' },
      { doc: HB, heading: 'Use of Computer Equipment' },
      { doc: HB, heading: 'Virus Protection Procedures' },
      { doc: HB, heading: 'Monitoring', occurrence: 1 },
    ],
  },
  {
    id: 'hr-media-statements',
    topic: 'policies',
    question: 'Can I speak to a journalist about the business?',
    answer: [
      'No. Any statements to reporters from newspapers, radio, television, etc. about the business will be given only by a Director.',
    ],
    keywords: ['press', 'reporter', 'media enquiry', 'newspaper', 'interview'],
    sources: [{ doc: HB, heading: 'Statements to the Media' }],
  },
  {
    id: 'hr-gifts',
    topic: 'policies',
    question: 'Can I accept a gift or hospitality from a client?',
    answer: [
      'Not without prior written approval from a Manager. The same applies to giving any gift or offering hospitality in connection with the business. A Manager will record every instance of gifts or hospitality given or received.',
      'Bribery of any kind is prohibited. If you suspect bribery or attempted bribery, even if you are not involved, report it to a Manager.',
    ],
    keywords: ['gifts', 'hospitality', 'bribery', 'anti-bribery', 'presents', 'tips'],
    sources: [
      { doc: HB, heading: 'Gifts and Hospitality' },
      { doc: HB, heading: 'Anti-Bribery Policy' },
      { doc: HB, heading: 'Reporting' },
    ],
  },
  {
    id: 'hr-whistleblowing',
    topic: 'policies',
    question: 'How do I report wrongdoing (whistleblowing)?',
    answer: [
      'In the first instance, report your concern to a Manager, who will treat it in complete confidence. If you are not satisfied with the explanation, raise the matter with the appropriate official organisation or regulatory body. If you do not report to a Manager, take your concerns directly to that organisation or body.',
      'Concerns covered include criminal offences, failure to comply with a legal obligation, miscarriages of justice, endangering health and safety, environmental damage, or concealing any of these. Bullying, harassment or other detrimental treatment of someone who has made a qualifying disclosure is unacceptable and will lead to disciplinary action.',
    ],
    keywords: ['whistleblowing', 'report concern', 'wrongdoing', 'qualifying disclosure', 'public interest'],
    sources: [
      { doc: HB, heading: 'The Procedure' },
      { doc: HB, heading: 'Qualifying Disclosures' },
      { doc: HB, heading: 'Treatment by Others' },
    ],
  },
  {
    id: 'hr-alcohol-drugs',
    topic: 'policies',
    question: 'What is the policy on alcohol and drugs?',
    answer: [
      'If your performance or attendance is affected by alcohol or drugs, or we believe you have been involved in any drug-related action or offence, you may face disciplinary action, which could lead to dismissal. Possession of, or being under the influence of, drugs at work is an example of gross misconduct, and consuming alcohol on the premises can lead to disciplinary action.',
      'If you arrive for work and are not, in our opinion, fit to work safely, you may be sent away for the rest of the day with or without pay, and may face disciplinary action. Never drive under the influence of alcohol or drugs, including medicines which may affect your driving.',
    ],
    keywords: ['alcohol', 'drink', 'drugs', 'under the influence', 'fit for work'],
    sources: [
      { doc: HB, heading: 'Alcohol & Drugs Policy' },
      { doc: HB, heading: 'Fitness for Work' },
      { doc: VR, heading: 'Other Guidelines' },
    ],
  },
  {
    id: 'hr-smoking',
    topic: 'policies',
    question: 'Can I smoke or vape at work or in a company vehicle?',
    answer: [
      'Smoking is not permitted on the premises; you may only smoke during authorised breaks, away from the premises and any windows. This includes e-cigarettes.',
      'All workplaces, including vehicles, are smokefree (including e-cigarettes). This also applies to anyone using their own vehicle for Company business. Not complying will lead to the disciplinary procedure being followed.',
    ],
    keywords: ['smoking', 'vaping', 'e-cigarette', 'cigarette break', 'smokefree'],
    sources: [
      { doc: HB, heading: 'No Smoking Policy' },
      { doc: VR, heading: 'No Smoking Policy' },
    ],
  },
  {
    id: 'hr-behaviour',
    topic: 'policies',
    question: 'What standards of behaviour are expected, including at clients\' properties and outside work?',
    answer: [
      'Be civil to colleagues; no rudeness towards clients or members of the public is permitted. Objectionable or insulting behaviour or bad language will make you liable to disciplinary action. Involvement in anything that could be seen as competing with the business is not allowed.',
      'At a client\'s premises you must familiarise yourself with and follow all their rules (security, health and safety, smoking, parking, etc.). Not doing so could result in removal from site and disciplinary action.',
      'You are expected to maintain high standards of integrity outside working hours too. Activities that bring adverse publicity, or cause the business to lose faith in your integrity, may be grounds for dismissal.',
    ],
    keywords: ['conduct', 'behaviour', 'code of conduct', 'client site', 'professionalism', 'integrity'],
    sources: [
      { doc: HB, heading: 'Behaviour at Work' },
      { doc: HB, heading: "Client’s Premises" },
      { doc: HB, heading: 'Behaviour Outside Work' },
    ],
  },
  {
    id: 'hr-equality-policy',
    topic: 'policies',
    question: 'What does our equality, diversity and inclusion policy commit us to?',
    answer: [
      'The policy commits the organisation to encouraging equality, diversity and inclusion and eliminating unlawful discrimination, both in employment and towards customers and the public. It covers the Equality Act 2010 protected characteristics: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race (including colour, nationality, and ethnic or national origin), religion or belief, sex and sexual orientation.',
      'Commitments include a working environment free of bullying, harassment, victimisation and unlawful discrimination; training managers and staff on their rights and responsibilities; decisions about staff based on merit; opportunities for training and development for all; reviewing practices and procedures; and monitoring the make-up of the workforce, with the policy reviewed annually.',
    ],
    keywords: ['equality', 'diversity', 'inclusion', 'discrimination', 'protected characteristics', 'Equality Act'],
    sources: [{ doc: EQ }, { doc: HB, heading: 'Statement of Policy' }],
  },
  {
    id: 'hr-equality-complaints',
    topic: 'policies',
    question: 'How are complaints of discrimination, bullying or harassment dealt with?',
    answer: [
      'Complaints of bullying, harassment, victimisation and unlawful discrimination are taken seriously, whoever makes them. Such acts are dealt with as misconduct under the grievance and/or disciplinary procedures. Particularly serious complaints could amount to gross misconduct and lead to dismissal without notice.',
      'All staff, as well as their employer, can be held liable for these acts in the course of their employment. Using the grievance and/or disciplinary procedures does not affect an employee\'s right to make a claim to an employment tribunal within three months of the alleged discrimination.',
    ],
    keywords: ['discrimination complaint', 'employment tribunal', 'victimisation', 'liability', 'harassment'],
    sources: [{ doc: EQ }],
  },
  {
    id: 'hr-equality-recruitment',
    topic: 'policies',
    question: 'What must we do to keep recruitment fair?',
    answer: [
      '- Take a consistent, non-discriminatory approach to advertising vacancies, and do not confine recruitment to sources that provide only, or mainly, applicants of a particular group.\n- Consider applicants solely on their ability to do the job.\n- Where possible, have more than one person do shortlisting and interviewing.\n- Keep interview questions related to the requirements of the job and not discriminatory.\n- Periodically review selection criteria to make sure they relate to the job.\n- Do not disqualify an applicant for being unable to complete an application form unassisted, unless completing it personally is a valid test of the English needed for the job.\n- Base promotion and advancement on merit.',
    ],
    keywords: ['recruitment', 'hiring', 'interviews', 'job adverts', 'shortlisting', 'fair selection'],
    sources: [{ doc: HB, heading: 'Recruitment and Selection' }],
  },

  // ─── Vehicles ─────────────────────────────────────────────────────
  {
    id: 'hr-vehicle-who-can-drive',
    topic: 'vehicles',
    question: 'Who is allowed to drive a company vehicle?',
    answer: [
      'You must hold a current driving licence and have the authority of a Director. Your licence must be produced for a Director to check before you drive (or you may be asked to allow the licence details to be accessed online).',
      'It is your responsibility to make sure the vehicle is not used by anyone other than authorised employees. Special written permission from a Director is needed for anyone else to use it.',
    ],
    keywords: ['company van', 'company car', 'authorised driver', 'licence check', 'insurance'],
    sources: [{ doc: VR, heading: 'Driving Licence and Authority to Drive Company Vehicles' }],
  },
  {
    id: 'hr-vehicle-licence-points',
    topic: 'vehicles',
    question: 'What do I do if I get points on my licence or am banned from driving?',
    answer: [
      'If your licence is endorsed, or you are disqualified from driving, you must tell us immediately. If driving is part of your job and alternative employment cannot be found, your employment may be terminated.',
      'Not reporting any driving conviction, or any summons that may lead to a conviction, immediately is a disciplinary matter, as is loss of your licence where driving on public roads is an essential part of the job. You must produce your licence on request.',
    ],
    keywords: ['penalty points', 'endorsement', 'driving ban', 'disqualified', 'conviction'],
    sources: [
      { doc: VR, heading: 'Driving Licence and Authority to Drive Company Vehicles' },
      { doc: HB, heading: 'Driving Licence' },
      { doc: HB, heading: 'Disciplinary Rules' },
    ],
  },
  {
    id: 'hr-vehicle-private-use',
    topic: 'vehicles',
    question: 'Can I use the company vehicle for personal journeys?',
    answer: [
      'Only if arrangements for private domestic or social use have been agreed in advance. Otherwise company vehicles may only be used for authorised business: travelling to and from clients and prospective clients.',
      'Vehicles may never be used to carry passengers for hire or reward, or for any motoring sport (racing, rallying or pace making). Using vehicles without approval, carrying unauthorised goods or passengers, or using them for personal gain can lead to disciplinary action.',
    ],
    keywords: ['personal use', 'private mileage', 'weekend use', 'passengers', 'permitted use'],
    sources: [
      { doc: VR, heading: 'Permitted Use' },
      { doc: HB, heading: 'Disciplinary Rules' },
    ],
  },
  {
    id: 'hr-vehicle-fuel',
    topic: 'vehicles',
    question: 'How does fuel work for company vehicles?',
    answer: [
      'Unless there is a different written arrangement, only fuel and oil used on company business is reimbursed. Submit claims on a weekly report sheet, signed by you and with receipts, where the vehicle cannot be filled up on the company fuel account.',
      'If you have a company fuel card, you are responsible for keeping it secure. Report it to a Director immediately if it is lost or stolen. It must be used for business purposes only, with a receipt for every transaction. Usage is regularly monitored, so it is worth keeping a personal record of your transactions.',
    ],
    keywords: ['fuel card', 'petrol', 'diesel', 'fuel claim', 'receipts', 'weekly report sheet'],
    sources: [{ doc: VR, heading: 'Fuel etc.' }],
  },
  {
    id: 'hr-vehicle-checks',
    topic: 'vehicles',
    question: 'What vehicle checks and maintenance am I responsible for?',
    answer: [
      '- Keep the vehicle clean. If it is not adequately cleaned, the cost of a valet may be deducted from your pay.\n- Make sure it is regularly serviced in line with the manufacturer\'s requirements and the maintenance book.\n- Keep oil and water levels, battery, brake fluid and tyre pressures maintained, and make sure tyre tread meets the minimum legal requirements.\n- Report any maintenance, repairs or replacement parts (including tyres) so they can be organised for you.\n- Report any warranty work before it is carried out.',
      'The road fund licence is renewed automatically when due.',
    ],
    keywords: ['servicing', 'tyres', 'oil', 'cleaning', 'maintenance', 'repairs', 'tax'],
    sources: [
      { doc: VR, heading: 'Cleaning and Maintenance' },
      { doc: VR, heading: 'Fuel etc.' },
      { doc: VR, heading: 'Warranty' },
      { doc: VR, heading: 'Road Fund Licence' },
    ],
  },
  {
    id: 'hr-vehicle-accident',
    topic: 'vehicles',
    question: 'What do I do if I have an accident in a company vehicle?',
    answer: [
      'Notify us immediately. Give your name and address, the owner\'s name and address, the vehicle registration and the insurance company name to anyone with reasonable grounds to ask, and give no further information. Do not express any opinion about who was responsible.',
      'If you could not give that information at the scene, report the accident to the police as soon as possible, and within twenty-four hours. If anyone is injured, or a notifiable animal (e.g. a dog), you must notify the police, and report it within twenty-four hours; if you cannot produce the insurance certificate then, produce it in person at a police station within five days.',
      'Get an accident report form from us and return it completed within twenty-four hours, including the other driver\'s and insurer\'s details, passengers, witnesses, attending police details and a detailed sketch. If the vehicle cannot be driven, arrange for it to be towed to a garage. Repairs must not be started until the insurer has agreed; we will organise them.',
    ],
    keywords: ['crash', 'collision', 'accident report form', 'insurance claim', 'police', 'damage'],
    sources: [
      { doc: VR, heading: 'Damage or Injury' },
      { doc: VR, heading: 'Loss' },
    ],
  },
  {
    id: 'hr-vehicle-damage-cost',
    topic: 'vehicles',
    question: 'Will I have to pay if I damage a company vehicle?',
    answer: [
      'You may. If you have an at fault accident while driving a company vehicle, you may be required to pay the insurance excess, up to a maximum of £250. If you fail to pay, it can be deducted from your pay.',
      'Where damage is due to your negligence or lack of care, you may be required to put the damage right at your own expense or pay the excess part of any insurance claim.',
    ],
    keywords: ['insurance excess', '£250', 'at fault', 'negligence', 'repair cost'],
    sources: [
      { doc: HB, heading: 'Wastage' },
      { doc: VR, heading: 'Personal Liability for Damage to Vehicles' },
    ],
  },
  {
    id: 'hr-vehicle-fines',
    topic: 'vehicles',
    question: 'Who pays speeding or parking fines?',
    answer: [
      'You do. Fines imposed by relevant authorities, including speeding and parking, are payable by the employee, and the Company takes no responsibility for them.',
      'If the Company receives the summons on your behalf, it may pay the fine and deduct the cost from your salary. This is an express written term of your contract of employment.',
    ],
    keywords: ['speeding ticket', 'parking ticket', 'PCN', 'penalty charge', 'fine'],
    sources: [
      { doc: HB, heading: 'Fines' },
      { doc: VR, heading: 'Fines' },
    ],
  },
  {
    id: 'hr-vehicle-phone',
    topic: 'vehicles',
    question: 'Can I use my phone while driving?',
    answer: [
      'No. Company policy is that you should not use any mobile phone while driving. Pull over in an appropriate place before making or receiving calls. If you cannot answer because there is nowhere safe to stop, return the call as soon as conveniently possible.',
    ],
    keywords: ['hands free', 'mobile', 'calls while driving', 'phone in car'],
    sources: [{ doc: VR, heading: 'Use of Mobile Phone Whilst Driving' }],
  },
  {
    id: 'hr-vehicle-safe-driving',
    topic: 'vehicles',
    question: 'What are the general rules for driving safely?',
    answer: [
      '- Never drive under the influence of alcohol or drugs, including medicines which may affect your driving.\n- Wear seat belts at all times and comply with local traffic conditions.\n- Always drive within the speed limit and slow down when the weather requires it.\n- Do not drive if tired.\n- Take regular breaks from the vehicle.',
      'Report any incident while driving a company vehicle, whether or not anyone is injured or the vehicle is damaged.',
    ],
    keywords: ['seat belt', 'speed limit', 'tired', 'breaks', 'driving rules'],
    sources: [
      { doc: VR, heading: 'Other Guidelines' },
      { doc: HB, heading: 'Disciplinary Rules' },
    ],
  },
  {
    id: 'hr-vehicle-theft',
    topic: 'vehicles',
    question: 'What happens if the company vehicle or its contents are stolen?',
    answer: [
      'Tell the police and us immediately, with full details of the vehicle\'s contents. Do the same if contents are stolen from the vehicle.',
      'Only company property is insured, so make your own arrangements to cover personal belongings. Keep the vehicle locked when not in use and contents out of sight, preferably in the boot. If negligence contributed to a theft, you will be held responsible.',
    ],
    keywords: ['stolen', 'theft', 'break-in', 'personal belongings', 'locked'],
    sources: [{ doc: VR, heading: 'Loss' }],
  },
  {
    id: 'hr-vehicle-modifications',
    topic: 'vehicles',
    question: 'Can I add stickers, a roof rack or a tow bar to the company vehicle?',
    answer: [
      'Not without prior written permission. When the vehicle is handed back, any attachments must stay unless professional rectification work restores the vehicle to its former condition.',
      'No changes may be made to the manufacturer\'s mechanical or structural specification.',
    ],
    keywords: ['stickers', 'roof rack', 'tow bar', 'modifications', 'accessories'],
    sources: [{ doc: VR, heading: 'Fixtures, Fittings and Modifications' }],
  },
  {
    id: 'hr-vehicle-abroad',
    topic: 'vehicles',
    question: 'Can I take the company vehicle abroad?',
    answer: [
      'Only with written permission. The insurance covers use in Great Britain. To travel anywhere else, get permission and give us a list of the countries and dates at least seven days beforehand. A letter of authorisation will be issued to go with the vehicle, and a Green Card may be necessary; return these for cancellation when you get back.',
      'Unless the journey is on approved business, the cost of any Green Card may be charged to you and must be paid before you travel.',
    ],
    keywords: ['overseas', 'Europe', 'Green Card', 'travel abroad', 'insurance cover'],
    sources: [{ doc: VR, heading: 'Travel Overseas' }],
  },
  {
    id: 'hr-vehicle-insurance-certificate',
    topic: 'vehicles',
    question: 'Where is the insurance certificate for the company vehicle?',
    answer: [
      'Insurance certificates are kept by the company for security reasons, but a copy is provided with each vehicle and renewed annually. Make sure it stays with the vehicle at all times. Replacement copies can be requested if necessary.',
    ],
    keywords: ['insurance certificate', 'proof of insurance', 'insurance copy', 'documents'],
    sources: [{ doc: VR, heading: 'Damage or Injury' }],
  },
];
