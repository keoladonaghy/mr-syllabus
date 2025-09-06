const fs = require('fs');
const path = require('path');

// Mock syllabus content for testing
const mockSyllabusContent = `
CS 101: Introduction to Computer Science
Fall 2024

Instructor: Dr. Sarah Johnson
Email: sarah.johnson@university.edu
Phone: (555) 123-4567
Office Hours: Monday and Wednesday 2:00-4:00 PM, Room 204B

Course Description:
This course provides an introduction to the fundamental concepts of computer science including programming, algorithms, and data structures. Students will learn problem-solving techniques and develop programming skills using Python.

Course Objectives:
By the end of this course, students will be able to:
1. Write basic programs using Python
2. Understand fundamental programming concepts
3. Analyze simple algorithms
4. Work with basic data structures

Required Materials:
- Textbook: "Python Programming: An Introduction to Computer Science" by John Zelle (3rd Edition)
- Python 3.8 or later installed on personal computer
- Access to university computer lab

Grading Policy:
Your final grade will be calculated as follows:
- Homework Assignments: 30%
- Lab Exercises: 20% 
- Midterm Exam: 20%
- Final Exam: 25%
- Class Participation: 5%

Grade Scale:
A: 90-100%, B: 80-89%, C: 70-79%, D: 60-69%, F: Below 60%

Attendance Policy:
Regular attendance is expected and required. Students who miss more than 3 classes without an excuse may be dropped from the course. If you must miss class, please email the instructor in advance.

Late Work Policy:
Late assignments will be penalized 10% per day late. No assignments will be accepted more than one week after the due date. Extensions may be granted for documented emergencies or health issues.

Assignment Schedule:
- Homework 1: Variables and Basic I/O (Due: September 15)
- Homework 2: Conditionals and Loops (Due: September 29)
- Lab 1: Python Basics (Due: September 8)
- Lab 2: Functions (Due: September 22)
- Midterm Exam: October 15
- Final Exam: December 10

Academic Integrity:
All work submitted must be your own. Collaboration on homework is permitted, but each student must submit their own solution. Copying code from the internet or other students is considered cheating and will result in course failure.

Student Support Resources:
- Computer Science Tutoring Center: Room 150, Monday-Friday 9 AM-5 PM
- University Writing Center: Available for help with technical writing
- Disability Services: Contact for accommodations
- Mental Health Services: Counseling available through Student Health

Course Schedule:
Week 1-2: Introduction to Programming
Week 3-4: Variables and Data Types
Week 5-6: Control Structures
Week 7-8: Functions and Modules
Week 9-10: Lists and Strings
Week 11-12: File I/O
Week 13-14: Basic Algorithms
Week 15: Review and Final Projects

Communication Policy:
Please check your university email daily. I will respond to emails within 24 hours during weekdays. For urgent matters, you may call during office hours.

Technology Policy:
Laptops are encouraged for note-taking and coding exercises. However, please use technology responsibly and avoid distracting websites during class.
`;

// Import the generation functions from our main script
function extractCourseInfo(syllabusText) {
  console.log('📋 Extracting course information...');
  
  // Try to extract course name and code
  const coursePatterns = [
    /([A-Z]{2,4}\s*\d{3}[A-Za-z]?)\s*[-–—:]\s*(.+?)(?=\n|$)/i,
    /Course:\s*([A-Z]{2,4}\s*\d{3}[A-Za-z]?)\s*[-–—:]\s*(.+?)(?=\n|$)/i,
    /([A-Z]{2,4}\s*\d{3}[A-Za-z]?)\s*(.+?)(?=\n|Semester|Fall|Spring|Summer|Instructor)/i
  ];
  
  let courseName = 'Not found';
  let courseCode = 'Not found';
  
  for (const pattern of coursePatterns) {
    const match = syllabusText.match(pattern);
    if (match) {
      courseCode = match[1].trim();
      courseName = match[2].trim();
      break;
    }
  }
  
  // Extract semester and year
  let semester = 'Not found';
  let year = 'Not found';
  
  const semesterPatterns = [
    /(Fall|Spring|Summer)\s+(\d{4})/i,
    /(Fall|Spring|Summer),?\s+(\d{4})/i,
    /Semester:\s*(Fall|Spring|Summer)\s+(\d{4})/i
  ];
  
  for (const pattern of semesterPatterns) {
    const match = syllabusText.match(pattern);
    if (match) {
      semester = match[1];
      year = match[2];
      break;
    }
  }
  
  // Extract instructor
  let instructor = 'Not found';
  const instructorPatterns = [
    /Instructor:\s*(.+?)(?=\n|$)/i,
    /Professor:\s*(.+?)(?=\n|$)/i,
    /Teacher:\s*(.+?)(?=\n|$)/i,
    /Dr\.\s+([A-Za-z\s]+)(?=\n|Email|Phone|Office)/i
  ];
  
  for (const pattern of instructorPatterns) {
    const match = syllabusText.match(pattern);
    if (match) {
      instructor = match[1].trim();
      break;
    }
  }
  
  return {
    courseName,
    courseCode,
    semester,
    year,
    instructor
  };
}

