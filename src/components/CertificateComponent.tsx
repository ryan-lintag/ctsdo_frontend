import { getReq } from "../lib/axios";
import { useUserStore } from "../store/useUserStore";
import type { Certificate, CompletedCourse } from "../types/common.types";
import { useEffect, useRef, useState } from "react";
import certificateImg from "../assets/images/certificate.png";
import html2canvas from "html2canvas";
import { Col, Row } from "react-bootstrap";

interface CountCardProps {
  certificate: Certificate;
  submitCallback: (item: Certificate) => void;
  cancelCallback: () => void;
}

interface CertificateDesign {
  backgroundImage?: string;
  containerWidth?: string;
  containerHeight?: string;
  logo1?: string;
  logo2?: string;
  logo3?: string;
  certificateTitle?: string;
  certificateSubtitle?: string;
  presentedToText?: string;
  titleFontSize?: string;
  titleFontFamily?: string;
  titleColor?: string;
  titleFontWeight?: string;
  subtitleFontSize?: string;
  subtitleFontFamily?: string;
  subtitleColor?: string;
  presentedToFontSize?: string;
  presentedToFontFamily?: string;
  presentedToColor?: string;
  nameFontSize?: string;
  nameFontFamily?: string;
  nameColor?: string;
  nameLetterSpacing?: string;
  nameFontWeight?: string;
  namePaddingTop?: string;
  textBlockFontFamily?: string;
  textBlockFontSize?: string;
  textBlockColor?: string;
  textBlockLetterSpacing?: string;
  signatureNameFontSize?: string;
  signatureTitleFontSize?: string;
  signatureNameFontWeight?: string;
  signatureColor?: string;
  leftSignatureName?: string;
  leftSignatureTitle?: string;
  rightSignatureName?: string;
  rightSignatureTitle?: string;
}

