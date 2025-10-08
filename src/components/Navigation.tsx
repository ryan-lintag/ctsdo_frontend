import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useUserStore } from '../store/useUserStore';
import { postReq } from '../lib/axios';
import './navigation-animations.css';
import './navigation-modern.css';

function Navigation() {
  const userProfile = useUserStore((state) => state.userProfile);
  const logoutUser = useUserStore((state) => state.logoutUser);
  const setIsLoading = useUserStore((state) => state.setIsLoading)
  const currentLocation = window.location.pathname;

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await postReq(`/auth/logout`, {});
      logoutUser();
      setIsLoading(false)
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      {['/', '/courses', '/about-us', '/faq', '/login', '/signup'].includes(currentLocation) ?
        <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary modern-glass-navbar">
          <Container>
            <Navbar.Brand href="/">
              <img src='/logo.jpg' width={'40px'} /> CTSDO
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link active={currentLocation == '/'} href="/">Home</Nav.Link>
                <Nav.Link active={currentLocation == '/about-us'} href="/about-us">About Us</Nav.Link>
                <Nav.Link active={currentLocation == '/faq'} href="/faq">FAQ</Nav.Link>
              </Nav>
              <Nav>
                {userProfile?._id ?
                  <>
                    <Nav.Link active={currentLocation == '/dashboard'} href="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link onClick={handleLogout} href="">Logout</Nav.Link>
                  </> :
                  <>
                    <Nav.Link active={currentLocation == '/login'} href="/login">Login</Nav.Link>
                    <Nav.Link active={currentLocation == '/signup'} href="/signup">Signup</Nav.Link>
                  </>
                }
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar> : null}
    </>
  );
}

export default Navigation;