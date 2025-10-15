import React, { useEffect, useState } from "react";
import { DashboardComponent } from "../../../components/DashboardComponent";
import { Col, Row } from "react-bootstrap";
import TableComponent from "../../../components/TableComponent";
import { deleteReq, getReq, postReq, putReq } from "../../../lib/axios";
import { Button as PrimeButton } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { LoaderBoundary } from "../../../components/LoaderBoundary";
import { FormatDate } from "../../../lib/formatter";
import { CertificateComponent } from "../../../components/CertificateComponent";
import type { Certificate } from "../../../types/common.types";

const CERTIFICATE_DEFAULT = {
  _id: "",
  userId: "",
  courseId: "",
  status: "In Progress",
};

const AdminCerticateRequest: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificate, setCertificate] =
    useState<Certificate>(CERTIFICATE_DEFAULT);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCertificateDialog, setDeleteCertificateDialog] = useState(false);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      let data = await getReq("/api/certificates") as any[];
      data = data.map((c: Certificate) => {
        return {
          ...c,
          fullName: `${c.firstName} ${c.lastName}`,
          requestDateStr: FormatDate(c.requestDate),
        };
      });
      setCertificates(data);
    } catch (err) {
      console.error("Failed to fetch certificates", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const submitCertificate = async (item: Certificate) => {
    setDeleteCertificateDialog(false);
    setIsLoading(true);
    try {
      if (item._id) {
        await putReq(`/api/certificates/${certificate._id}`, item);
      } else {
        await postReq(`/api/certificates`, item);
      }
      await fetchCertificates();
    } catch (err) {
      console.error("Failed to update certificate", err);
    } finally {
      setShowCertificate(false);
      setCertificate(CERTIFICATE_DEFAULT);
      setIsLoading(false);
    }
  };

  const editCertificate = (item: Certificate) => {
    setCertificate(item);
    setShowCertificate(true);
  };

  const downloadCertificate = async (item: Certificate) => {
    setIsLoading(true);
    try {
      let data = await getReq(`/api/certificates/${item._id}`) as any;
      console.log(data);
      downloadBase64Image(data.certificate, "certicate.png");
    } catch (err) {
      console.error("Failed to fetch certificate", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBase64Image = (base64String: string, filename: string) => {
    const link = document.createElement("a");
    link.href = base64String;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteCertificate = async () => {
    setDeleteCertificateDialog(false);
    setIsLoading(true);
    try {
      await deleteReq(`/api/certificates/${certificate._id}`);
      await fetchCertificates();
    } catch (err) {
      console.error("Failed to delete certificate", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCertificate = () => {
    setShowCertificate(false);
    setCertificate(CERTIFICATE_DEFAULT);
  };

  const confirmDeleteCertificate = (item: Certificate) => {
    setCertificate(item);
    setDeleteCertificateDialog(true);
  };

  const actionBodyTemplate = (item: Certificate) => {
    return (
      <React.Fragment>
        {item.status != "Approved" ? (
          <PrimeButton
            icon="pi pi-pencil"
            style={{ borderRadius: "50px" }}
            outlined
            className="mr-2"
            onClick={() => editCertificate(item)}
          />
        ) : (
          <PrimeButton
            icon="pi pi-download"
            style={{ borderRadius: "50px" }}
            outlined
            severity="success"
            className="mr-2"
            onClick={() => downloadCertificate(item)}
          />
        )}
        <PrimeButton
          icon="pi pi-trash"
          style={{ borderRadius: "50px" }}
          outlined
          severity="danger"
          onClick={() => confirmDeleteCertificate(item)}
        />
      </React.Fragment>
    );
  };

  const hideDeleteCertificateDialog = () => {
    setDeleteCertificateDialog(false);
  };

  const deleteCertificateDialogFooter = (
    <React.Fragment>
      <PrimeButton
        label="No"
        icon="pi pi-times"
        outlined
        className="mr-3"
        onClick={hideDeleteCertificateDialog}
      />
      <PrimeButton
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteCertificate}
      />
    </React.Fragment>
  );

  return (
    <DashboardComponent>
      <div className="dashboard-title">Certificates Management</div>
      <LoaderBoundary isLoading={isLoading}>
        {showCertificate ? (
          <>
            <CertificateComponent
              certificate={certificate}
              submitCallback={submitCertificate}
              cancelCallback={cancelCertificate}
            />
          </>
        ) : (
          <>
            <Row className="justify-content-center">
              <Col>
                <TableComponent
                  title=""
                  columns={[
                    {
                      field: "fullName",
                      header: "Full Name",
                      isSortable: true,
                    },
                    {
                      field: "courseTitle",
                      header: "Course Title",
                      isSortable: true,
                    },
                    {
                      field: "status",
                      header: "Status",
                      isSortable: true,
                    },
                    {
                      field: "requestDateStr",
                      header: "Requested Date",
                      isSortable: true,
                    },
                    {
                      field: "_id",
                      header: "Actions",
                      body: actionBodyTemplate,
                    },
                  ]}
                  data={certificates} //from API
                />
              </Col>
            </Row>
          </>
        )}
      </LoaderBoundary>
      <Dialog
        visible={deleteCertificateDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteCertificateDialogFooter}
        onHide={hideDeleteCertificateDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {certificate && (
            <span>
              Are you sure you want to delete <b>{certificate.courseTitle}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </DashboardComponent>
  );
};

export default AdminCerticateRequest;