export const CertificateComponent: React.FC<CountCardProps> = ({
  certificate,
  submitCallback,
  cancelCallback,
}) => {
  const userProfile = useUserStore((state) => state.userProfile);
  const [courses, setCourses] = useState<CompletedCourse[]>([]);
  const [newCertificate, setNewCertificate] =
    useState<Certificate>(certificate);
  const [isLoading, setIsLoading] = useState(false);
  const [certificateDesign, setCertificateDesign] = useState<CertificateDesign>({
    backgroundImage: "img/certificate.png",
    containerWidth: "1000px",
    containerHeight: "707px",
    nameFontSize: "80px",
    nameFontFamily: "'Imperial Script'",
    nameColor: "#cfaa51",
    nameLetterSpacing: "2px",
    nameFontWeight: "bold",
    namePaddingTop: "320px",
    textBlockFontSize: "20px",
    textBlockColor: "#000000",
    textBlockLetterSpacing: "1px",
    signatureNameFontSize: "20px",
    signatureTitleFontSize: "16px",
    signatureNameFontWeight: "bold",
    signatureColor: "#000000",
    leftSignatureName: "HON. MYLA B. CLARETE",
    leftSignatureTitle: "ACTING MUNICIPAL MAYOR",
    rightSignatureName: "JOHN PAUL L. MARTINEZ EN.P",
    rightSignatureTitle: "OIC - CTSDO"
  });
  const divRef = useRef(null);

  const getCompletedCourses = async () => {
    setIsLoading(true);
    try {
      const courses = await getReq("/api/courses/completed") as any[];
      console.log("Completed courses:", courses);

      if (courses && courses.length > 0) {
        if (!newCertificate.courseId) {
          setNewCertificate((prev) => ({
            ...prev,
            courseId: courses[0].courseId,
            courseTitle: courses[0].courseTitle,
          }));
        }
        setCourses(courses);
      } else {
        setCourses([]); // ✅ No completed courses
      }
    } catch (error) {
      console.error("Error fetching completed courses:", error);
      setCourses([]); // ✅ If error, just clear courses
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCertificateDesign = async () => {
      try {
        const settings = await getReq("/api/homepage-settings") as any;
        if (settings?.certificateDesign) {
          setCertificateDesign((prev) => ({
            ...prev,
            ...settings.certificateDesign
          }));
        }
      } catch (error) {
        console.error("Error fetching certificate design settings:", error);
        // Use defaults if fetch fails
      }
    };

    if (newCertificate.userId == userProfile._id || !newCertificate._id) {
      setNewCertificate((prev) => ({
        ...prev,
        firstName: userProfile.firstName,
        middleName: userProfile.middleName,
        lastName: userProfile.lastName,
      }));
    }
    
    fetchCertificateDesign();
    getCompletedCourses();
  }, []);

  const handleSubmitCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      ...newCertificate,
      userId: userProfile._id,
      status:
        ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
          ?.name === "approve"
          ? "Approved"
          : newCertificate.status,
    };

    if (formData.status != "Approved") submitCallback(formData);
    else generateCertificate(formData);
  };

  const generateCertificate = (formData: Certificate) => {
    // Capture the content of the div as a canvas
    if (divRef.current) {
      html2canvas(divRef.current as HTMLElement)
        .then((canvas) => {
          // Convert the canvas to a Base64 string
          formData.certificate = canvas.toDataURL();
          submitCallback(formData);
        })
        .catch((error) => {
          console.error("Error capturing the div:", error);
        });
    } else {
      console.error("divRef.current is null, cannot generate certificate.");
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let { name, value } = e.target;

    if (e.target instanceof HTMLSelectElement) {
      const courseTitle = e.target.options[e.target.selectedIndex].text;
      setNewCertificate((prev) => ({ ...prev, courseTitle: courseTitle }));
    }

    setNewCertificate((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center mt-5">
        <div
          className="card shadow p-4"
          style={{ maxWidth: "1000px", width: "100%" }}
        >
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "1000px", width: "100%" }}
      >
        <form onSubmit={handleSubmitCertificate}>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              className="form-control"
              name="firstName"
              defaultValue={newCertificate.firstName}
              disabled
            />
          </div>
          <div className="mb-3">
            <label htmlFor="middleName" className="form-label">
              Middle Name
            </label>
            <input
              className="form-control"
              name="middleName"
              defaultValue={newCertificate.middleName}
              disabled
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              className="form-control"
              name="lastName"
              defaultValue={newCertificate.lastName}
              disabled
            />
          </div>
          <div className="mb-3">
            <label htmlFor="courseId" className="form-label">
              Course
            </label>
            <select
              aria-label="form-select"
              name="courseId"
              className="form-select"
              onChange={handleInputChange}
              value={newCertificate.courseId}
            >
              <option value="">Select a course</option>
              {courses &&
                courses.map((c) => (
                  <option value={c.courseId} key={c.courseId}>
                    {c.courseTitle}
                  </option>
                ))}
            </select>
            {courses.length === 0 && (
              <small className="text-muted">
                No courses available. Please contact administrator.
              </small>
            )}
          </div>
          <button
            className="btn btn-primary mr-3"
            type="submit"
            name="save"
            disabled={!newCertificate.courseId}
          >
            {certificate?._id ? "Update" : "Request"} Certificate
          </button>
          {userProfile.role == "admin" && (
            <button
              className="btn btn-success mr-3"
              type="submit"
              name="approve"
              disabled={!newCertificate.courseId}
            >
              Approve
            </button>
          )}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={cancelCallback}
          >
            Cancel
          </button>
        </form>

        <br />
        {userProfile.role == "admin" && newCertificate.courseId && (
          <div>
            <h3>Certificate Preview:</h3>
            <div style={{ width: "100%", height: "800px", overflow: "auto" }}>
              <div
                ref={divRef}
                style={{
                  textAlign: "center",
                  fontSize: certificateDesign.textBlockFontSize || "20px",
                  backgroundImage: `url(${certificateDesign.backgroundImage || certificateImg})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100%",
                  width: certificateDesign.containerWidth || "1000px",
                  height: certificateDesign.containerHeight || "707px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  padding: "20px",
                  boxSizing: "border-box",
                }}
              >
                {/* Logos */}
                <Row
                  style={{
                    width: "30%",
                    textAlign: "center",
                    justifyContent: "space-around",
                    marginTop: "30px",
                    marginBottom: "-30px",
                  }}
                >
                  {certificateDesign.logo1 && (
                    <Col xs="4">
                      <img src={certificateDesign.logo1} alt="Logo 1" style={{ height: "80px", objectFit: "contain" }} />
                    </Col>
                  )}
                  {certificateDesign.logo2 && (
                    <Col xs="4">
                      <img src={certificateDesign.logo2} alt="Logo 2" style={{ height: "80px", objectFit: "contain" }} />
                    </Col>
                  )}
                  {certificateDesign.logo3 && (
                    <Col xs="4">
                      <img src={certificateDesign.logo3} alt="Logo 3" style={{ height: "80px", objectFit: "contain" }} />
                    </Col>
                  )}
                </Row>

                {/* Certificate Title */}
                <Row
                  style={{
                    width: "90%",
                    textAlign: "center",
                    fontSize: "80px",
                    fontWeight: certificateDesign.titleFontWeight || "bold",
                    fontFamily: certificateDesign.titleFontFamily || "'Arial', sans-serif",
                    color: certificateDesign.titleColor || "#000000",
                    marginBottom: "-40px",
                    marginTop: "30px",
                  }}
                >
                  <Col>{certificateDesign.certificateTitle || "CERTIFICATE"}</Col>
                </Row>

                {/* Certificate Subtitle */}
                <Row
                  style={{
                    width: "90%",
                    textAlign: "center",
                    fontSize: certificateDesign.subtitleFontSize || "32px",
                    fontFamily: certificateDesign.subtitleFontFamily || "'Georgia', serif",
                    color: certificateDesign.subtitleColor || "#333333",
                    marginBottom: "-50px",
                  }}
                >
                  <Col>{certificateDesign.certificateSubtitle || "Of Completion"}</Col>
                </Row>

                {/* Presented To Text */}
                <Row
                  style={{
                    width: "90%",
                    textAlign: "center",
                    fontSize:  "30px",
                    fontFamily: certificateDesign.presentedToFontFamily || "'Georgia', serif",
                    color: certificateDesign.presentedToColor || "#333333",
                    marginBottom: "-50px",
                    marginTop: "30px",
                  }}
                >
                  <Col>{certificateDesign.presentedToText || "This certificate is presented to:"}</Col>
                </Row>

                {/* Name */}
                <Row
                  style={{
                    width: "90%",
                    textAlign: "center",
                    fontSize: certificateDesign.nameFontSize || "80px",
                    fontWeight: certificateDesign.nameFontWeight || "bold",
                    fontFamily: certificateDesign.nameFontFamily || "'Imperial Script'",
                    letterSpacing: certificateDesign.nameLetterSpacing || "2px",
                    color: certificateDesign.nameColor || "#cfaa51",
                    marginTop: "25px",
                    marginBottom: "-20px",
                  }}
                >
                  <Col>
                    {newCertificate.firstName} &nbsp;
                    {newCertificate.middleName?.substring(0, 1)}
                    {newCertificate.middleName && ". "}
                    {newCertificate.lastName}
                  </Col>
                </Row>

                {/* Text Block */}
                <Row
                  style={{
                    width: "90%",
                    textAlign: "center",
                    fontSize: certificateDesign.textBlockFontSize || "20px",
                    fontFamily: certificateDesign.textBlockFontFamily || "'Georgia', serif",
                    letterSpacing: certificateDesign.textBlockLetterSpacing || "1px",
                    color: certificateDesign.textBlockColor || "#000000",
                    marginBottom: "10px",
                    lineHeight: "1.6",
                  }}
                >
                  <Col>
                    Has satisfactory completed through attendance and
                    participation
                    <br />
                    of {newCertificate.courseTitle} Course
                  </Col>
                </Row>

                {/* Signatures */}
                <Row
                  style={{
                    width: "90%",
                    margin: "0 auto",
                    textAlign: "center",
                    fontWeight: certificateDesign.signatureNameFontWeight || "bold",
                    fontSize: certificateDesign.signatureNameFontSize || "20px",
                    color: certificateDesign.signatureColor || "#000000",
                    marginBottom: "-25px",
                  }}
                >
                  <Col xs="6">{certificateDesign.leftSignatureName || "HON. MYLA B. CLARETE"}</Col>
                  <Col xs="6">{certificateDesign.rightSignatureName || "JOHN PAUL L. MARTINEZ EN.P"}</Col>
                </Row>

                <Row
                  style={{
                    width: "90%",
                    margin: "0 auto",
                    textAlign: "center",
                    fontSize: certificateDesign.signatureTitleFontSize || "16px",
                    color: certificateDesign.signatureColor || "#000000",
                  }}
                >
                  <Col xs="6">{certificateDesign.leftSignatureTitle || "ACTING MUNICIPAL MAYOR"}</Col>
                  <Col xs="6">{certificateDesign.rightSignatureTitle || "OIC - CTSDO"}</Col>
                </Row>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
