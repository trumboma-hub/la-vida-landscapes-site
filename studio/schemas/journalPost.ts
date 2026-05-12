import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'journalPost',
  title: 'Journal post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'Auto-fills from the title. This becomes the post URL.',
      options: {source: 'title', maxLength: 80},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Seasonal', value: 'Seasonal'},
          {title: 'Case Study', value: 'Case Study'},
          {title: 'Reflection', value: 'Reflection'},
          {title: 'Project Note', value: 'Project Note'},
        ],
        layout: 'radio',
      },
      initialValue: 'Seasonal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtag',
      title: 'Sub-tag',
      type: 'string',
      description:
        'Short context tag shown next to the category. E.g. "Spring", "Lake Martin, AL", "Founder".',
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text (for screen readers + SEO)',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Alt text is required so the image is accessible.'),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown on the Journal index card.',
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading', value: 'h2'},
            {title: 'Subheading', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {name: 'href', type: 'url', title: 'URL'},
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', type: 'string', title: 'Alt text'},
            {name: 'caption', type: 'string', title: 'Caption'},
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      description: 'The post is only visible on the website once this date has passed.',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'heroImage',
      date: 'publishedAt',
    },
    prepare({title, subtitle, media, date}) {
      const d = date ? new Date(date).toLocaleDateString() : 'unscheduled'
      return {
        title: title || '(untitled)',
        subtitle: `${subtitle || '—'} · ${d}`,
        media,
      }
    },
  },
})
