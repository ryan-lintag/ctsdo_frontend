import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Alert, Container } from 'react-bootstrap';
import { getReq } from '../lib/axios';
import { PortfolioComponent } from '../components/PortfolioComponent';
import type { Portfolio } from '../types/common.types';

const PublicPortfolio: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPublicPortfolio = async () => {
    if (!studentId) {
      setError('Invalid portfolio link');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await getReq(`/api/portfolio/public/${studentId}`);
      setPortfolio(data);
    } catch (err: any) {
      console.error('Error fetching public portfolio:', err);
      if (err.status === 404) {
        setError('Portfolio not found');
      } else {
        setError(err.message || 'Failed to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPortfolio();
  }, [studentId]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading portfolio...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Portfolio Not Available</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!portfolio) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Portfolio Not Found</Alert.Heading>
          <p>The requested portfolio could not be found.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4 text-center">
        <h1>Student Portfolio</h1>
        <p className="text-muted">CTSDO Online Management System</p>
      </div>
      <PortfolioComponent 
        portfolio={portfolio} 
        isOwner={false}
      />
      <div className="text-center mt-4 pt-4 border-top">
        <small className="text-muted">
          Powered by CTSDO Online Management System
        </small>
      </div>
    </Container>
  );
};

export default PublicPortfolio;