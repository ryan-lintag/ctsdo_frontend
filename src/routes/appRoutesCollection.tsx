import { createBrowserRouter, type RouteObject } from 'react-router-dom'

// pages
import PrivateRoutes from './PrivateRoute'
import ErrorPage from '../pages/error'
import HomePage from '../pages/home-page/HomePage'
import AboutUsPage from '../pages/about-us-page/AboutUsPage'
import FaqPage from '../pages/faq-page/FaqPage'
import LoginPage from '../pages/login-page/LoginPage'
import SignupPage from '../pages/signup-page/SignupPage'
import VerifyEmail from '../pages/verify-email-page/VerifyEmail'
import ResetPassword from '../pages/reset-password/ResetPassword'
import RequestReset from '../pages/request-reset/RequestReset'
import UserDashboard from '../pages/user-page/UserDashboard'
import MyProfile from '../pages/user-page/MyProfile'
import MyCourses from '../pages/user-page/applicant/MyCourses'
import MyRegistrations from '../pages/user-page/applicant/MyRegistrations'
import MyApplications from '../pages/user-page/applicant/MyApplications'
import AdminUsers from '../pages/user-page/admin/AdminUsers'
import CourseRegistrations from '../pages/user-page/admin/CourseRegistrations'
import ScholarApplications from '../pages/user-page/admin/ScholarApplications'
import AdminFaqs from '../pages/user-page/admin/AdminFaqs'
import AdminCourses from '../pages/user-page/admin/AdminCourses'
import AdminCerticateRequest from '../pages/user-page/admin/AdminCerticateRequest'
import MyCertifications from '../pages/user-page/applicant/MyCertifications'
import JobMatchingAI from '../pages/user-page/applicant/JobMatching'
import MyProgress from '../pages/user-page/applicant/MyProgress'
import CourseCalendarDashboard from '../pages/user-page/applicant/CourseCalendarDashboard'
import MyPortfolio from '../pages/user-page/applicant/MyPortfolio'
import PublicPortfolio from '../pages/PublicPortfolio'
import StudentsTable from '../pages/user-page/admin/AdminStudentsTable'
import AdminSetting from '../pages/user-page/admin/AdminSetting'


const routesWrapper = (data: RouteObject[]) => {
    return data.map((route) => {
        return {
            ...route,
            errorElement: <ErrorPage />,
        }
    })
}

export const appRoutesCollection = createBrowserRouter(
    [
        {
            id: '404',
            path: '/404',
            element: <div>Something went wrong</div>
        },
        {
            id: 'public.portfolio',
            path: '/portfolio/:studentId',
            element: <PublicPortfolio />
        },
        {
            path: "/",
            element: <PrivateRoutes />,
            children: routesWrapper([
                {
                    id: 'home',
                    path: '/',
                    element: <HomePage />
                },
                {
                    id: 'about.us',
                    path: '/about-us',
                    element: <AboutUsPage />
                },
                {
                    id: 'faq',
                    path: '/faq',
                    element: <FaqPage />
                },
                {
                    id: 'login',
                    path: '/login',
                    element: <LoginPage />
                },
                {
                    id: 'signup',
                    path: '/signup',
                    element: <SignupPage />
                },
                {
                    id: 'verify.email',
                    path: '/verify-email/:token',
                    element: <VerifyEmail />
                },
                {
                    id: 'reset.password',
                    path: '/reset/:token',
                    element: <ResetPassword />
                },
                {
                    id: 'request.reset',
                    path: '/request',
                    element: <RequestReset />
                },
                {
                    id: 'dashboard',
                    path: '/dashboard',
                    element: <UserDashboard />
                },
                {
                    id: 'my.profile',
                    path: '/my-profile',
                    element: <MyProfile />
                },
                {
                    id: 'my.courses',
                    path: '/my-courses',
                    element: <MyCourses />
                },
                {
                    id: 'my.certifications',
                    path: '/my-certifications',
                    element: <MyCertifications />
                },
                {
                    id: 'my.registrations',
                    path: '/my-registrations',
                    element: <MyRegistrations />
                },
                {
                    id: 'my.progress',
                    path: '/my-progress',
                    element: <MyProgress />
                },
                {
                    id: 'course.calendar',
                    path: '/course-calendar',
                    element: <CourseCalendarDashboard />
                },
                {
                    id: 'my.portfolio',
                    path: '/my-portfolio',
                    element: <MyPortfolio />
                },
                {
                    id: 'admin.students',
                    path: '/admin-students',
                    element: <StudentsTable />
                },
                {
                    id: 'my.applications',
                    path: '/my-applications',
                    element: <MyApplications />
                },
                {
                    id: 'admin.users',
                    path: '/admin-users',
                    element: <AdminUsers />
                },
                {
                    id: 'admin.settings',
                    path: '/admin-settings',
                    element: <AdminSetting />
                },
                {
                    id: 'course.registrations',
                    path: '/course-registrations',
                    element: <CourseRegistrations />
                },
                {
                    id: 'scholar.applications',
                    path: '/scholar-applications',
                    element: <ScholarApplications />
                },
                {
                    id: 'admin.courses',
                    path: '/admin-courses',
                    element: <AdminCourses />
                },
                {
                    id: 'job.matching',
                    path: '/job-matching',
                    element: <JobMatchingAI />
                },
                {
                    id: 'admin.certificate.request',
                    path: '/admin-certificate-request',
                    element: <AdminCerticateRequest />
                },
                {
                    id: 'admin.faqs',
                    path: '/admin-faqs',
                    element: <AdminFaqs />
                },
            ])
        }
    ]
)
