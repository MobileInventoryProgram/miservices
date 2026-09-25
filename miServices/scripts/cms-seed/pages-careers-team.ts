import { cta, hero, img, link, seo } from './helpers';

const person = (name: string, role: string, photo?: string, initials?: string) => ({
  _type: 'teamMember',
  name,
  role,
  ...(photo ? { photo: { ...img(photo, name), _type: 'imageWithAlt' } } : {}),
  ...(initials ? { initials } : {}),
});

/** Copied from the previous hardcoded app/careers/page.tsx and app/our-team/page.tsx */
export default [
  {
    _id: 'careersPage',
    _type: 'careersPage',
    hero: hero('Careers at miServices', 'Build your career in property inspection services'),
    why: {
      heading: 'Why Work With Us?',
      text: "At miServices, we're always looking for talented professionals to join our growing team. Whether you're interested in becoming a franchise partner or joining our corporate team, we offer exciting opportunities for career growth.",
      cards: [
        { _type: 'promoCard', heading: 'Franchise Opportunities', text: 'Build your own property inspection business with our proven franchise model.', button: link('Learn more →', '/franchise') },
        { _type: 'promoCard', heading: 'Corporate Positions', text: 'Join our head office team in various operational and support roles.', button: link('Contact us →', '/contact') },
      ],
    },
    cta: cta('Ready to Join Us?', 'Get in touch to discuss career opportunities', link('Contact Us', '/contact')),
    seo: seo('Careers | miServices', "Join the miServices team. Explore career opportunities in property inspection services across the UK."),
  },
  {
    _id: 'ourTeamPage',
    _type: 'ourTeamPage',
    hero: hero('Meet Our Team', 'Dedicated professionals committed to delivering exceptional property inspection services across the UK'),
    intro: {
      heading: 'We operate from two office locations, but we are one united team',
      text: 'Our experienced team combines industry expertise with a commitment to excellence, ensuring every property inspection meets the highest standards of quality and professionalism. With offices in both the North and South, we provide comprehensive coverage while maintaining seamless collaboration across all departments.',
    },
    groups: [
      { _type: 'teamGroup', title: 'Leadership Team', icon: 'briefcase', members: [person('Stuart McCormick', 'CEO', undefined, 'SM'), person('Marta', 'Franchise Director', '/team_photos/marta_1763171110167.avif'), person('Alex McCormick', 'Operations Director', undefined, 'AM')] },
      { _type: 'teamGroup', title: 'Office Management', icon: 'users', members: [person('Lorrie', 'Office Manager - North Office', '/team_photos/lorrie_1763171117499.avif'), person('Fred Davies', 'Office Manager - South Office', '/team_photos/Fred Davies_1763171081608.jpg')] },
      { _type: 'teamGroup', title: 'Payments and Collections', icon: 'userCheck', members: [person('Nuala', 'Payments and Collections', '/team_photos/nuala_1763171099341.avif'), person('Victoria Pasquino', 'Payments and Collections', '/team_photos/Victoria Pasquino_1763171081607.jpg')] },
      {
        _type: 'teamGroup',
        title: 'Admin and Bookings',
        icon: 'fileText',
        members: [
          person('Nic Davies', 'Senior Administrator', '/team_photos/Nic Davies_1763171081608.jpg'),
          person('Kim Cowman', 'Senior Administrator', '/team_photos/Kim Cowman_1763171081607.jpg'),
          person('Darren Mackenney', 'Administrator', '/team_photos/Darren Mackenney_1763171081607.jpg'),
          person('Kerry Taylor', 'Administrator', '/team_photos/Kerry Taylor_1763171081607.jpg'),
        ],
      },
    ],
    join: {
      heading: 'Join Our Team',
      text: "We're always looking for talented individuals to join our growing team. If you're passionate about property services and customer excellence, we'd love to hear from you.",
      button: link('View Career Opportunities', '/careers'),
    },
    seo: seo('Our Team | miServices', "Meet the dedicated team behind miServices - experienced professionals committed to delivering exceptional property inspection services across the UK.", 'miServices team, property inspection experts, inventory specialists, UK property services team'),
  },
];
