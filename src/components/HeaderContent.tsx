import { Col, Row } from 'react-bootstrap';
import homeImage from '../assets/images/home-image.jpg';
import { ContentWrapper } from './ContentWrapper';

function HeaderContent() {
  return (
    <ContentWrapper>
      <Row>
        <Col md='6' className='ctsdo-animated fadeInDown'>
          <img src={homeImage} width={'100%'} />
        </Col>
        <Col className='ctsdo-animated fadeInRight'>
          <h2 className="mb-4 col-sm-9">Learn Anything You Want Today</h2>
          <p className='col-sm-9 paragraph'>
            The Community Training and Skills Development Office (CTSDO) aims to improve access to technical education and job opportunities for Hacienda Dolores residents, particularly those aged 18 to 50+, through a digital platform.
          </p>
          <p className='col-sm-9 paragraph'>
            Traditional methods like bulletin boards and in-person visits are limited in reach and efficiency, making it harder for people to find and enroll in training programs.
          </p>
          <p><a href="/signup" className="btn btn-primary">Signup now</a></p>
        </Col>
      </Row>
    </ContentWrapper>
  );
}

export default HeaderContent;

