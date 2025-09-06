const fs = require('fs');
const path = require('path');
const { generateEnhancedQAPairs } = require('./enhanced-qa-generator');

// Mock comprehensive syllabus for demonstration
const comprehensiveMockSyllabus = `
CS 101: Introduction to Computer Science
Fall 2024

Instructor: Dr. Sarah Johnson
Email: sarah.johnson@university.edu
Phone: (555) 123-4567
Office: Room 204B
Office Hours: Monday and Wednesday 2:00-4:00 PM, or by appointment

Course Description:
This course provides an introduction to the fundamental concepts of computer science including programming, algorithms, and data structures. Students will learn problem-solving techniques and develop programming skills using Python programming language.

Course Objectives:
By the end of this course, students will be able to:
1. Write basic programs using Python programming language
2. Understand fundamental programming concepts including variables, loops, and functions
3. Analyze simple algorithms and understand their efficiency
4. Work with basic data structures like lists, strings, and dictionaries
5. Apply problem-solving techniques to computational problems
6. Debug and test programs effectively

Required Materials:
- Textbook: "Python Programming: An Introduction to Computer Science" by John Zelle (3rd Edition) - Required
- Python 3.8 or later installed on personal computer
- Access to university computer lab in Building A, Room 150
- Notebook for taking notes during lectures

Optional Materials:
- "Automate the Boring Stuff with Python" by Al Sweigart (available free online)
- USB drive for backing up work

Class Meeting Information:
- Lectures: Tuesday and Thursday, 10:00-11:30 AM, Room 301
- Lab Sessions: Friday, 2:00-4:00 PM, Computer Lab Room 150
- Total Credit Hours: 4 credits

Grading Policy:
Your final grade will be calculated as follows:
- Homework Assignments (6 total): 30%
- Lab Exercises (8 total): 20% 
- Midterm Exam: 20%
- Final Exam: 25%
- Class Participation and Attendance: 5%

Grade Scale:
A: 90-100% (Excellent work)
B: 80-89% (Good work)
C: 70-79% (Satisfactory work)
D: 60-69% (Below average work)
F: Below 60% (Failing)

Attendance Policy:
Regular attendance is expected and required for success in this course. Students who miss more than 3 classes without a valid excuse may be dropped from the course with a failing grade. If you must miss class due to illness, emergency, or other unavoidable circumstances, please email the instructor in advance when possible.

Excused absences include:
- Documented illness with medical excuse
- Family emergency with documentation
- University-sponsored activities with prior approval
- Religious observances with advance notice

Late Work Policy:
All assignments must be submitted by the specified due date and time (typically 11:59 PM). Late assignments will be penalized as follows:
- 1 day late: 10% penalty
- 2 days late: 20% penalty
- 3-7 days late: 30% penalty
- More than 1 week late: Not accepted (0 points)

Extensions may be granted in cases of documented emergencies, serious illness, or other extenuating circumstances. Students must contact the instructor as soon as possible to request an extension.

Assignment Schedule:
Homework Assignments:
- Homework 1: Variables and Basic I/O (Due: September 15, 11:59 PM)
- Homework 2: Conditionals and Loops (Due: September 29, 11:59 PM)
- Homework 3: Functions and Modules (Due: October 13, 11:59 PM)
- Homework 4: Lists and Data Structures (Due: October 27, 11:59 PM)
- Homework 5: File I/O and String Processing (Due: November 10, 11:59 PM)
- Homework 6: Final Programming Project (Due: December 1, 11:59 PM)

Lab Exercises:
- Lab 1: Python Basics and Setup (Due: September 8)
- Lab 2: Variables and Input/Output (Due: September 15)
- Lab 3: Conditionals and Decision Making (Due: September 22)
- Lab 4: Loops and Iteration (Due: September 29)
- Lab 5: Functions and Problem Solving (Due: October 6)
- Lab 6: Lists and Data Manipulation (Due: October 20)
- Lab 7: File Handling and Text Processing (Due: November 3)
- Lab 8: Algorithm Implementation (Due: November 17)

Exams:
- Midterm Exam: October 15, 2024 (in class, 90 minutes)
- Final Exam: December 10, 2024, 10:00 AM - 12:00 PM (comprehensive)

Academic Integrity:
All work submitted must be your own original work. While collaboration and discussion with classmates is encouraged for learning, each student must write and submit their own individual solutions.

Permitted Activities:
- Discussing concepts and general problem-solving strategies with classmates
- Getting help from the instructor, teaching assistants, or tutoring center
- Using official course materials and recommended resources
- Seeking help for debugging techniques (but not complete solutions)

Prohibited Activities:
- Copying code from other students, websites, or unauthorized sources
- Sharing your complete solutions with other students
- Using AI tools to generate complete solutions
- Having someone else write your code for you
- Submitting work that is not substantially your own

Violations of academic integrity will result in serious consequences, including possible course failure and academic disciplinary action.

Student Support Resources:
- Computer Science Tutoring Center: Room 150, Monday-Friday 9:00 AM-5:00 PM
  Walk-in tutoring and scheduled appointments available
- University Writing Center: Help with technical writing and documentation
  Located in Library Building, 2nd Floor
- Disability Services: Accommodations for students with documented disabilities
  Contact: disability@university.edu or (555) 123-9876
- Mental Health and Counseling Services: Support for stress, anxiety, and personal issues
  Available through Student Health Center: (555) 123-4321
- IT Help Desk: Technical support for computer and software issues
  Available 24/7 online or call (555) 123-HELP

Course Schedule (by Week):
Week 1 (Aug 28-Sep 1): Introduction to Programming and Python
Week 2 (Sep 4-8): Variables, Data Types, and Basic Operations
Week 3 (Sep 11-15): Input/Output and Simple Programs
Week 4 (Sep 18-22): Conditionals and Decision Making
Week 5 (Sep 25-29): Loops and Iteration
Week 6 (Oct 2-6): Functions and Modular Programming
Week 7 (Oct 9-13): Review and Midterm Preparation
Week 8 (Oct 16-20): Midterm Week and Lists Introduction
Week 9 (Oct 23-27): Lists and Data Structures
Week 10 (Oct 30-Nov 3): Strings and Text Processing
Week 11 (Nov 6-10): File Input/Output
Week 12 (Nov 13-17): Basic Algorithms and Problem Solving
Week 13 (Nov 20-24): Thanksgiving Break (No Classes Nov 23-24)
Week 14 (Nov 27-Dec 1): Advanced Topics and Project Work
Week 15 (Dec 4-8): Final Project Presentations and Review
Week 16 (Dec 11): Final Exam Week

Communication Policy:
- Check your university email daily for course announcements
- Instructor will respond to emails within 24 hours during weekdays
- For urgent matters during weekends, call the provided phone number
- All official course communications will be sent via university email
- Students are responsible for all information communicated via email

Technology Policy:
- Laptops and tablets are permitted and encouraged for note-taking and coding exercises
- Use of technology should support learning and not distract from class activities
- Cell phones should be silenced during class
- Social media and non-course websites should not be accessed during class time
- Students may be asked to put devices away if they become disruptive

Makeup Policy:
- Makeup exams will only be given for documented emergencies or serious illness
- Students must contact the instructor within 24 hours of missing an exam
- Makeup exams may be in a different format than the original
- No makeup opportunities for missed lab exercises or assignments beyond the late work policy

Final Project:
The final homework assignment (Homework 6) is a comprehensive programming project that demonstrates mastery of course concepts. Project requirements:
- Must be original work incorporating multiple course topics
- Should be 200-500 lines of well-documented Python code
- Must include error handling and user interface
- Requires written documentation explaining the program's purpose and design
- Due December 1, 2024, with in-class presentations during the final week

Course Evaluation:
Students will have opportunities to provide feedback on the course through:
- Mid-semester anonymous feedback survey
- Official university course evaluations at the end of the semester
- Informal feedback during office hours
- Your input helps improve the course for future students
`;

