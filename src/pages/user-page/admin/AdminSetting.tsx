import { useEffect, useState } from "react";
import { Button, Form, Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { DashboardComponent } from "../../../components/DashboardComponent";
import { getReq, putReq, postReq } from "../../../lib/axios";

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
    setSettings((prev) => ({ ...prev, [field]: (res as { url: string }).url }));
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
      setSuccessMessage("Homepage settings updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    // If it starts with /uploads, it's an uploaded file
    if (imagePath.startsWith("/uploads/")) {
      return `${API_BASE_URL}${imagePath}`;
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
              <h4 className="mb-0">Edit Homepage Settings</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
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
                          <small className="text-muted d-block mt-1">Path: {settings.headerImage}</small>
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
                          <small className="text-muted d-block mt-1">Path: {settings.enrollmentStepsImage}</small>
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
