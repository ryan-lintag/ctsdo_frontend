import { Container } from 'react-bootstrap'
import type { ReactNode } from 'react'

export const ContentWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Container className='p-4'>
      {children}
    </Container>
  )
}
