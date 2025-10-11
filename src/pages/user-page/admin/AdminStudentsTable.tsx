import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Col, Row } from 'react-bootstrap';
import TableComponent from '../../../components/TableComponent';
import { getReq } from '../../../lib/axios';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import type { Student, Course, User } from '../../../types/common.types';

const AdminStudentCompletion: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students, users, and courses
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const studentsData: Student[] = await getReq('/api/students');
      const usersData: User[] = await getReq('/private/applicants'); // fetch all users
      const coursesData: Course[] = await getReq('/api/courses'); // fetch all courses

      const merged = studentsData.map(s => {
        const user = usersData.find(u => u._id === s.userId);
        const course = coursesData.find(c => c._id === s.courseId);

        return {
          ...s,
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          email: user?.email || 'N/A',
          courseTitle: course ? course.title : 'Unknown',
          courseStartDate: course?.startDate || '',
          courseEndDate: course?.endDate || '',
        };
      });

      setStudents(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const hideDetailsDialog = () => {
    setDetailsDialog(false);
    setSelectedStudent(null);
  };

  const viewStudentDetails = (s: Student) => {
    setSelectedStudent(s);
    setDetailsDialog(true);
  };

  const actionBodyTemplate = (s: Student) => {
    return (
      <div className="d-flex gap-2">
        <PrimeButton 
          label="View" 
          outlined 
          severity="info" 
          size="small"
          onClick={() => viewStudentDetails(s)} 
        />
      </div>
    );
  };

  return (
    <DashboardComponent>
      <div className="dashboard-title">Students Management</div>
      <LoaderBoundary isLoading={isLoading}>
        <Row className="justify-content-center">
          <Col>
            <TableComponent
              title=""
              columns={[
                { field: 'name', header: 'Student Name', isSortable: true },
                { field: 'courseTitle', header: 'Course', isSortable: true },
                { field: 'status', header: 'Status', isSortable: true },
                {
                  field: '_id',
                  header: 'Actions',
                  body: actionBodyTemplate,
                },
              ]}
              data={students}
            />
          </Col>
        </Row>
      </LoaderBoundary>

      <Dialog 
        visible={detailsDialog} 
        style={{ width: '40rem' }} 
        header="Student Course Details" 
        modal 
        onHide={hideDetailsDialog}
        footer={
          <PrimeButton label="Close" icon="pi pi-times" onClick={hideDetailsDialog} />
        }
      >
        {selectedStudent && (
          <div className="student-details-content">
            <div className="mb-4">
              <h5 className="text-primary mb-3">Student Information</h5>
              <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                <strong>Name:</strong>
                <span>{selectedStudent.name}</span>
                
                <strong>Email:</strong>
                <span>{selectedStudent.email || 'N/A'}</span>
                
                <strong>Status:</strong>
                <span>
                  <span className={`badge ${selectedStudent.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>
                    {selectedStudent.status}
                  </span>
                </span>
                
                <strong>Approved Date:</strong>
                <span>{selectedStudent.approvedDate ? new Date(selectedStudent.approvedDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="mb-3">
              <h5 className="text-primary mb-3">Course Information</h5>
              <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                <strong>Course Title:</strong>
                <span>{selectedStudent.courseTitle}</span>
                
                <strong>Start Date:</strong>
                <span>{selectedStudent.courseStartDate ? new Date(selectedStudent.courseStartDate).toLocaleDateString() : 'N/A'}</span>
                
                <strong>End Date:</strong>
                <span>{selectedStudent.courseEndDate ? new Date(selectedStudent.courseEndDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {selectedStudent.status === 'Completed' && (
              <div className="alert alert-success mt-3">
                <i className="pi pi-check-circle mr-2"></i>
                This student has successfully completed the course!
              </div>
            )}
          </div>
        )}
      </Dialog>
    </DashboardComponent>
  );
};

export default AdminStudentCompletion;
