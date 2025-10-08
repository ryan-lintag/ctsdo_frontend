import type { ReactNode } from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { useUserStore } from '../store/useUserStore';
import SidebarNavigation from './SidebarNavigation';
import { LoaderBoundary } from './LoaderBoundary';
import { ContentWrapperFluid } from './ContentWrapperFluid';

export const DashboardComponent = ({ children }: { children: ReactNode }) => {
  const userProfile = useUserStore((state) => state.userProfile)
  const setIsLoading = useUserStore((state) => state.setIsLoading)
  const isLoading = useUserStore((state) => state.isLoading)
  const navigate = useNavigate();
  useEffect(() => {
    if (!userProfile || !userProfile._id) {
      navigate('/login');
      return;
    }
    setIsLoading(false)
  }, [navigate]);
  return (
    <Container fluid>
      <Row className='p-0'>
        <Col sm="auto" className='p-0'>
          <SidebarNavigation />
        </Col>
        <Col sm className='dashboard-box'>
          <LoaderBoundary isLoading={isLoading}>
            <ContentWrapperFluid>
              {children}
            </ContentWrapperFluid>
          </LoaderBoundary>
        </Col>
      </Row>
    </Container>
  )
}
