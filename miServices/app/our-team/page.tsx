import { Metadata } from 'next';
import Image from 'next/image';
import { FiUsers, FiBriefcase, FiUserCheck, FiFileText } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Our Team | miServices',
  description: 'Meet the dedicated team behind miServices - experienced professionals committed to delivering exceptional property inspection services across the UK.',
  keywords: 'miServices team, property inspection experts, inventory specialists, UK property services team',
  openGraph: {
    title: 'Our Team | miServices',
    description: 'Meet the dedicated team behind miServices - experienced professionals committed to delivering exceptional property inspection services.',
    type: 'website',
  },
};

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  initials?: string;
}

const leadershipTeam: TeamMember[] = [
  {
    name: 'Stuart McCormick',
    role: 'CEO',
    initials: 'SM',
  },
  {
    name: 'Marta',
    role: 'Franchise Director',
    image: '/team_photos/marta_1763171110167.avif',
  },
  {
    name: 'Alex McCormick',
    role: 'Operations Director',
    initials: 'AM',
  },
];

const officeManagers: TeamMember[] = [
  {
    name: 'Lorrie',
    role: 'Office Manager - North Office',
    image: '/team_photos/lorrie_1763171117499.avif',
  },
  {
    name: 'Fred Davies',
    role: 'Office Manager - South Office',
    image: '/team_photos/Fred Davies_1763171081608.jpg',
  },
];

const paymentsAndCollections: TeamMember[] = [
  {
    name: 'Nuala',
    role: 'Payments and Collections',
    image: '/team_photos/nuala_1763171099341.avif',
  },
  {
    name: 'Victoria Pasquino',
    role: 'Payments and Collections',
    image: '/team_photos/Victoria Pasquino_1763171081607.jpg',
  },
];

const adminAndBookings: TeamMember[] = [
  {
    name: 'Nic Davies',
    role: 'Senior Administrator',
    image: '/team_photos/Nic Davies_1763171081608.jpg',
  },
  {
    name: 'Kim Cowman',
    role: 'Senior Administrator',
    image: '/team_photos/Kim Cowman_1763171081607.jpg',
  },
  {
    name: 'Darren Mackenney',
    role: 'Administrator',
    image: '/team_photos/Darren Mackenney_1763171081607.jpg',
  },
  {
    name: 'Kerry Taylor',
    role: 'Administrator',
    image: '/team_photos/Kerry Taylor_1763171081607.jpg',
  },
];

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group">
      <div className="relative h-80 bg-gradient-to-br from-brand-dark-blue to-brand-light-blue">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover opacity-95 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-5xl font-bold text-white font-helvetica">
                {member.initials}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white font-helvetica mb-1">
            {member.name}
          </h3>
          <p className="text-white/90 text-sm">{member.role}</p>
        </div>
      </div>
    </div>
  );
}

function TeamSection({ 
  title, 
  icon: Icon, 
  members 
}: { 
  title: string; 
  icon: React.ElementType; 
  members: TeamMember[] 
}) {
  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <Icon className="text-brand-light-blue mr-3" size={32} />
        <h2 className="text-3xl font-bold text-brand-dark-blue font-helvetica">{title}</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

export default function OurTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">Meet Our Team</h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl">
            Dedicated professionals committed to delivering exceptional property inspection services across the UK
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-xl font-semibold text-brand-dark-blue mb-4 font-helvetica">
            We operate from two office locations, but we are one united team
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Our experienced team combines industry expertise with a commitment to excellence, ensuring every property inspection meets the highest standards of quality and professionalism. With offices in both the North and South, we provide comprehensive coverage while maintaining seamless collaboration across all departments.
          </p>
        </div>

        <TeamSection 
          title="Leadership Team" 
          icon={FiBriefcase} 
          members={leadershipTeam} 
        />

        <TeamSection 
          title="Office Management" 
          icon={FiUsers} 
          members={officeManagers} 
        />

        <TeamSection 
          title="Payments and Collections" 
          icon={FiUserCheck} 
          members={paymentsAndCollections} 
        />

        <TeamSection 
          title="Admin and Bookings" 
          icon={FiFileText} 
          members={adminAndBookings} 
        />

        <div className="mt-16 bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">
            Join Our Team
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our growing team. If you're passionate about property services and customer excellence, we'd love to hear from you.
          </p>
          <a
            href="/careers"
            className="inline-block bg-brand-light-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            View Career Opportunities
          </a>
        </div>
      </div>
    </div>
  );
}
