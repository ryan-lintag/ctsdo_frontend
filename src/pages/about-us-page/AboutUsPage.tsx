import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const AboutUsPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', background: '#eef3f7', borderRadius: '8px' }}>
      <Row className="justify-content-center my-4">
        <Col md={8}>
          <Card className="shadow-lg rounded-4">
            <Card.Body>
              <h2 className="text-center mb-4">About Us</h2>
              <p>
                <strong>Porac Manpower Training Center (PMTC)</strong> is dedicated to providing quality training and skills development to empower the local community of Porac. Our mission is to enhance employment opportunities through accessible and relevant training programs.
              </p>
              <p>
                We believe in building a skilled and competitive workforce by partnering with local organizations, trainers, and government programs.
              </p>
              <hr />
              <h5>Contact Information</h5>
              <ul className="list-unstyled">
                <li><strong>Facebook:</strong> <a href="https://www.facebook.com/Porac-Manpower-Training-Center" target="_blank" rel="noopener noreferrer">Porac Manpower Training Center</a></li>
                <li><strong>Phone Number:</strong> 0969-6368-093</li>
                <li><strong>Email:</strong> <a href="mailto:pmtcporac@gmail.com">pmtcporac@gmail.com</a></li>
                <li><strong>Location:</strong> Cangatba, Porac, Pampanga</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </div>
  );
};

export default AboutUsPage;
