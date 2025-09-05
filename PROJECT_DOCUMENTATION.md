# Mr. Syllabus - Project Documentation

## Project Overview

**Mr. Syllabus** is an AI-powered web application that helps students get answers about their course syllabus without needing to email their instructor. The application integrates with Google Docs to fetch syllabus content and uses Google's Gemini AI to answer student questions based solely on the syllabus information.

## Architecture & Technology Stack

### Frontend
- **Framework**: Vanilla HTML5, CSS3, and JavaScript (no external frameworks)
- **Styling**: Custom CSS with clean, modern design using system fonts
- **Interface**: Single-page application with responsive design
- **Features**: 
  - Question input with Enter key support
  - Real-time loading states and error handling
  - Automatic course information display
  - Clean, educational-focused UI design

### Backend
- **Development**: Express.js server (`server.js`) for local development
- **Production**: Vercel serverless functions for scalable deployment
- **API Endpoints**:
  - `POST /ask` - Main Q&A functionality
  - `GET /course-info` - Course information extraction

### AI & Data Integration
- **AI Model**: Google Gemini 1.5-flash for natural language processing
- **Data Source**: Google Docs API for syllabus content retrieval
- **Authentication**: Google Service Account with JWT tokens
- **Processing**: Real-time document parsing and AI-powered information extraction

### Deployment
- **Platform**: Vercel with GitHub integration
- **Configuration**: `vercel.json` for serverless function routing and timeouts
- **Environment**: Secure environment variable management
- **Performance**: 30-second timeout limits for API calls

## Project Structure

```
mr-syllabus/
├── index.html              # Main production interface (polished UI)
├── test.html              # Simple development/testing interface
├── server.js              # Express server for local development
├── package.json           # Dependencies and project metadata
├── vercel.json           # Vercel deployment configuration
├── .env                  # Environment variables (API keys)
├── .gitignore           # Git ignore patterns
├── api/
│   ├── ask.js           # Vercel serverless function for Q&A
│   └── course-info.js   # Vercel serverless function for course extraction
└── debug-course-info.js # Development debugging script
```

## Core Functionality

### 1. Syllabus Question Answering
- Students submit questions through web interface
- System fetches current syllabus content from Google Doc
- Gemini AI processes questions against syllabus context only
- Responses are limited to information found in the syllabus
- Graceful error handling for API failures

### 2. Course Information Extraction (New Feature)
- Automatic extraction of course metadata from syllabus header
- AI-powered parsing of course code, title, semester, and instructor
- Real-time display on main interface
- Formatted presentation: "COURSE123 - Course Title - Fall 2024" / "Instructor: Name"

## Environment Configuration

### Required Environment Variables
```bash
# Google Gemini AI API Key
GEMINI_API_KEY="your-gemini-api-key"

# Google Service Account JSON (as string)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...",...}'
```

### Google Doc Configuration
- **Document ID**: `1SjrxnkfMisN_SI6cfCbdsAbIc8-vCZTmdBlXBEt0ZMc`
- **Permissions**: Service account must have read access to the document
- **API Requirements**: Google Docs API enabled in Google Cloud Console

## Recent Development Session Changes

### Session Date: September 5, 2025

### Changes Implemented

#### 1. Course Information Extraction Feature
**Files Modified/Created:**
- `api/course-info.js` - New Vercel serverless function
- `server.js` - Updated with course info extraction endpoint
- `index.html` - Added course info display and JavaScript fetch logic
- `vercel.json` - Added course-info function configuration
- `.env` - Added Google service account key placeholder

**Functionality Added:**
- AI-powered extraction of course metadata from Google Doc syllabus
- Automatic parsing of:
  - Course alpha-numeric code (e.g., ENG 101, HIST 202A)
  - Course title/name
  - Semester determination (Fall for August dates, Spring for January dates)
  - Year extraction
  - Instructor name identification
- Real-time display on webpage load
- Formatted two-line presentation as requested by user

#### 2. UI/UX Improvements
**Styling Changes:**
- Added `.course-info` CSS class with bold, centered text
- Font size increased by 2 points relative to subtitle
- Positioned below subtitle with appropriate spacing
- Loading state with fallback messages

