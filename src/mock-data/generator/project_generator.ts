import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  members: string[];
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
}

const projectNames = [
  "E-commerce Platform Redesign", // 1
  "Mobile App Development", // 2
  "Data Analytics Dashboard", // 3
  "API Gateway Implementation", // 4
  "Cloud Migration Project", // 5
  "Customer Portal Enhancement", // 6
  "Inventory Management System", // 7
  "Payment Processing Integration", // 8
  "Real-time Chat Application", // 9
  "Content Management System", // 10
  "User Authentication Service", // 11
  "Reporting and Analytics Platform", // 12
  "Email Marketing Automation", // 13
  "Social Media Integration", // 14
  "E-learning Platform Development", // 15
  "Healthcare Management System", // 16
  "Financial Reporting Dashboard", // 17
  "Supply Chain Optimization", // 18
  "Customer Relationship Management", // 19
  "Human Resources Portal", // 20
  "Project Management Tool", // 21
  "Time Tracking Application", // 22
  "Expense Management System", // 23
  "Document Management Platform", // 24
  "Workflow Automation Engine", // 25
  "Business Intelligence Platform", // 26
  "Machine Learning Pipeline", // 27
  "IoT Device Management", // 28
  "Blockchain Integration", // 29
  "Cybersecurity Enhancement", // 30
  "Performance Monitoring System", // 31
  "Load Balancing Implementation", // 32
  "Database Optimization", // 33
  "Microservices Architecture", // 34
  "Container Orchestration", // 35
  "Serverless Application", // 36
  "Progressive Web App", // 37
  "Voice Assistant Integration", // 38
  "Augmented Reality Features", // 39
  "Virtual Reality Platform", // 40
  "Gamification System", // 41
  "Recommendation Engine", // 42
  "Search Optimization", // 43
  "Multi-language Support", // 44
  "Accessibility Compliance", // 45
  "GDPR Compliance Implementation", // 46
  "PCI DSS Compliance", // 47
  "ISO 27001 Certification", // 48
  "Disaster Recovery Plan", // 49
  "Backup and Restore System", // 50
  "Monitoring and Alerting", // 51
  "Log Management System", // 52
  "Performance Testing Suite", // 53
  "Security Testing Framework", // 54
  "Automated Testing Pipeline", // 55
  "Continuous Integration Setup", // 56
  "Continuous Deployment Pipeline", // 57
  "Infrastructure as Code", // 58
  "Configuration Management", // 59
  "Service Mesh Implementation", // 60
  "API Documentation Platform", // 61
  "Developer Portal", // 62
  "Third-party Integration Hub", // 63
  "Data Pipeline Architecture", // 64
  "Real-time Data Processing", // 65
  "Batch Processing System", // 66
  "Data Warehouse Migration", // 67
  "Business Process Automation", // 68
  "Workflow Engine Development", // 69
  "Approval System Implementation", // 70
  "Notification Service", // 71
  "Email Service Enhancement", // 72
  "SMS Gateway Integration", // 73
  "Push Notification System", // 74
  "In-app Messaging", // 75
  "Customer Support Portal", // 76
  "Knowledge Base Platform", // 77
  "FAQ Management System", // 78
  "Ticket Management System", // 79
  "Live Chat Integration", // 80
  "Video Conferencing Platform", // 81
  "Screen Sharing Application", // 82
  "File Sharing System", // 83
  "Collaboration Tools", // 84
  "Team Communication Platform", // 85
  "Calendar Integration", // 86
  "Meeting Scheduler", // 87
  "Resource Planning Tool", // 88
  "Budget Management System", // 89
  "Cost Tracking Application", // 90
  "Vendor Management Portal", // 91
  "Contract Management System", // 92
  "Legal Document Automation", // 93
  "Compliance Monitoring", // 94
  "Audit Trail Implementation", // 95
  "Data Governance Platform", // 96
  "Privacy Management System", // 97
  "Consent Management", // 98
  "Data Retention Policy", // 99
  "Archive Management System" // 100
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

function generateRandomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateRandomDateIn2025(): string {
  // Generate random date in 2025 (January 1, 2025 to December 31, 2025)
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  return generateRandomDate(startDate, endDate);
}

function generateProjects(count: number): ProjectData[] {
  const projects: ProjectData[] = [];
  
  // Load user and task data
  const usersPath = path.join(__dirname, '../1000_users.json');
  const tasksPath = path.join(__dirname, '../5000_tasks.json');
  
  const users: UserData[] = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const tasks: TaskData[] = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  
  console.log(`📖 Loaded ${users.length} users and ${tasks.length} tasks`);
  
  for (let i = 0; i < count; i++) {
    const createdAtDate = generateRandomDate(new Date('2024-01-01'), new Date('2024-01-16'));
    const createdAt = new Date(createdAtDate);
    const dueDate = generateRandomDateIn2025(); // Random date in 2025
    const updatedAt = generateRandomDate(createdAt, new Date());
    
    // Generate random number of members (1-5)
    const numMembers = Math.floor(Math.random() * 5) + 1;
    const shuffledUsers = users.sort(() => 0.5 - Math.random());
    const selectedMembers = shuffledUsers.slice(0, numMembers).map(user => user.id);
    
    // Generate random number of tasks (1-8)
    const numTasks = Math.floor(Math.random() * 8) + 1;
    const shuffledTasks = tasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffledTasks.slice(0, numTasks).map(task => task.id);
    
    const project: ProjectData = {
      id: uuidv4(),
      name: projectNames[i],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      dueDate: dueDate,
      members: selectedMembers,
      tasks: selectedTasks,
      createdAt: createdAtDate,
      updatedAt: updatedAt
    };
    
    projects.push(project);
  }
  
  return projects;
}

// Generate 100 projects
const projects = generateProjects(100);

// Write to file
const outputPath = path.join(__dirname, '../100_projects.json');
fs.writeFileSync(outputPath, JSON.stringify(projects, null, 2));

console.log(`✅ Generated ${projects.length} projects successfully!`);
console.log(`📁 File saved to: ${outputPath}`);

// Show some statistics
const totalMembers = projects.reduce((sum, project) => sum + project.members.length, 0);
const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
const avgMembers = (totalMembers / projects.length).toFixed(1);
const avgTasks = (totalTasks / projects.length).toFixed(1);

console.log('\n�� Project Statistics:');
console.log(`   Total Projects: ${projects.length}`);
console.log(`   Total Members Assigned: ${totalMembers}`);
console.log(`   Total Tasks Assigned: ${totalTasks}`);
console.log(`   Average Members per Project: ${avgMembers}`);
console.log(`   Average Tasks per Project: ${avgTasks}`);

// Show project name validation
console.log('\n✅ Project Names Validation:');
console.log(`   Expected: 100 project names`);
console.log(`   Actual: ${projectNames.length} project names`);
console.log(`   Status: ${projectNames.length === 100 ? '✅ Correct' : '❌ Incorrect'}`);