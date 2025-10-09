import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { getReq } from '../../../lib/axios';
import { FormatDate } from '../../../lib/formatter';
import type { Course } from '../../../types/common.types';
import { CourseCalendar } from '../../../components/CourseCalendar';
import { DashboardComponent } from '../../../components/DashboardComponent';

interface EnrolledCourse extends Omit<Course, 'status'> {
  registrationDate?: Date;
  status?: 'In Progress' | 'Completed' | 'Cancelled';
}

const CourseCalendarDashboard: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [_allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user's registrations
      const registrations = await getReq('/api/registration/user') as any[];
      
      // Fetch all courses to get complete course information
      const allCoursesData = await getReq('/api/courses') as any[];
      setAllCourses(allCoursesData);
      
      // Map registrations to courses with additional enrollment info
      const enrolledCoursesData = registrations.map((reg: any) => {
        const courseData = allCoursesData.find((course: Course) => course._id === reg.courseId);
        return {
          ...courseData,
          registrationDate: reg.entryDate,
          status: reg.status || 'In Progress'
        };
      }).filter((course: any) => course._id); // Filter out courses that weren't found
      
      setEnrolledCourses(enrolledCoursesData);
    } catch (err: unknown) {
      console.error('Error fetching enrolled courses:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load enrolled courses: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const getProgressPercentage = (course: EnrolledCourse): number => {
    if (!course.startDate || !course.endDate) return 0;
    
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const today = new Date();
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  const getCourseStatusBadge = (course: EnrolledCourse) => {
    if (course.status === 'Completed') {
      return <Badge bg="success">Completed</Badge>;
    }
    
    if (!course.startDate || !course.endDate) {
      return <Badge bg="secondary">Unknown</Badge>;
    }
    
    const today = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    if (today < startDate) {
      return <Badge bg="info">Upcoming</Badge>;
    } else if (today > endDate) {
      return <Badge bg="warning">Expired</Badge>;
    } else {
      return <Badge bg="primary">In Progress</Badge>;
    }
  };

  const getUpcomingCourses = () => {
    const today = new Date();
    return enrolledCourses.filter(course => {
      if (!course.startDate) return false;
      const startDate = new Date(course.startDate);
      return startDate > today;
    }).sort((a, b) => {
      const dateA = new Date(a.startDate!);
      const dateB = new Date(b.startDate!);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getActiveCourses = () => {
    const today = new Date();
    return enrolledCourses.filter(course => {
      if (!course.startDate || !course.endDate) return false;
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      return today >= startDate && today <= endDate;
    });
  };

  if (loading) {
    return (
      <DashboardComponent>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading your course calendar...</p>
        </div>
      </DashboardComponent>
    );
  }

  if (error) {
    return (
      <DashboardComponent>
        <Alert variant="danger">{error}</Alert>
      </DashboardComponent>
    );
  }

  const upcomingCourses = getUpcomingCourses();
  const activeCourses = getActiveCourses();

  return (
    <DashboardComponent>
      <div className="dashboard-title mb-4">My Course Calendar</div>
      
      {enrolledCourses.length === 0 ? (
        <Alert variant="info">
          You haven't enrolled in any courses yet. Visit the course dashboard to browse and register for available courses.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <h3 className="text-primary">{activeCourses.length}</h3>
                  <p className="mb-0">Active Courses</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-info">
                <Card.Body>
                  <h3 className="text-info">{upcomingCourses.length}</h3>
                  <p className="mb-0">Upcoming Courses</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-success">
                <Card.Body>
                  <h3 className="text-success">
                    {enrolledCourses.filter(c => c.status === 'Completed').length}
                  </h3>
                  <p className="mb-0">Completed Courses</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Calendar View */}
          <Card className="mb-4">
            <Card.Header>
            </Card.Header>
            <Card.Body>
              <CourseCalendar courses={enrolledCourses.map(({ status, registrationDate, ...course }) => course)} />
            </Card.Body>
          </Card>

          {/* Course Details */}
          <Row>
            {/* Active Courses */}
            {activeCourses.length > 0 && (
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">Active Courses ({activeCourses.length})</h6>
                  </Card.Header>
                  <Card.Body>
                    {activeCourses.map((course) => (
                      <Card key={course._id} className="mb-3 border-primary">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-1">{course.title}</h6>
                            {getCourseStatusBadge(course)}
                          </div>
                          
                          <p className="text-muted small mb-2">{course.description}</p>
                          
                          <div className="course-details mb-2">
                            <small className="text-muted d-block">
                              <strong>Instructor:</strong> {course.instructor || 'TBA'}
                            </small>
                            <small className="text-muted d-block">
                              <strong>Duration:</strong> {' '}
                              {FormatDate(course.startDate)} - {FormatDate(course.endDate)}
                            </small>
                            <small className="text-muted d-block">
                              <strong>Registered:</strong> {FormatDate(course.registrationDate)}
                            </small>
                          </div>
                          
                          <div className="progress-section">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Progress</small>
                              <small className="text-muted">{getProgressPercentage(course)}%</small>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ width: `${getProgressPercentage(course)}%` }}
                              ></div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            )}

            {/* Upcoming Courses */}
            {upcomingCourses.length > 0 && (
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header className="bg-info text-white">
                    <h6 className="mb-0">Upcoming Courses ({upcomingCourses.length})</h6>
                  </Card.Header>
                  <Card.Body>
                    {upcomingCourses.map((course) => (
                      <Card key={course._id} className="mb-3 border-info">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-1">{course.title}</h6>
                            {getCourseStatusBadge(course)}
                          </div>
                          
                          <p className="text-muted small mb-2">{course.description}</p>
                          
                          <div className="course-details">
                            <small className="text-muted d-block">
                              <strong>Instructor:</strong> {course.instructor || 'TBA'}
                            </small>
                            <small className="text-muted d-block">
                              <strong>Starts:</strong> {FormatDate(course.startDate)}
                            </small>
                            <small className="text-muted d-block">
                              <strong>Ends:</strong> {FormatDate(course.endDate)}
                            </small>
                            <small className="text-muted d-block">
                              <strong>Registered:</strong> {FormatDate(course.registrationDate)}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </DashboardComponent>
  );
};

export default CourseCalendarDashboard;