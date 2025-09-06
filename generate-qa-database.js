const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const DOCUMENT_ID = '1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc';
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];

// Authentication
async function getAuthClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }
  
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: SCOPES,
  });
  
  return auth;
}

// Fetch Google Doc content
async function fetchGoogleDoc() {
  try {
    const authClient = await getAuthClient();
    const docs = google.docs({
      version: 'v1',
      auth: authClient,
    });
    
    const res = await docs.documents.get({ documentId: DOCUMENT_ID });
    const content = res.data.body.content;
    const syllabusText = extractTextFromDoc(content);
    
    console.log('✅ Successfully fetched syllabus from Google Doc');
    return syllabusText;
  } catch (err) {
    console.error('❌ Error fetching Google Doc:', err.message);
    throw err;
  }
}

// Extract text from Google Doc structure
function extractTextFromDoc(content) {
  let text = '';
  for (const element of content) {
    if (element.paragraph) {
      for (const run of element.paragraph.elements) {
        if (run.textRun) {
          text += run.textRun.content;
        }
      }
    }
  }
  return text;
}

// Extract course information from syllabus
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

// Generate comprehensive Q&A pairs
function generateQAPairs(syllabusText, courseInfo) {
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
  
  // Extract common information patterns
  const emailMatch = syllabusText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const phoneMatch = syllabusText.match(/(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  const officeMatch = syllabusText.match(/Office(?:\s+Hours?)?:\s*(.+?)(?=\n|Email|Phone|$)/i);
  
  // CONTACT INFORMATION Q&As
  if (emailMatch) {
    addQA('contact', ['email', 'contact', 'reach', 'instructor'], 
      "What is the instructor's email?",
      ["How do I email the professor?", "What's the instructor's email address?", "How can I contact the instructor?"],
      `You can reach the instructor at ${emailMatch[0]}`);
  }
  
  if (phoneMatch) {
    addQA('contact', ['phone', 'call', 'number', 'contact'],
      "What is the instructor's phone number?",
      ["How do I call the professor?", "What's the instructor's phone number?", "Can I call the instructor?"],
      `The instructor's phone number is ${phoneMatch[0]}`);
  }
  
  if (officeMatch) {
    addQA('contact', ['office', 'hours', 'meet', 'visit', 'help'],
      "What are the office hours?",
      ["When can I visit the instructor?", "When is the professor available?", "What are the instructor's office hours?"],
      `Office hours: ${officeMatch[1].trim()}`);
  }
  
  // GRADING POLICY Q&As
  const gradingSection = extractSection(syllabusText, ['grading', 'grade', 'points', 'percentage']);
  if (gradingSection) {
    addQA('grade', ['grading', 'grade', 'calculated', 'breakdown', 'weights'],
      "How are grades calculated?",
      ["What's the grading breakdown?", "How is my grade determined?", "What's the grading policy?"],
      `Grading information: ${gradingSection.substring(0, 500)}...`);
  }
  
  // ATTENDANCE POLICY Q&As
  const attendanceSection = extractSection(syllabusText, ['attendance', 'absent', 'miss', 'present']);
  if (attendanceSection) {
    addQA('policy', ['attendance', 'absent', 'miss', 'present', 'policy'],
      "What is the attendance policy?",
      ["Do I have to attend class?", "What happens if I miss class?", "Is attendance required?"],
      `Attendance policy: ${attendanceSection.substring(0, 400)}...`);
  }
  
  // LATE WORK POLICY Q&As
  const lateWorkSection = extractSection(syllabusText, ['late', 'deadline', 'extension', 'makeup']);
  if (lateWorkSection) {
    addQA('policy', ['late', 'deadline', 'extension', 'makeup', 'policy'],
      "What is the late work policy?",
      ["Can I submit assignments late?", "What happens if I miss a deadline?", "Can I get an extension?"],
      `Late work policy: ${lateWorkSection.substring(0, 400)}...`);
  }
  
  // ASSIGNMENT Q&As
  const assignmentSection = extractSection(syllabusText, ['assignment', 'homework', 'project', 'paper', 'essay']);
  if (assignmentSection) {
    addQA('assignment', ['assignment', 'homework', 'project', 'paper', 'work'],
      "What assignments do we have?",
      ["What kind of assignments are there?", "What work do I need to complete?", "What are the course assignments?"],
      `Assignment information: ${assignmentSection.substring(0, 500)}...`);
  }
  
  // EXAM/TEST Q&As
  const examSection = extractSection(syllabusText, ['exam', 'test', 'quiz', 'midterm', 'final']);
  if (examSection) {
    addQA('deadline', ['exam', 'test', 'quiz', 'midterm', 'final', 'when'],
      "When are the exams?",
      ["What's the exam schedule?", "When are tests?", "When is the final exam?"],
      `Exam information: ${examSection.substring(0, 500)}...`);
  }
  
  // COURSE MATERIALS Q&As
  const materialsSection = extractSection(syllabusText, ['textbook', 'book', 'material', 'supply', 'required']);
  if (materialsSection) {
    addQA('logistics', ['textbook', 'book', 'material', 'supply', 'required', 'need'],
      "What materials do I need for class?",
      ["What textbooks are required?", "What do I need to buy?", "What supplies do I need?"],
      `Required materials: ${materialsSection.substring(0, 500)}...`);
  }
  
  // ACADEMIC INTEGRITY Q&As
  const integritySection = extractSection(syllabusText, ['academic', 'integrity', 'cheating', 'plagiarism', 'dishonest']);
  if (integritySection) {
    addQA('policy', ['academic', 'integrity', 'cheating', 'plagiarism', 'honest', 'policy'],
      "What is the academic integrity policy?",
      ["What happens if I cheat?", "What's the policy on plagiarism?", "What's considered academic dishonesty?"],
      `Academic integrity policy: ${integritySection.substring(0, 500)}...`);
  }
  
  // STUDENT SUPPORT Q&As
  const supportSection = extractSection(syllabusText, ['support', 'help', 'tutor', 'center', 'resource']);
  if (supportSection) {
    addQA('support', ['support', 'help', 'tutor', 'center', 'resource', 'assistance'],
      "What support resources are available?",
      ["Where can I get help?", "What resources are available to students?", "How can I get tutoring?"],
      `Support resources: ${supportSection.substring(0, 500)}...`);
  }
  
  // COURSE OBJECTIVES Q&As
  const objectivesSection = extractSection(syllabusText, ['objective', 'goal', 'outcome', 'learn', 'purpose']);
  if (objectivesSection) {
    addQA('logistics', ['objective', 'goal', 'outcome', 'learn', 'purpose', 'about'],
      "What are the course objectives?",
      ["What will I learn in this class?", "What are the learning goals?", "What's the purpose of this course?"],
      `Course objectives: ${objectivesSection.substring(0, 500)}...`);
  }
  
  // Add more specific Q&As based on common patterns
  addGeneralQAs();
  
  function addGeneralQAs() {
    // Course Information
    addQA('logistics', ['course', 'class', 'name', 'code', 'what'],
      "What course is this?",
      ["What class is this?", "What's the course name?", "What course code is this?"],
      `This is ${courseInfo.courseName} (${courseInfo.courseCode}) for ${courseInfo.semester} ${courseInfo.year}, taught by ${courseInfo.instructor}.`);
    
    // Instructor Information  
    addQA('contact', ['instructor', 'professor', 'teacher', 'who'],
      "Who is the instructor?",
      ["Who is teaching this class?", "Who is the professor?", "Who is my teacher?"],
      `Your instructor is ${courseInfo.instructor}.`);
    
    // Semester Information
    addQA('logistics', ['semester', 'when', 'term', 'year'],
      "What semester is this?",
      ["When is this class?", "What term is this?", "What year is this?"],
      `This course is offered in ${courseInfo.semester} ${courseInfo.year}.`);
    
    // General help questions
    addQA('support', ['help', 'stuck', 'confused', 'understand', 'support'],
      "Where can I get help if I'm struggling?",
      ["What if I don't understand something?", "Who can help me?", "I'm confused about the material"],
      "If you're struggling with course material, please reach out during office hours, contact the instructor via email, or check what student support resources are mentioned in the syllabus.");
    
    // Syllabus questions
    addQA('logistics', ['syllabus', 'document', 'information', 'find'],
      "Where can I find more information?",
      ["Where is all this information?", "Can I see the syllabus?", "Where do I find course details?"],
      "All course information is available in the course syllabus. Please refer to it for detailed policies and procedures.");
  }
  
  console.log(`✅ Generated ${qaPairs.length} Q&A pairs`);
  return qaPairs;
}

// Helper function to extract sections based on keywords
function extractSection(text, keywords) {
  const lines = text.split('\n');
  let sectionStart = -1;
  let sectionEnd = -1;
  
  // Find section start
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some(keyword => line.includes(keyword))) {
      sectionStart = i;
      break;
    }
  }
  
  if (sectionStart === -1) return null;
  
  // Find section end (next major heading or end of document)
  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    // Check if this looks like a new section header
    if (line.length > 0 && (
      line.toUpperCase() === line || 
      line.endsWith(':') ||
      /^[A-Z][A-Za-z\s]*:/.test(line)
    )) {
      // Make sure it's not just continuing the current section
      const lowerLine = line.toLowerCase();
      if (!keywords.some(keyword => lowerLine.includes(keyword))) {
        sectionEnd = i;
        break;
      }
    }
  }
  
  if (sectionEnd === -1) sectionEnd = lines.length;
  
  return lines.slice(sectionStart, sectionEnd).join('\n').trim();
}

// Main function
async function generateQADatabase() {
  try {
    console.log('🚀 Starting Q&A database generation...');
    
    // Fetch syllabus content
    const syllabusText = await fetchGoogleDoc();
    
    if (!syllabusText || syllabusText.trim().length === 0) {
      throw new Error('No content retrieved from Google Doc');
    }
    
    console.log(`📄 Retrieved ${syllabusText.length} characters of syllabus content`);
    
    // Extract course information
    const courseInfo = extractCourseInfo(syllabusText);
    console.log('📚 Course Info:', courseInfo);
    
    // Generate Q&A pairs
    const qaPairs = generateQAPairs(syllabusText, courseInfo);
    
    // Create final database
    const database = {
      courseInfo,
      qaPairs,
      generatedAt: new Date().toISOString(),
      syllabusLength: syllabusText.length
    };
    
    // Save to file
    const outputPath = path.join(__dirname, 'qa-database.json');
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
    
    console.log('✅ Q&A database generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 Generated ${qaPairs.length} Q&A pairs`);
    
    return database;
    
  } catch (error) {
    console.error('❌ Error generating Q&A database:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateQADatabase()
    .then(() => {
      console.log('🎉 Process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateQADatabase, fetchGoogleDoc, extractCourseInfo };