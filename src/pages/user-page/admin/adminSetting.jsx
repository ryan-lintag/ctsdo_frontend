import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Card, Row, Col, Spinner } from "react-bootstrap";
import { DashboardComponent } from '../../../components/DashboardComponent';

const AdminPageSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/homepage-settings`)
      .then((res) => setSettings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, field) => {
    if (!e.target.files) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/homepage-settings/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setSettings({ ...settings, [field]: res.data.url });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/homepage-settings`, settings);
    setSaving(false);
    alert("Homepage settings updated!");
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
                      onChange={(e) => handleFileUpload(e, "headerImage")}
                    />
                    {settings.headerImage && (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${settings.headerImage}`}
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
                        handleFileUpload(e, "enrollmentStepsImage")
                      }
                    />
                    {settings.enrollmentStepsImage && (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${settings.enrollmentStepsImage}`}
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
