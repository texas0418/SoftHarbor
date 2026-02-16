export interface EmergencyResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  text?: string;
  url?: string;
  available: string;
  emoji: string;
}

export const emergencyResources: EmergencyResource[] = [
  {
    id: 'e1',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support for people in distress. Available 24/7 via phone or chat.',
    phone: '988',
    url: 'https://988lifeline.org',
    available: '24/7',
    emoji: '📞',
  },
  {
    id: 'e2',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 to connect with a trained crisis counselor. Free, confidential, available 24/7.',
    text: 'HOME to 741741',
    available: '24/7',
    emoji: '💬',
  },
  {
    id: 'e3',
    name: 'SAMHSA National Helpline',
    description: 'Free, confidential treatment referral and information service for mental health and substance use disorders.',
    phone: '1-800-662-4357',
    available: '24/7, 365 days',
    emoji: '🏥',
  },
  {
    id: 'e4',
    name: 'GriefShare',
    description: 'Find a grief support group near you. Weekly sessions led by people who understand what you\'re going through.',
    url: 'https://www.griefshare.org',
    available: 'Weekly groups',
    emoji: '🤝',
  },
  {
    id: 'e5',
    name: 'National Alliance on Mental Illness (NAMI)',
    description: 'Information, resources, and support for mental health conditions including grief-related depression.',
    phone: '1-800-950-6264',
    text: 'NAMI to 741741',
    url: 'https://www.nami.org',
    available: 'Mon-Fri 10am-10pm ET',
    emoji: '🧠',
  },
  {
    id: 'e6',
    name: 'The Dougy Center',
    description: 'Support for children, teens, young adults, and families who are grieving.',
    phone: '1-866-775-1670',
    url: 'https://www.dougy.org',
    available: 'Mon-Fri 8am-5pm PT',
    emoji: '👨‍👩‍👧',
  },
  {
    id: 'e7',
    name: 'Veterans Crisis Line',
    description: 'For veterans, service members, and their families. Dial 988 then press 1.',
    phone: '988 (press 1)',
    text: '838255',
    available: '24/7',
    emoji: '🎖️',
  },
  {
    id: 'e8',
    name: 'The Compassionate Friends',
    description: 'Support for families who have experienced the death of a child at any age.',
    phone: '1-877-969-0010',
    url: 'https://www.compassionatefriends.org',
    available: '24/7 Helpline',
    emoji: '🕊️',
  },
];