**JavaScript Enhancements:**
- Automatic course info loading on page load (`DOMContentLoaded` event)
- Fetch API integration with `/course-info` endpoint
- Error handling for failed course info requests
- Clean formatting: "CODE - Title - Semester Year" / "Instructor: Name"

#### 3. Deployment Architecture Updates
**Vercel Configuration:**
- Added `api/course-info.js` function configuration with 30-second timeout
- Updated routing to handle `/course-info` endpoint
- Maintained backward compatibility with existing `/ask` functionality

**Authentication Improvements:**
- Dual authentication support (environment variable vs key file)
- Secure service account key management
- Production-ready credential handling

### Issues Encountered & Resolved

#### 1. 404 Endpoint Error
**Problem**: `/course-info` endpoint returning 404 NOT_FOUND on Vercel
**Root Cause**: Missing function configuration in `vercel.json`
**Resolution**: Added `api/course-info.js` to functions section with proper timeout configuration

#### 2. Deployment Timing Issue
**Problem**: Changes not appearing immediately after local deployment commands
**Root Cause**: Commits were not pushed to GitHub repository; Vercel only deploys on git push
**Resolution**: Executed `git push origin main` to trigger automatic Vercel redeployment

#### 3. Local Development Authentication
**Problem**: Local testing failing due to missing service account key file
**Root Cause**: Development environment using file-based auth while production uses environment variables
**Resolution**: Implemented dual authentication logic supporting both methods

### Development Workflow Established

1. **Local Development**: Use Express server (`node server.js`) with environment variables
2. **Testing**: Debug scripts for isolated functionality testing
3. **Deployment**: Git commit → push → automatic Vercel deployment
4. **Environment Management**: Separate local (.env) and production (Vercel dashboard) configurations

## Technical Implementation Details

### Course Information Extraction Logic
The system uses a sophisticated AI prompt to extract structured data from unstructured syllabus text:

1. **Document Parsing**: Google Docs API extracts raw text from document structure
2. **AI Processing**: Gemini AI analyzes first 2000 characters for course metadata
3. **Pattern Recognition**: AI identifies course codes (3-4 letters + numbers + optional suffix)
4. **Date Analysis**: Semester determination based on start date patterns
5. **Instructor Detection**: Natural language processing for instructor identification
6. **JSON Structuring**: Returns standardized JSON object for frontend consumption

### Error Handling & Resilience
- Graceful fallbacks for missing course information ("Not found" values)
- API timeout protection (30-second limits)
- User-friendly error messages for service unavailability
- Automatic retry logic for transient failures

## Security Considerations

### Implemented Security Measures
- Environment variable management for sensitive API keys
- Service account authentication with minimal required permissions
- CORS configuration for cross-origin requests
- Input validation for user questions
- No sensitive data logged or exposed to client-side

### Recommendations for Future Development
- Implement rate limiting for API endpoints
- Add request logging for monitoring and debugging
- Consider caching layer for frequently accessed syllabus content
- Regular rotation of API keys and service account credentials

## Future Development Opportunities

### Potential Enhancements
1. **Multi-Document Support**: Handle multiple course syllabi
2. **Advanced Search**: Full-text search within syllabus content
3. **Question History**: Store and display previous questions/answers
4. **Admin Interface**: Course information management dashboard
5. **Analytics**: Usage tracking and popular question analysis
6. **Mobile Optimization**: Enhanced mobile-first responsive design
7. **Accessibility**: WCAG compliance improvements
8. **Caching**: Implement syllabus content caching for performance

### Technical Debt & Maintenance
- Consider migrating to modern JavaScript framework (React/Vue) for complex features
- Implement automated testing suite (unit tests, integration tests)
- Add continuous integration/deployment pipeline
- Documentation updates for API endpoints and development setup

## Conclusion

The Mr. Syllabus project successfully demonstrates a practical application of AI-powered document analysis for educational purposes. The recent session successfully implemented course information extraction functionality with a clean, user-friendly interface. The application is production-ready with proper deployment architecture, security measures, and error handling.

The project serves as an excellent foundation for further educational technology development and showcases effective integration of multiple APIs (Google Docs, Google AI) in a serverless architecture.

---

*Documentation generated: September 5, 2025*
*Development session completed successfully with all requested features implemented and deployed.*