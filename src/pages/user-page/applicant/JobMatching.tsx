import React, { useState, useEffect } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { getReq, postReq } from '../../../lib/axios';
import { useUserStore } from '../../../store/useUserStore';
import { Alert, Spinner, Card, Badge, Button, Row, Col, ListGroup } from 'react-bootstrap';

interface Message {
  from: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface CompletedCourse {
  courseId: string;
  courseTitle: string;
}

interface JobOpportunity {
  company: string;
  title: string;
  location: string;
  salary: string;
  contact: string;
  applicationMethod: string;
  requirements: string[];
  applicationLink: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingChatGPT, setUsingChatGPT] = useState(false);
  const [chatGPTResponse, setChatGPTResponse] = useState<string | null>(null);

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
        const allCourses = await getReq('/api/courses');
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

  // Call ChatGPT API for job search
  const searchJobsWithChatGPT = async (completedCourses: CompletedCourse[], userQuery?: string, isAutoSearch = false) => {
    setIsLoading(true);
    try {
      const response = await postReq('/api/job-matching/search', {
        completedCourses,
        userQuery,
        isAutoSearch
      });

      if (response.success) {
        const assistantMessage: Message = {
          from: 'assistant',
          text: response.response,
          timestamp: new Date()
        };

        setChatGPTResponse(response.response);
        setMessages(prev => [...prev, assistantMessage]);
        
        if (response.searchSuggestions) {
          setSearchSuggestions(response.searchSuggestions);
        }

        if (response.jobOpportunities) {
          setJobOpportunities(response.jobOpportunities);
        }

        setUsingChatGPT(!response.usingFallback);
      } else {
        throw new Error(response.error || 'Failed to get response from ChatGPT');
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      
      let errorMessage = 'Sorry, I encountered an error while searching for jobs. ';
      
      const err = error as any;
      if (err.response?.status === 500 && err.response?.data?.error?.includes('API key')) {
        errorMessage = 'ChatGPT integration is not configured yet. Please contact the administrator to set up the OpenAI API key.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many requests to ChatGPT. Please try again in a few minutes.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }

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
        text: `Hello ${userProfile.firstName}! 👋 I'm your AI Job Matching Assistant powered by ChatGPT. Let me search for specific companies that are currently hiring for your completed TESDA courses...`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);

      if (courses.length > 0) {
        // Automatically search for jobs using ChatGPT
        await searchJobsWithChatGPT(courses, '', true);
      } else {
        const noCourseMessage: Message = {
          from: 'assistant',
          text: "I notice you haven't completed any courses yet. No worries! You can still ask me about specific companies hiring, job opportunities, and application methods. I'll provide you with direct contact information and application links! 💼",
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

  // Handle user message send
  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      from: 'user',
      text: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = userInput;
    setUserInput('');

    await searchJobsWithChatGPT(completedCourses, query, false);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Open job search in new tab
  const openJobSearch = (website: { name: string; url: string; searchUrl?: string }) => {
    const urlToOpen = website.searchUrl || website.url;
    window.open(urlToOpen, '_blank');
  };

  // Apply to specific job
  const applyToJob = (job: JobOpportunity) => {
    if (job.applicationLink && job.applicationLink.startsWith('http')) {
      window.open(job.applicationLink, '_blank');
    } else {
      // If no direct link, open company search on JobStreet
      const searchUrl = `https://www.jobstreet.com.ph/jobs?keywords=${encodeURIComponent(job.company + ' ' + job.title)}`;
      window.open(searchUrl, '_blank');
    }
  };

useEffect(() => {
  if (selectedCourse) {
    const selectedCourseObj = completedCourses.find(
      (course) => course.courseId === selectedCourse
    );
    if (selectedCourseObj) {
      searchJobsWithChatGPT([selectedCourseObj], '', true);
    }
  }
}, [selectedCourse]);


  // Initialize on component mount
  useEffect(() => {
    initializeChat();
  }, []);

  if (isInitializing) {
    return (
      <DashboardComponent>
        <div className="container mt-4" style={{ maxWidth: 1100 }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" />
            <h4 className="mt-3">Initializing ChatGPT Job Assistant...</h4>
            <p className="text-muted">Loading your completed courses and searching for companies hiring...</p>
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
              className={`rounded-circle d-flex align-items-center justify-content-center ${usingChatGPT ? 'bg-success' : 'bg-primary'}`}
              style={{ width: 60, height: 60 }}
            >
              <i className="fas fa-robot text-black" style={{ fontSize: '24px' }}></i>
            </div>
          </div>
          <div>
            <h2 className={`mb-1 ${usingChatGPT ? 'text-success' : 'text-primary'}`}>
              {usingChatGPT ? 'ChatGPT' : 'AI'} Job Matching Assistant
            </h2>
            <p className="text-muted mb-0">
              <i className={`fas ${usingChatGPT ? 'fa-check-circle text-success' : 'fa-info-circle text-primary'} me-1`}></i>
              {usingChatGPT ? 'Powered by OpenAI ChatGPT • Real-time company data' : 'Smart job matching • Company database'}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {chatGPTResponse && (
            <div className="mb-3">
            <div
              className="border rounded p-4 bg-light"
              dangerouslySetInnerHTML={{
              __html: chatGPTResponse
                // Markdown headings
                .replace(/^# (.*)$/gm, '<h2>$1</h2>')
                .replace(/^## (.*)$/gm, '<h4>$1</h4>')
                .replace(/^### (.*)$/gm, '<h6>$1</h6>')
                // Bold text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // URLs: find http(s) links and make them anchor tags
                .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
                )
              }}
              style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}
            />
            </div>
        )}

       {/* {completedCourses.length > 0 && (
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <i className="fas fa-graduation-cap me-2"></i>
              Your Completed TESDA Courses
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 align-items-center">
                <select
                  className="form-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">-- Select a course to search --</option>
                  {completedCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseTitle}
                    </option>
                  ))}
                </select>
              </div>
            </Card.Body>
          </Card>
        )} */}


        {/* Companies Currently Hiring */}
        {/* {jobOpportunities.length > 0 && (
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <i className="fas fa-building me-2"></i>
              Companies Currently Hiring for Your Skills ({jobOpportunities.length} opportunities found)
            </Card.Header>
            <Card.Body>
              <Row>
                {jobOpportunities.map((job, index) => (
                  <Col key={index} lg={6} className="mb-3">
                    <Card className="h-100 border-left-warning">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="text-primary mb-1">{job.company}</h6>
                            <h5 className="mb-2">{job.title}</h5>
                          </div>
                          <Badge bg="success" className="ms-2">{job.salary}</Badge>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {job.location}
                          </small>
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="fas fa-phone me-1"></i>
                            {job.contact}
                          </small>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            <strong>Requirements:</strong> {job.requirements.join(', ')}
                          </small>
                        </div>

                        <div className="mb-3">
                          <small className="text-info">
                            <i className="fas fa-info-circle me-1"></i>
                            {job.applicationMethod}
                          </small>
                        </div>

                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => applyToJob(job)}
                          >
                            <i className="fas fa-external-link-alt me-2"></i>
                            Apply Now
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )} */}

        {/* Web Search Suggestions */}
        {/* {searchSuggestions && (
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <i className="fas fa-search me-2"></i>
              AI Job Assistant Features
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <h6>Search Keywords:</h6>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {searchSuggestions.keywords.map((keyword, index) => (
                      <Badge key={index} bg="outline-info" className="p-1">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </Col>
                <Col md={8}>
                  <h6>Job Search Websites:</h6>
                  <div className="d-grid gap-2">
                    {searchSuggestions.websites.map((website, index) => (
                      <Button
                        key={index}
                        variant="outline-info"
                        size="sm"
                        onClick={() => openJobSearch(website)}
                        className="text-start"
                      >
                        <i className="fas fa-external-link-alt me-2"></i>
                        Search {website.name}
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )} */}

        {/* Chat Messages */}
        {/* <Card className="mb-4">
          <Card.Header>
            <i className="fas fa-comments me-2"></i>
            Chat with {usingChatGPT ? 'ChatGPT' : 'AI'} Job Assistant
          </Card.Header>
          <Card.Body
            style={{ 
              height: 400, 
              overflowY: 'auto', 
              backgroundColor: '#f8f9fa'
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-3 ${msg.from === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-3 rounded-3 shadow-sm`}
                  style={{
                    maxWidth: '85%',
                    backgroundColor: msg.from === 'user' ? '#007bff' : '#ffffff',
                    color: msg.from === 'user' ? 'white' : '#333',
                    border: msg.from === 'assistant' ? '1px solid #e9ecef' : 'none',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}
                >
                  {msg.from === 'assistant' && (
                    <div className="d-flex align-items-center mb-2">
                      <i className={`fas fa-robot ${usingChatGPT ? 'text-success' : 'text-primary'} me-2`}></i>
                      <small className="text-muted fw-bold">
                        {usingChatGPT ? 'ChatGPT' : 'AI'} Assistant
                      </small>
                    </div>
                  )}
                  <div>{msg.text}</div>
                  <small className="text-muted d-block mt-2" style={{ fontSize: '0.75rem' }}>
                    {msg.timestamp.toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-3 rounded-3 bg-white border shadow-sm">
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span className="text-muted">
                      {usingChatGPT ? 'ChatGPT is searching for companies and jobs...' : 'AI is searching for opportunities...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card> */}

        {/* Input Area */}
        {/* <Card>
          <Card.Body>
            <div className="input-group">
              <textarea
                className="form-control"
                placeholder="Ask about specific companies hiring, application methods, salary information, or any job-related questions..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={3}
                disabled={isLoading}
                style={{ resize: 'none' }}
              />
              <button
                className={`btn ${usingChatGPT ? 'btn-success' : 'btn-primary'} px-4`}
                onClick={handleSend}
                disabled={!userInput.trim() || isLoading}
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2"></i>
                    Ask {usingChatGPT ? 'ChatGPT' : 'AI'}
                  </>
                )}
              </button>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                💡 <strong>Try asking:</strong> "Show me welding companies in Manila with contact numbers", "Find automotive service centers hiring now", "What companies can I walk-in apply to?", "Give me HR contact information for construction companies"
              </small>
            </div>
          </Card.Body>
        </Card> */}

        {/* Features Info */}
        {/* <Card className="mt-4 border-success">
          <Card.Header className="bg-success text-white">
            <i className="fas fa-star me-2"></i>
            {usingChatGPT ? 'ChatGPT' : 'AI'} Job Assistant Features
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <h6><i className="fas fa-building text-primary me-2"></i>Specific Companies</h6>
                <p className="small text-muted">Real company names with current job openings and contact information.</p>
              </Col>
              <Col md={3}>
                <h6><i className="fas fa-phone text-success me-2"></i>Direct Contact Info</h6>
                <p className="small text-muted">HR phone numbers, email addresses, and office locations.</p>
              </Col>
              <Col md={3}>
                <h6><i className="fas fa-link text-warning me-2"></i>Application Links</h6>
                <p className="small text-muted">Direct links to company career pages and job applications.</p>
              </Col>
              <Col md={3}>
                <h6><i className="fas fa-money-bill text-info me-2"></i>Current Salaries</h6>
                <p className="small text-muted">Real-time salary ranges and compensation information.</p>
              </Col>
            </Row>
          </Card.Body>
        </Card> */}
      </div>
    </DashboardComponent>
  );
};

export default JobMatchingAI;