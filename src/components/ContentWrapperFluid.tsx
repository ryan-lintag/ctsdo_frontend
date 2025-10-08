import { Container } from 'react-bootstrap'
import type { ReactNode } from 'react'

export const ContentWrapperFluid = ({ children }: { children: ReactNode }) => {
  return (
    <Container className='p-0 m-0' fluid>
      {children}
    </Container>
  )
}
