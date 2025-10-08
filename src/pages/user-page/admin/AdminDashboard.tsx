import React, { useEffect, useState } from 'react';
import { CountCard } from '../../../components/CountCard';
import { Col, Row } from 'react-bootstrap';
import BarChartComponent from '../../../components/BarChartComponent';
import TableComponent from '../../../components/TableComponent';
import PointChartComponent from '../../../components/PointChartComponent';
import { getReq } from '../../../lib/axios'; // your axios helper

interface Counts {
  users: number;
  registrations: number;
  applications: number;
  courses: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface Enrollment {
  id: string;
  name: string;
  country: { name: string; code: string };
  company: string;
  date: string;
  status: string;
  verified: boolean;
  activity: number;
  representative: { name: string; image: string };
  balance: number;
}

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({
    users: 0,
    registrations: 0,
    applications: 0,
    courses: 0,
  });
  const [registrationsChart, setRegistrationsChart] = useState<ChartData>({ labels: [], data: [] });
  const [applicationsChart, setApplicationsChart] = useState<ChartData>({ labels: [], data: [] });
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [countsRes, registrationsRes, applicationsRes, enrollmentsRes] = await Promise.all([
          getReq('/api/admin-dashboard/counts'),
          getReq('/api/admin-dashboard/registrations'),
          getReq('/api/admin-dashboard/applications'),
          getReq('/api/admin-dashboard/enrollments'),
        ]);

        setCounts(countsRes.data);
        setRegistrationsChart(registrationsRes.data);
        setApplicationsChart(applicationsRes.data);
        setEnrollments(enrollmentsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center my-5">Loading dashboard...</div>;
  }

  return (
    <>
      <div className='dashboard-title'>
        Dashboard
      </div>

      {/* Counts */}
      <Row className='justify-content-center'>
        <CountCard icon='users' iconColor='#ff9800' count={counts.users} text='No. of Users' />
        <CountCard icon='window-restore' iconColor='#2196f3' count={counts.registrations} text='Total Registrations' />
        <CountCard icon='id-card' iconColor='#009688' count={counts.applications} text='Total Applications' />
        <CountCard icon='chalkboard' iconColor='#e91e63' count={counts.courses} text='No. of Courses' />
      </Row>

      {/* Charts */}
      <Row className='justify-content-center'>
        <Col md='12' lg='6'>
          <BarChartComponent
            title='Registrations'
            labels={registrationsChart.labels}
            datasets={[
              {
                label: 'Monthly',
                data: registrationsChart.data,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
            ]}
          />
        </Col>
        <Col md='12' lg='6'>
          <PointChartComponent
            title='Applications'
            labels={applicationsChart.labels}
            datasets={[
              {
                label: 'Monthly',
                data: applicationsChart.data,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
            ]}
          />
        </Col>
      </Row>

      {/* Enrollments Table */}
      <Row className='justify-content-center'>
        <Col>
          <TableComponent
            title='Enrollments'
            columns={[
              { field: 'name', header: 'Name', isSortable: true },
              { field: 'country.name', header: 'Country', isSortable: true },
              { field: 'company', header: 'Company', isSortable: true },
              { field: 'representative.name', header: 'Representative', isSortable: true },
            ]}
            data={enrollments}
          />
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
