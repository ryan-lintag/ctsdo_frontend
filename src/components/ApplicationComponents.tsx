import React, { useEffect, useState } from "react";
import {
  Table,
  Form,
  Row,
  Col,
  Alert,
  Button,
  Accordion,
} from "react-bootstrap";
import { getReq, postReq } from "../lib/axios";
import { AccordionItemComponent } from "../components/AccordionItemComponent";

interface ContactInfo {
  mobile: string;
  telephone: string;
  email: string;
  fax: string;
  others: string;
}

interface Address {
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  region: string;
  zipCode: string;
}

interface BirthPlace {
  city: string;
  province: string;
  region: string;
}

interface Education {
  highestEducationalAttainment: string;
}

interface Requirements {
  pictures: boolean;
  selfAssessment: boolean;
  others: string;
}

interface WorkExperience {
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  monthlySalary: string;
  status: string;
  yearsOfExperience: number;
}

interface TrainingsAttended {
  title: string;
  venue: string;
  hours: number;
  conductedBy: string;
  inclusiveDates: string;
}

interface LicensureExam {
  title: string;
  date: string;
  rating: string;
  remarks: string;
  examVenue: string;
}

interface CompetencyAssessment {
  qualificationTitle: string;
  level: string;
  industrySector: string;
  certNumber: string;
  dateIssued: string;
  expiryDate: string;
}

interface Picture {
  url: string;
  filename: string;
}

