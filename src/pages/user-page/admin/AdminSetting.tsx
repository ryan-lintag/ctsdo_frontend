import { useEffect, useState } from "react";
import { Button, Form, Card, Row, Col, Spinner, Alert, Tabs, Tab } from "react-bootstrap";
import { DashboardComponent } from "../../../components/DashboardComponent";
import { getReq, putReq, postReq } from "../../../lib/axios";

// Available stylish fonts for certificates
const CERTIFICATE_FONTS = [
  { value: "'Imperial Script'", label: "Imperial Script (Elegant)", preview: "Imperial Script" },
  { value: "'Georgia', serif", label: "Georgia (Classic)", preview: "Georgia" },
  { value: "'Garamond', serif", label: "Garamond (Sophisticated)", preview: "Garamond" },
  { value: "'Palatino', serif", label: "Palatino (Formal)", preview: "Palatino" },
  { value: "'Times New Roman', serif", label: "Times New Roman (Traditional)", preview: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New (Typewriter)", preview: "Courier New" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS (Modern)", preview: "Trebuchet MS" },
  { value: "'Verdana', sans-serif", label: "Verdana (Clean)", preview: "Verdana" },
  { value: "'Arial', sans-serif", label: "Arial (Professional)", preview: "Arial" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans MS (Casual)", preview: "Comic Sans MS" },
  { value: "'Brush Script MT', cursive", label: "Brush Script MT (Handwritten)", preview: "Brush Script MT" },
  { value: "'Lucida Handwriting', cursive", label: "Lucida Handwriting (Elegant Script)", preview: "Lucida Handwriting" },
  { value: "'Lucida Console', monospace", label: "Lucida Console (Technical)", preview: "Lucida Console" },
  { value: "'Century Gothic', sans-serif", label: "Century Gothic (Futuristic)", preview: "Century Gothic" },
  { value: "'Copperplate', serif", label: "Copperplate (Engraved)", preview: "Copperplate" },
];

const TEXT_FONTS = [
  { value: "'Georgia', serif", label: "Georgia (Classic)", preview: "Georgia" },
  { value: "'Garamond', serif", label: "Garamond (Sophisticated)", preview: "Garamond" },
  { value: "'Palatino', serif", label: "Palatino (Formal)", preview: "Palatino" },
  { value: "'Times New Roman', serif", label: "Times New Roman (Traditional)", preview: "Times New Roman" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS (Modern)", preview: "Trebuchet MS" },
  { value: "'Verdana', sans-serif", label: "Verdana (Clean)", preview: "Verdana" },
  { value: "'Arial', sans-serif", label: "Arial (Professional)", preview: "Arial" },
  { value: "'Courier New', monospace", label: "Courier New (Typewriter)", preview: "Courier New" },
];

const AdminPageSettings = () => {
  const [settings, setSettings] = useState({
    heroTitle: "",
    heroSubtitle: "",
    aboutTitle: "",
    aboutDescription: "",
    aboutButtonText: "",
    aboutButtonLink: "",
    headerImage: "",
    enrollmentStepsImage: "",
    googleMapEmbed: "",
    certificateDesign: {
      backgroundImage: "img/certificate.png",
      containerWidth: "1000px",
      containerHeight: "707px",
      logo1: "",
      logo2: "",
      logo3: "",
      certificateTitle: "CERTIFICATE",
      certificateSubtitle: "Of Completion",
      presentedToText: "This certificate is presented to:",
      titleFontSize: "60px",
      titleFontFamily: "'Arial', sans-serif",
      titleColor: "#000000",
      titleFontWeight: "bold",
      subtitleFontSize: "32px",
      subtitleFontFamily: "'Georgia', serif",
      subtitleColor: "#333333",
      presentedToFontSize: "18px",
      presentedToFontFamily: "'Georgia', serif",
      presentedToColor: "#333333",
      nameFontSize: "80px",
      nameFontFamily: "'Imperial Script'",
      nameColor: "#cfaa51",
      nameLetterSpacing: "2px",
      nameFontWeight: "bold",
      namePaddingTop: "20px",
      textBlockFontFamily: "'Georgia', serif",
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
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getReq("/api/homepage-settings");
        if (data) setSettings(prevSettings => ({ ...prevSettings, ...(data as any) }));
      } catch (err) {
        console.error("Error fetching settings:", err);
        setErrorMessage("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  field: string
) => {
  if (!e.target.files?.length) return;

  const formData = new FormData();
  formData.append("file", e.target.files[0]);

  try {
    const res = await postReq("/api/homepage-settings/upload", formData, {
      "Content-Type": "multipart/form-data"
    });
    setSettings((prev) => ({ ...prev, [field]: res['base64'] }));
    setSuccessMessage(
      `${field === "headerImage" ? "Header" : "Enrollment Steps"} image uploaded successfully!`
    );
  } catch (error) {
    console.error("File upload failed:", error);
    setErrorMessage("Error uploading file.");
  }
};


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await putReq("/api/homepage-settings", settings);
      setSuccessMessage("Settings updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    console.log('imagePath', imagePath)
    if (!imagePath) return "";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    // If it starts with /uploads, it's an uploaded file
    if (imagePath.startsWith("/uploads/")) {
      return `${API_BASE_URL}${imagePath}`;
    }

    if (imagePath.startsWith("data:image")) {
      return imagePath;
    }
    
    // If it's a default image path (like img/header.jpg)
    if (imagePath.startsWith("img/")) {
      return `${API_BASE_URL}/${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path
    return `${API_BASE_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <DashboardComponent>
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading settings...</p>
        </div>
      </DashboardComponent>
    );
  }

  return (
    <DashboardComponent>
      <Row className="justify-content-center mt-4">
        <Col md={10} lg={8}>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Settings</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Tabs defaultActiveKey="homepage" className="mb-4">
                  <Tab eventKey="homepage" title="Homepage Settings">
                    <Row className="mt-3">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hero Title</Form.Label>
                          <Form.Control
                            name="heroTitle"
                            value={settings.heroTitle}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Hero Subtitle</Form.Label>
                          <Form.Control
                            name="heroSubtitle"
                            value={settings.heroSubtitle}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>About Title</Form.Label>
                          <Form.Control
                            name="aboutTitle"
                            value={settings.aboutTitle}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>About Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="aboutDescription"
                            value={settings.aboutDescription}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>About Button Text</Form.Label>
                          <Form.Control
                            name="aboutButtonText"
                            value={settings.aboutButtonText}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>About Button Link</Form.Label>
                          <Form.Control
                            name="aboutButtonLink"
                            value={settings.aboutButtonLink}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Header Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e as React.ChangeEvent<HTMLInputElement>, "headerImage")}
                          />
                          {settings.headerImage && (
                            <div className="mt-2">
                              <small className="text-muted d-block mb-1">Current Image:</small>
                              <img
                                src={getImageUrl(settings.headerImage)}
                                alt="Header Preview"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                                onError={(e) => {
                                  console.error("Failed to load image:", settings.headerImage);
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                                }}
                              />
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Enrollment Steps Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e as React.ChangeEvent<HTMLInputElement>, "enrollmentStepsImage")
                            }
                          />
                          {settings.enrollmentStepsImage && (
                            <div className="mt-2">
                              <small className="text-muted d-block mb-1">Current Image:</small>
                              <img
                                src={getImageUrl(settings.enrollmentStepsImage)}
                                alt="Steps Preview"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                                onError={(e) => {
                                  console.error("Failed to load image:", settings.enrollmentStepsImage);
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                                }}
                              />
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Google Map Embed</Form.Label>
                          <Form.Control
                            name="googleMapEmbed"
                            value={settings.googleMapEmbed}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="certificate" title="Certificate Design">
                    <Row className="mt-3">
                      <Col md={5}>
                        <h5 className="mb-3">Certificate Background & Layout</h5>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Certificate Background Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (!e.target.files?.length) return;
                              const formData = new FormData();
                              formData.append("file", e.target.files[0]);
                              postReq("/api/homepage-settings/upload", formData, {
                                "Content-Type": "multipart/form-data"
                              }).then((res) => {
                                setSettings((prev) => ({
                                  ...prev,
                                  certificateDesign: {
                                    ...prev.certificateDesign,
                                    backgroundImage: res['base64']
                                  }
                                }));
                                setSuccessMessage("Certificate background image uploaded successfully!");
                              }).catch((error) => {
                                console.error("File upload failed:", error);
                                setErrorMessage("Error uploading certificate background image.");
                              });
                            }}
                          />
                          {settings.certificateDesign?.backgroundImage && (
                            <div className="mt-2">
                              <small className="text-muted d-block mb-1">Current Background:</small>
                              <img
                                src={getImageUrl(settings.certificateDesign.backgroundImage)}
                                alt="Certificate Background Preview"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '150px', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x150?text=Image+Not+Found";
                                }}
                              />
                            </div>
                          )}
                        </Form.Group>

                        <h5 className="mb-3 mt-4">Logos</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Logo 1 (Left)</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (!e.target.files?.length) return;
                              const formData = new FormData();
                              formData.append("file", e.target.files[0]);
                              postReq("/api/homepage-settings/upload", formData, {
                                "Content-Type": "multipart/form-data"
                              }).then((res) => {
                                setSettings((prev) => ({
                                  ...prev,
                                  certificateDesign: {
                                    ...prev.certificateDesign,
                                    logo1: res['base64']
                                  }
                                }));
                                setSuccessMessage("Logo 1 uploaded successfully!");
                              }).catch((error) => {
                                console.error("File upload failed:", error);
                                setErrorMessage("Error uploading logo 1.");
                              });
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Logo 2 (Center)</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (!e.target.files?.length) return;
                              const formData = new FormData();
                              formData.append("file", e.target.files[0]);
                              postReq("/api/homepage-settings/upload", formData, {
                                "Content-Type": "multipart/form-data"
                              }).then((res) => {
                                setSettings((prev) => ({
                                  ...prev,
                                  certificateDesign: {
                                    ...prev.certificateDesign,
                                    logo2: res['base64']
                                  }
                                }));
                                setSuccessMessage("Logo 2 uploaded successfully!");
                              }).catch((error) => {
                                console.error("File upload failed:", error);
                                setErrorMessage("Error uploading logo 2.");
                              });
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Logo 3 (Right)</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (!e.target.files?.length) return;
                              const formData = new FormData();
                              formData.append("file", e.target.files[0]);
                              postReq("/api/homepage-settings/upload", formData, {
                                "Content-Type": "multipart/form-data"
                              }).then((res) => {
                                setSettings((prev) => ({
                                  ...prev,
                                  certificateDesign: {
                                    ...prev.certificateDesign,
                                    logo3: res['base64']
                                  }
                                }));
                                setSuccessMessage("Logo 3 uploaded successfully!");
                              }).catch((error) => {
                                console.error("File upload failed:", error);
                                setErrorMessage("Error uploading logo 3.");
                              });
                            }}
                          />
                        </Form.Group>

                        <h5 className="mb-3 mt-4">Certificate Title & Subtitle</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Certificate Title</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.certificateTitle ?? "CERTIFICATE"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                certificateTitle: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Certificate Subtitle</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.certificateSubtitle ?? "Of Completion"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                certificateSubtitle: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Presented To Text</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.presentedToText ?? "This certificate is presented to:"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                presentedToText: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Container Width</Form.Label>
                          <Form.Control
                            name="containerWidth"
                            value={settings.certificateDesign?.containerWidth || "1000px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                containerWidth: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Container Height</Form.Label>
                          <Form.Control
                            name="containerHeight"
                            value={settings.certificateDesign?.containerHeight || "707px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                containerHeight: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}

                        <h5 className="mb-3 mt-4">Name Styling</h5>

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Name Font Size</Form.Label>
                          <Form.Control
                            name="nameFontSize"
                            value={settings.certificateDesign?.nameFontSize || "80px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                nameFontSize: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}

                        <Form.Group className="mb-3">
                          <Form.Label>Name Font Family</Form.Label>
                          <Form.Select
                            value={settings.certificateDesign?.nameFontFamily || "'Imperial Script'"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                nameFontFamily: e.target.value
                              }
                            })}
                          >
                            {CERTIFICATE_FONTS.map((font) => (
                              <option key={font.value} value={font.value}>
                                {font.label}
                              </option>
                            ))}
                          </Form.Select>
                          <small className="text-muted d-block mt-2">
                            Preview: <span style={{ fontFamily: settings.certificateDesign?.nameFontFamily || "'Imperial Script'", fontSize: "18px" }}>Sample Text</span>
                          </small>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Name Color</Form.Label>
                          <Form.Control
                            type="color"
                            name="nameColor"
                            value={settings.certificateDesign?.nameColor || "#cfaa51"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                nameColor: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Name Letter Spacing</Form.Label>
                          <Form.Control
                            name="nameLetterSpacing"
                            value={settings.certificateDesign?.nameLetterSpacing || "2px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                nameLetterSpacing: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Name Padding Top</Form.Label>
                          <Form.Control
                            name="namePaddingTop"
                            value={settings.certificateDesign?.namePaddingTop || "320px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                namePaddingTop: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}
                      </Col>

                      <Col md={6}>
                        <h5 className="mb-3">Text Block Styling</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Text Block Font Family</Form.Label>
                          <Form.Select
                            value={settings.certificateDesign?.textBlockFontFamily || "'Georgia', serif"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                textBlockFontFamily: e.target.value
                              }
                            })}
                          >
                            {TEXT_FONTS.map((font) => (
                              <option key={font.value} value={font.value}>
                                {font.label}
                              </option>
                            ))}
                          </Form.Select>
                          <small className="text-muted d-block mt-2">
                            Preview: <span style={{ fontFamily: settings.certificateDesign?.textBlockFontFamily || "'Georgia', serif", fontSize: "14px" }}>Sample Text</span>
                          </small>
                        </Form.Group>

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Text Block Font Size</Form.Label>
                          <Form.Control
                            name="textBlockFontSize"
                            value={settings.certificateDesign?.textBlockFontSize || "20px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                textBlockFontSize: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}

                        <Form.Group className="mb-3">
                          <Form.Label>Text Block Color</Form.Label>
                          <Form.Control
                            type="color"
                            name="textBlockColor"
                            value={settings.certificateDesign?.textBlockColor || "#000000"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                textBlockColor: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Text Block Letter Spacing</Form.Label>
                          <Form.Control
                            name="textBlockLetterSpacing"
                            value={settings.certificateDesign?.textBlockLetterSpacing || "1px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                textBlockLetterSpacing: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <h5 className="mb-3 mt-4">Signature Styling</h5>

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Signature Name Font Size</Form.Label>
                          <Form.Control
                            name="signatureNameFontSize"
                            value={settings.certificateDesign?.signatureNameFontSize || "20px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                signatureNameFontSize: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}

                        {/* <Form.Group className="mb-3">
                          <Form.Label>Signature Title Font Size</Form.Label>
                          <Form.Control
                            name="signatureTitleFontSize"
                            value={settings.certificateDesign?.signatureTitleFontSize || "16px"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                signatureTitleFontSize: e.target.value
                              }
                            })}
                          />
                        </Form.Group> */}

                        <Form.Group className="mb-3">
                          <Form.Label>Signature Color</Form.Label>
                          <Form.Control
                            type="color"
                            name="signatureColor"
                            value={settings.certificateDesign?.signatureColor || "#000000"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                signatureColor: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <h5 className="mb-3 mt-4">Signature Content</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Left Signature Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.leftSignatureName ?? "HON. MYLA B. CLARETE"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                leftSignatureName: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Left Signature Title</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.leftSignatureTitle ?? "ACTING MUNICIPAL MAYOR"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                leftSignatureTitle: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Right Signature Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.rightSignatureName ?? "JOHN PAUL L. MARTINEZ EN.P"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                rightSignatureName: e.target.value
                              }
                            })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Right Signature Title</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.certificateDesign?.rightSignatureTitle ?? "OIC - CTSDO"}
                            onChange={(e) => setSettings({
                              ...settings,
                              certificateDesign: {
                                ...settings.certificateDesign,
                                rightSignatureTitle: e.target.value
                              }
                            })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>

                <div className="text-end mt-4">
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardComponent>
  );
};

export default AdminPageSettings;
