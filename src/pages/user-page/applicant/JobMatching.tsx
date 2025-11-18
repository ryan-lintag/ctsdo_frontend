import React, { useState, useEffect } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { getReq, postReq } from '../../../lib/axios';
import { useUserStore } from '../../../store/useUserStore';
import { Alert, Spinner, Card, Badge, Button, Row, Col } from 'react-bootstrap';

// -----------------------------------------------------------------
// 1. UPDATED INTERFACES
// -----------------------------------------------------------------

interface Message {
  from: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface CompletedCourse {
  courseId: string;
  courseTitle: string;
}

// ⚠️ NEW Interface to match the fixed backend's JSON structure
interface ExtractedJob {
  job_title: string;
  company_name: string;
  location: string;
  salary_range: string; // The backend uses this key
  match_relevance: string;
  url: string;
}

// Keeping the original unused interface just for context, but note it is now obsolet

interface SearchSuggestion {
  keywords: string[];
  websites: {
    name: string;
    url: string;
    searchUrl?: string;
  }[];
}

const JobMatchingAI: React.FC = () => {
  const { userProfile } = useUserStore();
  const [_messages, setMessages] = useState<Message[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [ _setSelectedCourse] = useState<string>('');
  
  // ⚠️ State updated to use the correct ExtractedJob interface
  const [jobOpportunities, setJobOpportunities] = useState<ExtractedJob[]>([]);
  
  const [_searchSuggestions] = useState<SearchSuggestion | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setUsingChatGPT] = useState(false);
  const [chatGPTResponse, setChatGPTResponse] = useState<string | null>(null);
  const [selectedSearchCourse, setSelectedSearchCourse] = useState<string>('');

  // -----------------------------------------------------------------
  // 2. FETCH & SEARCH LOGIC
  // -----------------------------------------------------------------

  // Fetch user's completed courses
  const fetchCompletedCourses = async () => {
    try {
      const courses = await getReq('/api/courses/completed');
      setCompletedCourses(courses || []);
      return courses || [];
    } catch (error) {
      console.error('Error fetching completed courses:', error);
      // Fallback to all courses if completed courses endpoint fails
      try {
        const allCourses = await getReq('/api/courses') as any[];
        const formattedCourses = allCourses.map((course: { _id: any; title: any; }) => ({
          courseId: course._id,
          courseTitle: course.title
        }));
        setCompletedCourses(formattedCourses);
        return formattedCourses;
      } catch (fallbackError) {
        console.error('Error fetching fallback courses:', fallbackError);
        setError('Failed to load courses');
        return [];
      }
    }
  };

  // ⚠️ MODIFIED: Call AI API for job search with JSON parsing
  const searchJobsWithChatGPT = async (completedCourses: CompletedCourse[], userQuery?: string, isAutoSearch = false) => {
    setIsLoading(true);
    setError(null);
    setJobOpportunities([]); // Clear previous results
    setChatGPTResponse(null); // Clear previous AI chat text

    try {
      const response = await postReq('/api/job-matching/search', {
        completedCourses,
        userQuery,
        isAutoSearch
      }) as any;

      if (response.success && response.response) {
        // ⚠️ CRITICAL FIX: Parse the stringified JSON array from the 'response' field
        const rawJobArray: ExtractedJob[] = JSON.parse(response.response);
        
        // Check for the "No Match" fail-safe object
        const isNoMatch = rawJobArray.length === 1 && rawJobArray[0].job_title === "No Match";

        const jobsToDisplay = isNoMatch ? [] : rawJobArray;
        const count = jobsToDisplay.length;

        // Generate a friendly assistant message based on the result
        const assistantText = isNoMatch
            ? "I couldn't find any direct job matches for your completed courses in the current data snippets. Please try using the popular job board links below for manual searching."
            : `🎉 Great News, ${userProfile.firstName}! I found **${count} job match${count !== 1 ? 'es' : ''}** for your completed courses! Review the job postings listed below.`;

        const assistantMessage: Message = {
          from: 'assistant',
          text: assistantText,
          timestamp: new Date()
        };

        setChatGPTResponse(assistantText);
        setJobOpportunities(jobsToDisplay); // Set the jobs array (or empty if no match)
        setMessages(prev => [...prev, assistantMessage]);
        setUsingChatGPT(true); // Indicate successful AI response
      } else {
        // Handle custom backend errors
        throw new Error(response.error || 'Failed to get structured job opportunities from the AI.');
      }
    } catch (error) {
      console.error('Error calling job matching API:', error);
      
      let errorMessage = 'Sorry, I encountered an error while searching for jobs. ';
      
      const err = error as any;
      if (err.response?.status === 500 && err.response?.data?.error?.includes('API key')) {
        errorMessage = 'AI integration is not configured yet. Please contact the administrator to set up the necessary API key.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many requests to the AI service. Please try again in a few minutes.';
      } else if (err.message.includes('Unexpected token')) {
          // This catches the JSON.parse error if the backend returns non-JSON text
          errorMessage = 'The AI returned an invalid response format. Please report this issue.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      setError(errorMessage); // Set the error for the Alert component
      
      const errorMsg: Message = {
        from: 'assistant',
        text: errorMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the chat with automatic job search
  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      const courses = await fetchCompletedCourses();
      
      const welcomeMessage: Message = {
        from: 'assistant',
        text: `Hello ${userProfile.firstName}! 👋 I'm your AI Job Matching Assistant. I am searching for specific job postings that match your completed TESDA courses...`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);

      if (courses.length > 0) {
        // Automatically search for jobs using the new AI logic
        await searchJobsWithChatGPT(courses, '', true);
      } else {
        const noCourseMessage: Message = {
          from: 'assistant',
          text: "I notice you haven't completed any courses yet. No worries! You can still use the job search links below to look for general opportunities. 💼",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, noCourseMessage]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to initialize job matching assistant');
    } finally {
      setIsInitializing(false);
    }
  };

  // -----------------------------------------------------------------
  // 3. UTILITY FUNCTIONS (Unchanged, but included for completeness)
  // -----------------------------------------------------------------

  // Validate and normalize URLs
  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    
    // If it already has a scheme, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it looks like a domain without scheme, add https://
    if (url.includes('.') && !url.includes(' ')) {
      return `https://${url}`;
    }
    
    // Otherwise, it's invalid
    return '';
  };

  // Check if a URL is likely valid (has proper TLD, not a placeholder)
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Check for valid TLD (at least 2 characters after last dot)
      const parts = hostname.split('.');
      if (parts.length < 2) return false;
      
      const tld = parts[parts.length - 1];
      if (tld.length < 2) return false;
      
      // Reject placeholder domains
      const placeholders = ['example.com', 'test.com', 'localhost', 'placeholder', 'sample'];
      if (placeholders.some(p => hostname.includes(p))) return false;
      
      return true;
    } catch {
      return false;
    }
  };

  // Apply to specific job (using the new ExtractedJob type, though the function body is now simple)


  // Get course title for search
  const getCourseTitleForSearch = (): string => {
    if (selectedSearchCourse) {
      const course = completedCourses.find(c => c.courseId === selectedSearchCourse);
      return course ? course.courseTitle : '';
    }
    // If only one course, use it
    if (completedCourses.length === 1) {
      return completedCourses[0].courseTitle;
    }
    return '';
  };

  // Search on JobStreet
  const searchOnJobStreet = () => {
    const courseTitle = getCourseTitleForSearch();
    if (!courseTitle && completedCourses.length > 1) {
      alert('Please select a course first');
      return;
    }
    const searchQuery = courseTitle || 'TESDA';
    const url = `https://www.jobstreet.com.ph/jobs?keywords=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank');
  };

  // Search on LinkedIn
  const searchOnLinkedIn = () => {
    const courseTitle = getCourseTitleForSearch();
    if (!courseTitle && completedCourses.length > 1) {
      alert('Please select a course first');
      return;
    }
    const searchQuery = courseTitle || 'TESDA';
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&location=Philippines`;
    window.open(url, '_blank');
  };

  // Search on Indeed
  const searchOnIndeed = () => {
    const courseTitle = getCourseTitleForSearch();
    if (!courseTitle && completedCourses.length > 1) {
      alert('Please select a course first');
      return;
    }
    const searchQuery = courseTitle || 'TESDA';
    const url = `https://ph.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=Philippines`;
    window.open(url, '_blank');
  };

  // Search on Kalibrr
  const searchOnKalibrr = () => {
    const courseTitle = getCourseTitleForSearch();
    if (!courseTitle && completedCourses.length > 1) {
      alert('Please select a course first');
      return;
    }
    const searchQuery = courseTitle || 'TESDA';
    const url = `https://www.kalibrr.com/home/jobs?search=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank');
  };

  // Parse response (kept for general text output, though the main results are now structured)
  const parseChatGPTResponse = (response: string): React.ReactNode[] => {
    // Simple parsing logic: convert text response to an array of React elements
    return response.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // -----------------------------------------------------------------
  // 4. EFFECTS & RENDER
  // -----------------------------------------------------------------

  useEffect(() => {
    initializeChat();
  }, []);

  // Removed unused useEffect for selectedCourse as initialization handles the first search

  if (isInitializing) {
    return (
      <DashboardComponent>
        <div className="container mt-4" style={{ maxWidth: 1100 }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" />
            <h4 className="mt-3">Initializing AI Job Assistant...</h4>
            <p className="text-muted">Loading your completed courses and searching for job matches...</p>
          </div>
        </div>
      </DashboardComponent>
    );
  }

  return (
    <DashboardComponent>
      <div className="container mt-4 mb-7" style={{ maxWidth: 1200 }}>
        <div className="d-flex align-items-center mb-4">
  <div className="me-3">
    <div
      className="rounded-circle d-flex align-items-center justify-content-center gemini-icon"
      style={{ width: 60, height: 60 }}
    >
      <i className="fas fa-sparkles text-white" style={{ fontSize: "26px" }}></i>
    </div>
  </div>
  <div>
    <h2 className="mb-1 gemini-title">
      Gemini Job Matching Assistant
    </h2>
    <p className="text-muted mb-0 gemini-subtitle">
      <i className="fas fa-magic me-1 text-primary"></i>
      Smart job matching powered by Google’s Gemini AI.
    </p>
  </div>
</div>


        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* AI Chat Response and Job Search Websites Section */}
        {chatGPTResponse && (
            <div className="mb-3">
            <div
              className="border rounded p-4 bg-light"
              style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.6 }}
            >
              {parseChatGPTResponse(chatGPTResponse)}
            </div>
            
            {/* Job Search Websites Section */}
            <div className="mt-4 pt-3 border-top">
              <h6 className="mb-3 text-dark fw-bold">
                <i className="fas fa-search me-2 text-primary"></i>
                Search on Popular Job Websites:
              </h6>
              
              {/* Course Selector - Show only if 2 or more courses */}
              {completedCourses.length > 1 && (
                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    <i className="fas fa-graduation-cap me-1 text-success"></i>
                    Select a course to search:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedSearchCourse}
                    onChange={(e) => setSelectedSearchCourse(e.target.value)}
                  >
                    <option value="">-- All Courses --</option>
                    {completedCourses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={searchOnJobStreet}
                  className="btn btn-sm btn-outline-primary"
                  title="Search for jobs on JobStreet based on your completed course"
                >
                  <i className="fas fa-briefcase me-1"></i>
                  JobStreet PH
                </button>
                <button
                  onClick={searchOnLinkedIn}
                  className="btn btn-sm btn-outline-info"
                  title="Search for jobs on LinkedIn based on your completed course"
                >
                  <i className="fab fa-linkedin me-1"></i>
                  LinkedIn Jobs
                </button>
                <button
                  onClick={searchOnIndeed}
                  className="btn btn-sm btn-outline-danger"
                  title="Search for jobs on Indeed based on your completed course"
                >
                  <i className="fas fa-briefcase me-1"></i>
                  Indeed PH
                </button>
                <button
                  onClick={searchOnKalibrr}
                  className="btn btn-sm btn-outline-success"
                  title="Search for jobs on Kalibrr based on your completed course"
                >
                  <i className="fas fa-briefcase me-1"></i>
                  Kalibrr
                </button>
              </div>
            </div>
            </div>
        )}

        {/* ⚠️ Companies Currently Hiring - UNCOMMENTED AND FIXED FOR ExtractedJob */}
        {jobOpportunities.length > 0 && (
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <i className="fas fa-building me-2"></i>
              Job Matches Found for Your Skills ({jobOpportunities.length} opportunities)
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Ensure job is of type ExtractedJob */}
                {jobOpportunities.map((job: ExtractedJob, index) => (
                  <Col key={index} lg={6} className="mb-3">
                    <Card className="h-100 border-left-warning">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            {/* Uses the new field names from the backend schema */}
                            <h6 className="text-primary mb-1">{job.company_name}</h6>
                            <h5 className="mb-2">{job.job_title}</h5>
                          </div>
                          {/* Uses the new field name */}
                          <Badge bg="success" className="ms-2">{job.salary_range}</Badge>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {job.location}
                          </small>
                        </div>

                        <div className="mb-3">
                          <small className="text-info">
                            <i className="fas fa-info-circle me-1"></i>
                            {/* Uses the new field name */}
                            {job.match_relevance}
                          </small>
                        </div>

                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary" 
                            size="sm"
                            // Uses the correct field name
                            onClick={() => window.open(normalizeUrl(job.url), '_blank')}
                            // Checks if the URL is valid to prevent opening "N/A"
                            disabled={!isValidUrl(normalizeUrl(job.url))} 
                          >
                            <i className="fas fa-external-link-alt me-2"></i>
                            View Job Posting
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* All other commented-out sections (chat, input area, unused features) remain commented out, 
            as they are not relevant to the core fix of displaying the structured job data. */}
      </div>
    </DashboardComponent>
  );
};

export default JobMatchingAI;