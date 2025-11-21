export enum TemplateType {
  MODERN = 'modern',
  ELEGANT = 'elegant',
  CREATIVE = 'creative',
}

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'twitter' | 'github' | 'instagram' | 'facebook' | 'globe';
  url: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
}

export interface CardSection {
  id: string;
  type: 'about' | 'services' | 'contact' | 'social' | 'testimonials' | 'rich-text';
  title: string;
  isVisible: boolean;
  content?: string; // For text/html content
  items?: ServiceItem[]; // For list items like services
}

export interface CardData {
  id: string;
  template: TemplateType;
  themeColor: string;
  personalInfo: {
    fullName: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    avatarUrl: string;
    coverUrl: string;
  };
  sections: CardSection[];
  socialLinks: SocialLink[];
}

export type SectionUpdater = (id: string, updates: Partial<CardSection>) => void;