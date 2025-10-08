import type { FC, ReactNode } from 'react'

interface LoaderBoundaryProps {
    isLoading: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
    children: ReactNode
}

export const LoaderBoundary: FC<LoaderBoundaryProps> = ({ isLoading, children, size = 'sm' }) => {
    const sizes = {
        ['xs']: '32px',
        ['sm']: '48px',
        ['md']: '64px',
        ['lg']: '80px',
    }
    if (isLoading) {
        return (
            <div
                className='loader'
                style={{
                    width: sizes[size],
                    height: sizes[size],
                }}
            />
        )
    }
    return children
}
