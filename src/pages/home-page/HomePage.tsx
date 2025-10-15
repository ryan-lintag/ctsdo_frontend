import { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import HeaderContent from "../../components/HeaderContent";
import { ContentWrapper } from "../../components/ContentWrapper";
import { getReq } from "../../lib/axios";

const HomePage = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReq("/api/homepage-settings");
      setSettings(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    // If it starts with /uploads, it's an uploaded file
    if (imagePath.startsWith("/uploads/")) {
      return `${API_BASE_URL}${imagePath}`;
    }

    if (imagePath.startsWith("data:image")) {
      return imagePath;
    }
    
    // If it's a default image path (like img/header.jpg)
    if (imagePath.startsWith("img/")) {
      return `${API_BASE_URL}/${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path
    return `${API_BASE_URL}/${imagePath}`;
  };

  if (loading) return <p>Loading...</p>;
  if (!settings) return <p>No settings found.</p>;

  return (
    <>
      <HeaderContent />

      {/* Hero Section */}
      <Container fluid className="bg-light">
        <ContentWrapper>
          <Row>
            <Col className="col-md-12 heading-section text-center">
              <span className="subheading">{settings.heroTitle}</span>
              <h2 className="mb-4">{settings.heroSubtitle}</h2>
            </Col>
          </Row>
        </ContentWrapper>
      </Container>

      {/* About Section */}
      <Container className="mt-5 mb-5">
        <Row className="justify-content-center">
          <Col md={12} className="text-center">
            <div
              className="img ftco-intro p-1 pb-4"
              style={{
                backgroundImage: `url(${getImageUrl(settings.headerImage)})`,
                opacity: 0.8,
              }}
            >
              <div className="overlay"></div>
              <h2>{settings.aboutTitle}</h2>
              <p>{settings.aboutDescription}</p>
              <p className="mb-0">
                <a
                  href={settings.aboutButtonLink}
                  className="btn btn-primary px-4 py-3"
                >
                  {settings.aboutButtonText}
                </a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Enrollment Steps */}
      <Container fluid className="bg-light">
        <ContentWrapper>
          <Row>
            <Col className="col-md-12 heading-section text-center">
              <span className="subheading">Easy Process</span>
              <h2 className="mb-4">Enrollment Steps</h2>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <img 
              src={getImageUrl(settings.enrollmentStepsImage)} 
              alt="Enrollment Steps"
              width="100%" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Row>
        </ContentWrapper>
      </Container>

      {/* Location */}
      <Col className="col-md-12 heading-section text-center">
        <h2 className="mb-4">Our Location</h2>
      </Col>
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2646.522613585975!2d120.54483323047396!3d15.080216561036277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396f4bb560fd10b%3A0xd96b63f6379b3384!2sPorac%20Manpower%20Training%20Center!5e0!3m2!1sen!2ssg!4v1759986070976!5m2!1sen!2ssg"
  width="100%"
  height="450"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Company Location Map"
/>

    </>
  );
};

export default HomePage;
