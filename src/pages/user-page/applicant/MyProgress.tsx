import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Col, Row, Card, ProgressBar, Badge } from 'react-bootstrap';
import { getReq } from '../../../lib/axios';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import { FormatDate } from '../../../lib/formatter';

interface RegistrationData {
  _id: string;
  courseId: string;
  entryDate: string;
  isApproved?: boolean;
  feedback?: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Certificate {
  _id: string;
  courseId: string;
}

const MyProgress: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [regData, courseData] = await Promise.all([
          getReq('/api/registration/user'),
          getReq('/api/courses')
        ]);

        let certData: Certificate[] = [];
        try {
          certData = await getReq('/api/certificates/user');
        } catch {
          console.warn('No certificates found for this user.');
        }

        setRegistrations(regData);
        setCourses(courseData);
        setCertificates(certData);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.title : 'Untitled Course';
  };

  const getStatusLabel = (reg: RegistrationData) => {
    const hasCertificate = certificates.some(c => c.courseId === reg.courseId);

    if (hasCertificate) return { text: 'Completed', variant: 'success' };
    if (reg.isApproved) return { text: 'Approved', variant: 'info' };
    if (reg.feedback) return { text: 'Rejected', variant: 'danger' };
    return { text: 'Pending', variant: 'warning' };
  };

  const getProgressPercentage = (reg: RegistrationData) => {
    const hasCertificate = certificates.some(c => c.courseId === reg.courseId);

    if (hasCertificate) return 100;
    if (reg.isApproved) return 75;
    return 25;
  };

  const getProgressVariant = (reg: RegistrationData) => {
    const hasCertificate = certificates.some(c => c.courseId === reg.courseId);

    if (hasCertificate) return 'success';
    if (reg.isApproved) return 'info';
    if (reg.feedback) return 'danger';
    return 'warning';
  };

  return (
    <DashboardComponent>
      <div className="dashboard-title">My Progress</div>
      <LoaderBoundary isLoading={isLoading}>
        {registrations.length > 0 ? (
          <Row className="g-4">
            {registrations.map((reg) => {
              const status = getStatusLabel(reg);
              return (
                <Col md={6} key={reg._id}>
                  <Card className="p-4 shadow-sm h-100">
                    <h5>{getCourseTitle(reg.courseId)}</h5>
                    <ProgressBar
                      now={getProgressPercentage(reg)}
                      variant={getProgressVariant(reg)}
                      label={`${getProgressPercentage(reg)}%`}
                      className="mb-3"
                    />
                    <p>
                      <strong>Status:</strong>{' '}
                      <Badge bg={status.variant}>{status.text}</Badge>
                    </p>
                    <p>
                      <strong>Entry Date:</strong>{' '}
                      {reg.entryDate ? FormatDate(new Date(reg.entryDate)) : 'N/A'}
                    </p>
                    {reg.feedback && (
                      <p className="text-danger">
                        <strong>Feedback:</strong> {reg.feedback}
                      </p>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="text-center mt-5">No registrations found.</div>
        )}
      </LoaderBoundary>
    </DashboardComponent>
  );
};

export default MyProgress;
