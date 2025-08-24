import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  role: 'admin' | 'user';
  position: string[];
  team: string[];
  createdAt: string;
  updatedAt: string;
}

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
  'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Emily', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy',
  'Ronald', 'Lisa', 'Timothy', 'Nancy', 'Jason', 'Karen', 'Jeffrey', 'Betty', 'Ryan', 'Helen',
  'Jacob', 'Sandra', 'Gary', 'Donna', 'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon',
  'Stephen', 'Michelle', 'Larry', 'Laura', 'Justin', 'Emily', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
  'Benjamin', 'Dorothy', 'Samuel', 'Lisa', 'Frank', 'Nancy', 'Gregory', 'Karen', 'Raymond', 'Betty',
  'Alexander', 'Helen', 'Patrick', 'Sandra', 'Jack', 'Donna', 'Dennis', 'Carol', 'Jerry', 'Ruth'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
];

const positions = [
  'Software Developer', 'Senior Developer', 'Junior Developer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'DevOps Engineer', 'System Administrator', 'Database Administrator', 'Network Engineer',
  'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Web Designer', 'Product Manager',
  'Project Manager', 'Scrum Master', 'Business Analyst', 'Data Analyst', 'Business Intelligence',
  'QA Engineer', 'Test Lead', 'Quality Assurance', 'Marketing Specialist', 'Content Creator',
  'SEO Specialist', 'Digital Marketing', 'Sales Representative', 'Customer Support', 'Technical Support',
  'Architect', 'Team Lead', 'Engineering Manager', 'CTO', 'CEO', 'CFO', 'HR Manager', 'Recruiter',
  'Legal Counsel', 'Finance Manager', 'Operations Manager', 'Strategy Manager', 'Research Analyst',
  'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 'Security Engineer', 'Cloud Engineer',
  'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Developer', 'Vue Developer',
  'Angular Developer', 'Node.js Developer', 'Python Developer', 'Java Developer', 'C# Developer',
  'PHP Developer', 'Ruby Developer', 'Go Developer', 'Rust Developer', 'Swift Developer',
  'Kotlin Developer', 'Flutter Developer', 'React Native Developer', 'WordPress Developer', 'Shopify Developer'
];

const teams = [
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'QA', 'Design', 'Product', 'Marketing',
  'Sales', 'Support', 'HR', 'Finance', 'Legal', 'Operations', 'Strategy', 'Research', 'Data Science',
  'AI/ML', 'Security', 'Cloud', 'Infrastructure', 'Architecture', 'Engineering', 'Management',
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'iOS', 'Android', 'Flutter', 'React Native', 'WordPress', 'Shopify', 'E-commerce', 'Analytics',
  'Business Intelligence', 'Customer Success', 'Growth', 'Content', 'SEO', 'Social Media',
  'Brand', 'Creative', 'Agile', 'Scrum', 'Kanban', 'Lean', 'Six Sigma', 'Project Management',
  'Program Management', 'Portfolio Management', 'Change Management', 'Risk Management', 'Compliance',
  'Audit', 'Internal Audit', 'External Audit', 'Financial Planning', 'Budgeting', 'Forecasting',
  'Treasury', 'Tax', 'Legal', 'Regulatory', 'Policy', 'Governance', 'Ethics', 'Sustainability',
  'Corporate Social Responsibility', 'Diversity & Inclusion', 'Employee Experience', 'Talent Acquisition',
  'Learning & Development', 'Performance Management', 'Compensation & Benefits', 'Workplace Safety',
  'Health & Wellness', 'Employee Relations', 'Labor Relations', 'International HR', 'HR Technology'
];

const domains = [
  'example.com', 'company.com', 'business.org', 'startup.io', 'tech.net', 'enterprise.com',
  'digital.co', 'innovation.tech', 'future.ai', 'smart.dev', 'cloud.app', 'data.science',
  'web.design', 'mobile.app', 'software.dev', 'platform.io', 'solution.com', 'service.net',
  'product.co', 'market.place', 'ecommerce.shop', 'online.store', 'digital.market', 'tech.solutions',
  'innovation.lab', 'research.center', 'development.studio', 'creative.agency', 'design.firm',
  'consulting.group', 'advisory.partners', 'strategy.firm', 'management.consultants', 'business.solutions',
  'enterprise.solutions', 'corporate.services', 'professional.services', 'expert.consulting',
  'specialist.group', 'expertise.center', 'knowledge.hub', 'learning.academy', 'training.institute',
  'education.center', 'university.edu', 'college.org', 'school.net', 'academy.com', 'institute.org',
  'foundation.org', 'association.org', 'federation.org', 'alliance.org', 'partnership.org',
  'collaboration.net', 'cooperation.org', 'network.group', 'community.org', 'society.org'
];

function generateRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function generateRandomEmail(name: string): string {
  const firstName = name.split(' ')[0].toLowerCase();
  const lastName = name.split(' ')[1].toLowerCase();
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const emailVariations = [
    `${firstName}.${lastName}@${domain}`,
    `${firstName}${lastName}@${domain}`,
    `${firstName[0]}${lastName}@${domain}`,
    `${firstName}_${lastName}@${domain}`,
    `${firstName}-${lastName}@${domain}`,
    `${firstName}${Math.floor(Math.random() * 999)}@${domain}`
  ];
  return emailVariations[Math.floor(Math.random() * emailVariations.length)];
}

function generateRandomPositions(): string[] {
  const numPositions = Math.floor(Math.random() * 3) + 1; // 1-3 positions
  const shuffled = positions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numPositions);
}

function generateRandomTeams(): string[] {
  const numTeams = Math.floor(Math.random() * 3) + 1; // 1-3 teams
  const shuffled = teams.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTeams);
}

function generateRandomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateUsers(count: number): UserData[] {
  const users: UserData[] = [];
  
  for (let i = 1; i <= count; i++) {
    const name = generateRandomName();
    const email = generateRandomEmail(name);
    const createdAt = generateRandomDate(new Date('2023-01-01'), new Date('2024-01-16'));
    const isEmailVerified = Math.random() > 0.2; // 80% verified
    const lastLoginAt = isEmailVerified && Math.random() > 0.3 ? 
      generateRandomDate(new Date(createdAt), new Date()) : null;
    const role = Math.random() > 0.9 ? 'admin' : 'user'; // 10% admins
    
    const user: UserData = {
      id: uuidv4(),
      name,
      email,
      password: 'SecurePass123!',
      isEmailVerified,
      lastLoginAt,
      role,
      position: generateRandomPositions(),
      team: generateRandomTeams(),
      createdAt,
      updatedAt: lastLoginAt || createdAt
    };
    
    users.push(user);
  }
  
  return users;
}

// Generate 1000 users
const users = generateUsers(1000);

// Write to file
const outputPath = path.join(__dirname, '../1000_users.json');
fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));

console.log(`✅ Generated ${users.length} users successfully!`);
console.log(`📁 File saved to: ${outputPath}`);

// Show some statistics
const adminCount = users.filter(u => u.role === 'admin').length;
const verifiedCount = users.filter(u => u.isEmailVerified).length;
const activeCount = users.filter(u => u.lastLoginAt !== null).length;

console.log('\n📊 User Statistics:');
console.log(`   Total Users: ${users.length}`);
console.log(`   Admins: ${adminCount} (${(adminCount/users.length*100).toFixed(1)}%)`);
console.log(`   Email Verified: ${verifiedCount} (${(verifiedCount/users.length*100).toFixed(1)}%)`);
console.log(`   Active Users: ${activeCount} (${(activeCount/users.length*100).toFixed(1)}%)`);