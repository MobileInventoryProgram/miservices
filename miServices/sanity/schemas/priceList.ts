import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'priceList',
  title: 'Price List',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'owner',
      title: 'Owner (Franchisee)',
      type: 'reference',
      to: [{ type: 'franchisee' }],
      description: 'Leave empty for admin templates. Set to a franchisee for privately owned lists.',
    }),
    defineField({
      name: 'availableToFranchisees',
      title: 'Available to Franchisees',
      type: 'boolean',
      description: 'When true, franchisees can see and duplicate this template. Only meaningful for admin templates (no owner).',
      initialValue: false,
      hidden: ({ document }) => !!document?.owner,
    }),
    defineField({
      name: 'isDefault',
      title: 'Default Price List',
      type: 'boolean',
      description: 'For admin templates: system default. For franchisee lists: default for quoting.',
      initialValue: false,
    }),
    defineField({
      name: 'serviceRows',
      title: 'Service Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'serviceType',
              title: 'Service Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Inventory Only', value: 'inventory' },
                  { title: 'Combined Inventory & Check-in', value: 'combined' },
                  { title: 'Check Out', value: 'checkout' },
                  { title: 'Mid Term Inspection', value: 'midterm' },
                  { title: 'Separate Check In', value: 'checkin' },
                  { title: 'Virtual Tour, Floor Plan & Photography', value: 'virtualTourBundle' },
                  { title: 'Virtual Tour & Floorplan', value: 'virtualTourFloorplan' },
                  { title: 'Floorplan Only', value: 'floorplan' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'bedrooms',
              title: 'Bedrooms',
              type: 'string',
              options: {
                list: [
                  { title: 'Studio / 1 Bed', value: 'studio_1' },
                  { title: '2 Bed', value: '2' },
                  { title: '3 Bed', value: '3' },
                  { title: '4 Bed', value: '4' },
                  { title: '5 Bed', value: '5' },
                  { title: '6 Bed', value: '6' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'maxRooms',
              title: 'Max Rooms',
              type: 'number',
            }),
            defineField({
              name: 'unfurnishedPrice',
              title: 'Unfurnished Price (ex VAT)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'furnishedPrice',
              title: 'Furnished Price (ex VAT)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
          ],
          preview: {
            select: {
              serviceType: 'serviceType',
              bedrooms: 'bedrooms',
              unfurnishedPrice: 'unfurnishedPrice',
              furnishedPrice: 'furnishedPrice',
            },
            prepare({ serviceType, bedrooms, unfurnishedPrice, furnishedPrice }) {
              const serviceLabels: Record<string, string> = {
                inventory: 'Inventory',
                combined: 'Combined',
                checkout: 'Check Out',
                midterm: 'Mid Term',
                checkin: 'Check In',
                virtualTourBundle: 'VT Bundle',
                virtualTourFloorplan: 'VT & Floorplan',
                floorplan: 'Floorplan',
              };
              const bedroomLabels: Record<string, string> = {
                studio_1: 'Studio/1 Bed',
                '2': '2 Bed',
                '3': '3 Bed',
                '4': '4 Bed',
                '5': '5 Bed',
                '6': '6 Bed',
              };
              const priceText = furnishedPrice != null
                ? `£${unfurnishedPrice} unfurn / £${furnishedPrice} furn`
                : `£${unfurnishedPrice}`;
              return {
                title: `${serviceLabels[serviceType] || serviceType} — ${bedroomLabels[bedrooms] || bedrooms}`,
                subtitle: priceText,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'flatRates',
      title: 'Flat Rates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price (ex VAT)',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'unit',
              title: 'Unit',
              type: 'string',
              description: 'e.g. "per visit", "per report"',
            }),
          ],
          preview: {
            select: {
              name: 'name',
              price: 'price',
              unit: 'unit',
            },
            prepare({ name, price, unit }) {
              return {
                title: name,
                subtitle: `£${price}${unit ? ` ${unit}` : ''}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'additionalRoomRates',
      title: 'Additional Room Rates',
      type: 'object',
      fields: [
        defineField({
          name: 'unfurnishedPerRoom',
          title: 'Unfurnished Per Room (ex VAT)',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'furnishedPerRoom',
          title: 'Furnished Per Room (ex VAT)',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
      ],
    }),
    defineField({
      name: 'cancellationFee',
      title: 'Cancellation Fee (ex VAT)',
      type: 'number',
    }),
    defineField({
      name: 'terms',
      title: 'Terms',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isDefault: 'isDefault',
      ownerName: 'owner.companyName',
    },
    prepare({ title, isDefault, ownerName }) {
      const badges = [];
      if (isDefault) badges.push('Default');
      if (ownerName) badges.push(ownerName);
      else badges.push('Admin Template');
      return {
        title,
        subtitle: badges.join(' — '),
      };
    },
  },
});
