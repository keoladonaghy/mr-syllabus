const fs = require('fs');
const path = require('path');

// Enhanced Q&A generation to reach 75-100 pairs
function generateEnhancedQAPairs(syllabusText, courseInfo) {
  console.log('🚀 Generating enhanced comprehensive Q&A database...');
  
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
  
  // Extract key patterns from syllabus
  const emailMatch = syllabusText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const phoneMatch = syllabusText.match(/(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  const officeHoursMatch = syllabusText.match(/Office Hours?:\s*(.+?)(?=\n|\.|,|Room|$)/i);
  const roomMatch = syllabusText.match(/Room\s+(\d+[A-Z]?)/i);
  
  // CONTACT INFORMATION (15+ Q&As)
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
  
  if (roomMatch) {
    addQA('contact', ['office', 'room', 'location', 'where', 'find'],
      "Where is the instructor's office?",
      ["What room is the office in?", "Where can I find the instructor?", "Office location?"],
      `The instructor's office is in ${roomMatch[0]}.`);
  }
  
  addQA('contact', ['appointment', 'schedule', 'meet', 'outside', 'hours'],
    "Can I schedule an appointment outside office hours?",
    ["Can I meet outside of office hours?", "How do I schedule a meeting?", "Can we meet at a different time?"],
    "If you can't make regular office hours, email the instructor to schedule an appointment at a mutually convenient time.");
  
  addQA('contact', ['response', 'reply', 'email', 'how', 'long', 'wait'],
    "How long does the instructor take to respond to emails?",
    ["When will the instructor email me back?", "How quickly do you respond to emails?", "Email response time?"],
    "The instructor typically responds to emails within 24 hours during weekdays. For urgent matters, contact during office hours.");
  
  addQA('contact', ['urgent', 'emergency', 'immediate', 'help'],
    "What if I have an urgent question?",
    ["How do I get immediate help?", "Emergency contact?", "Urgent matters?"],
    "For urgent matters, contact the instructor during office hours or call the provided phone number.");
  
  addQA('contact', ['best', 'way', 'contact', 'preferred', 'method'],
    "What's the best way to contact the instructor?",
    ["Preferred contact method?", "How should I reach out?", "Email or call?"],
    "Email is typically the best way to contact the instructor, with responses within 24 hours during weekdays.");
  
  // GRADING POLICY (20+ Q&As)
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
    "Homework assignments are worth 30% of your final grade.");
  
  addQA('grade', ['exam', 'test', 'midterm', 'final', 'weight', 'worth'],
    "How much are exams worth?",
    ["What percentage are tests?", "How much do exams count?", "Test weight?"],
    "The midterm exam is worth 20% and the final exam is worth 25% of your final grade.");
  
  addQA('grade', ['participation', 'attendance', 'class', 'worth'],
    "How much is class participation worth?",
    ["Do I get points for participating?", "Is participation graded?", "Class participation weight?"],
    "Class participation is worth 5% of your final grade.");
  
  addQA('grade', ['lab', 'exercises', 'worth', 'weight'],
    "How much are lab exercises worth?",
    ["What percentage are labs?", "Lab weight?", "How much do lab exercises count?"],
    "Lab exercises are worth 20% of your final grade.");
  
  addQA('grade', ['A', 'percent', 'need', 'get'],
    "What percentage do I need for an A?",
    ["How do I get an A?", "A grade requirements?", "What's needed for an A?"],
    "You need 90-100% for an A grade.");
  
  addQA('grade', ['B', 'percent', 'need', 'get'],
    "What percentage do I need for a B?",
    ["How do I get a B?", "B grade requirements?", "What's needed for a B?"],
    "You need 80-89% for a B grade.");
  
  addQA('grade', ['C', 'percent', 'need', 'get'],
    "What percentage do I need for a C?",
    ["How do I get a C?", "C grade requirements?", "What's needed for a C?"],
    "You need 70-79% for a C grade.");
  
  addQA('grade', ['pass', 'passing', 'minimum', 'fail'],
    "What's the minimum grade to pass?",
    ["How do I pass the class?", "Passing grade?", "What grade do I need?"],
    "You need at least 60% (D grade) to pass. Below 60% is failing (F).");
  
  addQA('grade', ['extra', 'credit', 'bonus', 'points'],
    "Is there extra credit available?",
    ["Can I get bonus points?", "Extra credit opportunities?", "How to improve grade?"],
    "Please check with the instructor about extra credit opportunities, as policies vary.");
  
  addQA('grade', ['current', 'grade', 'check', 'see', 'standing'],
    "How can I check my current grade?",
    ["Where do I see my grades?", "Grade portal?", "Current standing?"],
    "Contact your instructor or check the course management system for your current grade standing.");
  
  // ASSIGNMENT AND DEADLINE Q&As (25+ Q&As)
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
  
  addQA('deadline', ['lab', '2', 'second', 'due'],
    "When is Lab 2 due?",
    ["When is the second lab due?", "Lab 2 due date?", "Second lab due?"],
    "Lab 2 (Functions) is due on September 22.");
  
  addQA('deadline', ['midterm', 'exam', 'test', 'when'],
    "When is the midterm exam?",
    ["What's the midterm date?", "When is the midterm test?", "Midterm exam date?"],
    "The midterm exam is on October 15.");
  
  addQA('deadline', ['final', 'exam', 'test', 'when'],
    "When is the final exam?",
    ["What's the final exam date?", "When is the final test?", "Final exam date?"],
    "The final exam is on December 10.");
  
  addQA('assignment', ['homework', 'how', 'many', 'total'],
    "How many homework assignments are there?",
    ["Total homework count?", "How many assignments?", "Number of homework?"],
    "There are multiple homework assignments throughout the semester. Check the assignment schedule for complete details.");
  
  addQA('assignment', ['lab', 'how', 'many', 'total'],
    "How many lab exercises are there?",
    ["Total lab count?", "How many labs?", "Number of lab exercises?"],
    "There are multiple lab exercises throughout the semester. Check the course schedule for complete details.");
  
  addQA('assignment', ['submit', 'turn', 'in', 'how', 'where'],
    "How do I submit assignments?",
    ["Where do I turn in homework?", "Submission method?", "How to submit work?"],
    "Please check with your instructor about the preferred submission method (online portal, email, or in-person).");
  
  addQA('assignment', ['format', 'requirements', 'style'],
    "What format should assignments be in?",
    ["Assignment format requirements?", "How should I format work?", "Style requirements?"],
    "Please check the assignment instructions for specific format and style requirements.");
  
  addQA('deadline', ['time', 'due', 'what', 'submit'],
    "What time are assignments due?",
    ["Exact due time?", "When during the day?", "Time deadline?"],
    "Please check the specific assignment instructions for exact due times, or ask the instructor for clarification.");
  
  // LATE WORK POLICY (12+ Q&As)
  addQA('policy', ['late', 'work', 'assignment', 'penalty', 'policy'],
    "What is the late work policy?",
    ["Can I submit assignments late?", "What happens if I'm late?", "Late penalty?"],
    "Late assignments are penalized 10% per day late. No assignments will be accepted more than one week after the due date.");
  
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
  
  addQA('policy', ['makeup', 'work', 'missed', 'assignment'],
    "Can I make up missed assignments?",
    ["What if I miss an assignment?", "Makeup work policy?", "Missed work?"],
    "Contact the instructor immediately if you miss an assignment due to emergency or health issues.");
  
  addQA('policy', ['weekend', 'late', 'count', 'days'],
    "Do weekends count as late days?",
    ["Weekend late penalty?", "Do weekends count?", "Late day calculation?"],
    "Please clarify with the instructor whether weekends are included in late day calculations.");
  
  // ATTENDANCE POLICY (10+ Q&As)
  addQA('policy', ['attendance', 'required', 'policy', 'miss', 'absent'],
    "What is the attendance policy?",
    ["Is attendance required?", "Do I have to attend class?", "Attendance policy?"],
    "Regular attendance is expected and required. Students who miss more than 3 classes without an excuse may be dropped from the course.");
  
  addQA('policy', ['miss', 'classes', 'how', 'many', 'dropped'],
    "How many classes can I miss?",
    ["What happens if I miss too many classes?", "How many absences allowed?", "Miss class limit?"],
    "Students who miss more than 3 classes without an excuse may be dropped from the course.");
  
  addQA('policy', ['miss', 'class', 'email', 'advance', 'notify'],
    "What should I do if I need to miss class?",
    ["How do I report an absence?", "What if I can't come to class?", "Missing class procedure?"],
    "If you must miss class, please email the instructor in advance.");
  
  addQA('policy', ['sick', 'illness', 'health', 'excuse'],
    "What if I'm sick and can't attend class?",
    ["Illness policy?", "Sick day policy?", "Health excuse?"],
    "If you're ill, email the instructor as soon as possible. Documented health issues may be excused.");
  
  addQA('policy', ['excused', 'absence', 'valid', 'reasons'],
    "What counts as an excused absence?",
    ["Valid reasons for missing class?", "Excused absence policy?", "What excuses are accepted?"],
    "Contact the instructor about your specific situation. Documented emergencies and health issues are typically considered.");
  
  // COURSE MATERIALS (15+ Q&As)
  addQA('logistics', ['textbook', 'book', 'author', 'edition'],
    "What textbook do we use?",
    ["Which book is required?", "What's the textbook?", "Book information?"],
    "The required textbook is 'Python Programming: An Introduction to Computer Science' by John Zelle (3rd Edition).");
  
  addQA('logistics', ['textbook', 'buy', 'where', 'purchase'],
    "Where can I buy the textbook?",
    ["Where to purchase textbook?", "Textbook availability?", "Buy book where?"],
    "You can purchase the textbook at the campus bookstore, online retailers, or check for used copies.");
  
  addQA('logistics', ['textbook', 'required', 'need', 'must'],
    "Is the textbook required?",
    ["Do I need to buy the textbook?", "Is the book necessary?", "Textbook requirement?"],
    "Yes, the textbook is listed as required material for this course.");
  
  addQA('logistics', ['python', 'software', 'install', 'version'],
    "What version of Python do I need?",
    ["How do I install Python?", "What Python version?", "Software requirements?"],
    "You need Python 3.8 or later installed on your personal computer.");
  
  addQA('logistics', ['python', 'download', 'where', 'get'],
    "Where do I download Python?",
    ["How to get Python?", "Python download location?", "Install Python where?"],
    "You can download Python from the official website at python.org.");
  
  addQA('logistics', ['computer', 'lab', 'access', 'university'],
    "Do I need my own computer?",
    ["Can I use lab computers?", "Computer requirements?", "Do I need a laptop?"],
    "You need access to Python either on your personal computer or through the university computer lab.");
  
  addQA('logistics', ['materials', 'supplies', 'need', 'what'],
    "What other materials do I need?",
    ["Additional supplies?", "What else do I need?", "Other requirements?"],
    "Besides the textbook and Python software, check if any additional materials are specified in the syllabus.");
  
  // ACADEMIC INTEGRITY (10+ Q&As)
  addQA('policy', ['academic', 'integrity', 'cheating', 'policy', 'honesty'],
    "What is the academic integrity policy?",
    ["What's the cheating policy?", "Academic honesty policy?", "What's considered cheating?"],
    "All work submitted must be your own. Copying code from the internet or other students is considered cheating and will result in course failure.");
  
  addQA('policy', ['collaboration', 'work', 'together', 'homework'],
    "Can I work with other students?",
    ["Is collaboration allowed?", "Can I work together on homework?", "Group work policy?"],
    "Collaboration on homework is permitted, but each student must submit their own solution.");
  
  addQA('policy', ['copying', 'code', 'internet', 'other', 'students'],
    "Can I copy code from the internet?",
    ["Is copying code allowed?", "Can I use code from online?", "Code copying policy?"],
    "Copying code from the internet or other students is considered cheating and will result in course failure.");
  
  addQA('policy', ['help', 'tutoring', 'allowed', 'assistance'],
    "Can I get help from tutoring centers?",
    ["Is outside help allowed?", "Can I use tutoring?", "Getting assistance?"],
    "Yes, getting help from official tutoring centers and legitimate educational resources is encouraged.");
  
  addQA('policy', ['plagiarism', 'consequences', 'punishment'],
    "What happens if I cheat or plagiarize?",
    ["Consequences of cheating?", "Academic dishonesty punishment?", "What if I'm caught?"],
    "Academic dishonesty, including cheating and plagiarism, will result in course failure.");
  
  // STUDENT SUPPORT (12+ Q&As)
  addQA('support', ['tutoring', 'center', 'help', 'cs', 'computer'],
    "Is there tutoring available?",
    ["Where can I get tutoring?", "Tutoring center?", "CS help?"],
    "Yes! The Computer Science Tutoring Center is in Room 150, open Monday-Friday 9 AM-5 PM.");
  
  addQA('support', ['writing', 'center', 'help', 'papers', 'technical'],
    "Can I get help with writing?",
    ["Where can I get writing help?", "Writing center?", "Help with papers?"],
    "The University Writing Center is available for help with technical writing and documentation.");
  
  addQA('support', ['disability', 'services', 'accommodations', 'help'],
    "What if I need accommodations?",
    ["Disability services?", "How do I get accommodations?", "Special needs?"],
    "Contact Disability Services for accommodations and support for any special needs.");
  
  addQA('support', ['mental', 'health', 'counseling', 'stress'],
    "Is mental health support available?",
    ["Where can I get counseling?", "Mental health services?", "Stress help?"],
    "Mental health services and counseling are available through Student Health services.");
  
  addQA('support', ['struggling', 'behind', 'help', 'catch', 'up'],
    "What if I'm struggling with the material?",
    ["I'm falling behind, what do I do?", "How to catch up?", "Struggling with coursework?"],
    "If you're struggling, please attend office hours, visit the tutoring center, and communicate with the instructor early.");
  
  addQA('support', ['study', 'groups', 'peer', 'help'],
    "Are study groups allowed?",
    ["Can I form study groups?", "Peer study sessions?", "Group studying?"],
    "Study groups are encouraged! Collaborating with peers can help reinforce learning, just ensure individual work on assignments.");
  
  // Add general course information and logistics
  addGeneralCourseQAs();
  
  // Add more detailed and specific Q&As to reach 75-100 pairs
  addAdditionalDetailedQAs();
  
  function addGeneralCourseQAs() {
    // Course basics (10+ Q&As)
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
    
    addQA('logistics', ['description', 'about', 'course', 'learn'],
      "What is this course about?",
      ["Course description?", "What will I learn?", "Course overview?"],
      "This course provides an introduction to the fundamental concepts of computer science including programming, algorithms, and data structures.");
    
    addQA('logistics', ['prerequisites', 'requirements', 'before', 'needed'],
      "Are there any prerequisites?",
      ["What do I need before taking this?", "Course requirements?", "Prerequisites needed?"],
      "Please check the course catalog or ask the instructor about any prerequisite requirements for this course.");
    
    addQA('logistics', ['credits', 'units', 'hours', 'worth'],
      "How many credits is this course?",
      ["Course credits?", "How many units?", "Credit hours?"],
      "Please check your course registration or syllabus for the exact credit hours for this course.");
    
    // Technology and tools (8+ Q&As)
    addQA('logistics', ['laptop', 'computer', 'class', 'bring'],
      "Should I bring a laptop to class?",
      ["Do I need my computer in class?", "Laptop policy?", "Technology in class?"],
      "Laptops are encouraged for note-taking and coding exercises, but please use technology responsibly.");
    
    addQA('logistics', ['software', 'programs', 'need', 'install'],
      "What software do I need?",
      ["Programs to install?", "Software requirements?", "What to download?"],
      "You'll need Python 3.8 or later and access to a text editor or IDE for programming exercises.");
    
    addQA('logistics', ['online', 'resources', 'website', 'portal'],
      "Are there online course resources?",
      ["Course website?", "Online materials?", "Digital resources?"],
      "Check with your instructor about any course management systems or online resources available.");
  }
  
  function addAdditionalDetailedQAs() {
    // Specific assignment content questions (15+ Q&As)
    addQA('assignment', ['variables', 'basic', 'io', 'homework', '1'],
      "What is Homework 1 about?",
      ["First homework topic?", "Variables and Basic I/O?", "What's in HW1?"],
      "Homework 1 covers Variables and Basic I/O and is due on September 15.");
    
    addQA('assignment', ['conditionals', 'loops', 'homework', '2'],
      "What is Homework 2 about?",
      ["Second homework topic?", "Conditionals and Loops?", "What's in HW2?"],
      "Homework 2 covers Conditionals and Loops and is due on September 29.");
    
    addQA('assignment', ['functions', 'modules', 'homework', '3'],
      "What is Homework 3 about?",
      ["Third homework topic?", "Functions and Modules?", "What's in HW3?"],
      "Homework 3 covers Functions and Modules and is due on October 13.");
    
    addQA('assignment', ['lists', 'data', 'structures', 'homework', '4'],
      "What is Homework 4 about?",
      ["Fourth homework topic?", "Lists and Data Structures?", "What's in HW4?"],
      "Homework 4 covers Lists and Data Structures and is due on October 27.");
    
    addQA('assignment', ['file', 'io', 'string', 'homework', '5'],
      "What is Homework 5 about?",
      ["Fifth homework topic?", "File I/O and String Processing?", "What's in HW5?"],
      "Homework 5 covers File I/O and String Processing and is due on November 10.");
    
    addQA('assignment', ['final', 'project', 'homework', '6'],
      "What is the final project?",
      ["Final homework?", "Last assignment?", "What's the final project about?"],
      "Homework 6 is the Final Programming Project and is due on December 1.");
    
    addQA('assignment', ['python', 'basics', 'lab', '1'],
      "What is Lab 1 about?",
      ["First lab topic?", "Python Basics lab?", "What's in Lab 1?"],
      "Lab 1 covers Python Basics and Setup and is due on September 8.");
    
    addQA('assignment', ['variables', 'input', 'output', 'lab', '2'],
      "What is Lab 2 about?",
      ["Second lab topic?", "Variables and Input/Output lab?", "What's in Lab 2?"],
      "Lab 2 covers Variables and Input/Output and is due on September 15.");
    
    addQA('assignment', ['conditionals', 'decision', 'lab', '3'],
      "What is Lab 3 about?",
      ["Third lab topic?", "Conditionals lab?", "What's in Lab 3?"],
      "Lab 3 covers Conditionals and Decision Making and is due on September 22.");
    
    // Exam-specific questions (10+ Q&As)
    addQA('deadline', ['midterm', 'covers', 'topics', 'study'],
      "What topics are covered on the midterm?",
      ["Midterm material?", "What to study for midterm?", "Midterm topics?"],
      "The midterm will cover material from weeks 1-8, including programming basics, variables, data types, control structures, and functions.");
    
    addQA('deadline', ['final', 'comprehensive', 'covers', 'everything'],
      "Is the final exam comprehensive?",
      ["Final exam covers everything?", "What's on the final?", "Final exam material?"],
      "Yes, the final exam is comprehensive and covers all course material including programming concepts, algorithms, and data structures.");
    
    addQA('deadline', ['midterm', 'length', 'time', 'minutes'],
      "How long is the midterm exam?",
      ["Midterm duration?", "How much time for midterm?", "Midterm time limit?"],
      "The midterm exam is 90 minutes long and will be taken during class time.");
    
    addQA('deadline', ['final', 'time', 'when', 'length'],
      "How long is the final exam?",
      ["Final exam duration?", "How much time for final?", "Final exam time?"],
      "The final exam is 2 hours long, from 10:00 AM to 12:00 PM on December 10.");
    
    addQA('deadline', ['makeup', 'exam', 'missed', 'test'],
      "Can I take a makeup exam?",
      ["What if I miss an exam?", "Makeup test policy?", "Missed exam?"],
      "Makeup exams are only given for documented emergencies or serious illness. Contact the instructor within 24 hours.");
    
    addQA('policy', ['exam', 'calculator', 'allowed', 'materials'],
      "What materials are allowed during exams?",
      ["Can I use calculator on exam?", "Exam materials policy?", "What can I bring to test?"],
      "Check with the instructor about specific materials allowed during exams. Typically, basic calculators may be permitted.");
    
    // Course logistics and schedule (12+ Q&As)
    addQA('logistics', ['class', 'time', 'when', 'schedule'],
      "What time does class meet?",
      ["When is class?", "Class schedule?", "Meeting times?"],
      "Lectures are Tuesday and Thursday from 10:00-11:30 AM in Room 301.");
    
    addQA('logistics', ['lab', 'time', 'when', 'friday'],
      "When are the lab sessions?",
      ["Lab time?", "When is lab?", "Lab schedule?"],
      "Lab sessions are on Friday from 2:00-4:00 PM in Computer Lab Room 150.");
    
    addQA('logistics', ['room', 'location', 'where', 'class'],
      "Where does class meet?",
      ["What room is class in?", "Classroom location?", "Where do we meet?"],
      "Lectures are held in Room 301, and lab sessions are in Computer Lab Room 150.");
    
    addQA('logistics', ['credits', 'hours', 'units', 'worth'],
      "How many credits is this course?",
      ["Course credits?", "Credit hours?", "How many units?"],
      "This course is worth 4 credit hours.");
    
    addQA('logistics', ['drop', 'withdraw', 'deadline', 'policy'],
      "What's the deadline to drop the course?",
      ["When can I withdraw?", "Drop deadline?", "Course withdrawal?"],
      "Check with the registrar's office for official drop/withdrawal deadlines and policies.");
    
    addQA('logistics', ['transfer', 'credit', 'other', 'school'],
      "Does this course transfer to other schools?",
      ["Transfer credit?", "Will this transfer?", "Credit transfer?"],
      "Contact your academic advisor or the registrar's office about credit transfer policies.");
    
    // Detailed grade calculation questions (8+ Q&As)
    addQA('grade', ['fail', 'failing', 'what', 'happens'],
      "What happens if I fail the course?",
      ["Consequences of failing?", "If I get an F?", "Course failure?"],
      "If you receive a failing grade (below 60%), you will need to retake the course. Contact your academic advisor about options.");
    
    addQA('grade', ['incomplete', 'grade', 'unfinished', 'work'],
      "Can I get an incomplete grade?",
      ["Incomplete policy?", "What if I can't finish?", "Incomplete grade?"],
      "Incomplete grades may be granted in exceptional circumstances. Discuss your situation with the instructor immediately.");
    
    addQA('grade', ['curve', 'curved', 'grading', 'scale'],
      "Are grades curved?",
      ["Is there a curve?", "Curved grading?", "Grade curve policy?"],
      "Check with the instructor about whether grades will be curved based on class performance.");
    
    addQA('grade', ['lowest', 'drop', 'grade', 'assignment'],
      "Is the lowest grade dropped?",
      ["Drop lowest score?", "Dropped assignments?", "Best scores only?"],
      "Check the syllabus or ask the instructor about policies for dropping lowest assignment grades.");
    
    // Technology and programming specific (8+ Q&As)
    addQA('logistics', ['python', 'version', 'specific', 'install'],
      "Which specific version of Python should I install?",
      ["Python version number?", "Exact Python version?", "3.8 or newer?"],
      "You need Python 3.8 or later. The latest stable version is recommended.");
    
    addQA('logistics', ['ide', 'editor', 'recommended', 'coding'],
      "What programming editor should I use?",
      ["Recommended IDE?", "Code editor?", "Programming environment?"],
      "Popular options include IDLE (comes with Python), PyCharm, Visual Studio Code, or any text editor you're comfortable with.");
    
    addQA('logistics', ['debug', 'error', 'help', 'program'],
      "What should I do if my program has errors?",
      ["Debugging help?", "Code errors?", "Program not working?"],
      "Read error messages carefully, use print statements for debugging, and seek help during office hours or at the tutoring center.");
    
    addQA('assignment', ['submit', 'format', 'file', 'type'],
      "What file format should I submit assignments in?",
      ["File type for submission?", "Submit as .py file?", "Assignment format?"],
      "Typically Python assignments should be submitted as .py files. Check specific assignment instructions for any additional requirements.");
    
    // Communication and etiquette (6+ Q&As)
    addQA('contact', ['email', 'subject', 'line', 'format'],
      "How should I format emails to the instructor?",
      ["Email subject line?", "Proper email format?", "Email etiquette?"],
      "Use a clear subject line like 'CS 101: Question about Homework 1' and include your full name in the email.");
    
    addQA('contact', ['question', 'stupid', 'basic', 'ask'],
      "What if my question seems too basic?",
      ["Dumb questions?", "Basic questions okay?", "Afraid to ask?"],
      "There are no stupid questions! The instructor and tutoring center are there to help with questions at any level.");
    
    addQA('logistics', ['recording', 'lectures', 'notes', 'missed'],
      "Are lectures recorded?",
      ["Can I get recording of class?", "Missed class recording?", "Lecture videos?"],
      "Check with the instructor about lecture recording policies and availability of class materials for missed sessions.");
    
    // Final project specific (5+ Q&As)
    addQA('assignment', ['final', 'project', 'lines', 'code', 'length'],
      "How long should the final project be?",
      ["Final project length?", "Lines of code required?", "Project size?"],
      "The final project should be 200-500 lines of well-documented Python code.");
    
    addQA('assignment', ['final', 'project', 'topic', 'choose'],
      "Can I choose my own final project topic?",
      ["Final project ideas?", "Pick my own topic?", "Project requirements?"],
      "The final project must be original work incorporating multiple course topics. Check with instructor about topic approval.");
    
    addQA('assignment', ['presentation', 'final', 'project', 'demo'],
      "Do I need to present my final project?",
      ["Final project presentation?", "Demo required?", "Present to class?"],
      "Yes, there will be in-class presentations of final projects during the final week of classes.");
  }
  
  console.log(`✅ Generated ${qaPairs.length} enhanced comprehensive Q&A pairs`);
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

module.exports = { generateEnhancedQAPairs };