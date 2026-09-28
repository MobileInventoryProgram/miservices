import { defineField, defineType } from 'sanity';
import { JOB_TYPES } from '../../lib/job-types';
import { CLIENT_TYPES, CONTACT_STATUSES } from '../../lib/crm/options';

/**
 * A franchise's client/prospect. Belongs to a franchise (every login on that
 * franchise can see it) and records which member owns it. Head Office admins
 * see all contacts. Managed in Members Area → Contacts.
 */
export default defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  fields: [
    defineField({
      name: 'franchise',
      title: 'Franchise',
      type: 'reference',
      to: [{ type: 'franchisee' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'owner', title: 'Owner', type: 'reference', to: [{ type: 'member' }] }),
    defineField({ name: 'firstName', title: 'First Name', type: 'string' }),
    defineField({ name: 'lastName', title: 'Last Name', type: 'string' }),
    defineField({ name: 'companyName', title: 'Company Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'text', rows: 2 }),
    defineField({ name: 'postcode', title: 'Postcode', type: 'string' }),
    defineField({
      name: 'clientType',
      title: 'Client Type',
      type: 'string',
      options: { list: CLIENT_TYPES.map(({ value, label }) => ({ value, title: label })) },
    }),
    defineField({ name: 'propertyCount', title: 'Number of Properties', type: 'number' }),
    defineField({
      name: 'jobTypes',
      title: 'Job Types',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: JOB_TYPES.map(({ value, label }) => ({ value, title: label })) },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: CONTACT_STATUSES.map(({ value, label }) => ({ value, title: label })) },
      initialValue: 'lead',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: { list: [{ value: 'manual', title: 'Added manually' }, { value: 'quote', title: 'Added while quoting' }] },
      initialValue: 'manual',
    }),
    defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 4 }),
    defineField({
      name: 'marketing',
      title: 'Marketing emails',
      type: 'object',
      description: 'Consent to Head Office marketing emails, kept in step with the Resend mailing list.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'consent', title: 'Agreed to marketing emails', type: 'boolean' }),
        defineField({ name: 'consentAt', title: 'Agreed on', type: 'datetime', readOnly: true }),
        defineField({ name: 'consentBy', title: 'Recorded by', type: 'string', readOnly: true }),
        defineField({ name: 'consentSource', title: 'Recorded in', type: 'string', readOnly: true }),
        defineField({ name: 'unsubscribedAt', title: 'Unsubscribed on', type: 'datetime', readOnly: true }),
        defineField({ name: 'syncedAt', title: 'Last synced to Resend', type: 'datetime', readOnly: true }),
        defineField({ name: 'syncError', title: 'Last sync problem', type: 'string', readOnly: true }),
      ],
    }),
    defineField({ name: 'archived', title: 'Archived', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Created', type: 'datetime', readOnly: true }),
    defineField({ name: 'updatedAt', title: 'Updated', type: 'datetime', readOnly: true }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      companyName: 'companyName',
      franchise: 'franchise.companyName',
    },
    prepare: ({ firstName, lastName, companyName, franchise }) => ({
      title: [firstName, lastName].filter(Boolean).join(' ') || companyName || 'Unnamed contact',
      subtitle: [companyName, franchise].filter(Boolean).join(' — '),
    }),
  },
  orderings: [{ title: 'Newest', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
});
