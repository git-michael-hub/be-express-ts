const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const taskTitles = [
  "Implement user authentication system",
  "Design responsive dashboard layout", 
  "Set up CI/CD pipeline",
  "Write API documentation",
  "Optimize database queries",
  "Create unit tests for user module",
  "Implement real-time notifications",
  "Add file upload functionality",
  "Configure monitoring and logging",
  "Create user onboarding flow",
  "Build admin panel interface",
  "Implement search functionality",
  "Add data export features",
  "Create reporting dashboard",
  "Set up email notifications",
  "Implement payment integration",
  "Add multi-language support",
  "Create mobile app version",
  "Implement data backup system",
  "Add user activity tracking",
  "Create analytics dashboard",
  "Implement role-based permissions",
  "Add two-factor authentication",
  "Create automated testing suite",
  "Implement caching strategy",
  "Add social media integration",
  "Create help documentation",
  "Implement data validation",
  "Add bulk import functionality",
  "Create user feedback system",
  "Implement dark mode theme",
  "Add keyboard shortcuts",
  "Create data visualization charts",
  "Implement progressive web app",
  "Add voice search capability",
  "Create automated deployment",
  "Implement load balancing",
  "Add real-time collaboration",
  "Create data migration tools",
  "Implement API rate limiting",
  "Add third-party integrations",
  "Create user preferences panel",
  "Implement data encryption",
  "Add automated backups",
  "Create system health monitoring",
  "Implement audit logging",
  "Add data archiving",
  "Create performance optimization",
  "Implement security scanning",
  "Add compliance reporting"
];

const descriptions = [
  "Create a comprehensive solution for managing user data and authentication",
  "Build an intuitive interface that provides excellent user experience",
  "Develop robust backend services with proper error handling",
  "Implement scalable architecture for future growth",
  "Create efficient data processing algorithms",
  "Build secure communication channels between components",
  "Design flexible configuration management system",
  "Implement comprehensive testing strategies",
  "Create automated deployment pipelines",
  "Build monitoring and alerting systems",
  "Develop user-friendly documentation and guides",
  "Implement data validation and sanitization",
  "Create backup and recovery procedures",
  "Build performance optimization features",
  "Implement security best practices",
  "Create accessibility features for all users",
  "Develop integration with external services",
  "Build real-time data synchronization",
  "Implement advanced search capabilities",
  "Create customizable user interfaces"
];

const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'inprogress', 'done', 'block', 'inreview'];

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomDateIn2025() {
  // Generate random date in 2025 (January 1, 2025 to December 31, 2025)
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  return generateRandomDate(startDate, endDate);
}

function generateTasks(count) {
  const tasks = [];
  
  for (let i = 1; i <= count; i++) {
    const createdAt = generateRandomDate(new Date('2024-01-01'), new Date('2024-01-16'));
    const dueDate = generateRandomDateIn2025(); // Random date in 2025
    const updatedAt = generateRandomDate(createdAt, new Date());
    
    const task = {
      id: uuidv4(),
      title: taskTitles[Math.floor(Math.random() * taskTitles.length)] + ` #${i}`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      dueDate: dueDate.toISOString(),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      isArchive: Math.random() > 0.9, // 10% chance of being archived
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    };
    
    tasks.push(task);
  }
  
  return tasks;
}

const tasks = generateTasks(5000);
fs.writeFileSync('./src/mock-data/5000_tasks.json', JSON.stringify(tasks, null, 2));
console.log('Generated 5000 tasks successfully!');