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
    if (newCertificate.userId == userProfile._id || !newCertificate._id) {
      setNewCertificate((prev) => ({
        ...prev,
        firstName: userProfile.firstName,
        middleName: userProfile.middleName,
        lastName: userProfile.lastName,
      }));
    }
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
                  fontSize: "20px",
                  backgroundImage: "url(" + certificateImg + ")",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100%",
                  width: "1000px",
                  height: "707px",
                }}
              >
                <Row
                  style={{
                    height: "430px",
                    fontSize: "20px",
                    width: "90%",
                    margin: "auto",
                    textAlign: "center",
                    paddingTop: "320px",
                  }}
                >
                  <Col
                    style={{
                      fontSize: "80px",
                      fontWeight: "bold",
                      fontFamily: `'Imperial Script'`,
                      letterSpacing: "2px",
                      color: "#cfaa51",
                    }}
                  >
                    {newCertificate.firstName} &nbsp;
                    {newCertificate.middleName?.substring(0, 1)}
                    {newCertificate.middleName && ". "}
                    {newCertificate.lastName}
                  </Col>
                </Row>
                <Row
                  style={{
                    height: "115px",
                    fontSize: "20px",
                    width: "90%",
                    margin: "auto",
                    textAlign: "center",
                    letterSpacing: "1px",
                  }}
                >
                  <Col>
                    Has satisfactory completed through attendance and
                    participation
                    <br />
                    of {newCertificate.courseTitle} Course
                  </Col>
                </Row>
                <Row
                  style={{
                    height: "20px",
                    fontWeight: "bold",
                    fontSize: "20px",
                    width: "90%",
                    margin: "auto",
                  }}
                >
                  <Col xs="6">HON. MYLA B. CLARETE</Col>
                  <Col xs="5">JOHN PAUL L. MARTINEZ EN.P</Col>
                </Row>
                <Row
                  style={{
                    height: "20px",
                    fontSize: "16px",
                    width: "90%",
                    margin: "auto",
                  }}
                >
                  <Col xs="6">ACTING MUNICIPAL MAYOR</Col>
                  <Col xs="6">OIC - CTSDO</Col>
                </Row>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
