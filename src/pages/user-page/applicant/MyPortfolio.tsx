import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Container } from 'react-bootstrap';
import { useUserStore } from '../../../store/useUserStore';
import { getReq, putReq } from '../../../lib/axios';
import { PortfolioComponent } from '../../../components/PortfolioComponent';
import { DashboardComponent } from '../../../components/DashboardComponent';
import type { Portfolio } from '../../../types/common.types';

const MyPortfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userProfile = useUserStore((state) => state.userProfile);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getReq(`/api/portfolio/${userProfile._id}`);
      setPortfolio(data);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolio = async (updatedData: any) => {
    try {
      const response = await putReq(`/api/portfolio/${userProfile._id}`, updatedData);
      
      // Update the portfolio state with the new profile data
      if (portfolio) {
        setPortfolio({
          ...portfolio,
          profile: response.profile,
          stats: {
            ...portfolio.stats,
            skillsCount: response.profile.highlightedSkills?.length || 0,
            socialLinksCount: response.profile.socialLinks?.length || 0
          }
        });
      }
      
      // Also update the user store
      //useUserStore.getState().setUserProfile(response.profile);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update portfolio');
    }
  };

  useEffect(() => {
    if (userProfile._id) {
      fetchPortfolio();
    }
  }, [userProfile._id]);

  if (loading) {
    return (
      <DashboardComponent>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your portfolio...</p>
        </div>
      </DashboardComponent>
    );
  }

  if (error) {
    return (
      <DashboardComponent>
        <Alert variant="danger" className="mt-3">
          <Alert.Heading>Error Loading Portfolio</Alert.Heading>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={fetchPortfolio}
          >
            Try Again
          </button>
        </Alert>
      </DashboardComponent>
    );
  }

  if (!portfolio) {
    return (
      <DashboardComponent>
        <Alert variant="warning" className="mt-3">
          <Alert.Heading>Portfolio Not Found</Alert.Heading>
          <p>Unable to load your portfolio. Please try refreshing the page.</p>
        </Alert>
      </DashboardComponent>
    );
  }

  return (
    <DashboardComponent>
      <div className="dashboard-title mb-4">My Portfolio</div>
      <PortfolioComponent 
      portfolio={portfolio} 
      isOwner={true}
      onUpdate={updatePortfolio}
      />
      
      <br /><br />
    </DashboardComponent>
  );
};

export default MyPortfolio;