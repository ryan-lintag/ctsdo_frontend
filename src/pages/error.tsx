import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

const ErrorPage = () => {
    const error = useRouteError()
    console.log('ERROR:',error)
    if (isRouteErrorResponse(error)) {
        switch (error.status) {
            case 404:
                return <div>This page doesn't exist!</div>
            default:
                return <div>Something went wrong!</div>
        }
    }
    return <div>Something went wrong!</div>
}

export default ErrorPage
