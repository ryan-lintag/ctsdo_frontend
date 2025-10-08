import { useEffect } from "react";
import { Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
    // const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        async function authenticate() {

        }
        authenticate();
    }, []);
    
    return <Outlet />
}

export default PrivateRoutes;