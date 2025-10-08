import { RouterProvider } from 'react-router-dom'

import { appRoutesCollection } from './appRoutesCollection'

const AppRoutes = () => {
    return <RouterProvider router={appRoutesCollection} />
}

export default AppRoutes
