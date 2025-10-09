import { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import axios from "axios";
import HeaderContent from "../../components/HeaderContent";
import { ContentWrapper } from "../../components/ContentWrapper";
import { getReq } from "../../lib/axios";

const HomePage = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReq("/api/homepage-settings");
      setSettings(data);
      setLoading(false);
    };
    fetchData();
  }, []);

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
                backgroundImage: `url(${settings.headerImage})`,
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
            <img src={settings.enrollmentStepsImage} width="100%" />
          </Row>
        </ContentWrapper>
      </Container>

      {/* Location */}
      <Col className="col-md-12 heading-section text-center">
        <h2 className="mb-4">Our Location</h2>
      </Col>
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30814.727311615177!2d120.50327758173422!3d15.11209407047506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33968cbf29ec7ebb%3A0x66f07782278c9b64!2sDolores%20(Hacienda%20Dolores)%2C%20Porac%2C%20Pampanga%2C%20Philippines!5e0!3m2!1sen!2sph"
  width="100%"
  height="450"
  style={{ border: 0 }}
  allowFullScreen=""
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Company Location Map"
/>

    </>
  );
};

export default HomePage;
