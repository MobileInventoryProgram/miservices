import { Metadata } from 'next';
import Image from 'next/image';
import { CmsIcon } from '@/lib/cms/icons';
import { buildMetadata, getPageDoc, imageUrl } from '@/lib/cms/site';
import type { CmsHero, CmsImage, CmsLink, CmsSeo } from '@/lib/cms/types';

interface TeamMember {
  _key?: string;
  name: string;
  role: string;
  image?: string;
  initials?: string;
}

interface OurTeamPageDoc {
  hero?: CmsHero;
  intro?: { heading?: string; text?: string };
  groups?: { _key?: string; title?: string; icon?: string; members?: (Omit<TeamMember, 'image'> & { photo?: CmsImage })[] }[];
  join?: { heading?: string; text?: string; button?: CmsLink };
  seo?: CmsSeo;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<OurTeamPageDoc>('ourTeamPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/our-team' });
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group">
      <div className="relative h-80 bg-gradient-to-br from-brand-dark-blue to-brand-light-blue">
        {member.image ? (
          <Image
            src={member.image}
            sizes="(max-width: 768px) 100vw, 33vw"
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

function TeamSection({ title, icon, members }: { title?: string; icon?: string; members: TeamMember[] }) {
  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <CmsIcon name={icon} className="text-brand-light-blue mr-3" size={32} />
        <h2 className="text-3xl font-bold text-brand-dark-blue font-helvetica">{title}</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <TeamMemberCard key={member._key || member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

export default async function OurTeamPage() {
  const doc = await getPageDoc<OurTeamPageDoc>('ourTeamPage');
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">{doc?.hero?.heading}</h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl">
            {doc?.hero?.subheading}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-xl font-semibold text-brand-dark-blue mb-4 font-helvetica">
            {doc?.intro?.heading}
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">{doc?.intro?.text}</p>
        </div>

        {(doc?.groups || []).map((group, i) => (
          <TeamSection
            key={group._key || i}
            title={group.title}
            icon={group.icon}
            members={(group.members || []).map((m) => ({ ...m, image: imageUrl(m.photo, 800) }))}
          />
        ))}

        <div className="mt-16 bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">
            {doc?.join?.heading}
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">{doc?.join?.text}</p>
          {doc?.join?.button && (
            <a
              href={doc.join.button.href}
              className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              {doc.join.button.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
