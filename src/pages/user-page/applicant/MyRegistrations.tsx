import React, { useEffect, useState } from "react";
import { DashboardComponent } from "../../../components/DashboardComponent";
import { Button, Col, Row } from "react-bootstrap";
import TableComponent from "../../../components/TableComponent";
import { deleteReq, getReq, postReq, putReq } from "../../../lib/axios";
import { LoaderBoundary } from "../../../components/LoaderBoundary";
import { FormatDate } from "../../../lib/formatter";
import {
  RegistrationForm,
  type RegistrationData,
} from "../../../components/RegistrationComponent";
import { Button as PrimeButton } from "primereact/button";
import { Dialog } from "primereact/dialog";

const MyRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationData | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteRegistrationDialog, setDeleteRegistrationDialog] =
    useState(false);

  // Fetch registrations
  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await getReq("/api/registration/user");
      console.log("API Response:", res); // <--- check what you actually get

      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.registrations)
        ? res.registrations
        : [];

      const formatted = data.map((c: any) => ({
        ...c,
        requestDateStr: FormatDate(c.requestDate || c.createdAt),
      }));

      setRegistrations(formatted);
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit registration
  const editRegistration = (item: RegistrationData) => {
    setSelectedRegistration(item);
    setShowRegistrationForm(true);
  };

  // Submit registration (create or update)
  const submitRegistration = async (registrationData: RegistrationData) => {
    setIsLoading(true);
    try {
      if (selectedRegistration && selectedRegistration._id) {
        // Update existing registration
        await putReq(
          `/api/registration/${selectedRegistration._id}`,
          registrationData
        );
      } else {
        // Create new registration
        await postReq("/api/registration", registrationData);
      }

      // Refresh the list
      await fetchRegistrations();

      // Close the form
      setShowRegistrationForm(false);
      setSelectedRegistration(null);
    } catch (err) {
      console.error("Failed to submit registration", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel form
  const cancelRegistration = () => {
    setShowRegistrationForm(false);
    setSelectedRegistration(null);
  };

  // Delete registration
  const deleteRegistration = async () => {
    setDeleteRegistrationDialog(false);
    setIsLoading(true);
    try {
      if (selectedRegistration?._id) {
        await deleteReq(`/api/registration/${selectedRegistration._id}`);
        await fetchRegistrations();
      }
    } catch (err) {
      console.error("Failed to delete registration", err);
    } finally {
      setSelectedRegistration(null);
      setIsLoading(false);
    }
  };

  // Confirm delete registration
  const confirmDeleteRegistration = (item: RegistrationData) => {
    setSelectedRegistration(item);
    setDeleteRegistrationDialog(true);
  };

  // Hide delete dialog
  const hideDeleteRegistrationDialog = () => {
    setDeleteRegistrationDialog(false);
    setSelectedRegistration(null);
  };

const registrationStatusTemplate = (registration: RegistrationData) => {
  if (registration.isApproved === true) {
    return (
      <span>
        <i className="pi pi-check-circle me-1 text-success"></i> Approved
      </span>
    );
  } else if (registration.feedback) {
    return (
      <span>
        <i className="pi pi-times-circle me-1 text-danger"></i> Rejected
      </span>
    );
  } else if (registration.isApproved === false) {
    return (
      <span>
        <i className="pi pi-clock me-1 text-warning"></i> Pending
      </span>
    );
  } else {
    return (
      <span>
        <i className="pi pi-question-circle me-1 text-secondary"></i> Not Applied
      </span>
    );
  }
};


  // Action buttons template
  const actionBodyTemplate = (item: RegistrationData) => {
    return (
      <React.Fragment>
        <PrimeButton
          icon="pi pi-pencil"
          style={{ borderRadius: "50px" }}
          outlined
          className="mr-2"
          onClick={() => editRegistration(item)}
        />
        <PrimeButton
          icon="pi pi-trash"
          style={{ borderRadius: "50px" }}
          outlined
          severity="danger"
          onClick={() => confirmDeleteRegistration(item)}
        />
      </React.Fragment>
    );
  };

  // Delete dialog footer
  const deleteRegistrationDialogFooter = (
    <React.Fragment>
      <PrimeButton
        label="No"
        icon="pi pi-times"
        outlined
        className="mr-3"
        onClick={hideDeleteRegistrationDialog}
      />
      <PrimeButton
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteRegistration}
      />
    </React.Fragment>
  );

  // Load on mount
  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <DashboardComponent>
      <div className="dashboard-title">Registration Management</div>
      <LoaderBoundary isLoading={isLoading}>
        {showRegistrationForm ? (
          <RegistrationForm
            registration={selectedRegistration}
            submitCallback={submitRegistration}
            cancelCallback={cancelRegistration}
          />
        ) : (
          <>
            <Button
              type="button"
              className="mt-4 btn-success"
              onClick={() => setShowRegistrationForm(true)}
            >
              + New Registration
            </Button>
            <Row className="justify-content-center mt-3">
              <Col>
                <TableComponent
                  title=""
                  columns={[
                    {
                      field: "uliNumber",
                      header: "Uli Number",
                      isSortable: true,
                    },
                    {
                      field: "firstName",
                      header: "First Name",
                      isSortable: true,
                    },
                    {
                      field: "requestDateStr",
                      header: "Request Date",
                      isSortable: true,
                    },
                    {
                      field: "isApproved",
                      header: "Approval",
                      body: registrationStatusTemplate,
                    },
                    {
                      field: "_id",
                      header: "Actions",
                      body: actionBodyTemplate,
                    },
                  ]}
                  data={registrations}
                />
              </Col>
            </Row>
          </>
        )}
      </LoaderBoundary>

      <Dialog
        visible={deleteRegistrationDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteRegistrationDialogFooter}
        onHide={hideDeleteRegistrationDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {selectedRegistration && (
            <span>
              Are you sure you want to delete the registration for{" "}
              <b>
                {selectedRegistration.firstName} {selectedRegistration.lastName}
              </b>
              ?
            </span>
          )}
        </div>
      </Dialog>
    </DashboardComponent>
  );
};

export default MyRegistrations;
