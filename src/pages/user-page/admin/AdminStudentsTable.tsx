import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Col, Row } from 'react-bootstrap';
import TableComponent from '../../../components/TableComponent';
import { getReq, putReq } from '../../../lib/axios';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import type { Student, Course, User } from '../../../types/common.types';

const STUDENT_DEFAULT = { _id: '', userId: '', courseId: '', status: 'In Progress', name: '', courseTitle: '' };

const AdminStudentCompletion: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student>(STUDENT_DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);

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
          courseTitle: course ? course.title : 'Unknown',
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

  // Mark student as completed
  const markCompleted = async () => {
    if (!student._id) return;
    setIsLoading(true);
    try {
      const updated = await putReq(`/api/students/${student._id}/complete`, {}) as any;
      setStudents(prev => prev.map(s => s._id === updated._id ? updated : s));
    } catch (err) {
      console.error('Failed to mark completed:', err);
    } finally {
      setConfirmDialog(false);
      setStudent(STUDENT_DEFAULT);
      setIsLoading(false);
    }
  };

  // Open confirmation dialog
  const confirmMarkCompleted = (s: Student) => {
    setStudent(s);
    setConfirmDialog(true);
  };

  const hideDialog = () => setConfirmDialog(false);

  const actionBodyTemplate = (s: Student) => {
    return (
      <PrimeButton 
        label="Mark Completed" 
        outlined 
        severity="success" 
        disabled={s.status === 'Completed'} 
        onClick={() => confirmMarkCompleted(s)} 
      />
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
        visible={confirmDialog} 
        style={{ width: '32rem' }} 
        header="Confirm Completion" 
        modal 
        onHide={hideDialog}
        footer={
          <>
            <PrimeButton label="No" icon="pi pi-times" outlined className="mr-3" onClick={hideDialog} />
            <PrimeButton label="Yes" icon="pi pi-check" severity="success" onClick={markCompleted} />
          </>
        }
      >
        {student && (
          <div className="confirmation-content">
            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
            Are you sure you want to mark <b>{student.name}</b> for the course <b>{student.courseTitle}</b> as Completed?
          </div>
        )}
      </Dialog>
    </DashboardComponent>
  );
};

export default AdminStudentCompletion;
