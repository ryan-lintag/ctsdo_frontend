import React, { useEffect, useState } from 'react';
import { getReq } from '../../../lib/axios';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import TableComponent from '../../../components/TableComponent';

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  dateOfBirth: string;
  middleName?: string;
}

interface Application {
  _id: string;
  userId: string | Applicant; // can be an ID or populated object
  isApproved: boolean;
}

interface ApplicantRow extends Applicant {
  isApproved?: boolean | null;
}

const AdminUsers: React.FC = () => {
  const [rows, setRows] = useState<ApplicantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const applicants: Applicant[] = await getReq('/private/applicants');
        const applications: Application[] = await getReq('/api/application');

        // Merge approval status into applicants
        const merged: ApplicantRow[] = applicants.map((a) => {
          const userApp = applications.find((app) => {
            if (typeof app.userId === 'string') {
              return app.userId === a._id;
            }
            // if populated object
            return app.userId?._id === a._id;
          });

          return {
            ...a,
            isApproved: userApp ? userApp.isApproved : null,
          };
        });

        setRows(merged);
      } catch (err) {
        console.error('Failed to fetch applicants data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const approvalBodyTemplate = (row: ApplicantRow) => {
    if (row.isApproved === true)
      return <span className="badge bg-success">Scholar</span>;
    if (row.isApproved === false)
      return <span className="badge bg-warning text-dark">Waiting for Approval</span>;
    return <span className="badge bg-secondary">Not Applied</span>;
  };

  const columns = [
    { field: 'firstName', header: 'First Name', isSortable: true },
    { field: 'middleName', header: 'Middle Name', isSortable: true },
    { field: 'lastName', header: 'Last Name', isSortable: true },
    { field: 'email', header: 'Email', isSortable: true },
    { field: 'role', header: 'Role', isSortable: true },
    {
      field: 'dateOfBirth',
      header: 'Date of Birth',
      isSortable: true,
      body: (row: ApplicantRow) =>
        row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : '',
    },
    {
      field: 'isApproved',
      header: 'Application Status',
      body: approvalBodyTemplate,
    },
  ];

  return (
    <DashboardComponent>
      <div className="dashboard-title mb-3">Available Applicants</div>
      <LoaderBoundary isLoading={isLoading}>
        <TableComponent title="" columns={columns} data={rows} />
      </LoaderBoundary>
    </DashboardComponent>
  );
};

export default AdminUsers;
