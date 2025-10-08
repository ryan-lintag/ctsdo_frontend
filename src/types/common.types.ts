import type { Key, ReactNode } from "react";

export type Course = {
    name: ReactNode;
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    quota?: number;
    status?: number;
    instructor?: string;
    startDate?: Date;
    endDate?: Date;
    currentEnrolled?: number;
}

export type UserProfile = {
    _id: string,
    email: string,
    password?: string,
    role: string,
    firstName: string,
    middleName: string,
    lastName: string,
    dateOfBirth: Date,
    status?: number,
    // Portfolio fields
    contactNumber?: string,
    address?: string,
    bio?: string,
    profilePicture?: string,
    socialLinks?: SocialLink[],
    highlightedSkills?: string[],
    education?: { school: string; degree: string; year: string }[],
    experience?: { company: string; period: string; description: string }[]
}

export type SocialLink = {
    platform: 'linkedin' | 'github' | 'facebook' | 'twitter' | 'instagram' | 'website' | 'other',
    url: string
}

export type CompletedCourseDetails = {
    courseId: string,
    courseTitle: string,
    courseDescription?: string,
    instructor?: string,
    startDate?: Date,
    endDate?: Date,
    completionDate: Date,
    status: string,
    certificate?: Certificate,
    duration?: number
}

export type Portfolio = {
    profile: UserProfile,
    completedCourses: CompletedCourseDetails[],
    stats: {
        totalCompletedCourses: number,
        certificatesEarned: number,
        skillsCount: number,
        socialLinksCount: number
    }
}

export type Certificate = {
    _id: string;
    userId: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    courseId: string;
    courseTitle?: string;
    status?: string;
    requestDate?: Date;
    certificate?: string,
}

export type CompletedCourse = {
    courseId?: string;
    courseTitle?: string;
}

export interface Address {
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  region: string;
}

export interface BirthPlace {
  city: string;
  province: string;
  region: string;
}

export interface ParentGuardian {
  name: string;
  address: string;
}

export interface RegistrationData {
  _id: Key | null | undefined;
  idPicture?: string;
  image?: string;
  thumbmark?: string;
  uliNumber: string;
  entryDate: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  extensionName?: string;
  address: Address;
  email: string;
  facebook: string;
  contactNumber: string;
  nationality: string;
  sex: string;
  civilStatus: string;
  employmentStatus: string;
  dob: string;
  birthPlace: BirthPlace;
  educationalAttainment: string[];
  parentGuardian: ParentGuardian;
  classifications: string[];
  disabilityType: string[];
  disabilityCause: string[];
  courseId: string;
  scholarshipType: string;
  privacyAgreement: boolean;
  dateAccomplished: string;
  applicantSignature?: File | null;
  registrarSignature?: File | null;
  dateReceived: string;
  isApproved?: boolean;
  feedback?: string;
}

export interface Student {
  _id: string;
  userId: string;
  courseId: string;
  status: string;
  name?: string; // full name for display
  courseTitle?: string; // course title for display
}

export interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  status: number;
}