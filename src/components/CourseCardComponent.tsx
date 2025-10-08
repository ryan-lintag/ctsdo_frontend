import { Card, Col } from 'react-bootstrap';
import type { Course } from '../types/common.types';

interface CourseCardProps {
  course: Course;
}

export const CourseCardComponent: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Col md='4' className='p-4'>
      <Card className='project-wrapper'>
        <Card.Header className='card-header' style={{ backgroundImage: 'url(' + course.imageUrl + ')' }}>&nbsp;</Card.Header>
        <Card.Body>
          <Card.Title><h3>{course.title}</h3></Card.Title>
          <Card.Text>
            {course.description}
          </Card.Text>
          <div className="d-flex" style={{ justifyContent: 'space-between' }}>
            <a href={"/login?id=" + course._id} className="btn btn-primary">Find out more!</a>
            {/* <a href={"/my-certifications?course=" + course._id} className="btn btn-success">Request for Certificate</a> */}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}