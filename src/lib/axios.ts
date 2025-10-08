/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAxiosInstance } from '../api/createAxiosInstance'
import type { AxiosHeaderValue } from 'axios'

const { get: GET, post: POST, put: PUT, delete: DELETE } = createAxiosInstance()

export const getReq = (url: string, params?: Record<string, any>, headers?: {
    [key: string]: AxiosHeaderValue
}) => {
    const data = GET(url, {
        params, headers: {
            ...headers,
        }
    })
    return data
        .then((res) => res.data)
        .catch((err) => {
            throw new Error(err)
        })
}

export const postReq = (url: string, body: Record<string, any>, headers?: {
    [key: string]: AxiosHeaderValue
}) => {
    const data = POST(url, body, {
        headers: {
            ...headers,
        }
    })
    return data
        .then((res) => res.data)
        .catch((err) => {
            throw new Error(err)
        })
}

export const putReq = (url: string, body: Record<string, any>, headers?: {
    [key: string]: AxiosHeaderValue
}) => {
    const data = PUT(url, body, {
        headers: {
            ...headers,
        }
    })
    return data
        .then((res) => res.data)
        .catch((err) => {
            throw new Error(err)
        })
}

export const deleteReq = (url: string, headers?: {
    [key: string]: AxiosHeaderValue
}) => {
    const data = DELETE(url, {
        headers: {
            ...headers,
        }
    })
    return data
        .then((res) => res.data)
        .catch((err) => {
            throw new Error(err)
        })
}
