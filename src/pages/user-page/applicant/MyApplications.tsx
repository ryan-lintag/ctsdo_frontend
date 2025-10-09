import React, { useEffect, useState } from "react";
import { DashboardComponent } from "../../../components/DashboardComponent";
import { Button, Col, Row } from "react-bootstrap";
import TableComponent from "../../../components/TableComponent";
import { deleteReq, getReq, postReq, putReq } from "../../../lib/axios";
import { LoaderBoundary } from "../../../components/LoaderBoundary";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FormatDate } from "../../../lib/formatter";
import {
  ApplicationsForm,
  type ApplicationFormData,
} from "../../../components/ApplicationComponents";
import { Button as PrimeButton } from "primereact/button";
import { Dialog } from "primereact/dialog";

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationFormData[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationFormData | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteApplicationDialog, setDeleteApplicationDialog] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await getReq("/api/application/user") as any;
      console.log("API Response:", res); // <--- check what you actually get

      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.applications)
        ? res.applications
        : [];

      const formatted = data.map((c: any) => ({
        ...c,
        requestDateStr: FormatDate(c.requestDate || c.createdAt),
      }));

      setApplications(formatted);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit application
  const editApplication = (item: ApplicationFormData) => {
    setSelectedApplication(item);
    setShowApplicationForm(true);
  };

  // Submit application (create or update)
  const submitApplication = async (applicationData: ApplicationFormData) => {
    setIsLoading(true);
    try {
      if (selectedApplication && selectedApplication._id) {
        // Update existing application
        await putReq(
          `/api/application/${selectedApplication._id}`,
          applicationData
        );
      } else {
        // Create new application
        await postReq("/api/application", applicationData);
      }

      // Refresh the list
      await fetchApplications();

      // Close the form
      setShowApplicationForm(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error("Failed to submit application", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel form
  const cancelApplication = () => {
    setShowApplicationForm(false);
    setSelectedApplication(null);
  };

  // Delete application
  const deleteApplication = async () => {
    setDeleteApplicationDialog(false);
    setIsLoading(true);
    try {
      if (selectedApplication?._id) {
        await deleteReq(`/api/application/${selectedApplication._id}`);
        await fetchApplications();
      }
    } catch (err) {
      console.error("Failed to delete application", err);
    } finally {
      setSelectedApplication(null);
      setIsLoading(false);
    }
  };

  // Confirm delete application
  const confirmDeleteApplication = (item: ApplicationFormData) => {
    setSelectedApplication(item);
    setDeleteApplicationDialog(true);
  };

  // Hide delete dialog
  const hideDeleteApplicationDialog = () => {
    setDeleteApplicationDialog(false);
    setSelectedApplication(null);
  };

  // Action buttons template
  const actionBodyTemplate = (item: ApplicationFormData) => {
    return (
      <React.Fragment>
        <PrimeButton
          icon="pi pi-pencil"
          style={{ borderRadius: "50px" }}
          outlined
          className="mr-2"
          onClick={() => editApplication(item)}
        />
        <PrimeButton
          icon="pi pi-trash"
          style={{ borderRadius: "50px" }}
          outlined
          severity="danger"
          onClick={() => confirmDeleteApplication(item)}
        />
      </React.Fragment>
    );
  };

const approvalStatusTemplate = (item: ApplicationFormData) => {
  if (item.isApproved === true) {
    return (
      <span>
        <i className="pi pi-check-circle me-1 text-success"></i> Approved
      </span>
    );
  } else if (item.isApproved === false) {
    return (
      <span>
        <i className="pi pi-clock me-1 text-warning"></i> Pending
      </span>
    );
  } else {
    return (
      <span>
        <i className="pi pi-times-circle me-1 text-danger"></i> Not Applied
      </span>
    );
  }
};


  // Delete dialog footer
  const deleteApplicationDialogFooter = (
    <React.Fragment>
      <PrimeButton
        label="No"
        icon="pi pi-times"
        outlined
        className="mr-3"
        onClick={hideDeleteApplicationDialog}
      />
      <PrimeButton
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteApplication}
      />
    </React.Fragment>
  );

  // Load on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <DashboardComponent>
      <div className="dashboard-title">Application Management</div>
      <LoaderBoundary isLoading={isLoading}>
        {showApplicationForm ? (
          <ApplicationsForm
            application={selectedApplication}
            submitCallback={submitApplication}
            cancelCallback={cancelApplication}
          />
        ) : (
          <>
            <Button
              type="button"
              className="mt-4 btn-success"
              onClick={() => setShowApplicationForm(true)}
            >
              + New Application
            </Button>
            <Row className="justify-content-center mt-3">
              <Col>
                <TableComponent
                  title=""
                  columns={[
                    {
                      field: "lastName",
                      header: "Last Name",
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
                      body: approvalStatusTemplate,
                    },
                    {
                      field: "_id",
                      header: "Actions",
                      body: actionBodyTemplate,
                    },
                  ]}
                  data={applications}
                />
              </Col>
            </Row>
          </>
        )}
      </LoaderBoundary>
      <Dialog
        visible={deleteApplicationDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteApplicationDialogFooter}
        onHide={hideDeleteApplicationDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {selectedApplication && (
            <span>
              Are you sure you want to delete the application for{" "}
              <b>
                {selectedApplication.firstName} {selectedApplication.lastName}
              </b>
              ?
            </span>
          )}
        </div>
      </Dialog>
    </DashboardComponent>
  );
};

export default MyApplications;
