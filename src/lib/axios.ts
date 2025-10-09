/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAxiosInstance } from '../api/createAxiosInstance'

const { get: GET, post: POST, put: PUT, delete: DELETE } = createAxiosInstance()

export const getReq = (url: string, params?: Record<string, any>, headers?: {
    [key: string]: string
}) => {
    const data = GET(url, {
        params, headers: {
            ...headers,
        }
    })
    return data
        .then((res: any) => res.data)
        .catch((err: any) => {
            throw new Error(err)
        })
}

export const postReq = (url: string, body: Record<string, any>, headers?: {
    [key: string]: string
}) => {
    const data = POST(url, body, {
        headers: {
            ...headers,
        }
    })
    return data
        .then((res: any) => res.data)
        .catch((err: any) => {
            throw new Error(err)
        })
}

export const putReq = (url: string, body: Record<string, any>, headers?: {
    [key: string]: string
}) => {
    const data = PUT(url, body, {
        headers: {
            ...headers,
        }
    })
    return data
        .then((res: any) => res.data)
        .catch((err: any) => {
            throw new Error(err)
        })
}

export const deleteReq = (url: string, headers?: {
    [key: string]: string
}) => {
    const data = DELETE(url, {
        headers: {
            ...headers,
        }
    })
    return data
        .then((res: any) => res.data)
        .catch((err: any) => {
            throw new Error(err)
        })
}
