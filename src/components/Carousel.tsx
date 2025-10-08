import Carousel from 'react-bootstrap/Carousel';
import barista from '../assets/images/barista.jpg';
import drivingCourse from '../assets/images/driving_course.jpg';
import electrical from '../assets/images/electrical.jpg';

function CarouselComponent() {
  return (
    <Carousel interval={3000}>
      <Carousel.Item>
        <img className="d-block w-100" src={barista} />
        {/* <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption> */}
      </Carousel.Item>
      <Carousel.Item>
      <img className="d-block w-100" src={drivingCourse} />
        {/* <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption> */}
      </Carousel.Item>
      <Carousel.Item>
      <img className="d-block w-100" src={electrical} />
      
        {/* <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption> */}
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselComponent;