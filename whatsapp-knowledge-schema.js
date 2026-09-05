// ============================================================
// WhatsApp AI Knowledge & Guardrails — questionnaire schema
// Data-driven definition of every section/field. The page
// (whatsapp-knowledge.html) renders purely from this file, so
// adding/editing a question is a data change, not a UI rewrite.
// ============================================================

// Field shapes:
//   { id, label, help, type, required, options, showIf }
//   type: 'text' | 'textarea' | 'tel' | 'email' | 'url' | 'date' |
//         'number' | 'select' | 'multiselect' | 'boolean' | 'file' | 'table'
//   showIf: { fieldId, equals } — field only renders when answers[fieldId] === equals
//   table fields additionally have: columns [{id,label,type,options}], repeatable (bool),
//     rows (pre-seeded starter rows, editable; used for both starter content and fixed-row tables)

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FAQ_STARTER_QUESTIONS = [
  'What are your membership plans?',
  'What is the monthly membership price?',
  'Do you offer quarterly, six-month and annual plans?',
  'Is there a joining fee?',
  'Are taxes included?',
  'Are any discounts currently available?',
  'Do you offer a free trial?',
  'Can I book a gym tour?',
  'What are the gym timings?',
  'Is the gym open on Sundays and public holidays?',
  'Do you provide personal training?',
  'What are the personal-training charges?',
  'Are trainers available throughout the day?',
  'Do you have female trainers?',
  'What equipment and facilities are available?',
  'Do you have group classes?',
  'How can I book or cancel a class?',
  'Is parking available?',
  'Are lockers and showers available?',
  'Can I freeze my membership?',
  'Can I transfer my membership?',
  'Can I cancel my membership?',
  'Are payments refundable?',
  'Which payment methods are accepted?',
  'Can I renew through WhatsApp?',
  'Can I pay through a payment link?',
  'What happens when my membership expires?',
  'How do I contact a staff member?',
  'How do I raise a complaint?',
  'What should I do if I have lost an item at the gym?',
];

const FAQ_COLUMNS = [
  { id: 'question', label: 'Customer question', type: 'text' },
  { id: 'answer', label: 'Approved answer', type: 'textarea' },
  { id: 'category', label: 'Category', type: 'text' },
  { id: 'branch', label: 'Applicable branch', type: 'text' },
  { id: 'owner', label: 'Answer owner', type: 'text' },
  { id: 'lastReviewed', label: 'Last reviewed date', type: 'date' },
  { id: 'effectiveFrom', label: 'Effective-from date', type: 'date' },
  { id: 'expiry', label: 'Expiry date (if applicable)', type: 'date' },
  { id: 'status', label: 'Status', type: 'select', options: ['Draft', 'Approved', 'Retired'] },
  { id: 'aiAnswersDirectly', label: 'Should AI answer directly?', type: 'boolean' },
  { id: 'staffApprovalRequired', label: 'Staff approval required?', type: 'boolean' },
  { id: 'escalationTeam', label: 'Escalation team', type: 'text' },
];

const MEMBERSHIP_PLAN_COLUMNS = [
  { id: 'name', label: 'Plan name', type: 'text' },
  { id: 'duration', label: 'Duration', type: 'text' },
  { id: 'price', label: 'Standard price', type: 'number' },
  { id: 'tax', label: 'Tax', type: 'text' },
  { id: 'joiningFee', label: 'Joining fee', type: 'number' },
  { id: 'totalPayable', label: 'Total payable amount', type: 'number' },
  { id: 'included', label: 'Included services', type: 'textarea' },
  { id: 'excluded', label: 'Excluded services', type: 'textarea' },
  { id: 'ptIncluded', label: 'Personal training included?', type: 'boolean' },
  { id: 'classAccessIncluded', label: 'Class access included?', type: 'boolean' },
  { id: 'freezeEntitlement', label: 'Freeze entitlement', type: 'text' },
  { id: 'transferEntitlement', label: 'Transfer entitlement', type: 'text' },
  { id: 'cancellationConditions', label: 'Cancellation/refund conditions', type: 'textarea' },
  { id: 'offerPrice', label: 'Offer price', type: 'number' },
  { id: 'offerStart', label: 'Offer start date', type: 'date' },
  { id: 'offerEnd', label: 'Offer end date', type: 'date' },
  { id: 'eligibility', label: 'Eligibility conditions', type: 'text' },
  { id: 'whatsappDescription', label: 'Approved WhatsApp description', type: 'textarea' },
  { id: 'active', label: 'Active?', type: 'boolean' },
];

