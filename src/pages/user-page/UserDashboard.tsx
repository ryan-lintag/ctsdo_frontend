import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import ApplicantDashboard from './applicant/ApplicantDashboard';
import AdminDashboard from './admin/AdminDashboard';
import { DashboardComponent } from '../../components/DashboardComponent';

const UserDashboard: React.FC = () => {
    const userProfile = useUserStore((state) => state.userProfile)
    return (
        <DashboardComponent>
            {userProfile.role === 'admin' ? <AdminDashboard /> : <ApplicantDashboard />}
        </DashboardComponent>
    );
};

export default UserDashboard;