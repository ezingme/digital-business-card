import { CardData, TemplateType } from './types';

export const AVAILABLE_COLORS = [
  '#4f46e5', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#e11d48', // Rose
  '#1e293b', // Slate
  '#8b5cf6', // Violet
];

export const INITIAL_CARD_DATA: CardData = {
  id: '1',
  template: TemplateType.MODERN,
  themeColor: '#4f46e5',
  personalInfo: {
    fullName: 'Alex Morgan',
    title: 'Senior Product Designer',
    company: 'Creative Flow Studio',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'www.alexmorgan.design',
    avatarUrl: 'https://picsum.photos/200/200',
    coverUrl: 'https://picsum.photos/800/300',
  },
  socialLinks: [
    { id: '1', platform: 'linkedin', url: 'https://linkedin.com' },
    { id: '2', platform: 'twitter', url: 'https://twitter.com' },
    { id: '3', platform: 'instagram', url: 'https://instagram.com' },
  ],
  sections: [
    {
      id: 'bio',
      type: 'about',
      title: 'About Me',
      isVisible: true,
      content: "I am a passionate designer with over 8 years of experience in creating digital products that people love to use. My approach combines user-centric design principles with modern aesthetics to deliver impactful solutions.",
    },
    {
      id: 'services',
      type: 'services',
      title: 'My Services',
      isVisible: true,
      items: [
        { id: 's1', title: 'UI/UX Design', desc: 'Creating intuitive and beautiful interfaces.' },
        { id: 's2', title: 'Brand Identity', desc: 'Crafting unique visual languages for brands.' },
        { id: 's3', title: 'Web Development', desc: 'Building responsive and fast websites.' },
      ]
    },
    {
      id: 'custom-text',
      type: 'rich-text',
      title: 'Experience',
      isVisible: true,
      content: "<ul><li><strong>Senior Designer</strong> at TechCorp (2020-Present)</li><li><strong>UI Designer</strong> at WebFlow (2018-2020)</li></ul><p>Specializing in <em>design systems</em> and accessibility.</p>"
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact Info',
      isVisible: true,
    },
    {
      id: 'social',
      type: 'social',
      title: 'Social Profiles',
      isVisible: true,
    }
  ],
};