const CLASS_COLUMNS = [
  { id: 'type', label: 'Class type', type: 'text' },
  { id: 'description', label: 'Description', type: 'textarea' },
  { id: 'schedule', label: 'Schedule', type: 'text' },
  { id: 'capacity', label: 'Capacity', type: 'number' },
  { id: 'trainer', label: 'Trainer', type: 'text' },
  { id: 'eligibility', label: 'Eligibility', type: 'text' },
  { id: 'price', label: 'Price', type: 'number' },
  { id: 'bookingRules', label: 'Booking rules', type: 'textarea' },
  { id: 'cancellationRules', label: 'Cancellation rules', type: 'textarea' },
  { id: 'waitlistRules', label: 'Wait-list rules', type: 'textarea' },
];

const PT_PACKAGE_COLUMNS = [
  { id: 'name', label: 'Package name', type: 'text' },
  { id: 'sessions', label: 'Number of sessions', type: 'number' },
  { id: 'price', label: 'Price', type: 'number' },
  { id: 'validity', label: 'Validity', type: 'text' },
  { id: 'notes', label: 'Notes', type: 'textarea' },
];

const AUTOMATION_COLUMNS = [
  { id: 'name', label: 'Automation', type: 'text', locked: true },
  { id: 'enabled', label: 'Enabled?', type: 'boolean' },
  { id: 'trigger', label: 'Trigger', type: 'text' },
  { id: 'waitingPeriod', label: 'Waiting period', type: 'text' },
  { id: 'audience', label: 'Audience', type: 'text' },
  { id: 'exclusions', label: 'Exclusions', type: 'text' },
  { id: 'approvedMessage', label: 'Approved message', type: 'textarea' },
  { id: 'maxFrequency', label: 'Maximum frequency', type: 'text' },
  { id: 'preferredTime', label: 'Preferred sending time', type: 'text' },
  { id: 'humanOwner', label: 'Human owner', type: 'text' },
  { id: 'stopConditions', label: 'Stop conditions', type: 'text' },
  { id: 'consentRequired', label: 'Consent required?', type: 'boolean' },
];

const AUTOMATION_ROWS = [
  'First-visit welcome message',
  'Attendance milestone message',
  'No visit for a specified number of days',
  'Trainer follow-up after inactivity',
  'Membership expiry reminder',
  'Expired membership follow-up',
  'Trial attended but not converted',
  'Trial booked but not attended',
  'Highly engaged member recognition',
  'Feedback request after a defined number of visits',
].map((name) => ({ name, enabled: false }));

const ESCALATION_COLUMNS = [
  { id: 'category', label: 'Category', type: 'text', locked: true },
  { id: 'responsible', label: 'Responsible person/team', type: 'text' },
  { id: 'contactMethod', label: 'Contact method', type: 'text' },
  { id: 'workingHours', label: 'Working hours', type: 'text' },
  { id: 'responseTime', label: 'Expected response time', type: 'text' },
  { id: 'backupContact', label: 'Backup contact', type: 'text' },
  { id: 'handoffInfo', label: 'Information included in handoff', type: 'textarea' },
  { id: 'highPriorityConditions', label: 'High-priority conditions', type: 'textarea' },
];

const ESCALATION_ROWS = [
  'New-membership sales',
  'Personal-training enquiries',
  'Payment failures',
  'Refunds',
  'Complaints',
  'Attendance disputes',
  'Technical issues',
  'Injuries or emergencies',
  'Harassment or safety concerns',
  'Data/privacy requests',
  "Questions the AI cannot answer",
].map((category) => ({ category }));

