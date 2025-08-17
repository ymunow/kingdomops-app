// Natural abilities and skills mapping for ministry placement
export interface NaturalAbility {
  key: string;
  category: 'ARTS' | 'SKILL' | 'SPORTS';
  displayName: string;
  description: string;
  ministryApplications: string[];
}

export const NATURAL_ABILITIES: NaturalAbility[] = [
  // Arts
  {
    key: 'ARTS_ARTIST',
    category: 'ARTS',
    displayName: 'Artist',
    description: 'Visual arts, drawing, painting, design',
    ministryApplications: ['Church decorations', 'Bulletin graphics', 'Event promotional materials', 'Children ministry crafts']
  },
  {
    key: 'ARTS_BASS_GUITAR',
    category: 'ARTS',
    displayName: 'Bass Guitar',
    description: 'Bass guitar performance and music',
    ministryApplications: ['Worship team', 'Youth ministry music', 'Special events']
  },
  {
    key: 'ARTS_DANCE',
    category: 'ARTS',
    displayName: 'Dance',
    description: 'Dance performance and choreography',
    ministryApplications: ['Worship dance', 'Youth ministry', 'Special celebrations', 'Cultural ministry']
  },
  {
    key: 'ARTS_DIRECTOR',
    category: 'ARTS',
    displayName: 'Director',
    description: 'Creative direction and production management',
    ministryApplications: ['Drama ministry', 'Easter/Christmas productions', 'Youth programs', 'Event coordination']
  },
  {
    key: 'ARTS_DRAMA',
    category: 'ARTS',
    displayName: 'Drama',
    description: 'Acting and theatrical performance',
    ministryApplications: ['Drama team', 'Children ministry skits', 'Holiday productions', 'Evangelistic theater']
  },
  {
    key: 'ARTS_DRUMS',
    category: 'ARTS',
    displayName: 'Drums',
    description: 'Percussion and rhythm instruments',
    ministryApplications: ['Worship team', 'Youth band', 'Special events music']
  },
  {
    key: 'ARTS_GUITAR',
    category: 'ARTS',
    displayName: 'Guitar',
    description: 'Guitar performance and music',
    ministryApplications: ['Worship team', 'Youth ministry', 'Small group worship', 'Acoustic ministry']
  },
  {
    key: 'ARTS_KEYBOARD_PIANO',
    category: 'ARTS',
    displayName: 'Keyboard/Piano',
    description: 'Piano and keyboard performance',
    ministryApplications: ['Worship team', 'Children ministry music', 'Special events', 'Accompaniment']
  },
  {
    key: 'ARTS_LEAD_WORSHIP',
    category: 'ARTS',
    displayName: 'Lead Worship',
    description: 'Leading congregational worship and music ministry',
    ministryApplications: ['Worship leader', 'Youth worship', 'Small group worship', 'Special services']
  },
  {
    key: 'ARTS_LIGHTING',
    category: 'ARTS',
    displayName: 'Lighting',
    description: 'Stage and event lighting design',
    ministryApplications: ['Production team', 'Special events', 'Holiday services', 'Drama productions']
  },
  {
    key: 'ARTS_MEDIA_GRAPHICS',
    category: 'ARTS',
    displayName: 'Media/Graphics',
    description: 'Digital media creation and graphic design',
    ministryApplications: ['Marketing materials', 'Social media', 'Presentation slides', 'Website design']
  },
  {
    key: 'ARTS_MUSIC_OTHER',
    category: 'ARTS',
    displayName: 'Music-Other',
    description: 'Other musical instruments and talents',
    ministryApplications: ['Worship team', 'Special music', 'Cultural ministry', 'Children programs']
  },
  {
    key: 'ARTS_PHOTOGRAPHY',
    category: 'ARTS',
    displayName: 'Photography',
    description: 'Photography and visual documentation',
    ministryApplications: ['Event photography', 'Social media content', 'Ministry documentation', 'Website images']
  },
  {
    key: 'ARTS_PRODUCTION',
    category: 'ARTS',
    displayName: 'Production',
    description: 'Event and media production coordination',
    ministryApplications: ['Service production', 'Special events', 'Media ministry', 'Technical coordination']
  },
  {
    key: 'ARTS_SLIDES',
    category: 'ARTS',
    displayName: 'Slides',
    description: 'Presentation and visual media creation',
    ministryApplications: ['Service presentations', 'Teaching materials', 'Event visuals', 'Announcement slides']
  },
  {
    key: 'ARTS_SOUND_TECH',
    category: 'ARTS',
    displayName: 'Sound Tech',
    description: 'Audio engineering and sound systems',
    ministryApplications: ['Audio/Visual team', 'Service production', 'Special events', 'Recording ministry']
  },
  {
    key: 'ARTS_VIDEO',
    category: 'ARTS',
    displayName: 'Video',
    description: 'Video production and editing',
    ministryApplications: ['Service recording', 'Ministry videos', 'Social media content', 'Training materials']
  },
  {
    key: 'ARTS_VOCALIST',
    category: 'ARTS',
    displayName: 'Vocalist',
    description: 'Vocal performance and singing',
    ministryApplications: ['Worship team', 'Choir', 'Special music', 'Youth ministry music']
  },
  {
    key: 'ARTS_WRITER',
    category: 'ARTS',
    displayName: 'Writer',
    description: 'Creative and content writing',
    ministryApplications: ['Newsletter content', 'Social media', 'Drama scripts', 'Teaching materials']
  },

  // Skills
  {
    key: 'SKILL_BUS_DRIVER',
    category: 'SKILL',
    displayName: 'Bus Driver',
    description: 'Commercial driving and transportation',
    ministryApplications: ['Youth trips', 'Senior ministry outings', 'Mission trips', 'Event transportation']
  },
  {
    key: 'SKILL_BUSINESS_MANAGEMENT',
    category: 'SKILL',
    displayName: 'Business Management',
    description: 'Business operations and management experience',
    ministryApplications: ['Ministry leadership', 'Event planning', 'Team coordination', 'Strategic planning']
  },
  {
    key: 'SKILL_CARPENTRY',
    category: 'SKILL',
    displayName: 'Carpentry',
    description: 'Woodworking and construction skills',
    ministryApplications: ['Building maintenance', 'Set construction', 'Mission trips', 'Facility improvements']
  },
  {
    key: 'SKILL_CHILD_CARE',
    category: 'SKILL',
    displayName: 'Child Care',
    description: 'Experience caring for children',
    ministryApplications: ['Nursery ministry', 'Children church', 'VBS', 'Youth programs']
  },
  {
    key: 'SKILL_CLEANING',
    category: 'SKILL',
    displayName: 'Cleaning',
    description: 'Cleaning and maintenance expertise',
    ministryApplications: ['Facility maintenance', 'Event setup/cleanup', 'Community service', 'Mission trips']
  },
  {
    key: 'SKILL_CONSTRUCTION',
    category: 'SKILL',
    displayName: 'Construction',
    description: 'Construction and building trades',
    ministryApplications: ['Building projects', 'Mission trips', 'Facility improvements', 'Community outreach']
  },
  {
    key: 'SKILL_COOKING',
    category: 'SKILL',
    displayName: 'Cooking',
    description: 'Culinary skills and food preparation',
    ministryApplications: ['Fellowship meals', 'Special events', 'Hospitality ministry', 'Community dinners']
  },
  {
    key: 'SKILL_COUNSELING',
    category: 'SKILL',
    displayName: 'Counseling',
    description: 'Professional counseling and therapy background',
    ministryApplications: ['Pastoral care', 'Support groups', 'Crisis intervention', 'Marriage ministry']
  },
  {
    key: 'SKILL_CUSTOMER_SERVICE',
    category: 'SKILL',
    displayName: 'Customer Service',
    description: 'Customer relations and service experience',
    ministryApplications: ['Welcome team', 'Guest services', 'Information desk', 'Phone ministry']
  },
  {
    key: 'SKILL_EDUCATION',
    category: 'SKILL',
    displayName: 'Education',
    description: 'Teaching and educational background',
    ministryApplications: ['Sunday school', 'Adult education', 'Youth teaching', 'Leadership training']
  },
  {
    key: 'SKILL_ELECTRICIAN',
    category: 'SKILL',
    displayName: 'Electrician',
    description: 'Electrical work and systems',
    ministryApplications: ['Building maintenance', 'Audio/Visual setup', 'Facility improvements', 'Mission trips']
  },
  {
    key: 'SKILL_EVENT_COORDINATION',
    category: 'SKILL',
    displayName: 'Event Coordination',
    description: 'Event planning and coordination experience',
    ministryApplications: ['Special events', 'Conferences', 'Retreats', 'Wedding coordination']
  },
  {
    key: 'SKILL_FINANCIAL',
    category: 'SKILL',
    displayName: 'Financial',
    description: 'Finance and accounting expertise',
    ministryApplications: ['Financial ministry', 'Stewardship teaching', 'Budget planning', 'Administrative support']
  },
  {
    key: 'SKILL_HOSPITALITY_INDUSTRY',
    category: 'SKILL',
    displayName: 'Hospitality Industry',
    description: 'Professional hospitality experience',
    ministryApplications: ['Guest services', 'Event hospitality', 'Fellowship coordination', 'Retreat planning']
  },
  {
    key: 'SKILL_MARKETING_COMM',
    category: 'SKILL',
    displayName: 'Marketing/Communications',
    description: 'Marketing and communications background',
    ministryApplications: ['Social media ministry', 'Marketing materials', 'Community outreach', 'Public relations']
  },
  {
    key: 'SKILL_MECHANIC',
    category: 'SKILL',
    displayName: 'Mechanic',
    description: 'Automotive and mechanical repair',
    ministryApplications: ['Vehicle maintenance', 'Mission trip preparation', 'Community service', 'Practical assistance']
  },
  {
    key: 'SKILL_MECHANICAL',
    category: 'SKILL',
    displayName: 'Mechanical',
    description: 'General mechanical skills and repair',
    ministryApplications: ['Building maintenance', 'Equipment repair', 'Mission trips', 'Community service']
  },
  {
    key: 'SKILL_MEDIA_GRAPHICS',
    category: 'SKILL',
    displayName: 'Media/Graphics',
    description: 'Media production and graphic design',
    ministryApplications: ['Marketing materials', 'Website design', 'Social media', 'Presentation graphics']
  },
  {
    key: 'SKILL_MEDICAL',
    category: 'SKILL',
    displayName: 'Medical',
    description: 'Healthcare and medical background',
    ministryApplications: ['Health ministry', 'Mission trips', 'Senior ministry', 'Crisis response']
  },
  {
    key: 'SKILL_OFFICE',
    category: 'SKILL',
    displayName: 'Office',
    description: 'Administrative and office management',
    ministryApplications: ['Administrative support', 'Data management', 'Office coordination', 'Communication']
  },
  {
    key: 'SKILL_PAINTER',
    category: 'SKILL',
    displayName: 'Painter',
    description: 'Painting and finishing work',
    ministryApplications: ['Building maintenance', 'Facility improvements', 'Mission trips', 'Set design']
  },
  {
    key: 'SKILL_PEOPLE',
    category: 'SKILL',
    displayName: 'People Skills',
    description: 'Strong interpersonal and relationship skills',
    ministryApplications: ['Pastoral care', 'Small group leadership', 'Welcome ministry', 'Counseling support']
  },
  {
    key: 'SKILL_PROJECT_MANAGEMENT',
    category: 'SKILL',
    displayName: 'Project Management',
    description: 'Project planning and management expertise',
    ministryApplications: ['Ministry coordination', 'Special projects', 'Team leadership', 'Strategic planning']
  },
  {
    key: 'SKILL_SECURITY',
    category: 'SKILL',
    displayName: 'Security',
    description: 'Security and safety expertise',
    ministryApplications: ['Church security', 'Event safety', 'Children protection', 'Emergency response']
  },
  {
    key: 'SKILL_SETUP_TEARDOWN',
    category: 'SKILL',
    displayName: 'Setup/Teardown',
    description: 'Event setup and logistics coordination',
    ministryApplications: ['Event logistics', 'Service preparation', 'Special events', 'Facility coordination']
  },
  {
    key: 'SKILL_SPA_SERVICES',
    category: 'SKILL',
    displayName: 'Spa Services',
    description: 'Wellness and spa service background',
    ministryApplications: ['Women ministry', 'Retreat coordination', 'Wellness ministry', 'Self-care programs']
  },
  {
    key: 'SKILL_TECH_COMPUTERS',
    category: 'SKILL',
    displayName: 'Technology/Computers',
    description: 'Information technology and computer skills',
    ministryApplications: ['IT support', 'Website management', 'Database management', 'Tech troubleshooting']
  },
  {
    key: 'SKILL_TRANSLATOR',
    category: 'SKILL',
    displayName: 'Translator',
    description: 'Language translation and interpretation',
    ministryApplications: ['Multicultural ministry', 'Mission support', 'Community outreach', 'International ministry']
  },

  // Sports
  {
    key: 'SPORTS_ATHLETE',
    category: 'SPORTS',
    displayName: 'Athlete',
    description: 'Athletic performance and sports experience',
    ministryApplications: ['Sports ministry', 'Youth athletics', 'Community sports leagues', 'Fitness ministry']
  },
  {
    key: 'SPORTS_COACH',
    category: 'SPORTS',
    displayName: 'Coach',
    description: 'Sports coaching and team leadership',
    ministryApplications: ['Youth sports', 'Community athletics', 'Leadership development', 'Mentoring programs']
  },
  {
    key: 'SPORTS_OFFICIAL',
    category: 'SPORTS',
    displayName: 'Official/Referee',
    description: 'Sports officiating and rules expertise',
    ministryApplications: ['Youth sports', 'Community leagues', 'Sports camps', 'Athletic coordination']
  }
];

// Helper functions for natural abilities
export function getAbilitiesByCategory(category: 'ARTS' | 'SKILL' | 'SPORTS'): NaturalAbility[] {
  return NATURAL_ABILITIES.filter(ability => ability.category === category);
}

export function getAbilityByKey(key: string): NaturalAbility | undefined {
  return NATURAL_ABILITIES.find(ability => ability.key === key);
}

export function getMinistryMatchingScore(
  userAbilities: string[], 
  requiredAbilities: string[], 
  preferredAbilities: string[]
): number {
  let score = 0;
  let maxScore = 0;

  // Required abilities (weighted heavily)
  requiredAbilities.forEach(required => {
    maxScore += 10;
    if (userAbilities.includes(required)) {
      score += 10;
    }
  });

  // Preferred abilities (weighted moderately)
  preferredAbilities.forEach(preferred => {
    maxScore += 5;
    if (userAbilities.includes(preferred)) {
      score += 5;
    }
  });

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}