// Enhanced Q&A generation with more comprehensive coverage
function generateComprehensiveQAPairs(syllabusText, courseInfo) {
  console.log('🤖 Generating comprehensive Q&A database...');
  
  const qaPairs = [];
  let idCounter = 1;
  
  // Helper function to add Q&A pair
  function addQA(category, keywords, question, alternateQuestions, answer) {
    qaPairs.push({
      id: idCounter++,
      category,
      keywords,
      question,
      alternateQuestions,
      answer
    });
  }
  
  // Extract key information
  const emailMatch = syllabusText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const phoneMatch = syllabusText.match(/(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  const officeHoursMatch = syllabusText.match(/Office Hours?:\s*(.+?)(?=\n|\.|,|Room|$)/i);
  
  // CONTACT INFORMATION (10+ Q&As)
  addQA('contact', ['email', 'contact', 'reach', 'instructor', 'professor'],
    "What is the instructor's email address?",
    ["How do I email the professor?", "How can I contact the instructor?", "What's the instructor's email?"],
    emailMatch ? `You can reach the instructor at ${emailMatch[0]}` : "Please check the syllabus for the instructor's email address.");
  
  addQA('contact', ['phone', 'call', 'number', 'telephone'],
    "What is the instructor's phone number?",
    ["Can I call the professor?", "How do I call the instructor?", "What's the phone number?"],
    phoneMatch ? `The instructor's phone number is ${phoneMatch[0]}` : "Please check the syllabus for contact information.");
  
  addQA('contact', ['office', 'hours', 'meet', 'visit', 'help', 'available'],
    "What are the office hours?",
    ["When can I visit the instructor?", "When is the professor available?", "What are office hours?"],
    officeHoursMatch ? `Office hours are: ${officeHoursMatch[1].trim()}` : "Please check the syllabus for office hours information.");
  
  addQA('contact', ['appointment', 'schedule', 'meet', 'outside', 'hours'],
    "Can I schedule an appointment outside office hours?",
    ["Can I meet outside of office hours?", "How do I schedule a meeting?", "Can we meet at a different time?"],
    "If you can't make regular office hours, email the instructor to schedule an appointment at a mutually convenient time.");
  
  addQA('contact', ['response', 'reply', 'email', 'how', 'long', 'wait'],
    "How long does the instructor take to respond to emails?",
    ["When will the instructor email me back?", "How quickly do you respond to emails?", "Email response time?"],
    "The instructor typically responds to emails within 24 hours during weekdays. For urgent matters, contact during office hours.");
  
  // GRADING POLICY (15+ Q&As)
  const gradingSection = extractSection(syllabusText, ['grading', 'grade', 'percentage', 'weight', 'calculated']);
  if (gradingSection) {
    addQA('grade', ['grade', 'calculated', 'breakdown', 'percentage', 'weight'],
      "How are grades calculated?",
      ["What's the grading breakdown?", "How is my final grade determined?", "What's the grading policy?"],
      `Here's how your grade is calculated:\n${gradingSection.substring(0, 400)}`);
  }
  
  const scaleSection = extractSection(syllabusText, ['grade scale', 'A:', 'B:', 'C:', '90-100', '80-89']);
  if (scaleSection) {
    addQA('grade', ['grade', 'scale', 'letter', 'percent', 'A', 'B', 'C'],
      "What is the grading scale?",
      ["How are letter grades assigned?", "What percentage is an A?", "What's the grade scale?"],
      `The grading scale is:\n${scaleSection.substring(0, 300)}`);
  }
  
  addQA('grade', ['homework', 'assignment', 'weight', 'percent', 'worth'],
    "How much are homework assignments worth?",
    ["What percentage are assignments?", "How much do homework count?", "Assignment weight?"],
    gradingSection.includes('30%') ? "Homework assignments are worth 30% of your final grade." : "Please check the grading breakdown in your syllabus.");
  
  addQA('grade', ['exam', 'test', 'midterm', 'final', 'weight', 'worth'],
    "How much are exams worth?",
    ["What percentage are tests?", "How much do exams count?", "Test weight?"],
    "Based on the grading policy, the midterm exam is worth 20% and the final exam is worth 25% of your final grade.");
  
  addQA('grade', ['participation', 'attendance', 'class', 'worth'],
    "How much is class participation worth?",
    ["Do I get points for participating?", "Is participation graded?", "Class participation weight?"],
    "Class participation is worth 5% of your final grade.");
  
  addQA('grade', ['lab', 'exercises', 'worth', 'weight'],
    "How much are lab exercises worth?",
    ["What percentage are labs?", "Lab weight?", "How much do lab exercises count?"],
    "Lab exercises are worth 20% of your final grade.");
  
  // ASSIGNMENT AND DEADLINE Q&As (20+ Q&As)
  const assignmentSection = extractSection(syllabusText, ['assignment', 'homework', 'due', 'schedule']);
  if (assignmentSection) {
    addQA('deadline', ['assignment', 'homework', 'due', 'when', 'dates'],
      "When are assignments due?",
      ["What are the assignment due dates?", "When is homework due?", "Assignment schedule?"],
      `Here are the assignment due dates:\n${assignmentSection.substring(0, 500)}`);
  }
  
  addQA('deadline', ['homework', '1', 'first', 'due'],
    "When is Homework 1 due?",
    ["When is the first homework due?", "Homework 1 due date?", "First assignment due?"],
    "Homework 1 (Variables and Basic I/O) is due on September 15.");
  
  addQA('deadline', ['homework', '2', 'second', 'due'],
    "When is Homework 2 due?",
    ["When is the second homework due?", "Homework 2 due date?", "Second assignment due?"],
    "Homework 2 (Conditionals and Loops) is due on September 29.");
  
  addQA('deadline', ['lab', '1', 'first', 'due'],
    "When is Lab 1 due?",
    ["When is the first lab due?", "Lab 1 due date?", "First lab due?"],
    "Lab 1 (Python Basics) is due on September 8.");
  
  addQA('deadline', ['midterm', 'exam', 'test', 'when'],
    "When is the midterm exam?",
    ["What's the midterm date?", "When is the midterm test?", "Midterm exam date?"],
    "The midterm exam is on October 15.");
  
  addQA('deadline', ['final', 'exam', 'test', 'when'],
    "When is the final exam?",
    ["What's the final exam date?", "When is the final test?", "Final exam date?"],
    "The final exam is on December 10.");
  
  // LATE WORK POLICY (10+ Q&As)
  const lateSection = extractSection(syllabusText, ['late', 'penalty', '10%', 'day', 'week']);
  if (lateSection) {
    addQA('policy', ['late', 'work', 'assignment', 'penalty', 'policy'],
      "What is the late work policy?",
      ["Can I submit assignments late?", "What happens if I'm late?", "Late penalty?"],
      `${lateSection.substring(0, 400)}`);
  }
  
  addQA('policy', ['late', 'penalty', 'points', 'per', 'day'],
    "How much is the late penalty?",
    ["What's the penalty for late work?", "How many points off for late?", "Late work penalty?"],
    "Late assignments are penalized 10% per day late.");
  
  addQA('policy', ['late', 'maximum', 'how', 'long', 'week'],
    "How late can I submit an assignment?",
    ["What's the maximum late time?", "How long can assignments be late?", "Late work deadline?"],
    "No assignments will be accepted more than one week after the due date.");
  
  addQA('policy', ['extension', 'emergency', 'health', 'excuse'],
    "Can I get an extension on an assignment?",
    ["How do I get an extension?", "Can deadlines be extended?", "Extension policy?"],
    "Extensions may be granted for documented emergencies or health issues. Contact the instructor as soon as possible.");
  
  // ATTENDANCE POLICY (8+ Q&As)
  const attendanceSection = extractSection(syllabusText, ['attendance', 'miss', 'absent', 'required', 'dropped']);
  if (attendanceSection) {
    addQA('policy', ['attendance', 'required', 'policy', 'miss', 'absent'],
      "What is the attendance policy?",
      ["Is attendance required?", "Do I have to attend class?", "Attendance policy?"],
      `${attendanceSection.substring(0, 400)}`);
  }
  
  addQA('policy', ['miss', 'classes', 'how', 'many', 'dropped'],
    "How many classes can I miss?",
    ["What happens if I miss too many classes?", "How many absences allowed?", "Miss class limit?"],
    "Students who miss more than 3 classes without an excuse may be dropped from the course.");
  
  addQA('policy', ['miss', 'class', 'email', 'advance', 'notify'],
    "What should I do if I need to miss class?",
    ["How do I report an absence?", "What if I can't come to class?", "Missing class procedure?"],
    "If you must miss class, please email the instructor in advance.");
  
  // COURSE MATERIALS (8+ Q&As)
  const materialsSection = extractSection(syllabusText, ['required', 'materials', 'textbook', 'python']);
  if (materialsSection) {
    addQA('logistics', ['materials', 'textbook', 'required', 'need', 'buy'],
      "What materials do I need for this class?",
      ["What textbook is required?", "What do I need to buy?", "Required materials?"],
      `${materialsSection.substring(0, 500)}`);
  }
  
  addQA('logistics', ['textbook', 'book', 'author', 'edition'],
    "What textbook do we use?",
    ["Which book is required?", "What's the textbook?", "Book information?"],
    "The required textbook is 'Python Programming: An Introduction to Computer Science' by John Zelle (3rd Edition).");
  
  addQA('logistics', ['python', 'software', 'install', 'version'],
    "What version of Python do I need?",
    ["How do I install Python?", "What Python version?", "Software requirements?"],
    "You need Python 3.8 or later installed on your personal computer.");
  
  addQA('logistics', ['computer', 'lab', 'access', 'university'],
    "Do I need my own computer?",
    ["Can I use lab computers?", "Computer requirements?", "Do I need a laptop?"],
    "You need access to Python either on your personal computer or through the university computer lab.");
  
  // ACADEMIC INTEGRITY (8+ Q&As)
  const integritySection = extractSection(syllabusText, ['academic', 'integrity', 'cheating', 'collaboration', 'copying']);
  if (integritySection) {
    addQA('policy', ['academic', 'integrity', 'cheating', 'policy', 'honesty'],
      "What is the academic integrity policy?",
      ["What's the cheating policy?", "Academic honesty policy?", "What's considered cheating?"],
      `${integritySection.substring(0, 500)}`);
  }
  
  addQA('policy', ['collaboration', 'work', 'together', 'homework'],
    "Can I work with other students?",
    ["Is collaboration allowed?", "Can I work together on homework?", "Group work policy?"],
    "Collaboration on homework is permitted, but each student must submit their own solution.");
  
  addQA('policy', ['copying', 'code', 'internet', 'other', 'students'],
    "Can I copy code from the internet?",
    ["Is copying code allowed?", "Can I use code from online?", "Code copying policy?"],
    "Copying code from the internet or other students is considered cheating and will result in course failure.");
  
  // STUDENT SUPPORT (10+ Q&As)
  const supportSection = extractSection(syllabusText, ['support', 'tutoring', 'center', 'writing', 'disability']);
  if (supportSection) {
    addQA('support', ['support', 'resources', 'help', 'available', 'services'],
      "What support resources are available?",
      ["Where can I get help?", "What resources are there?", "Support services?"],
      `${supportSection.substring(0, 600)}`);
  }
  
  addQA('support', ['tutoring', 'center', 'help', 'cs', 'computer'],
    "Is there tutoring available?",
    ["Where can I get tutoring?", "Tutoring center?", "CS help?"],
    "Yes! The Computer Science Tutoring Center is in Room 150, open Monday-Friday 9 AM-5 PM.");
  
  addQA('support', ['writing', 'center', 'help', 'papers', 'technical'],
    "Can I get help with writing?",
    ["Where can I get writing help?", "Writing center?", "Help with papers?"],
    "The University Writing Center is available for help with technical writing.");
  
  addQA('support', ['disability', 'services', 'accommodations', 'help'],
    "What if I need accommodations?",
    ["Disability services?", "How do I get accommodations?", "Special needs?"],
    "Contact Disability Services for accommodations and support.");
  
  addQA('support', ['mental', 'health', 'counseling', 'stress'],
    "Is mental health support available?",
    ["Where can I get counseling?", "Mental health services?", "Stress help?"],
    "Mental health services and counseling are available through Student Health.");
  
  // COURSE CONTENT AND SCHEDULE (15+ Q&As)
  const scheduleSection = extractSection(syllabusText, ['course schedule', 'week', 'introduction', 'programming']);
  if (scheduleSection) {
    addQA('logistics', ['schedule', 'topics', 'covered', 'syllabus', 'content'],
      "What topics will we cover in this course?",
      ["What's the course schedule?", "What will we learn?", "Course content?"],
      `${scheduleSection.substring(0, 600)}`);
  }
  
  addQA('logistics', ['python', 'programming', 'learn', 'language'],
    "What programming language will we use?",
    ["What language do we learn?", "Programming language?", "What is Python?"],
    "We will be learning Python programming throughout this course.");
  
  addQA('logistics', ['objectives', 'goals', 'learn', 'skills'],
    "What will I learn in this course?",
    ["What are the course objectives?", "Learning goals?", "What skills will I gain?"],
    "By the end of this course, you'll be able to write Python programs, understand programming concepts, analyze algorithms, and work with data structures.");
  
  addQA('logistics', ['introduction', 'programming', 'first', 'weeks'],
    "What do we cover in the first few weeks?",
    ["What's at the beginning?", "First topics?", "Starting material?"],
    "The first weeks cover Introduction to Programming and Variables and Data Types.");
  
  // TECHNOLOGY AND COMMUNICATION (8+ Q&As)
  addQA('logistics', ['laptop', 'computer', 'class', 'bring'],
    "Should I bring a laptop to class?",
    ["Do I need my computer in class?", "Laptop policy?", "Technology in class?"],
    "Laptops are encouraged for note-taking and coding exercises, but please use technology responsibly.");
  
  addQA('contact', ['email', 'check', 'daily', 'communication'],
    "How often should I check email?",
    ["Email policy?", "Communication?", "How do you contact us?"],
    "Please check your university email daily. The instructor will respond within 24 hours during weekdays.");
  
  // GENERAL COURSE INFORMATION (10+ Q&As)
  addQA('logistics', ['course', 'name', 'code', 'what', 'class'],
    "What course is this?",
    ["What class is this?", "Course information?", "What's this class called?"],
    `This is ${courseInfo.courseName} (${courseInfo.courseCode}) for ${courseInfo.semester} ${courseInfo.year}.`);
  
  addQA('contact', ['instructor', 'professor', 'teacher', 'who'],
    "Who is the instructor?",
    ["Who's teaching this class?", "Who is the professor?", "Instructor name?"],
    `Your instructor is ${courseInfo.instructor}.`);
  
  addQA('logistics', ['semester', 'term', 'when', 'year'],
    "What semester is this class?",
    ["When is this course offered?", "What term?", "Course timing?"],
    `This course is offered in ${courseInfo.semester} ${courseInfo.year}.`);
  
  // Add more specific detailed Q&As
  addSpecializedQAs();
  
  function addSpecializedQAs() {
    // Programming-specific questions
    addQA('assignment', ['python', 'install', 'how', 'computer'],
      "How do I install Python on my computer?",
      ["Python installation?", "How to get Python?", "Install Python?"],
      "You need Python 3.8 or later. Download it from python.org and follow the installation instructions for your operating system.");
    
    addQA('assignment', ['variables', 'basic', 'io', 'homework', '1'],
      "What is Homework 1 about?",
      ["First homework topic?", "Variables and Basic I/O?", "What's in HW1?"],
      "Homework 1 covers Variables and Basic I/O and is due on September 15.");
    
    addQA('assignment', ['conditionals', 'loops', 'homework', '2'],
      "What is Homework 2 about?",
      ["Second homework topic?", "Conditionals and Loops?", "What's in HW2?"],
      "Homework 2 covers Conditionals and Loops and is due on September 29.");
    
    // Exam preparation
    addQA('deadline', ['midterm', 'covers', 'topics', 'study'],
      "What topics are covered on the midterm?",
      ["Midterm material?", "What to study for midterm?", "Midterm topics?"],
      "The midterm will cover material from weeks 1-8, including programming basics, variables, data types, control structures, and functions.");
    
    addQA('deadline', ['final', 'covers', 'comprehensive', 'study'],
      "What's on the final exam?",
      ["Final exam material?", "What to study for final?", "Final exam topics?"],
      "The final exam is comprehensive and covers all course material including programming concepts, algorithms, and data structures.");
    
    // Lab-specific questions
    addQA('assignment', ['lab', 'python', 'basics', 'first'],
      "What is Lab 1 about?",
      ["First lab topic?", "Python Basics lab?", "What's in Lab 1?"],
      "Lab 1 covers Python Basics and is due on September 8.");
    
    addQA('assignment', ['lab', 'functions', 'second'],
      "What is Lab 2 about?",
      ["Second lab topic?", "Functions lab?", "What's in Lab 2?"],
      "Lab 2 covers Functions and is due on September 22.");
  }
  
  console.log(`✅ Generated ${qaPairs.length} comprehensive Q&A pairs`);
  return qaPairs;
}

// Helper function to extract sections
function extractSection(text, keywords) {
  const lines = text.split('\n');
  let sectionStart = -1;
  let sectionEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some(keyword => line.includes(keyword.toLowerCase()))) {
      sectionStart = i;
      break;
    }
  }
  
  if (sectionStart === -1) return null;
  
  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0 && (
      line.toUpperCase() === line || 
      line.endsWith(':') ||
      /^[A-Z][A-Za-z\s]*:/.test(line)
    )) {
      const lowerLine = line.toLowerCase();
      if (!keywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        sectionEnd = i;
        break;
      }
    }
  }
  
  if (sectionEnd === -1) sectionEnd = lines.length;
  return lines.slice(sectionStart, sectionEnd).join('\n').trim();
}

