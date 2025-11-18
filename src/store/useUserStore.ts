import { create } from 'zustand'
import type { UserProfile } from '../types/common.types'
import { persist } from 'zustand/middleware'

const USER_PROFILE_DEFAULT: UserProfile = {
    _id: '',
    email: '',
    role: '',
    userName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: new Date(),
    status: 0
}
type StoreType = {
    userProfile: UserProfile
    isLoading: boolean
    setLoggedInUser: (userProfile: UserProfile) => void
    setIsLoading: (isLoading: boolean) => void
    logoutUser: () => void
}
export const useUserStore = create<StoreType>()(
    persist(
        (set, _get) => ({
            userProfile: USER_PROFILE_DEFAULT,
            isLoading: true,
            setLoggedInUser: (userProfile: UserProfile) => set({ userProfile }),
            setIsLoading: (isLoading: boolean) => set({ isLoading }),
            logoutUser: () => { set({ userProfile: USER_PROFILE_DEFAULT }) }
        }),
        {
            name: 'ctsdo-storage', // name of the item in the storage (must be unique)
        },
    ),
)