export interface ApplicationFormData {
  _id?: string;
  idPicture: string;
  applicantSignature: string;
  referenceNumber: string;
  uliNumber: string;
  nameOfSchool: string;
  addressOfSchool: string;
  lastName: string;
  firstName: string;
  middleName: string;
  middleInitial: string;
  extensionName: string;
  dateOfApplication: Date;
  dateOfBirth: Date;
  birthPlace: BirthPlace;
  age: number;
  sex: string;
  civilStatus: string[];
  motherName: string;
  fatherName: string;
  contactInfo: ContactInfo;
  address: Address;
  education: Education;
  employmentStatus: string[];
  trainingCenter: string;
  titleOfAssessment: string;
  // assessmentCenter: string;
  clientType: string;
  assessmentSchedule: Date;
  // personalProtectiveEquipment: boolean;
  remarks: string;
  requirements: Requirements;
  workExperience: WorkExperience[];
  trainingsAttended: TrainingsAttended[];
  licensureExamsPassed: LicensureExam[];
  competencyAssessmentsPassed: CompetencyAssessment[];
  pictures: Picture[];
  submittedBy: string;
  // officialReceiptNumber: string;
  // orDateIssued: Date;
  signature: string;
  isApproved?: boolean;
  feedback?: string;
  createdAt?: Date;
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

type NewApplicationFormData = ApplicationFormData;

// ✅ Default values
const defaultApplicationFormData: NewApplicationFormData = {
  idPicture: "",
  applicantSignature: "",
  referenceNumber: "",
  uliNumber: generateId(),
  nameOfSchool: "",
  lastName: "",
  firstName: "",
  middleName: "",
  middleInitial: "",
  extensionName: "",
  addressOfSchool: "",
  dateOfApplication: new Date(),
  dateOfBirth: new Date(),
  age: 0,
  sex: "",
  civilStatus: [],
  motherName: "",
  fatherName: "",
  contactInfo: {
    mobile: "",
    telephone: "",
    email: "",
    fax: "",
    others: "",
  },
  birthPlace: {
    city: "",
    province: "",
    region: "",
  },
  address: {
    street: "",
    barangay: "",
    district: "",
    city: "",
    province: "",
    region: "",
    zipCode: "",
  },
  education: {
    highestEducationalAttainment: "",
  },
  employmentStatus: [],
  trainingCenter: "",
  titleOfAssessment: "",
  // assessmentCenter: "",
  clientType: "",
  assessmentSchedule: new Date(),
  // personalProtectiveEquipment: false,
  remarks: "",
  requirements: {
    pictures: false,
    selfAssessment: false,
    others: "",
  },
  workExperience: [],
  trainingsAttended: [],
  licensureExamsPassed: [],
  competencyAssessmentsPassed: [],
  pictures: [],
  submittedBy: "",
  // officialReceiptNumber: "",
  // orDateIssued: new Date(),
  signature: "",
};

interface ApplicationFormProps {
  application?: ApplicationFormData | null;
  submitCallback?: (data: ApplicationFormData) => void;
  cancelCallback?: () => void;
}

export const ApplicationsForm: React.FC<ApplicationFormProps> = ({
  application,
  submitCallback,
  cancelCallback,
}) => {
  const [_formData, setFormData] = useState<ApplicationFormData[]>([]);
  const [newFormData, setNewFormData] = useState<NewApplicationFormData>(
    defaultApplicationFormData
  );
  const clientTypeOption = [
    "TVET Graduating Student",
    "TVET Graduate",
    "Industry Worker",
    "K-12",
    "OFW",
  ];
  const titleOfAssessmenOption = ["Full Qualification", "COC", "Renewal"];
  const sexOptions = ["Male", "Female", "Other"];
  const civilStatusOptions = [
    "Single",
    "Married",
    "Widowed",
    "Divorced",
    "Separated",
  ];
  const employmentStatusOption = [
    "Employed",
    "Unemployed",
    "Self-Employed",
    "Student",
    "Retired",
  ];
  const educationalAttainmentOption = [
    "Elemantary Graduate",
    "High School Graduate",
    "TVET Graduate",
    "College Level",
    "College Graduate",
    "Others",
  ];

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchApplicationById = async (id: string) => {
    try {
      const res = await getReq(`/api/application/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching application byID:", error);
      return null;
    }
  };

  const handleApplicationInputChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    parentKey?: keyof ApplicationFormData,
    childKey?: string
  ) => {
    let { name, value } = e.target;

    // convert the file to base64 string
    if (
      ["idPicture", "applicantSignature"].includes(name) &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      value = await getImage(e.target.files?.[0]);
      if (name == "idPicture") newFormData.idPicture = value;
      else if (name == "applicantSignature")
        newFormData.applicantSignature = value;
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
      reader.readAsDataURL(file); // Read file as base64
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result); // This is the base64 string
        } else {
          reject("Base64 conversion failed");
        }
      };
      reader.onerror = reject;
    });
  };

  const resetFormData = () => setNewFormData(defaultApplicationFormData);

  const handleAddApplicationForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    const simpleFields = [
      "idPicture",
      "applicantSignature",
      "referenceNumber",
      "nameOfSchool",
      "addressOfSchool",
      "age",
      "firstName",
      "lastName",
      "middleName",
      "middleInitial",
      "extensionName",
      "uliNumber",
      "dateOfApplication",
      "dateOfBirth",
      "civilStatus",
      "motherName",
      "fatherName",
      "employmentStatus",
      "trainingCenter",
      "titleOfAssessment",
      "clientType",
      "sex",
    ] as const;

    simpleFields.forEach((key) => {
      const value = newFormData[key];
      if (typeof value === "string") {
        formDataToSend.append(key, value);
      } else if (typeof value === "boolean") {
        formDataToSend.append(key, value ? "true" : "false");
      }
    });

    if (newFormData.address) {
      for (const [key, value] of Object.entries(newFormData.address)) {
        if (value) {
          formDataToSend.append(`address[${key}]`, value);
        }
      }
    }
    if (newFormData.contactInfo) {
      for (const [key, value] of Object.entries(newFormData.contactInfo)) {
        if (value) {
          formDataToSend.append(`contactInfo[${key}]`, value);
        }
      }
    }
    if (newFormData.assessmentSchedule) {
      for (const [key, value] of Object.entries(
        newFormData.assessmentSchedule
      )) {
        if (value) {
          formDataToSend.append(`assessmentSchedule[${key}]`, value);
        }
      }
    }
    if (newFormData.requirements) {
      for (const [key, value] of Object.entries(newFormData.requirements)) {
        if (value) {
          formDataToSend.append(`requirements[${key}]`, value);
        }
      }
    }
    if (newFormData.birthPlace) {
      for (const [key, value] of Object.entries(newFormData.birthPlace)) {
        if (value) {
          formDataToSend.append(`birthPlace[${key}]`, value);
        }
      }
    }

    const arrayFieldKeys = [
      "civilStatus",
      "employmentStatus",
      "titleOfAssessment",
      "workExperience",
      "trainingsAttended",
      "licensureExamsPassed",
      "competencyAssessmentsPassed",
      "pictures",
      "education",
    ] as const;

    arrayFieldKeys.forEach((key) => {
      const value = newFormData[key];
      if (value) {
        formDataToSend.append(key, JSON.stringify(value));
      }
    });

    for (let pair of formDataToSend.entries()) {
      console.log(pair[0], ":", pair[1]);
    }

    try {
      if (submitCallback) {
        // Use the callback (when used in MyApplications)
        submitCallback(newFormData);
      } else {
        // Direct API call (when used standalone)
        const res = await postReq("/api/application", formDataToSend);
        const newApplication = res;
        setFormData((prev) => [...prev, newApplication]);

        // Optionally fetch the submitted application by ID
        const fetched = await fetchApplicationById(newApplication._id);
        if (fetched) console.log("Fetched Application:", fetched);

        // Reset form after successful submission
        setNewFormData(defaultApplicationFormData);
        setSuccess("Application submitted successfully.");
        setError(null);
      }
    } catch (err: any) {
      console.error(
        "Failed to add application:",
        err.response?.data || err.message
      );
      setError(
        "Failed to submit application. Please check all required fields."
      );
      setSuccess(null);
    }
  };

  const handleWorkExperienceChange = (
    index: number,
    field: keyof WorkExperience,
    value: string | number
  ) => {
    const updated = [...newFormData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setNewFormData((prev) => ({ ...prev, workExperience: updated }));
  };

  const addWorkExperienceRow = () => {
    setNewFormData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          companyName: "",
          position: "",
          startDate: "",
          endDate: "",
          monthlySalary: "",
          status: "",
          yearsOfExperience: 0,
        },
      ],
    }));
  };

  const removeWorkExperienceRow = (index: number) => {
    const updated = [...newFormData.workExperience];
    updated.splice(index, 1);
    setNewFormData((prev) => ({ ...prev, workExperience: updated }));
  };

  const handleSeminarChange = (
    index: number,
    field: keyof TrainingsAttended,
    value: string | number
  ) => {
    const updated = [...newFormData.trainingsAttended];
    updated[index] = { ...updated[index], [field]: value };
    setNewFormData((prev) => ({ ...prev, trainingsAttended: updated }));
  };

  const addSeminarRow = () => {
    setNewFormData((prev) => ({
      ...prev,
      trainingsAttended: [
        ...prev.trainingsAttended,
        {
          title: "",
          venue: "",
          hours: 0,
          conductedBy: "",
          inclusiveDates: "",
        },
      ],
    }));
  };

  const removeSeminarRow = (index: number) => {
    const updated = [...newFormData.trainingsAttended];
    updated.splice(index, 1);
    setNewFormData((prev) => ({ ...prev, trainingsAttended: updated }));
  };

  const handleLicensureExamChange = (
    index: number,
    field: keyof LicensureExam,
    value: string
  ) => {
    const updated = [...newFormData.licensureExamsPassed];
    updated[index] = { ...updated[index], [field]: value };
    setNewFormData((prev) => ({ ...prev, licensureExamsPassed: updated }));
  };

  const addLicensureExamRow = () => {
    setNewFormData((prev) => ({
      ...prev,
      licensureExamsPassed: [
        ...prev.licensureExamsPassed,
        {
          title: "",
          date: "",
          rating: "",
          remarks: "",
          examVenue: "",
        },
      ],
    }));
  };

  const removeLicensureExamRow = (index: number) => {
    const updated = [...newFormData.licensureExamsPassed];
    updated.splice(index, 1);
    setNewFormData((prev) => ({ ...prev, licensureExamsPassed: updated }));
  };

  const handleCompetencyAssessmentChange = (
    index: number,
    field: keyof CompetencyAssessment,
    value: string
  ) => {
    const updated = [...newFormData.competencyAssessmentsPassed];
    updated[index] = { ...updated[index], [field]: value };
    setNewFormData((prev) => ({
      ...prev,
      competencyAssessmentsPassed: updated,
    }));
  };

  const addCompetencyAssessmentRow = () => {
    setNewFormData((prev) => ({
      ...prev,
      competencyAssessmentsPassed: [
        ...prev.competencyAssessmentsPassed,
        {
          qualificationTitle: "",
          level: "",
          industrySector: "",
          certNumber: "",
          dateIssued: "",
          expiryDate: "",
        },
      ],
    }));
  };

  const removeCompetencyAssessmentRow = (index: number) => {
    const updated = [...newFormData.competencyAssessmentsPassed];
    updated.splice(index, 1);
    setNewFormData((prev) => ({
      ...prev,
      competencyAssessmentsPassed: updated,
    }));
  };

  // const renderImagePreview = (imageData: string | null, altText: string) => {
  //   if (!imageData) return null;

  //   return (
  //     <div className="mb-2">
  //       <small className="text-muted">Current image:</small>
  //       <br />
  //       <img
  //         src={imageData}
  //         alt={altText}
  //         style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover" }}
  //         className="border rounded"
  //       />
  //     </div>
  //   );
  // };

  useEffect(() => {
    if (application) {
      console.log("Populating form with application data:", application);

      // const formatDateForInput = (dateValue: string | Date | undefined) => {
      //   if (!dateValue) return "";
      //   const date = new Date(dateValue);
      //   return date.toISOString().slice(0, 10);
      // };

      setNewFormData({
        idPicture: application.idPicture || "",
        applicantSignature: application.applicantSignature || "",
        referenceNumber: application.referenceNumber || "",
        uliNumber: application.uliNumber || generateId(),
        nameOfSchool: application.nameOfSchool || "",
        lastName: application.lastName || "",
        firstName: application.firstName || "",
        middleName: application.middleName || "",
        middleInitial: application.middleInitial || "",
        extensionName: application.extensionName || "",
        addressOfSchool: application.addressOfSchool || "",
        dateOfApplication: application.dateOfApplication
          ? new Date(application.dateOfApplication)
          : new Date(),
        dateOfBirth: application.dateOfBirth
          ? new Date(application.dateOfBirth)
          : new Date(),
        age: application.age || 0,
        sex: application.sex || "",
        civilStatus: application.civilStatus || [],
        motherName: application.motherName || "",
        fatherName: application.fatherName || "",
        contactInfo: {
          mobile: application.contactInfo?.mobile || "",
          telephone: application.contactInfo?.telephone || "",
          email: application.contactInfo?.email || "",
          fax: application.contactInfo?.fax || "",
          others: application.contactInfo?.others || "",
        },
        birthPlace: {
          city: application.birthPlace?.city || "",
          province: application.birthPlace?.province || "",
          region: application.birthPlace?.region || "",
        },
        address: {
          street: application.address?.street || "",
          barangay: application.address?.barangay || "",
          district: application.address?.district || "",
          city: application.address?.city || "",
          province: application.address?.province || "",
          region: application.address?.region || "",
          zipCode: application.address?.zipCode || "",
        },
        education: {
          highestEducationalAttainment:
            application.education?.highestEducationalAttainment || "",
        },
        employmentStatus: application.employmentStatus || [],
        trainingCenter: application.trainingCenter || "",
        titleOfAssessment: application.titleOfAssessment || "",
        clientType: application.clientType || "",
        assessmentSchedule: application.assessmentSchedule
          ? new Date(application.assessmentSchedule)
          : new Date(),
        remarks: application.remarks || "",
        requirements: {
          pictures: application.requirements?.pictures || false,
          selfAssessment: application.requirements?.selfAssessment || false,
          others: application.requirements?.others || "",
        },
        workExperience: application.workExperience || [],
        trainingsAttended: application.trainingsAttended || [],
        licensureExamsPassed: application.licensureExamsPassed || [],
        competencyAssessmentsPassed:
          application.competencyAssessmentsPassed || [],
        pictures: application.pictures || [],
        submittedBy: application.submittedBy || "",
        signature: application.signature || "",
      });
    }
  }, [application]);

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "1200px", width: "100%" }}
      >
        <Form onSubmit={handleAddApplicationForm}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <>
            <div className="label d-flex justify-content-center align-items-center">
              <h5>APPLICATION FORM</h5>
            </div>
            <Row>
              <Form.Group controlId="formFileMultiple" className="mb-3">
                <Form.Label>ID Picture</Form.Label>
                <Form.Control
                  type="file"
                  name="idPicture"
                  accept="image/*"
                  onChange={handleApplicationInputChange}
                />
              </Form.Group>

              <Accordion alwaysOpen>
                <AccordionItemComponent
                  eventKey="0"
                  header="T2MIS Auto Generated"
                  children={
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>ReferenceNumber</Form.Label>
                          <Form.Control
                            type="text"
                            name="referenceNumber"
                            value={newFormData.referenceNumber}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Unique Learner Identifier (ULI)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="uliNumber"
                            value={newFormData.uliNumber}
                            onChange={handleApplicationInputChange}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group
                          controlId="formFileMultiple"
                          className="mb-3"
                        >
                          <Form.Label>Date of Application</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfApplication"
                            onChange={handleApplicationInputChange}
                            value={
                              newFormData.dateOfApplication instanceof Date
                                ? newFormData.dateOfApplication
                                    .toISOString()
                                    .slice(0, 10)
                                : newFormData.dateOfApplication
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                />

                <Col>
                  <Form.Group controlId="formFileMultiple" className="mb-3">
                    <Form.Label>Applicant Signature</Form.Label>
                    <Form.Control
                      type="file"
                      name="applicantSignature"
                      accept="image/*"
                      onChange={handleApplicationInputChange}
                    />
                  </Form.Group>
                </Col>

                <AccordionItemComponent
                  eventKey="1"
                  header="Assessments"
                  children={
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Name of School/Training Center/Company:
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="nameOfSchool"
                            value={newFormData.nameOfSchool}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Address of School:</Form.Label>
                          <Form.Control
                            type="text"
                            name="addressOfSchool"
                            value={newFormData.addressOfSchool}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {" "}
                            Title of Assessment Applied for:
                          </Form.Label>
                          <Form.Select
                            name="titleOfAssessment"
                            value={newFormData.titleOfAssessment}
                            onChange={handleApplicationInputChange}
                          >
                            <option value="">Select Title</option>
                            {titleOfAssessmenOption.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>1. Client Type</h6>
                          </Form.Label>
                          <Form.Select
                            name="clientType"
                            value={newFormData.clientType}
                            onChange={handleApplicationInputChange}
                          >
                            <option value="">Select Client</option>
                            {clientTypeOption.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                />

                <AccordionItemComponent
                  eventKey="2"
                  header="Profile"
                  children={
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Surname</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={newFormData.lastName}
                            onChange={handleApplicationInputChange}
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
                            onChange={handleApplicationInputChange}
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
                            onChange={handleApplicationInputChange}
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
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Middle Initial</Form.Label>
                          <Form.Control
                            type="text"
                            name="middleInitial"
                            value={newFormData.middleInitial}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Birth Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={
                              newFormData.dateOfBirth instanceof Date
                                ? newFormData.dateOfBirth
                                    .toISOString()
                                    .slice(0, 10)
                                : newFormData.dateOfBirth
                            }
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>age</h6>
                          </Form.Label>
                          <Form.Control
                            name="age"
                            value={newFormData.age}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>2.3 Mother's Name</h6>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="motherName"
                            value={newFormData.motherName}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>2.3 Father's Name</h6>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="fatherName"
                            value={newFormData.fatherName}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sex</Form.Label>
                          <Form.Select
                            name="sex"
                            value={newFormData.sex}
                            onChange={handleApplicationInputChange}
                          >
                            <option value="">3.1 Select Sex --</option>
                            {sexOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Civil Status</Form.Label>
                          <Form.Select
                            name="civilStatus"
                            value={newFormData.civilStatus}
                            onChange={handleApplicationInputChange}
                          >
                            <option value="">3.2 Select Civil Status --</option>
                            {civilStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <div className="label">
                        <h6>2.7 Contact Number(s)s</h6>
                      </div>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tel: </Form.Label>
                          <Form.Control
                            type="text"
                            name="contactInfo.telephone"
                            value={newFormData.contactInfo.telephone}
                            onChange={(e) =>
                              setNewFormData((prev) => ({
                                ...prev,
                                contactInfo: {
                                  ...prev.contactInfo,
                                  telephone: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Moblie: </Form.Label>
                          <Form.Control
                            type="text"
                            name="contactInfo.mobile"
                            value={newFormData.contactInfo.mobile}
                            onChange={(e) =>
                              setNewFormData((prev) => ({
                                ...prev,
                                contactInfo: {
                                  ...prev.contactInfo,
                                  mobile: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email: </Form.Label>
                          <Form.Control
                            type="text"
                            name="contactInfo.email"
                            value={newFormData.contactInfo.email}
                            onChange={(e) =>
                              setNewFormData((prev) => ({
                                ...prev,
                                contactInfo: {
                                  ...prev.contactInfo,
                                  email: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fax: </Form.Label>
                          <Form.Control
                            type="text"
                            name="contactInfo.fax"
                            value={newFormData.contactInfo.fax}
                            onChange={(e) =>
                              setNewFormData((prev) => ({
                                ...prev,
                                contactInfo: {
                                  ...prev.contactInfo,
                                  fax: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Others: </Form.Label>
                          <Form.Control
                            type="text"
                            name="contactInfo.others"
                            value={newFormData.contactInfo.others}
                            onChange={(e) =>
                              setNewFormData((prev) => ({
                                ...prev,
                                contactInfo: {
                                  ...prev.contactInfo,
                                  others: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                />

                <AccordionItemComponent
                  eventKey="3"
                  header="Complete Permanent Mailing Address"
                  children={
                    <Row>
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
                      {/* <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Region</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.region"
                          value={newFormData.address.region}
                          onChange={(e) =>
                          setNewFormData(prev => ({
                ...prev,
                address: { ...prev.address, region : e.target.value },
              }))
            }
                        />
                      </Form.Group>
                    </Col> */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>ZipCode</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.zipCode"
                            value={newFormData.address.zipCode}
                            onChange={(e) =>
                              setNewFormData((prev) => ({
                                ...prev,
                                address: {
                                  ...prev.address,
                                  zipCode: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                />

                <AccordionItemComponent
                  eventKey="4"
                  header="Status"
                  children={
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>Training Center</h6>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="trainingCenter"
                            value={newFormData.trainingCenter}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            2.8 Highest Educational Attainment
                          </Form.Label>
                          <Form.Select
                            name="education.highestEducationalAttainment"
                            value={
                              newFormData.education.highestEducationalAttainment
                            }
                            onChange={handleApplicationInputChange}
                          >
                            <option value="">Select</option>
                            {educationalAttainmentOption.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>2.9 Employment Status</Form.Label>
                          <Form.Select
                            name="employmentStatus."
                            value={newFormData.employmentStatus}
                            onChange={handleApplicationInputChange}
                          >
                            <option value="">Select</option>
                            {employmentStatusOption.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                />

                <AccordionItemComponent
                  eventKey="5"
                  header="Birthplace"
                  children={
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>Municipality/City</h6>
                          </Form.Label>
                          <Form.Control
                            name="birthPlace.city"
                            value={newFormData.birthPlace.city}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>Province</h6>
                          </Form.Label>
                          <Form.Control
                            name="birthPlace.province"
                            value={newFormData.birthPlace.province}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <h6>Region</h6>
                          </Form.Label>
                          <Form.Control
                            name="birthPlace.region"
                            value={newFormData.birthPlace.region}
                            onChange={handleApplicationInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                />

                <AccordionItemComponent
                  eventKey="6"
                  header="Experience"
                  children={
                    <Row>
                      <Form.Group className="mb-3">
                        <h5>Work Experience</h5>
                        <Table bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Company Name</th>
                              <th>Position</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Monthly Salary</th>
                              <th>Status</th>
                              <th>Years of Experience</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newFormData.workExperience.map((exp, index) => (
                              <tr key={index}>
                                <td>
                                  <Form.Control
                                    type="text"
                                    value={exp.companyName}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "companyName",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    value={exp.position}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "position",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="date"
                                    value={exp.startDate}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="date"
                                    value={exp.endDate}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    value={exp.monthlySalary}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "monthlySalary",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    value={exp.status}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "status",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    min={0}
                                    value={exp.yearsOfExperience}
                                    onChange={(e) =>
                                      handleWorkExperienceChange(
                                        index,
                                        "yearsOfExperience",
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Button
                                    variant="danger"
                                    onClick={() =>
                                      removeWorkExperienceRow(index)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Button
                          variant="primary"
                          onClick={addWorkExperienceRow}
                        >
                          Add Work Experience
                        </Button>
                      </Form.Group>
                      <Form.Group>
                        <h5>Seminars / Trainings Attended</h5>
                        <Table bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Venue</th>
                              <th>Hours</th>
                              <th>Conducted By</th>
                              <th>Inclusive Dates</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newFormData.trainingsAttended.map(
                              (seminar, index) => (
                                <tr key={index}>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={seminar.title}
                                      onChange={(e) =>
                                        handleSeminarChange(
                                          index,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={seminar.venue}
                                      onChange={(e) =>
                                        handleSeminarChange(
                                          index,
                                          "venue",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      min={0}
                                      value={seminar.hours}
                                      onChange={(e) =>
                                        handleSeminarChange(
                                          index,
                                          "hours",
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={seminar.conductedBy}
                                      onChange={(e) =>
                                        handleSeminarChange(
                                          index,
                                          "conductedBy",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="date"
                                      value={seminar.inclusiveDates}
                                      onChange={(e) =>
                                        handleSeminarChange(
                                          index,
                                          "inclusiveDates",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="danger"
                                      onClick={() => removeSeminarRow(index)}
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                        <Button variant="primary" onClick={addSeminarRow}>
                          Add Seminar/Training
                        </Button>
                      </Form.Group>
                      <Form.Group>
                        <h5>Licensure Exam</h5>
                        <Table bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Date</th>
                              <th>Rating</th>
                              <th>Remarks</th>
                              <th>Exam Venue</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newFormData.licensureExamsPassed.map(
                              (exam, index) => (
                                <tr key={index}>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={exam.title}
                                      onChange={(e) =>
                                        handleLicensureExamChange(
                                          index,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="date"
                                      value={exam.date}
                                      onChange={(e) =>
                                        handleLicensureExamChange(
                                          index,
                                          "date",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={exam.rating}
                                      onChange={(e) =>
                                        handleLicensureExamChange(
                                          index,
                                          "rating",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={exam.remarks}
                                      onChange={(e) =>
                                        handleLicensureExamChange(
                                          index,
                                          "remarks",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={exam.examVenue}
                                      onChange={(e) =>
                                        handleLicensureExamChange(
                                          index,
                                          "examVenue",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="danger"
                                      onClick={() =>
                                        removeLicensureExamRow(index)
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                        <Button variant="primary" onClick={addLicensureExamRow}>
                          Add Licensure Exam
                        </Button>
                      </Form.Group>
                      <Form.Group>
                        <h5>Competency Assessment</h5>
                        <Table bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Qualification Title</th>
                              <th>Level</th>
                              <th>Industry Sector</th>
                              <th>Certificate Number</th>
                              <th>Date Issued</th>
                              <th>Expiry Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newFormData.competencyAssessmentsPassed.map(
                              (assessment, index) => (
                                <tr key={index}>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={assessment.qualificationTitle}
                                      onChange={(e) =>
                                        handleCompetencyAssessmentChange(
                                          index,
                                          "qualificationTitle",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={assessment.level}
                                      onChange={(e) =>
                                        handleCompetencyAssessmentChange(
                                          index,
                                          "level",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={assessment.industrySector}
                                      onChange={(e) =>
                                        handleCompetencyAssessmentChange(
                                          index,
                                          "industrySector",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      value={assessment.certNumber}
                                      onChange={(e) =>
                                        handleCompetencyAssessmentChange(
                                          index,
                                          "certNumber",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="date"
                                      value={assessment.dateIssued}
                                      onChange={(e) =>
                                        handleCompetencyAssessmentChange(
                                          index,
                                          "dateIssued",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="date"
                                      value={assessment.expiryDate}
                                      onChange={(e) =>
                                        handleCompetencyAssessmentChange(
                                          index,
                                          "expiryDate",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="danger"
                                      onClick={() =>
                                        removeCompetencyAssessmentRow(index)
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                        <Button
                          variant="primary"
                          onClick={addCompetencyAssessmentRow}
                        >
                          Add Competency Assessment
                        </Button>
                      </Form.Group>
                    </Row>
                  }
                />
              </Accordion>
            </Row>
            <Button type="submit" variant="primary">
              {application ? "Update Application" : "Submit Application"}
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
        </Form>
      </div>
    </div>
  );
};