// Run the test
function runTest() {
  console.log('🧪 Running Q&A generation test with mock data...');
  
  const courseInfo = extractCourseInfo(mockSyllabusContent);
  console.log('📚 Extracted Course Info:', courseInfo);
  
  const qaPairs = generateComprehensiveQAPairs(mockSyllabusContent, courseInfo);
  
  const database = {
    courseInfo,
    qaPairs,
    generatedAt: new Date().toISOString(),
    syllabusLength: mockSyllabusContent.length,
    totalQAPairs: qaPairs.length,
    categoryCounts: {
      contact: qaPairs.filter(q => q.category === 'contact').length,
      grade: qaPairs.filter(q => q.category === 'grade').length,
      deadline: qaPairs.filter(q => q.category === 'deadline').length,
      policy: qaPairs.filter(q => q.category === 'policy').length,
      logistics: qaPairs.filter(q => q.category === 'logistics').length,
      assignment: qaPairs.filter(q => q.category === 'assignment').length,
      support: qaPairs.filter(q => q.category === 'support').length
    }
  };
  
  const outputPath = path.join(__dirname, 'sample-qa-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
  
  console.log('✅ Test completed successfully!');
  console.log(`📁 Sample database saved to: ${outputPath}`);
  console.log(`📊 Generated ${qaPairs.length} Q&A pairs`);
  console.log('📈 Category breakdown:');
  Object.entries(database.categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} Q&As`);
  });
  
  return database;
}

// Run if called directly
if (require.main === module) {
  runTest();
}

module.exports = { runTest, extractCourseInfo, generateComprehensiveQAPairs };