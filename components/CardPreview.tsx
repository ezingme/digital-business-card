import React from 'react';
import { CardData, TemplateType, CardSection, ServiceItem } from '../types';
import { 
  Phone, Mail, MapPin, Globe, Linkedin, Twitter, Github, Instagram, Facebook, Link as LinkIcon 
} from 'lucide-react';

interface CardPreviewProps {
  data: CardData;
}

const IconMap: Record<string, React.ReactNode> = {
  linkedin: <Linkedin size={20} />,
  twitter: <Twitter size={20} />,
  github: <Github size={20} />,
  instagram: <Instagram size={20} />,
  facebook: <Facebook size={20} />,
  globe: <LinkIcon size={20} />,
};

const SocialButton = ({ platform, url, color }: { platform: string, url: string, color: string }) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer"
      className="flex items-center justify-center w-10 h-10 rounded-full text-white transition-transform hover:scale-110"
      style={{ backgroundColor: color }}
    >
      {IconMap[platform] || <LinkIcon size={20} />}
    </a>
  );
};

const ContactItem = ({ icon, text, href }: { icon: React.ReactNode, text: string, href?: string }) => (
  <a 
    href={href || '#'} 
    className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all text-sm text-slate-700"
  >
    <div className="text-slate-400">{icon}</div>
    <span className="truncate">{text}</span>
  </a>
);

