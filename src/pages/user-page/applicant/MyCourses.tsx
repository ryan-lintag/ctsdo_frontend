import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Col, Row } from 'react-bootstrap';
import TableComponent from '../../../components/TableComponent';
import { getReq } from '../../../lib/axios';
import { useUserStore } from '../../../store/useUserStore';

interface Course {
  _id: string;
  title: string;
  status?: string;
  completed?: boolean;
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const setIsLoading = useUserStore((state) => state.setIsLoading);

  const fetchCourses = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Step 1: Fetch user registrations (with course info)
      const registrations = await getReq('/api/registration/user') as any[];

      // Extract both courseId & courseTitle
      const userCourses = registrations.map((reg: any) => ({
        _id: reg.courseId,
        title: reg.courseTitle ?? 'Untitled Course',
        status: 'Not Completed',
        completed: false
      }));

      // Step 2: Fetch completed courses
      let completedCourses: { courseId: string }[] = [];
      try {
        completedCourses = await getReq('/api/courses/completed');
      } catch (error) {
        console.warn('Completed courses fetch failed, defaulting to none.');
      }

      // Step 3: Merge completion status
      const merged = userCourses.map((course: any) => ({
        ...course,
        completed: completedCourses.some((c) => c.courseId === course._id)
      }));

      setCourses(merged);
    } catch (error) {
      console.error('Failed to fetch user courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <DashboardComponent>
      <div className="dashboard-title">My Courses</div>
      <Row className="justify-content-center">
        <Col>
          <TableComponent
            title=""
            columns={[
              { field: 'title', header: 'Course Title', isSortable: true },
              { field: 'status', header: 'Status', isSortable: true },
              {
                field: 'completed',
                header: 'Completion',
                isSortable: false,
                body: (rowData: Course) =>
                  rowData.completed ? (
                    <span style={{ color: 'green' }}>Completed</span>
                  ) : (
                    <span style={{ color: 'red' }}>Not Completed</span>
                  ),
              },
            ]}
            data={courses}
          />
        </Col>
      </Row>
    </DashboardComponent>
  );
};

export default MyCourses;
