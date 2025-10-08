import type { ReactNode } from 'react'
import { Accordion } from 'react-bootstrap';

interface CustomProps {
  eventKey: string
  header: string
  children: ReactNode
}

export const AccordionItemComponent: React.FC<CustomProps> = ({ eventKey, header, children }) => {
  return (
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header className='m-0 primary'>{header}</Accordion.Header>
      <Accordion.Body>
        {children}
      </Accordion.Body>
    </Accordion.Item>
  )
}
