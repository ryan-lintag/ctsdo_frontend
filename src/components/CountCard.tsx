import { CDBIcon } from 'cdbreact';
import { Card, Col, Container, Row } from 'react-bootstrap';

interface CountCardProps {
  icon: string
  iconColor: string
  count: number
  text: string
}

export const CountCard: React.FC<CountCardProps> = ({ icon, iconColor, count, text }) => {
  return (
    <Col md='6' sm='12' lg='3'>
      <div className="parent count-card-box">
        <div className="left margin-right-auto" style={{ color: iconColor, position: 'relative' }}>
          <span style={{ position: 'absolute', top: '0' }}>
            <CDBIcon fas icon={icon} size="3x" /></span>
        </div>
        <div className="right">
          <div><h3>{count}</h3></div>
          <div><h6>{text}</h6></div>
        </div>
      </div>
    </Col>
  );
}