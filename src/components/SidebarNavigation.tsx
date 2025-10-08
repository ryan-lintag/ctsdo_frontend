import {
  CDBSidebar,
  CDBSidebarHeader,
  CDBSidebarContent,
  CDBSidebarMenu,
} from 'cdbreact';
import { useUserStore } from '../store/useUserStore';
import { postReq } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { SidebarMenuItem } from './SidebarMenuItem';
import './sidebar-animations.css';

const SidebarNavigation = () => {
  const userProfile = useUserStore((state) => state.userProfile);
  const logoutUser = useUserStore((state) => state.logoutUser);
  const setIsLoading = useUserStore((state) => state.setIsLoading)
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await postReq(`/auth/logout`, {});
      logoutUser();
      setIsLoading(false);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div style={{ height: '100vh', boxShadow: '0 6px 24px rgba(15,23,42,0.06)', borderRight: '1px solid #e6eef8' }} className='sidebar-navigation-box'>
      <CDBSidebar
        textColor="#111827"
        backgroundColor="#ffffff"
        className={'modern-light-sidebar'}
        breakpoint={0}
        toggled={false}
        minWidth={'72px'}
        maxWidth={'320px'}
      >
        <CDBSidebarHeader prefix={<i className="fa fa-bars" style={{ color: '#374151' }} />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src='/logo.png' width={44} style={{ borderRadius: 8, objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#0f1724', fontSize: 16 }}>CTSDO</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Welcome, {userProfile.firstName + ' ' + userProfile.lastName}</div>
            </div>
          </div>
        </CDBSidebarHeader>

        <CDBSidebarContent>
          {/* <div style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '8px 10px', borderRadius: 8 }}>
              <i className="fa fa-search" style={{ color: '#9ca3af' }} />
              <input placeholder="Search..." style={{ border: 0, outline: 'none', background: 'transparent', width: '100%' }} />
            </div>
          </div> */}

          <CDBSidebarMenu>
            <div style={{ padding: '6px 12px' }}>
              <SidebarMenuItem text='Dashboard' path='/dashboard' icon='chart-line' />
              <SidebarMenuItem text='My Profile' path='/my-profile' icon='user-circle' />

            {userProfile?.role !== 'admin' ? (
              <>
                <SidebarMenuItem text='Course Calendar' path='/course-calendar' icon='calendar-alt' />
                <SidebarMenuItem text='My Portfolio' path='/my-portfolio' icon='user-graduate' />
                <SidebarMenuItem text='My Certification' path='/my-certifications' icon='certificate' />
                <SidebarMenuItem text='My Registrations' path='/my-registrations' icon='file-alt' />
                <SidebarMenuItem text='My Applications' path='/my-applications' icon='id-badge' />
                <SidebarMenuItem text='Job Matching' path='/job-matching' icon='id-badge' />
              </>
            ) : (
              <>
                <SidebarMenuItem text='Users' path='/admin-users' icon='users' />
                <SidebarMenuItem text='Course Registrations' path='/course-registrations' icon='window-restore' />
                <SidebarMenuItem text='Scholar Applications' path='/scholar-applications' icon='id-card' />
                <SidebarMenuItem text='Courses' path='/admin-courses' icon='chalkboard' />
                <SidebarMenuItem text='Certificate Request' path='/admin-certificate-request' icon='certificate' />
                <SidebarMenuItem text='FAQs' path='/admin-faqs' icon='sticky-note' />
                <SidebarMenuItem text='Students' path='/admin-students' icon='user-graduate' />
                <SidebarMenuItem text='Settings' path='/admin-settings' icon='cog' />
              </>
            )}
            </div>
          </CDBSidebarMenu>

          <div style={{ padding: '12px' }}>
            <div style={{ borderTop: '1px solid #eef2f7', marginTop: 8, paddingTop: 12 }}>
              <div className="sidebar-btn-wrapper p-1 mb-5">
                <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid #eef2f7', background: '#fff' }}>
                  <i className="fa fa-sign-out-alt" style={{ color: '#ef4444' }} />
                  <span style={{ color: '#111827', fontWeight: 600 }}>Logout</span>
                </button>
              </div>
            </div>
          </div>

        </CDBSidebarContent>
      </CDBSidebar>
    </div>
  );
};

export default SidebarNavigation;