const MANDATORY_GUARDRAILS = [
  'Do not invent membership prices, offers, schedules or policies.',
  'Use only approved and active information.',
  'Do not negotiate prices or promise special discounts.',
  'Do not confirm payments without system verification.',
  'Do not change membership, payment or attendance records without authorization.',
  "Do not expose another member's personal information.",
  'Do not request fingerprint data or biometric templates.',
  'Do not provide medical diagnosis.',
  'Do not prescribe medication or treatment.',
  'Do not provide personalized injury-rehabilitation advice.',
  'Do not guarantee weight loss, muscle gain or health outcomes.',
  'Do not provide detailed workout or diet plans unless that capability is separately approved.',
  'Escalate questions involving injury, chest pain, fainting, breathing difficulty or another potential emergency.',
  'Escalate complaints, harassment, safety incidents and payment disputes.',
  'Never claim that a staff member, trainer or facility is available unless confirmed.',
  'Clearly state when information is unavailable.',
  'Ask the customer whether they want to connect with a staff member when the answer is uncertain.',
];

const SECTIONS = [
  {
    id: 'gym_info',
    title: 'Gym Information',
    fields: [
      { id: 'gymName', label: 'Official gym name', type: 'text', required: true },
      { id: 'branchName', label: 'Branch name', type: 'text' },
      { id: 'address', label: 'Full address', type: 'textarea', required: true },
      { id: 'mapsLink', label: 'Google Maps link', type: 'url' },
      { id: 'contactNumbers', label: 'Contact numbers', type: 'text', required: true },
      { id: 'whatsappNumber', label: 'WhatsApp number', type: 'tel', required: true },
      { id: 'email', label: 'Email address', type: 'email' },
      { id: 'website', label: 'Website and social-media links', type: 'textarea' },
      {
        id: 'hours', label: 'Opening and closing hours', type: 'table', repeatable: false,
        columns: [
          { id: 'day', label: 'Day', type: 'text', locked: true },
          { id: 'open', label: 'Opens', type: 'text' },
          { id: 'close', label: 'Closes', type: 'text' },
          { id: 'closed', label: 'Closed?', type: 'boolean' },
        ],
        rows: WEEKDAYS.map((day) => ({ day })),
      },
      { id: 'holidayPolicy', label: 'Holiday and special-hours policy', type: 'textarea' },
      { id: 'parking', label: 'Parking availability', type: 'text' },
      { id: 'facilities', label: 'Locker, shower, changing-room and other facilities', type: 'textarea' },
      { id: 'accessRules', label: 'Male-only, female-only or mixed access rules', type: 'text' },
      { id: 'minAge', label: 'Minimum age requirement', type: 'number' },
      { id: 'accessibility', label: 'Accessibility information', type: 'textarea' },
      { id: 'staffLanguages', label: 'Languages supported by staff', type: 'text' },
    ],
  },
  {
    id: 'faq',
    title: 'Common Customer Questions',
    intro: 'Add, edit, reorder or delete rows. Starter questions are pre-filled — leave the answer blank for anything not yet decided.',
    fields: [
      {
        id: 'faqTable', label: 'Common customer questions', type: 'table', repeatable: true,
        columns: FAQ_COLUMNS,
        rows: FAQ_STARTER_QUESTIONS.map((question) => ({ question, status: 'Draft' })),
      },
    ],
  },
  {
    id: 'membership_plans',
    title: 'Membership Plans and Pricing',
    intro: "The AI must never calculate, invent or negotiate a price. It only ever displays an active, approved price from this table.",
    fields: [
      { id: 'plansTable', label: 'Membership plans', type: 'table', repeatable: true, columns: MEMBERSHIP_PLAN_COLUMNS, rows: [] },
    ],
  },
  {
    id: 'trials_leads',
    title: 'Trials and Lead Management',
    fields: [
      { id: 'trialType', label: 'Is the trial free or paid?', type: 'select', options: ['Free', 'Paid'] },
      { id: 'trialPrice', label: 'Trial price', type: 'number', showIf: { fieldId: 'trialType', equals: 'Paid' } },
      { id: 'trialDuration', label: 'Trial duration', type: 'text' },
      { id: 'trialEligibility', label: 'Trial eligibility', type: 'text' },
      { id: 'previousMembersTrial', label: 'Can previous members take a trial?', type: 'boolean' },
      { id: 'trialBookingInfo', label: 'Information required to book a trial', type: 'textarea' },
      { id: 'trialTimings', label: 'Available trial timings', type: 'text' },
      { id: 'maxDailyTrials', label: 'Maximum daily trial bookings', type: 'number' },
      { id: 'advanceNotice', label: 'Advance notice required', type: 'text' },
      { id: 'trialCancellationRules', label: 'Cancellation/rescheduling rules', type: 'textarea' },
      { id: 'trialStaffNotify', label: 'Staff notification recipient', type: 'text' },
      { id: 'trialFollowUp', label: 'Follow-up schedule after the trial', type: 'textarea' },
      { id: 'qualifiedLeadDefinition', label: 'Definition of a qualified lead', type: 'textarea' },
      { id: 'leadAssignTiming', label: 'When a lead should be assigned to staff', type: 'text' },
      { id: 'maxFollowUps', label: 'How many follow-ups are permitted', type: 'number' },
      { id: 'followUpStop', label: 'When follow-ups must stop', type: 'text' },
      { id: 'leadStatuses', label: 'Lead statuses used by the gym', type: 'table', repeatable: true, columns: [{ id: 'status', label: 'Status', type: 'text' }], rows: [] },
    ],
  },
  {
    id: 'classes_pt',
    title: 'Classes and Personal Training',
    fields: [
      { id: 'classesTable', label: 'Available classes', type: 'table', repeatable: true, columns: CLASS_COLUMNS, rows: [] },
      { id: 'ptPackagesTable', label: 'Personal-training packages', type: 'table', repeatable: true, columns: PT_PACKAGE_COLUMNS, rows: [] },
      { id: 'trainerAvailability', label: 'Trainer availability', type: 'textarea' },
      { id: 'botRecommendTrainer', label: 'Can the chatbot recommend a trainer?', type: 'boolean' },
      { id: 'infoBeforeTrainerConnect', label: 'Information required before connecting a customer to a trainer', type: 'textarea' },
    ],
  },
  {
    id: 'payments_renewals',
    title: 'Payments, Renewals and Refunds',
    intro: 'The bot must not issue refunds, confirm unverified payments, or change membership records without system confirmation.',
    fields: [
      { id: 'paymentMethods', label: 'Online and offline payment methods', type: 'textarea' },
      { id: 'paymentGateway', label: 'Payment gateway or payment-link provider', type: 'text' },
      { id: 'paymentConfirmation', label: 'Payment confirmation process', type: 'textarea' },
      { id: 'invoiceProcess', label: 'Invoice or receipt process', type: 'textarea' },
      { id: 'failedPayments', label: 'Failed payments — approved policy', type: 'textarea' },
      { id: 'duplicatePayments', label: 'Duplicate payments — approved policy', type: 'textarea' },
      { id: 'refunds', label: 'Refunds — approved policy', type: 'textarea' },
      { id: 'cancellationPolicy', label: 'Membership cancellation — approved policy', type: 'textarea' },
      { id: 'freezePolicy', label: 'Membership freeze — approved policy', type: 'textarea' },
      { id: 'transferPolicy', label: 'Membership transfer — approved policy', type: 'textarea' },
      { id: 'renewalWindows', label: 'Renewal windows', type: 'text' },
      { id: 'gracePeriods', label: 'Grace periods', type: 'text' },
      { id: 'lateRenewal', label: 'Late-renewal handling', type: 'textarea' },
      { id: 'discountsCoupons', label: 'Discounts and coupon codes — approved policy', type: 'textarea' },
      { id: 'paymentEscalationOwner', label: 'Person responsible for payment escalation', type: 'text' },
    ],
  },
  {
    id: 'fitgym',
    title: 'Fit Gym Application',
    fields: [
      { id: 'fitgymVersion', label: 'Fit Gym product/version', type: 'text' },
      { id: 'fitgymVendorContact', label: 'Vendor/contact person', type: 'text' },
      { id: 'fitgymApis', label: 'Available APIs', type: 'textarea' },
      { id: 'fitgymWebhooks', label: 'Webhook availability', type: 'boolean' },
      { id: 'fitgymMemberId', label: 'Member identifier', type: 'text' },
      { id: 'fitgymMembershipStatus', label: 'Membership-status availability', type: 'boolean' },
      { id: 'fitgymExpiryDate', label: 'Expiry-date availability', type: 'boolean' },
      { id: 'fitgymPaymentInfo', label: 'Payment information availability', type: 'boolean' },
      { id: 'fitgymClassTrainerInfo', label: 'Class and trainer information availability', type: 'boolean' },
      { id: 'fitgymAttendanceData', label: 'Attendance-data availability', type: 'boolean' },
      { id: 'fitgymDataExport', label: 'Data-export options', type: 'text' },
      { id: 'fitgymUpdateFrequency', label: 'Data-update frequency', type: 'text' },
      { id: 'fitgymSandbox', label: 'Test/sandbox access', type: 'boolean' },
      { id: 'fitgymRestrictions', label: 'Integration restrictions', type: 'textarea' },
      { id: 'fitgymVendorApproval', label: 'Vendor approval required?', type: 'boolean' },
      { id: 'fitgymDocs', label: 'Sample API documentation', type: 'file' },
    ],
  },
  {
    id: 'biometric',
    title: 'Biometric Attendance',
    intro: 'Do not request, export or store fingerprint images or biometric templates. Only member identifiers and attendance events where integration is authorized.',
    fields: [
      { id: 'deviceBrand', label: 'Device brand and model', type: 'text' },
      { id: 'attendanceVendor', label: 'Software/vendor name', type: 'text' },
      { id: 'memberIdMethod', label: 'How the device identifies members', type: 'text' },
      { id: 'attendanceIntegration', label: 'API, SDK, webhook, database or export availability', type: 'textarea' },
      { id: 'attendanceTiming', label: 'Real-time or scheduled attendance data', type: 'select', options: ['Real-time', 'Scheduled', 'Unknown'] },
      { id: 'entryExitEvents', label: 'Entry and exit events available?', type: 'boolean' },
      { id: 'memberIdMapping', label: 'Current member-ID mapping', type: 'textarea' },
      { id: 'duplicateAttendance', label: 'Duplicate attendance handling', type: 'textarea' },
      { id: 'offlineDeviceHandling', label: 'Offline-device handling', type: 'textarea' },
      { id: 'missingAttendanceFix', label: 'Missing attendance correction process', type: 'textarea' },
      { id: 'attendanceEditAccess', label: 'Who can edit attendance', type: 'text' },
      { id: 'dataRetention', label: 'Data-retention policy', type: 'text' },
      { id: 'consentNotice', label: 'Member consent/privacy notice', type: 'textarea' },
      { id: 'attendanceDisputeContact', label: 'Staff contact for attendance disputes', type: 'text' },
    ],
  },
  {
    id: 'automations',
    title: 'Attendance-Based Automations',
    fields: [
      { id: 'automationsTable', label: 'Automations', type: 'table', repeatable: false, columns: AUTOMATION_COLUMNS, rows: AUTOMATION_ROWS },
    ],
  },
  {
    id: 'personality',
    title: 'Chatbot Personality',
    fields: [
      { id: 'assistantName', label: 'Assistant name', type: 'text', required: true },
      { id: 'greeting', label: 'Greeting message', type: 'textarea' },
      { id: 'tone', label: 'Tone', type: 'select', options: ['Formal', 'Friendly', 'Motivational', 'Premium'] },
      { id: 'responseLength', label: 'Response length preference', type: 'select', options: ['Short', 'Detailed'] },
      { id: 'languages', label: 'Languages supported', type: 'text' },
      { id: 'emojisAllowed', label: 'Are emojis allowed?', type: 'boolean' },
      { id: 'wordsToAvoid', label: 'Words or phrases to avoid', type: 'textarea' },
      { id: 'preferredTerminology', label: 'Preferred terminology', type: 'textarea' },
      { id: 'selfIntroduction', label: 'How should the assistant introduce itself?', type: 'textarea' },
      { id: 'uncertaintyResponse', label: 'How should it acknowledge uncertainty?', type: 'textarea' },
      { id: 'closingMessage', label: 'Closing message', type: 'textarea' },
      { id: 'outOfOfficeMessage', label: 'Out-of-office response', type: 'textarea' },
      { id: 'handoffMessage', label: 'Human-handoff message', type: 'textarea' },
    ],
  },
  {
    id: 'guardrails',
    title: 'AI Guardrails',
    isGuardrailSection: true,
    fields: [
      {
        id: 'mandatoryGuardrails', label: 'Mandatory guardrails (confirm each one)', type: 'guardrail-list',
        items: MANDATORY_GUARDRAILS, required: true,
      },
      {
        id: 'additionalGuardrails', label: 'Additional rules', type: 'table', repeatable: true,
        columns: [{ id: 'rule', label: 'Additional rule', type: 'textarea' }], rows: [],
      },
    ],
  },
  {
    id: 'escalation',
    title: 'Human Escalation',
    fields: [
      { id: 'escalationTable', label: 'Escalation matrix', type: 'table', repeatable: false, columns: ESCALATION_COLUMNS, rows: ESCALATION_ROWS },
    ],
  },
  {
    id: 'whatsapp_consent',
    title: 'WhatsApp Consent and Communication',
    intro: 'Marketing communication must only be sent to eligible and consented members.',
    fields: [
      { id: 'consentMethod', label: 'How members provide WhatsApp consent', type: 'textarea' },
      { id: 'approvedNumberUse', label: 'Approved use of their phone number', type: 'textarea' },
      { id: 'transactionalConsent', label: 'Transactional-message consent', type: 'text' },
      { id: 'marketingConsent', label: 'Marketing-message consent', type: 'text' },
      { id: 'optOutKeywords', label: 'Opt-out keywords', type: 'text' },
      { id: 'optOutConfirmation', label: 'Opt-out confirmation message', type: 'textarea' },
      { id: 'doNotContactHandling', label: 'Do-not-contact handling', type: 'textarea' },
      { id: 'messageFrequencyLimits', label: 'Message-frequency limits', type: 'text' },
      { id: 'quietHours', label: 'Quiet hours', type: 'text' },
      {
        id: 'approvedTemplates', label: 'Approved template messages', type: 'table', repeatable: true,
        columns: [{ id: 'template', label: 'Template', type: 'textarea' }], rows: [],
      },
      { id: 'templateApprover', label: 'Who approves future templates', type: 'text' },
    ],
  },
  {
    id: 'edge_cases',
    title: 'Unknown and Edge-Case Questions',
    fields: [
      { id: 'alwaysRefuse', label: 'What questions should the chatbot always refuse?', type: 'textarea' },
      { id: 'alwaysTransfer', label: 'What questions should always be transferred?', type: 'textarea' },
      { id: 'confidentialInfo', label: 'What information is confidential?', type: 'textarea' },
      { id: 'ownerOnlyDecisions', label: 'Which decisions can only the owner make?', type: 'textarea' },
      { id: 'pricesNegotiableOffline', label: 'Are prices negotiable offline?', type: 'boolean' },
      { id: 'discountRequestHandling', label: 'How should the chatbot respond if a customer requests a discount?', type: 'textarea' },
      { id: 'abusiveLanguageHandling', label: 'How should it handle abusive language?', type: 'textarea' },
      { id: 'unrelatedMessageHandling', label: 'How should it handle messages unrelated to the gym?', type: 'textarea' },
      { id: 'memberNotFoundHandling', label: 'How should it respond when a member cannot be found?', type: 'textarea' },
      { id: 'systemDownHandling', label: 'What should happen when Fit Gym or the attendance system is unavailable?', type: 'textarea' },
      { id: 'finalApprover', label: 'Who gives final approval to the chatbot knowledge?', type: 'text', required: true },
    ],
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SECTIONS, MANDATORY_GUARDRAILS, WEEKDAYS };
}
