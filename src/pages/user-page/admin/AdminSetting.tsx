import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Card, Row, Col, Spinner } from "react-bootstrap";
import { DashboardComponent } from "../../../components/DashboardComponent";

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

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/homepage-settings")
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.length) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/homepage-settings/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSettings((prev) => ({ ...prev, [field]: res.data.url }));
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Error uploading file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put("http://localhost:3000/api/homepage-settings", settings);
      alert("Homepage settings updated successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <DashboardComponent>
      <Row className="justify-content-center mt-4">
        <Col md={10} lg={8}>
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
                        onChange={(e) => handleFileUpload(e as React.ChangeEvent<HTMLInputElement>, "headerImage")}
                      />
                      {settings.headerImage && (
                        <img
                          src={`http://localhost:3000${settings.headerImage}`}
                          alt="Header Preview"
                          className="img-fluid rounded mt-2 shadow-sm"
                        />
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Enrollment Steps Image</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) =>
                          handleFileUpload(e as React.ChangeEvent<HTMLInputElement>, "enrollmentStepsImage")
                        }
                      />
                      {settings.enrollmentStepsImage && (
                        <img
                          src={`http://localhost:3000${settings.enrollmentStepsImage}`}
                          alt="Steps Preview"
                          className="img-fluid rounded mt-2 shadow-sm"
                        />
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
