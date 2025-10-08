import React, { useState, useRef } from "react";
import {
  Card,
  Button,
  Badge,
  Row,
  Col,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaDownload,
  FaEdit,
  FaEye,
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGlobe,
  FaLink,
} from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Portfolio, SocialLink } from "../types/common.types";
import { FormatDate } from "../lib/formatter";
import "./Portfolio.css";
import ResumeComponent from "./ResumeComponent";

interface PortfolioComponentProps {
  portfolio: Portfolio;
  isOwner: boolean;
  onUpdate?: (updatedData: any) => Promise<void>;
}

export const PortfolioComponent: React.FC<PortfolioComponentProps> = ({
  portfolio,
  isOwner,
  onUpdate,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [editData, setEditData] = useState({
    contactNumber: portfolio.profile.contactNumber || "",
    address: portfolio.profile.address || "",
    bio: portfolio.profile.bio || "",
    highlightedSkills: portfolio.profile.highlightedSkills || [],
    socialLinks: portfolio.profile.socialLinks || [],
    profilePicture: portfolio.profile.profilePicture || "",
    education: portfolio.profile.education || [],
    experience: portfolio.profile.experience || [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newSocialLink, setNewSocialLink] = useState<SocialLink>({
    platform: "linkedin",
    url: "",
  });
  const [newEducation, setNewEducation] = useState({
    school: "",
    degree: "",
    year: "",
  });
  const [newExperience, setNewExperience] = useState({
    company: "",
    period: "",
    description: "",
  });
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const portfolioRef = useRef<HTMLDivElement>(null);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <FaLinkedin className="text-primary" />;
      case "github":
        return <FaGithub className="text-dark" />;
      case "facebook":
        return <FaFacebook className="text-primary" />;
      case "twitter":
        return <FaTwitter className="text-info" />;
      case "instagram":
        return <FaInstagram className="text-danger" />;
      case "website":
        return <FaGlobe className="text-success" />;
      default:
        return <FaLink className="text-secondary" />;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setUpdateError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData((prev) => ({
          ...prev,
          profilePicture: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && editData.highlightedSkills.length < 20) {
      setEditData((prev) => ({
        ...prev,
        highlightedSkills: [...prev.highlightedSkills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      highlightedSkills: prev.highlightedSkills.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    if (newEducation.school.trim() && newEducation.degree.trim() && newEducation.year.trim()) {
      setEditData((prev) => ({
        ...prev,
        education: [...prev.education, newEducation],
      }));
      setNewEducation({ school: "", degree: "", year: "" });
    }
  };

  const removeEducation = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    if (newExperience.company.trim() && newExperience.period.trim() && newExperience.description.trim()) {
      setEditData((prev) => ({
        ...prev,
        experience: [...prev.experience, newExperience],
      }));
      setNewExperience({ company: "", period: "", description: "" });
    }
  };

  const removeExperience = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addSocialLink = () => {
    if (newSocialLink.url.trim()) {
      setEditData((prev) => ({
        ...prev,
        socialLinks: [...prev.socialLinks, newSocialLink],
      }));
      setNewSocialLink({ platform: "linkedin", url: "" });
    }
  };

  const removeSocialLink = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsUpdating(true);
    setUpdateError("");

    try {
      await onUpdate(editData);
      setShowEditModal(false);
    } catch (error: any) {
      setUpdateError(error.message || "Failed to update portfolio");
    } finally {
      setIsUpdating(false);
    }
  };

  const generatePDF = async () => {
    if (!portfolioRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Create a clone of the portfolio element for PDF generation
      const element = portfolioRef.current.cloneNode(true) as HTMLElement;

      // Hide edit buttons in the cloned element
      const editButtons = element.querySelectorAll(".edit-only");
      editButtons.forEach((btn) => btn.remove());

      // Temporarily append to body for rendering
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.background = "white";
      element.style.padding = "20px";
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Remove the temporary element
      document.body.removeChild(element);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text("Generated by CTSDO Online Management System", 105, 290, {
          align: "center",
        });
      }

      const fileName = `${portfolio.profile.firstName}_${portfolio.profile.lastName}_Portfolio.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div ref={portfolioRef} className="portfolio-container">
        {/* Header Section */}
        <div>
          <Row>
              {isOwner && (
                <div className="edit-only" style={{ textAlign: "right", marginBottom: 10 }}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    className="me-2"
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <FaDownload />
                    )}{" "}
                    Download PDF
                  </Button>
                </div>
              )}
            </Row>
            <Row>
              {/* <Col md={3} className="text-center">
                <div className="profile-picture-container mb-3">
                  {portfolio.profile.profilePicture ? (
                    <img
                      src={portfolio.profile.profilePicture}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{
                        width: "150px",
                        height: "150px",
                        margin: "0 auto",
                      }}
                    >
                      <span className="text-muted fs-1">
                        {portfolio.profile.firstName.charAt(0)}
                        {portfolio.profile.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </Col> */}
              <Col md={9}>
                {/* <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="mb-1">
                      {portfolio.profile.firstName}{" "}
                      {portfolio.profile.middleName}{" "}
                      {portfolio.profile.lastName}
                    </h2>
                    <p className="text-muted mb-2">Student Portfolio</p>
                  </div>
                  {isOwner && (
                    <div className="edit-only">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowEditModal(true)}
                        className="me-2"
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={generatePDF}
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FaDownload />
                        )}{" "}
                        Download PDF
                      </Button>
                    </div>
                  )}
                </div>

                {portfolio.profile.bio && (
                  <p className="mb-3">{portfolio.profile.bio}</p>
                )} */}

                {/* Social Links */}
                {/* {portfolio.profile.socialLinks &&
                  portfolio.profile.socialLinks.length > 0 && (
                    <div className="mb-3">
                      <h6>Connect with me:</h6>
                      <div className="d-flex gap-3">
                        {portfolio.profile.socialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {getSocialIcon(link.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )} */}

                {/* Skills */}
                {/* {portfolio.profile.highlightedSkills &&
                  portfolio.profile.highlightedSkills.length > 0 && (
                    <div>
                      <h6>Skills:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {portfolio.profile.highlightedSkills.map(
                          (skill, index) => (
                            <Badge
                              key={index}
                              bg="primary"
                              className="px-3 py-2"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )} */}
              </Col>
            </Row>
              <ResumeComponent 
                data={{
                  name: portfolio.profile?.firstName + ' ' + portfolio.profile?.lastName || 'John Doe',
                  photoUrl: portfolio.profile?.profilePicture || '/logo.png',
                  contact: {
                  email: portfolio.profile?.email,
                  phone: portfolio.profile?.contactNumber,
                  address: portfolio.profile?.address,
                  },
                  education: portfolio.profile?.education,
                  experience: portfolio.profile?.experience,
                  skills: portfolio.profile?.highlightedSkills?.map((skill: any) => ({
                  name: skill,
                  level: 10
                  })) || [],
                  socialLinks: portfolio.profile?.socialLinks?.map((link: any) => ({
                    platform: link.platform,
                    url: link.url
                  })) || [],
                  profileSummary: portfolio.profile?.bio || 'Experienced developer with a passion for building web applications.'
                }} 
                />
        </div>
            

        {/* Statistics */}
        {/* <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h3 className="text-primary">
                  {portfolio.stats.totalCompletedCourses}
                </h3>
                <p className="mb-0">Completed Courses</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h3 className="text-success">
                  {portfolio.stats.certificatesEarned}
                </h3>
                <p className="mb-0">Certificates Earned</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h3 className="text-info">{portfolio.stats.skillsCount}</h3>
                <p className="mb-0">Skills</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-warning">
              <Card.Body>
                <h3 className="text-warning">
                  {portfolio.stats.socialLinksCount}
                </h3>
                <p className="mb-0">Social Links</p>
              </Card.Body>
            </Card>
          </Col>
        </Row> */}

        {/* Completed Courses */}
        {/* <Card className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Completed Courses</h5>
          </Card.Header>
          <Card.Body>
            {portfolio.completedCourses.length === 0 ? (
              <Alert variant="info">No completed courses yet.</Alert>
            ) : (
              <Row>
                {portfolio.completedCourses.map((course, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <Card className="h-100 border-left-primary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1">{course.courseTitle}</h6>
                          {course.certificate && (
                            <Badge bg="success">Certified</Badge>
                          )}
                        </div>

                        {course.courseDescription && (
                          <p className="text-muted small mb-2">
                            {course.courseDescription}
                          </p>
                        )}

                        <div className="course-details">
                          {course.instructor && (
                            <small className="text-muted d-block">
                              <strong>Instructor:</strong> {course.instructor}
                            </small>
                          )}
                          <small className="text-muted d-block">
                            <strong>Completed:</strong>{" "}
                            {FormatDate(course.completionDate)}
                          </small>
                          {course.duration && (
                            <small className="text-muted d-block">
                              <strong>Duration:</strong> {course.duration} days
                            </small>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card> */}
      </div>

      {/* Edit Modal */}
      <Modal
        className="portfolio-modal"
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Portfolio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError && <Alert variant="danger">{updateError}</Alert>}

          <Form>
            {/* Profile Picture */}
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {editData.profilePicture && (
                <div className="mt-2">
                  <img
                    src={editData.profilePicture}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                    className="rounded"
                  />
                </div>
              )}
            </Form.Group>

            {/* Contact */}
            <Form.Group className="mb-3">
              <Form.Label>Contact Number:</Form.Label>
              <Form.Control
                type="text"
                value={editData.contactNumber}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, contactNumber: e.target.value }))
                }
                maxLength={15}
                placeholder="Enter your contact number"
              />
              <Form.Text className="text-muted">
                {editData.contactNumber?.length}/15 characters
              </Form.Text>
            </Form.Group>

            {/* Address */}
            <Form.Group className="mb-3">
              <Form.Label>Address:</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editData.address}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, address: e.target.value }))
                }
                maxLength={1000}
                placeholder="Address"
              />
              <Form.Text className="text-muted">
                {editData.address?.length}/1000 characters
              </Form.Text>
            </Form.Group>

            {/* Bio */}
            <Form.Group className="mb-3">
              <Form.Label>Bio:</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editData.bio}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, bio: e.target.value }))
                }
                maxLength={1000}
                placeholder="Tell us about yourself..."
              />
              <Form.Text className="text-muted">
                {editData.bio.length}/1000 characters
              </Form.Text>
            </Form.Group>

            {/* Social Links */}
            <Form.Group className="mb-3">
              <Form.Label>Social Links:</Form.Label>
              <div className="d-flex mb-2">
                <Form.Select
                  value={newSocialLink.platform}
                  onChange={(e) =>
                    setNewSocialLink((prev) => ({
                      ...prev,
                      platform: e.target.value as SocialLink["platform"],
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "150px" }}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Control
                  type="url"
                  value={newSocialLink.url}
                  onChange={(e) =>
                    setNewSocialLink((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
                <Button
                  variant="outline-primary"
                  onClick={addSocialLink}
                  disabled={!newSocialLink.url.trim()}
                  className="ms-2"
                >
                  Add
                </Button>
              </div>
              <div className="d-flex flex-column gap-2">
                {editData.socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 border rounded"
                  >
                    <div className="d-flex align-items-center">
                      {getSocialIcon(link.platform)}
                      <span className="ms-2 text-capitalize">
                        {link.platform}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2 text-muted small"
                      >
                        {link.url}
                      </a>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeSocialLink(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Skills */}
            <Form.Group className="mb-3">
              <Form.Label>Skills:</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  maxLength={50}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                />
                <Button
                  variant="outline-primary"
                  onClick={addSkill}
                  disabled={
                    !newSkill.trim() || editData.highlightedSkills.length >= 20
                  }
                  className="ms-2"
                >
                  Add
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {editData.highlightedSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    bg="primary"
                    className="px-3 py-2 d-flex align-items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.7em" }}
                      onClick={() => removeSkill(index)}
                    ></button>
                  </Badge>
                ))}
              </div>
              <Form.Text className="text-muted">
                {editData.highlightedSkills.length}/20 skills
              </Form.Text>
            </Form.Group>

            {/* Education */}
            <Form.Group className="mb-3">
              <Form.Label>Education:</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={newEducation.school}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      school: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "250px" }}
                  placeholder="School Name"
                />
                <Form.Control
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      degree: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "300px" }}
                  placeholder="Degree"
                />
                <Form.Control
                  type="text"
                  value={newEducation.year}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      year: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "150px" }}
                  placeholder="Year"
                />
                <Button
                  variant="outline-primary"
                  onClick={addEducation}
                  disabled={
                    !newEducation.school.trim() ||
                    !newEducation.degree.trim() ||
                    !newEducation.year.trim()
                  }
                  className="ms-2"
                >
                  Add
                </Button>
              </div>
              <div className="d-flex flex-column gap-2">
                {editData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 border rounded"
                  >
                    <div className="d-flex align-items-center">
                      <span className="mx-2">
                        {edu.school}
                      </span>
                      <span className="mx-2">
                        {edu.degree}
                      </span>
                      <span className="mx-2">
                        {edu.year}
                      </span>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Education */}
            <Form.Group className="mb-3">
              <Form.Label>Education:</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={newEducation.school}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      school: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "250px" }}
                  placeholder="School Name"
                />
                <Form.Control
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      degree: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "300px" }}
                  placeholder="Degree"
                />
                <Form.Control
                  type="text"
                  value={newEducation.year}
                  onChange={(e) =>
                    setNewEducation((prev) => ({
                      ...prev,
                      year: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "150px" }}
                  placeholder="Year (e.g. 2021-2023)"
                />
                <Button
                  variant="outline-primary"
                  onClick={addEducation}
                  disabled={
                    !newEducation.school.trim() ||
                    !newEducation.degree.trim() ||
                    !newEducation.year.trim()
                  }
                  className="ms-2"
                >
                  Add
                </Button>
              </div>
              <div className="d-flex flex-column gap-2">
                {editData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 border rounded"
                  >
                    <div className="d-flex align-items-center">
                      <span className="mx-2">
                        {edu.school}
                      </span>
                      <span className="mx-2">
                        {edu.degree}
                      </span>
                      <span className="mx-2">
                        {edu.year}
                      </span>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            

            {/* Experience */}
            <Form.Group className="mb-3">
              <Form.Label>Experience:</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "250px" }}
                  placeholder="Company Name"
                />
                <Form.Control
                  type="text"
                  value={newExperience.period}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      period: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "200px" }}
                  placeholder="Period (e.g. 2021-2023)"
                />
                <Form.Control
                  type="text"
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="me-2"
                  style={{ maxWidth: "300px" }}
                  placeholder="Description"
                />
                <Button
                  variant="outline-primary"
                  onClick={addExperience}
                  disabled={
                    !newExperience.company.trim() ||
                    !newExperience.period.trim() ||
                    !newExperience.description.trim()
                  }
                  className="ms-2"
                >
                  Add
                </Button>
              </div>
              <div className="d-flex flex-column gap-2">
                {editData.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 border rounded"
                  >
                    <div className="d-flex align-items-center">
                      <span className="mx-2">
                        {exp.company}
                      </span>
                      <span className="mx-2">
                        {exp.period}
                      </span>
                      <span className="mx-2">
                        {exp.description}
                      </span>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};