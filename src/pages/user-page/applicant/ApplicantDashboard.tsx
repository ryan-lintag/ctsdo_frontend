import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert, Button, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getReq } from '../../../lib/axios';
import { FormatDate } from '../../../lib/formatter';
import type { Course } from '../../../types/common.types';
import { CourseCalendar } from '../../../components/CourseCalendar';

interface CourseWithFormattedDates extends Course {
  startDateStr: string;
  endDateStr: string;
  statusStr: string;
}

const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithFormattedDates[]>([]);
  const [allCourses, setAllCourses] = useState<CourseWithFormattedDates[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, _setActiveTab] = useState<'available' | 'calendar'>('available');
  const [courseFilter, setCourseFilter] = useState<'all' | 'available' | 'upcoming' | 'expired'>('available');
  const navigate = useNavigate();

  const getStatusString = (course: Course): string => {
    if (!course.startDate || !course.endDate) return 'Unknown';
    
    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data: Course[] = await getReq('/api/courses');
      const formattedCourses = data.map((c) => ({
        ...c,
        startDateStr: FormatDate(c.startDate),
        endDateStr: FormatDate(c.endDate),
        statusStr: getStatusString(c),
      }));
      setAllCourses(formattedCourses);
      filterCourses(formattedCourses, courseFilter);
    } catch (err: unknown) {
      console.error('Error fetching courses:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load courses: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = (coursesToFilter: CourseWithFormattedDates[], filter: string) => {
    let filtered = coursesToFilter;
    
    if (filter === 'available') {
      const now = new Date();
      filtered = coursesToFilter.filter(course => {
        if (!course.startDate || !course.endDate) return false;
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        return now >= startDate && now <= endDate;
      });
    } else if (filter === 'upcoming') {
      const now = new Date();
      filtered = coursesToFilter.filter(course => {
        if (!course.startDate) return false;
        const startDate = new Date(course.startDate);
        return now < startDate;
      });
    } else if (filter === 'expired') {
      const now = new Date();
      filtered = coursesToFilter.filter(course => {
        if (!course.endDate) return false;
        const endDate = new Date(course.endDate);
        return now > endDate;
      });
    }
    
    setCourses(filtered);
  };

  const handleFilterChange = (filter: 'all' | 'available' | 'upcoming' | 'expired') => {
    setCourseFilter(filter);
    filterCourses(allCourses, filter);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (course: CourseWithFormattedDates) => {
  navigate('/my-registrations', { state: { preselectedCourseId: course._id } });
};


  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {activeTab === 'available' && (
            <>
              <div className="mb-4">
                <h5>Filter Courses:</h5>
                <Nav variant="tabs" activeKey={courseFilter} onSelect={(k) => handleFilterChange(k as any)}>
                  <Nav.Item>
                    <Nav.Link eventKey="all">All Courses ({allCourses.length})</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="available">
                      Available ({allCourses.filter(c => getStatusString(c) === 'Active').length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="upcoming">
                      Upcoming ({allCourses.filter(c => getStatusString(c) === 'Upcoming').length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="expired">
                      Expired ({allCourses.filter(c => getStatusString(c) === 'Expired').length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>

              {courses.length === 0 ? (
                <Alert variant="info">
                  No courses found for the selected filter. 
                  {courseFilter === 'available' && ' Try checking "Upcoming" courses for future enrollment opportunities.'}
                </Alert>
              ) : (
                <Row>
                  {courses.map((course) => (
                    <Col md={6} lg={4} key={course._id} className="mb-4">
                      <Card className={`shadow-sm h-100 ${
                        course.statusStr === 'Active' ? 'border-success' : 
                        course.statusStr === 'Upcoming' ? 'border-info' : 'border-secondary'
                      }`}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="mb-0">{course.title}</Card.Title>
                            <span className={`badge ${
                              course.statusStr === 'Active' ? 'bg-success' : 
                              course.statusStr === 'Upcoming' ? 'bg-info' : 'bg-secondary'
                            }`}>
                              {course.statusStr}
                            </span>
                          </div>
                          <Card.Text className="text-muted">{course.description}</Card.Text>
                          <div className="course-details mb-3">
                            <p className="mb-1"><strong>Instructor:</strong> {course.instructor || 'TBA'}</p>
                            <p className="mb-1"><strong>Start:</strong> {course.startDateStr}</p>
                            <p className="mb-1"><strong>End:</strong> {course.endDateStr}</p>
                            <p className="mb-1"><strong>Quota:</strong> {course.quota || 'Unlimited'}</p>
                          </div>
                          <Button
                            variant={course.statusStr === 'Active' ? 'primary' : 'outline-primary'}
                            className="w-100"
                            onClick={() => handleCourseClick(course)}
                            disabled={course.statusStr === 'Expired'}
                          >
                            {course.statusStr === 'Active' ? 'Register Now' : 
                             course.statusStr === 'Upcoming' ? 'Pre-Register' : 'Registration Closed'}
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}

          {activeTab === 'calendar' && (
            <CourseCalendar courses={allCourses} />
          )}
        </>
      )}
    </>
  );
};

export default HomePage;
