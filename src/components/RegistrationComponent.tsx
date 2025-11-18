import React, { useEffect, useState } from "react";
import { Form, Row, Col, Alert, Button, Accordion } from "react-bootstrap";
import { getReq, postReq } from "../lib/axios";
import { AccordionItemComponent } from "../components/AccordionItemComponent";
import { useUserStore } from "../store/useUserStore";
import { useLocation } from "react-router-dom";

interface Address {
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  region: string;
}

interface BirthPlace {
  city: string;
  province: string;
  region: string;
}

interface ParentGuardian {
  name: string;
  address: string;
}

export interface RegistrationData {
  _id?: string;
  idPicture: string | null;
  image: string | null;
  thumbmark: string | null;
  uliNumber: string;
  entryDate: string;
  lastName: string;
  firstName: string;
  middleName: string;
  extensionName: string;
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
  applicantSignature: File | null;
  registrarSignature: File | null;
  dateReceived: string;
  isApproved?: boolean;
  feedback?: string;
}

const generateId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const getRandomChar = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  const getRandomString = (chars: string, length: number) =>
    Array.from({ length }, () => getRandomChar(chars)).join("");

  const part1 = getRandomString(letters, 1);
  const part2 = getRandomString(digits, 8);
  const part3 = getRandomString(letters, 1);

  return `${part1}${part2}${part3}`;
};

// Alias so we can reuse RegistrationData
type NewRegistrationData = RegistrationData;

const defaultFormData: NewRegistrationData = {
  idPicture: null,
  image: null,
  thumbmark: null,
  uliNumber: generateId(),
  entryDate: "",
  lastName: "",
  firstName: "",
  middleName: "",
  extensionName: "",
  address: {
    street: "",
    barangay: "",
    district: "",
    city: "",
    province: "",
    region: "",
  },
  email: "",
  facebook: "",
  contactNumber: "",
  nationality: "",
  sex: "",
  civilStatus: "",
  employmentStatus: "",
  dob: "",
  birthPlace: {
    city: "",
    province: "",
    region: "",
  },
  educationalAttainment: [],
  parentGuardian: {
    name: "",
    address: "",
  },
  classifications: [],
  disabilityType: [],
  disabilityCause: [],
  courseId: "",
  scholarshipType: "",
  privacyAgreement: false,
  dateAccomplished: "",
  applicantSignature: null,
  registrarSignature: null,
  dateReceived: "",
};