export const CardPreview: React.FC<CardPreviewProps> = ({ data }) => {
  const { personalInfo, themeColor, sections, socialLinks } = data;

  const renderSection = (section: CardSection) => {
    if (!section.isVisible) return null;

    switch (section.type) {
      case 'about':
        return (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-slate-800">{section.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        );
      case 'rich-text':
        return (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-slate-800">{section.title}</h3>
            <div 
                className="text-slate-600 text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-p:my-2 prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4"
                dangerouslySetInnerHTML={{ __html: section.content || '' }}
            />
          </div>
        );
      case 'services':
        return (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-slate-800">{section.title}</h3>
            <div className="grid grid-cols-1 gap-3">
              {section.items?.map((item: ServiceItem) => (
                <div key={item.id || Math.random()} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-medium text-slate-800 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
              {(!section.items || section.items.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No services added yet.</p>
              )}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div key={section.id} className="mb-6">
             <h3 className="text-lg font-semibold mb-3 text-slate-800">{section.title}</h3>
             <div className="flex flex-col gap-2">
                {personalInfo.email && <ContactItem icon={<Mail size={16} />} text={personalInfo.email} href={`mailto:${personalInfo.email}`} />}
                {personalInfo.phone && <ContactItem icon={<Phone size={16} />} text={personalInfo.phone} href={`tel:${personalInfo.phone}`} />}
                {personalInfo.website && <ContactItem icon={<Globe size={16} />} text={personalInfo.website} href={`https://${personalInfo.website}`} />}
                {personalInfo.location && <ContactItem icon={<MapPin size={16} />} text={personalInfo.location} />}
             </div>
          </div>
        );
      case 'social':
        return (
          <div key={section.id} className="mb-6">
             <h3 className="text-lg font-semibold mb-3 text-center text-slate-800">{section.title}</h3>
             <div className="flex flex-wrap justify-center gap-3">
               {socialLinks.map(link => (
                 <SocialButton key={link.id} platform={link.platform} url={link.url} color={themeColor} />
               ))}
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- TEMPLATE: MODERN ---
  if (data.template === TemplateType.MODERN) {
    return (
      <div className="w-full h-full bg-white overflow-y-auto relative">
        {/* Header Image */}
        <div className="h-32 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${personalInfo.coverUrl})` }}>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        {/* Profile Content */}
        <div className="px-6 relative">
          {/* Avatar */}
          <div className="-mt-12 mb-4">
            <img 
              src={personalInfo.avatarUrl} 
              alt={personalInfo.fullName} 
              className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
            />
          </div>
          
          {/* Basic Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{personalInfo.fullName}</h1>
            <p className="text-sm font-medium mb-1" style={{ color: themeColor }}>{personalInfo.title}</p>
            <p className="text-xs text-slate-500">{personalInfo.company}</p>
          </div>

          {/* Dynamic Sections */}
          <div className="pb-10">
            {sections.map(renderSection)}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-6 right-6">
          <button 
            className="w-12 h-12 rounded-full shadow-lg text-white flex items-center justify-center hover:scale-105 transition-transform"
            style={{ backgroundColor: themeColor }}
          >
            <MapPin size={20} />
          </button>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: ELEGANT ---
  if (data.template === TemplateType.ELEGANT) {
    return (
      <div className="w-full h-full bg-[#fcfcfc] overflow-y-auto font-serif">
        <div className="p-8 text-center border-b border-slate-200 bg-white">
           <img 
              src={personalInfo.avatarUrl} 
              alt={personalInfo.fullName} 
              className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-2 border-slate-100 shadow-sm"
            />
            <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">{personalInfo.fullName}</h1>
            <p className="uppercase tracking-widest text-xs font-bold text-slate-400 mb-1">{personalInfo.title}</p>
            <p className="text-sm text-slate-500 italic">{personalInfo.company}</p>
        </div>
        <div className="p-8 pb-12">
          {sections.map(renderSection)}
        </div>
      </div>
    );
  }

  // --- TEMPLATE: CREATIVE ---
  return (
    <div className="w-full h-full bg-slate-900 text-white overflow-y-auto font-poppins relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        
        <div className="p-8 pt-12 relative z-10">
           <div className="flex items-end gap-4 mb-8">
              <img 
                src={personalInfo.avatarUrl} 
                alt={personalInfo.fullName} 
                className="w-20 h-20 rounded-full border-2 border-white/20 object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold leading-none mb-2">{personalInfo.fullName}</h1>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-black" style={{ backgroundColor: themeColor }}>
                  {personalInfo.title}
                </span>
              </div>
           </div>
           
           <div className="space-y-8">
              {sections.map((s) => {
                 // Override render for dark mode styles
                 if (!s.isVisible) return null;
                 if (s.type === 'social') {
                   return (
                     <div key={s.id} className="flex gap-4 overflow-x-auto pb-2">
                        {socialLinks.map(l => (
                           <a key={l.id} href={l.url} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                              {IconMap[l.platform]}
                           </a>
                        ))}
                     </div>
                   )
                 }
                 // Handle Rich Text in Dark Mode
                 if (s.type === 'rich-text') {
                    return (
                        <div key={s.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-bold mb-4 opacity-90" style={{ color: themeColor }}>{s.title}</h3>
                            <div 
                                className="text-slate-300 text-sm leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-2 prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4"
                                dangerouslySetInnerHTML={{ __html: s.content || '' }}
                            />
                        </div>
                    )
                 }

                 return (
                   <div key={s.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 opacity-90" style={{ color: themeColor }}>{s.title}</h3>
                      {s.content && <p className="text-slate-300 text-sm leading-relaxed">{s.content}</p>}
                      {s.items && (
                        <div className="space-y-4">
                          {s.items.map((i: ServiceItem) => (
                            <div key={i.id || Math.random()}>
                              <h4 className="font-bold text-white text-sm">{i.title}</h4>
                              <p className="text-xs text-slate-400">{i.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.type === 'contact' && (
                         <div className="space-y-3 text-sm text-slate-300">
                            {personalInfo.email && <div className="flex gap-3 items-center"><Mail size={14}/> {personalInfo.email}</div>}
                            {personalInfo.phone && <div className="flex gap-3 items-center"><Phone size={14}/> {personalInfo.phone}</div>}
                            {personalInfo.website && <div className="flex gap-3 items-center"><Globe size={14}/> {personalInfo.website}</div>}
                         </div>
                      )}
                   </div>
                 )
              })}
           </div>
        </div>
    </div>
  );
};