import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import TableComponent from '../../../components/TableComponent';
import { deleteReq, getReq, postReq, putReq } from '../../../lib/axios';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import { FormatDate } from '../../../lib/formatter';
import { CourseComponent } from '../../../components/CourseComponent';
import type { Course } from '../../../types/common.types';

const COURSE_DEFAULT: Course = {
  name: '',
  _id: '',
  title: '',
  description: '',
  imageUrl: '',
  quota: 0,
  status: 0,
  instructor: '',
  startDate: undefined,
  endDate: undefined,
  currentEnrolled: 0
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course>(COURSE_DEFAULT);
  const [showCourse, setShowCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCourseDialog, setDeleteCourseDialog] = useState(false);

  const [descriptionDialogVisible, setDescriptionDialogVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      let data = await getReq('/api/courses') as any[];
      data = data.map((c: Course) => ({
        ...c,
        statusStr: c.status == 0 ? 'Inactive' : 'Active',
        startDateStr: FormatDate(c.startDate),
        endDateStr: FormatDate(c.endDate)
      }));
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const submitCourse = async (item: Course) => {
    setDeleteCourseDialog(false);
    setIsLoading(true);
    try {
      if (item._id) await putReq(`/api/courses/${course._id}`, item)
      else await postReq(`/api/courses`, item)
      await fetchCourses();
    } catch (err) {
      console.error('Failed to submit course', err);
    } finally {
      setShowCourse(false)
      setCourse(COURSE_DEFAULT);
      setIsLoading(false);
    }
  }

  const editCourse = (item: Course) => {
    setCourse(item);
    setShowCourse(true);
  }

  const deleteCourse = async () => {
    setDeleteCourseDialog(false);
    setIsLoading(true);
    try {
      await deleteReq(`/api/courses/${course._id}`)
      await fetchCourses();
    } catch (err) {
      console.error('Failed to delete course', err);
    } finally {
      setCourse(COURSE_DEFAULT);
      setIsLoading(false);
    }
  }

  const cancelCourse = () => {
    setShowCourse(false)
    setCourse(COURSE_DEFAULT);
  }

  const confirmDeleteCourse = (item: Course) => {
    setCourse(item)
    setDeleteCourseDialog(true);
  }

  const actionBodyTemplate = (item: Course) => (
    <>
      <PrimeButton
        icon="pi pi-pencil"
        outlined
        style={{ borderRadius: '50px', width: '40px', height: '40px', marginRight: '0.5rem' }}
        onClick={() => editCourse(item)}
      />
      <PrimeButton
        icon="pi pi-trash"
        severity="danger"
        outlined
        style={{ borderRadius: '50px', width: '40px', height: '40px' }}
        onClick={() => confirmDeleteCourse(item)}
      />
    </>
  );

  const hideDeleteCourseDialog = () => setDeleteCourseDialog(false);

  const deleteCourseDialogFooter = (
    <>
      <PrimeButton label="No" icon="pi pi-times" outlined className='me-3' onClick={hideDeleteCourseDialog} />
      <PrimeButton label="Yes" icon="pi pi-check" severity="danger" onClick={deleteCourse} />
    </>
  );

  return (
    <DashboardComponent>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="dashboard-title">Courses Management</h2>
        <PrimeButton
          icon="pi pi-plus"
          severity="success"
          outlined
          style={{ borderRadius: '50px', width: '40px', height: '40px' }}
          onClick={() => { setCourse(COURSE_DEFAULT); setShowCourse(true); }}
        />
      </div>

      <LoaderBoundary isLoading={isLoading}>
        {showCourse && (
          <CourseComponent course={course} submitCallback={submitCourse} cancelCallback={cancelCourse} />
        )}

        {!showCourse && (
          <TableComponent
            title=''
            columns={[
              { field: 'title', header: 'Title', isSortable: true },
              {
                field: 'description',
                header: 'Description',
                isSortable: false,
                body: (row: Course) => (
                  <span
                    style={{ cursor: 'pointer', color: '#0d6efd' }}
                    onClick={() => {
                      setSelectedDescription(row.description);
                      setDescriptionDialogVisible(true);
                    }}
                  >
                    {row.description.length > 50 ? row.description.slice(0, 50) + '...' : row.description}
                  </span>
                )
              },
              { field: 'startDateStr', header: 'Start Date', isSortable: true },
              { field: 'endDateStr', header: 'End Date', isSortable: true },
              { field: 'instructor', header: 'Instructor', isSortable: true },
              { field: 'quota', header: 'Quota', isSortable: true },
              { field: 'statusStr', header: 'Status', isSortable: true },
              { field: '_id', header: 'Actions', body: actionBodyTemplate },
            ]}
            data={courses}
          />
        )}
      </LoaderBoundary>

      <Dialog
        visible={deleteCourseDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={deleteCourseDialogFooter}
        onHide={hideDeleteCourseDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle me-3" style={{ fontSize: '2rem' }} />
          {course && <span>Are you sure you want to delete <b>{course.title}</b>?</span>}
        </div>
      </Dialog>

      <Dialog
        visible={descriptionDialogVisible}
        onHide={() => setDescriptionDialogVisible(false)}
        header="Course Description"
        modal
        style={{ width: '40rem' }}
      >
        <p>{selectedDescription}</p>
      </Dialog>
    </DashboardComponent>
  );
};

export default AdminCourses;
