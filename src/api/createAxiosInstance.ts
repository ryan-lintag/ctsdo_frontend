import axios from 'axios'

export const createAxiosInstance = () => {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: undefined,
        },
    })

    return instance
}