// Extract course information
function extractCourseInfo(syllabusText) {
  console.log('📋 Extracting course information...');
  
  // Course name and code
  const courseMatch = syllabusText.match(/([A-Z]{2,4}\s*\d{3}[A-Za-z]?)\s*[-–—:]\s*(.+?)(?=\n|$)/i);
  const courseName = courseMatch ? courseMatch[2].trim() : 'Not found';
  const courseCode = courseMatch ? courseMatch[1].trim() : 'Not found';
  
  // Semester and year
  const semesterMatch = syllabusText.match(/(Fall|Spring|Summer)\s+(\d{4})/i);
  const semester = semesterMatch ? semesterMatch[1] : 'Not found';
  const year = semesterMatch ? semesterMatch[2] : 'Not found';
  
  // Instructor
  const instructorMatch = syllabusText.match(/Instructor:\s*(.+?)(?=\n|$)/i);
  const instructor = instructorMatch ? instructorMatch[1].trim() : 'Not found';
  
  return {
    courseName,
    courseCode,
    semester,
    year,
    instructor
  };
}

// Main function to generate comprehensive Q&A database
function generateComprehensiveDatabase() {
  console.log('🚀 Generating comprehensive Q&A database with 100+ pairs...');
  
  // Extract course information
  const courseInfo = extractCourseInfo(comprehensiveMockSyllabus);
  console.log('📚 Course Info:', courseInfo);
  
  // Generate comprehensive Q&A pairs
  const qaPairs = generateEnhancedQAPairs(comprehensiveMockSyllabus, courseInfo);
  
  // Create final database structure
  const database = {
    courseInfo,
    qaPairs,
    metadata: {
      generatedAt: new Date().toISOString(),
      syllabusLength: comprehensiveMockSyllabus.length,
      totalQAPairs: qaPairs.length,
      version: "1.0",
      description: "Comprehensive Q&A database for syllabus-based student inquiries"
    },
    statistics: {
      categoryCounts: {
        contact: qaPairs.filter(q => q.category === 'contact').length,
        grade: qaPairs.filter(q => q.category === 'grade').length,
        deadline: qaPairs.filter(q => q.category === 'deadline').length,
        policy: qaPairs.filter(q => q.category === 'policy').length,
        logistics: qaPairs.filter(q => q.category === 'logistics').length,
        assignment: qaPairs.filter(q => q.category === 'assignment').length,
        support: qaPairs.filter(q => q.category === 'support').length
      },
      totalKeywords: qaPairs.reduce((total, qa) => total + qa.keywords.length, 0),
      averageKeywordsPerQA: Math.round(qaPairs.reduce((total, qa) => total + qa.keywords.length, 0) / qaPairs.length * 10) / 10
    },
    usage: {
      instructions: "Use keywords to match student questions to appropriate Q&A pairs. Each Q&A includes alternate question phrasings to improve matching accuracy.",
      categories: {
        contact: "Questions about reaching the instructor, office hours, communication",
        grade: "Questions about grading, grade calculation, grade scale",
        deadline: "Questions about due dates, exam dates, assignment schedules",
        policy: "Questions about course policies (attendance, late work, academic integrity)",
        logistics: "Questions about course basics, materials, technology requirements",
        assignment: "Questions about specific assignments, homework, labs",
        support: "Questions about student resources, tutoring, accommodations"
      }
    }
  };
  
  // Save to file
  const outputPath = path.join(__dirname, 'comprehensive-qa-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
  
  console.log('✅ Comprehensive Q&A database generated successfully!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📊 Generated ${qaPairs.length} Q&A pairs`);
  console.log('📈 Category breakdown:');
  Object.entries(database.statistics.categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} Q&As`);
  });
  console.log(`🔑 Total keywords: ${database.statistics.totalKeywords}`);
  console.log(`📝 Average keywords per Q&A: ${database.statistics.averageKeywordsPerQA}`);
  
  return database;
}

// Run if called directly
if (require.main === module) {
  generateComprehensiveDatabase();
}

module.exports = { generateComprehensiveDatabase };