import 'bootstrap/dist/css/bootstrap.min.css'
import Navigation from './components/Navigation'
import Container from 'react-bootstrap/Container';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';
import { LoaderBoundary } from './components/LoaderBoundary';
import { useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  setTimeout(() => {
    setIsLoading(false);
  }, 1000);
  return (
    <Container fluid className='p-0'>
      <LoaderBoundary isLoading={isLoading}>
        <Navigation />
        <AppRoutes />
        <Footer />
      </LoaderBoundary>
    </Container>
  )
}

export default App