interface RegistrationFormProps {
  registration?: RegistrationData | null;
  submitCallback?: (data: RegistrationData) => void;
  cancelCallback?: () => void;
  submitting?: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  registration,
  submitCallback,
  cancelCallback,
}) => {
  const location = useLocation();
  const preselectedCourseId = location.state?.preselectedCourseId;
  const { userProfile } = useUserStore();
  const [_formData, setFormData] = useState<RegistrationData[]>([]);
  const [newFormData, setNewFormData] = useState<NewRegistrationData>({
    ...defaultFormData,
    firstName: userProfile.firstName,
    middleName: userProfile.middleName,
    lastName: userProfile.lastName,
  });

  const sexOptions = ["Male", "Female", "Other"];
  const civilStatusOptions = [
    "Single",
    "Married",
    "Widowed",
    "Divorced",
    "Separated",
  ];
  const employmentStatusOptions = [
    "Employed",
    "Unemployed",
    "Self-Employed",
    "Student",
    "Retired",
  ];
  const educationalAttainmentOptions = [
    "No Formal Education",
    "Elementary Underraduate",
    "Elementary Graduate",
    "Junior High School Underraduate",
    "Junior High School Graduate",
    "Senior High School Underraduate",
    "Senior High School Graduate",
    "College Undergraduate",
    "College Graduate",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
  ];

  const clientsClassificationOptions = [
    "4ps Benificiary",
    "Displaced Workers",
    "Family Member of AFP and PNP Wounded in-Action",
    "Industry Worker",
    "Out of School Youth",
    "Rebel Returnees",
    "TESDA alumni",
    "Victim of Natural Disaster and Calamities",
    "Agraria Reform Beneficiary",
    "Drug Dependents Surrendernees",
    "Farmer and Fisherman",
    "Inmates and Detainees",
    "Overseas Filipino Worker (OFW)",
    "Returning OFW",
    "TVET Trainers",
    "Wounded in Action  AFP & PNP Personnel",
    "Balik Pobinsya",
    "Indigenous People",
    "MILF benificiary",
    "RCEF-RESP",
    "Student",
    "Uniformed Personnel",
    "Others"
  ]

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const fetchRegistrationById = async (id: string) => {
    try {
      const data = (await getReq(`/api/registrations/${id}`)) as any;
      return data;
    } catch (error) {
      console.error("Error fetching registration by ID:", error);
      return null;
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = (await getReq("/api/courses")) as any;
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const getImage = async (file: File): Promise<any> => {
    if (file) {
      return await convertToBase64(file)
        .then((base64) => base64)
        .catch((err) =>
          console.error("Error converting image to base64:", err)
        );
    } else return "";
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("Base64 conversion failed");
        }
      };
      reader.onerror = reject;
    });
  };

  const handleRegistrationInputChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    parentKey?: keyof RegistrationData,
    childKey?: string
  ) => {
    let { name, value } = e.target;

    // convert the file to base64 string
    if (
      [
        "idPicture",
        "applicantSignature",
        "image",
        "thumbmark",
        "registrarSignature",
      ].includes(name) &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      value = await getImage(e.target.files?.[0]);
    }

    if (parentKey && childKey) {
      setNewFormData((prev: any) => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: value,
        },
      }));
      return;
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setNewFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetFormData = () => setNewFormData(defaultFormData);

  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newFormData.courseId) {
      setError("Please select a course");
      return;
    }

    try {
      if (submitCallback) {
        submitCallback(newFormData);
      } else {
        // Send JSON payload directly (backend expects application/json)
        const res = (await postReq("/api/registration", newFormData)) as any;
        const newRegistration = res;
        setFormData((prev) => [...prev, newRegistration]);

        const fetched = await fetchRegistrationById(newRegistration._id);
        if (fetched) console.log("Fetched Registration:", fetched);

        setNewFormData(defaultFormData);
        setSuccess("Registration submitted successfully.");
        setError(null);
      }
    } catch (err: any) {
      console.error(
        "Failed to add registration:",
        err.response?.data || err.message
      );
      setError(
        "Failed to submit registration. Please check all required fields."
      );
      setSuccess(null);
    }
  };

  const renderImagePreview = (imageData: string | null, altText: string) => {
    if (!imageData) return null;

    return (
      <div className="mb-2">
        <small className="text-muted">Current image:</small>
        <br />
        <img
          src={imageData}
          alt={altText}
          style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover" }}
          className="border rounded"
        />
      </div>
    );
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (
      userProfile.firstName ||
      userProfile.middleName ||
      userProfile.lastName
    ) {
      setNewFormData((prev) => ({
        ...prev,
        firstName: userProfile.firstName,
        middleName: userProfile.middleName,
        lastName: userProfile.lastName,
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (preselectedCourseId) {
      setNewFormData((prev) => ({ ...prev, courseId: preselectedCourseId }));
    }
  }, [preselectedCourseId]);

  useEffect(() => {
    if (registration) {
      console.log("Populating form with registration data:", registration);

      const formatDateForInput = (dateString: string | Date) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setNewFormData({
        ...registration,
        entryDate: formatDateForInput(registration.entryDate),
        dob: formatDateForInput(registration.dob),
        dateAccomplished: formatDateForInput(registration.dateAccomplished),
        dateReceived: formatDateForInput(registration.dateReceived),
        educationalAttainment: Array.isArray(registration.educationalAttainment)
          ? registration.educationalAttainment
          : registration.educationalAttainment
          ? [registration.educationalAttainment]
          : [],
        classifications: Array.isArray(registration.classifications)
          ? registration.classifications
          : registration.classifications
          ? [registration.classifications]
          : [],
        disabilityType: Array.isArray(registration.disabilityType)
          ? registration.disabilityType
          : registration.disabilityType
          ? [registration.disabilityType]
          : [],
        disabilityCause: Array.isArray(registration.disabilityCause)
          ? registration.disabilityCause
          : registration.disabilityCause
          ? [registration.disabilityCause]
          : [],
        address: registration.address || {
          street: "",
          barangay: "",
          district: "",
          city: "",
          province: "",
          region: "",
        },
        birthPlace: registration.birthPlace || {
          city: "",
          province: "",
          region: "",
        },
        parentGuardian: registration.parentGuardian || {
          name: "",
          address: "",
        },
        idPicture: null,
        image: null,
        thumbmark: null,
        applicantSignature: null,
        registrarSignature: null,
      });
    }
  }, [registration]);

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "1200px", width: "100%" }}
      >
        <Form onSubmit={handleAddRegistration}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success ? (
            <Alert variant="success">{success}</Alert>
          ) : (
            <>
              <div className="label d-flex justify-content-center align-items-center">
                <h5>
                  {registration ? "Edit Registration" : "LEARNER PROFILE FORM"}
                </h5>
              </div>
              <Row>
                <Accordion alwaysOpen>
                  <AccordionItemComponent
                    eventKey="0"
                    header="T2MIS Auto Generated"
                    children={
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <div className="label">
                              <h6>Unique Learner Identifier (ULI no.)</h6>
                            </div>
                            <Form.Control
                              type="text"
                              name="uliNumber"
                              value={newFormData.uliNumber}
                              onChange={handleRegistrationInputChange}
                              disabled
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <div className="label">
                              <h6>Entry Date</h6>
                            </div>
                            <Form.Control
  type="date"
  name="entryDate"
  value={newFormData.entryDate || new Date().toISOString().split("T")[0]}
  min={new Date().toISOString().split("T")[0]}
  onChange={handleRegistrationInputChange}
/>

                          </Form.Group>
                        </Col>
                      </Row>
                    }
                  />
                  <AccordionItemComponent
                    eventKey="1"
                    header="Learner/Manpower Profile"
                    children={
                      <Row>
                        <div className="label">
                          <h6>Name</h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={newFormData.lastName}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={newFormData.firstName}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Middle Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="middleName"
                              value={newFormData.middleName}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Extension Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="extensionName"
                              value={newFormData.extensionName}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>Complete Permanent Mailing Address</h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Street</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.street"
                              value={newFormData.address.street}
                              onChange={(e) =>
                                setNewFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    ...prev.address,
                                    street: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Barangay</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.barangay"
                              value={newFormData.address.barangay}
                              onChange={(e) =>
                                setNewFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    ...prev.address,
                                    barangay: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>District</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.district"
                              value={newFormData.address.district}
                              onChange={(e) =>
                                setNewFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    ...prev.address,
                                    district: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>City/Municipality</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.city"
                              value={newFormData.address.city}
                              onChange={(e) =>
                                setNewFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    ...prev.address,
                                    city: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Province</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.province"
                              value={newFormData.address.province}
                              onChange={(e) =>
                                setNewFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    ...prev.address,
                                    province: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Region</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.region"
                              value={newFormData.address.region}
                              onChange={(e) =>
                                setNewFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    ...prev.address,
                                    region: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                              type="text"
                              name="email"
                              value={newFormData.email}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Facebook Account</Form.Label>
                            <Form.Control
                              type="text"
                              name="facebook"
                              value={newFormData.facebook}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="contactNumber"
                              value={newFormData.contactNumber}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="dob"
                              value={newFormData.dob}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>Birthplace</h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Municipality/City</Form.Label>
                            <Form.Control
                              type="text"
                              name="birthPlace.city"
                              value={newFormData.birthPlace.city}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Province</Form.Label>
                            <Form.Control
                              type="text"
                              name="birthPlace.province"
                              value={newFormData.birthPlace.province}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Region</Form.Label>
                            <Form.Control
                              type="text"
                              name="birthPlace.region"
                              value={newFormData.birthPlace.region}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nationality</Form.Label>
                            <Form.Control
                              type="text"
                              name="nationality"
                              value={newFormData.nationality}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    }
                  />
                  <AccordionItemComponent
                    eventKey="2"
                    header="Personal Information"
                    children={
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Sex</Form.Label>
                            <Form.Select
                              name="sex"
                              value={newFormData.sex}
                              onChange={handleRegistrationInputChange}
                            >
                              <option value="">--Select--</option>
                              {sexOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Civil Status</Form.Label>
                            <Form.Select
                              name="civilStatus"
                              value={newFormData.civilStatus}
                              onChange={handleRegistrationInputChange}
                            >
                              <option value="">--Select--</option>
                              {civilStatusOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Employment Status</Form.Label>
                            <Form.Select
                              name="employmentStatus"
                              value={newFormData.employmentStatus}
                              onChange={handleRegistrationInputChange}
                            >
                              <option value="">--Select--</option>
                              {employmentStatusOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>Educational Attainment Before the Training</h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Select
                              name="educationalAttainment"
                              value={newFormData.educationalAttainment}
                              onChange={handleRegistrationInputChange}
                            >
                              <option value="">--Select--</option>
                              {educationalAttainmentOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>Parent/Guardian</h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="parentGuardian.name"
                              value={newFormData.parentGuardian.name}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Complete Permanent Mailing Address
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="parentGuardian.address"
                              value={newFormData.parentGuardian.address}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>Learner/Trainee/Student </h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Select
                              name="classifications"
                              value={newFormData.classifications}
                              onChange={handleRegistrationInputChange}
                            >
                            <option value="">--Select Classification--</option>
                            {clientsClassificationOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>
                            If Scholar, What type of Scholarship Package (TSPW,
                            PESFA, STEP, others?)
                          </h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label></Form.Label>
                            <Form.Control
                              type="text"
                              name="scholarshipType"
                              value={newFormData.scholarshipType}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <div className="label">
                              <h6>Name of Course/Qualification</h6>
                            </div>
                            <Form.Select
                              name="courseId"
                              value={newFormData.courseId}
                              onChange={handleRegistrationInputChange}
                              disabled={loadingCourses}
                            >
                              <option value="">
                                {loadingCourses
                                  ? "Loading courses..."
                                  : "--Select Course--"}
                              </option>
                              {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                  {course.title}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                    }
                  />
                  <AccordionItemComponent
                    eventKey="4"
                    header="Applicant Signature"
                    children={
                      <Row>
                        <div className="label d-flex justify-content-center align-items-center">
                          <h5>
                            This is to certify that the information stated above
                            is true and correct.
                          </h5>
                        </div>

                        <Form.Group controlId="formFileMultiple" className="mb-3">
                  <Form.Label>ID Picture</Form.Label>
                  {renderImagePreview(
                    registration?.idPicture ?? null,
                    "Current ID Picture"
                  )}
                  <Form.Control
                    type="file"
                    name="idPicture"
                    accept="image/*"
                    onChange={handleRegistrationInputChange}
                  />
                  {registration?.idPicture && (
                    <small className="text-muted">
                      Upload a new image to replace the current one
                    </small>
                  )}
                </Form.Group>

                        <Form.Group
                          controlId="applicantSignature"
                          className="mb-3"
                        >
                          <Form.Label>Applicant Signature</Form.Label>
                          {renderImagePreview(
                            registration?.applicantSignature as unknown as string,
                            "Current Applicant Signature"
                          )}
                          <Form.Control
                            type="file"
                            name="applicantSignature"
                            onChange={handleRegistrationInputChange}
                          />
                          {registration?.applicantSignature && (
                            <small className="text-muted">
                              Upload a new signature to replace the current one
                            </small>
                          )}
                        </Form.Group>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date Accomplishment</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateAccomplished"
                              value={newFormData.dateAccomplished}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>

                        <Form.Group controlId="image" className="mb-3">
                          <Form.Label>
                            1x1 picture taken within the last 6 months
                          </Form.Label>
                          {renderImagePreview(
                            registration?.image ?? null,
                            "Current 1x1 Picture"
                          )}
                          <Form.Control
                            type="file"
                            name="image"
                            onChange={handleRegistrationInputChange}
                          />
                          {registration?.image && (
                            <small className="text-muted">
                              Upload a new picture to replace the current one
                            </small>
                          )}
                        </Form.Group>

                        <Form.Group controlId="thumbmark" className="mb-3">
                          <Form.Label>Right Thumbmark</Form.Label>
                          {renderImagePreview(
                            registration?.thumbmark ?? null,
                            "Current Thumbmark"
                          )}
                          <Form.Control
                            type="file"
                            name="thumbmark"
                            onChange={handleRegistrationInputChange}
                          />
                          {registration?.thumbmark && (
                            <small className="text-muted">
                              Upload a new thumbmark to replace the current one
                            </small>
                          )}
                        </Form.Group>
                      </Row>
                    }
                  />
                  <AccordionItemComponent
                    eventKey="3"
                    header="to be filled up by the TESDA personel"
                    children={
                      <Row>
                        
                        <div className="label">
                          <h6>
                            Type of Dissabilities (Only for Person with
                            Dissabilities)
                          </h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Control
                              type="text"
                              name="disabilityType"
                              value={newFormData.disabilityType}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <div className="label">
                          <h6>
                            Cause of Dissabilities (Only for Person with
                            Dissabilities)
                          </h6>
                        </div>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Control
                              type="text"
                              name="disabilityCause"
                              value={newFormData.disabilityCause}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                                                <Form.Group
                          controlId="registrarSignature"
                          className="mb-3"
                        >
                          <Form.Label>
                            School Administrator Signature
                          </Form.Label>
                          {renderImagePreview(
                            registration?.registrarSignature as unknown as string,
                            "Current Administrator Signature"
                          )}
                          <Form.Control
                            type="file"
                            name="registrarSignature"
                            onChange={handleRegistrationInputChange}
                          />
                          {registration?.registrarSignature && (
                            <small className="text-muted">
                              Upload a new signature to replace the current one
                            </small>
                          )}
                        </Form.Group>

                         <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date Received</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateReceived"
                              value={newFormData.dateReceived}
                              onChange={handleRegistrationInputChange}
                            />
                          </Form.Group>
                        </Col>
                        
                      </Row>
                    }
                  />
                </Accordion>
              </Row>

              <br />

              <div className="label">
                <h6>Privacy Disclaimer</h6>
              </div>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="privacyAgreement"
                    checked={newFormData.privacyAgreement}
                    onChange={(e) =>
                      setNewFormData((prev) => ({
                        ...prev,
                        privacyAgreement: e.target.checked,
                      }))
                    }
                    label="I hereby allow TESDA to use/post my contact details, name, email, cellphone/landline nos. and other information i provided
                      which may be used for processing of my scholarship application, for empolyment opportunities and for the survey of TESDA programs."
                  />
                </Form.Group>
              </Col>
              <Button type="submit" variant="primary">
                {registration ? "Update Registration" : "Submit Registration"}
              </Button>
              {cancelCallback && (
                <Button
                  type="button"
                  variant="secondary"
                  className="ms-2"
                  onClick={cancelCallback}
                >
                  Cancel
                </Button>
              )}
              {!cancelCallback && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="ms-2"
                  onClick={resetFormData}
                >
                  Reset Form
                </Button>
              )}
            </>
          )}
        </Form>
      </div>
    </div>
  );
};
