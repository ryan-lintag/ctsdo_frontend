import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Row, Col, Button as BSButton, Alert, Badge, ButtonGroup } from 'react-bootstrap';
import { Dialog } from 'primereact/dialog';
import { Button as PrimeButton } from 'primereact/button';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import { getReq, putReq, postReq, deleteReq } from '../../../lib/axios';
import { FormatDate } from '../../../lib/formatter';
import TableComponent from '../../../components/TableComponent';
import { ApplicationsForm, type ApplicationFormData } from '../../../components/ApplicationComponents';

const ScholarApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationFormData[]>([]);
  const [allApplications, setAllApplications] = useState<ApplicationFormData[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await getReq('/api/application');
      setAllApplications(data);
      filterApplications(data, filter);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = (data: ApplicationFormData[], filter: 'all' | 'pending' | 'approved' | 'rejected') => {
    if (filter === 'all') setApplications(data);
    else {
      const filtered = data.filter(app => {
        if (filter === 'pending') return !app.isApproved && !app.feedback;
        if (filter === 'approved') return app.isApproved && !app.feedback;
        if (filter === 'rejected') return app.feedback !== '';
        return false;
      });
      setApplications(filtered);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'approved' | 'rejected') => {
    setFilter(newFilter);
    filterApplications(allApplications, newFilter);
  };

  // Status badge
  const getStatusBadge = (application: ApplicationFormData) => {
    if (application.isApproved) return <Badge bg="success">Approved</Badge>;
    if (application.feedback) return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="warning">Pending</Badge>;
  };

  // Actions
  const viewDetails = (application: ApplicationFormData) => {
    setSelectedApplication(application);
    setDetailsDialog(true);
  };

  const confirmApprove = (application: ApplicationFormData) => {
    setSelectedApplication(application);
    setApproveDialog(true);
  };

  const confirmReject = (application: ApplicationFormData) => {
    setSelectedApplication(application);
    setRejectDialog(true);
  };

  const confirmDelete = (application: ApplicationFormData) => {
    setSelectedApplication(application);
    setRejectDialog(true); // reuse reject dialog as delete confirmation
  };

  const editApplication = (application: ApplicationFormData) => {
    setSelectedApplication(application);
    setShowApplicationForm(true);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    try {
      await putReq(`/api/application/${selectedApplication._id}`, { isApproved: true, feedback: '' });
      setSuccess('Application approved successfully.');
      setApproveDialog(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Failed to approve application.');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    try {
      await putReq(`/api/application/${selectedApplication._id}`, { isApproved: false, feedback });
      setSuccess('Application rejected successfully.');
      setRejectDialog(false);
      setSelectedApplication(null);
      setFeedback('');
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Failed to reject application.');
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    try {
      await deleteReq(`/api/application/${selectedApplication._id}`);
      setSuccess('Application deleted successfully.');
      setRejectDialog(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Failed to delete application.');
    }
  };

  const submitApplication = async (applicationData: ApplicationFormData) => {
    try {
      if (selectedApplication && selectedApplication._id) {
        await putReq(`/api/application/${selectedApplication._id}`, applicationData);
        setSuccess('Application updated successfully.');
      } else {
        await postReq(`/api/application`, applicationData);
        setSuccess('Application added successfully.');
      }
      setShowApplicationForm(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Failed to save application.');
    }
  };

  const cancelApplicationForm = () => {
    setShowApplicationForm(false);
    setSelectedApplication(null);
  };

  const hideRejectDialog = () => {
    setRejectDialog(false);
    setSelectedApplication(null);
    setFeedback('');
  };

  const hideApproveDialog = () => {
    setApproveDialog(false);
    setSelectedApplication(null);
  };

  // Table templates
  const actionBodyTemplate = (application: ApplicationFormData) => (
    <>
      <PrimeButton icon="pi pi-eye" style={{ borderRadius: '50px' }} outlined className="me-2" onClick={() => viewDetails(application)} />
      <PrimeButton icon="pi pi-pencil" style={{ borderRadius: '50px' }} outlined className="me-2" severity="info" onClick={() => editApplication(application)} />
      <PrimeButton icon="pi pi-trash" style={{ borderRadius: '50px' }} outlined className="me-2" severity="danger" onClick={() => confirmDelete(application)} />
      {!application.isApproved && !application.feedback && (
        <>
          <PrimeButton icon="pi pi-check" style={{ borderRadius: '50px' }} outlined className="me-2" severity="success" onClick={() => confirmApprove(application)} />
          <PrimeButton icon="pi pi-times" style={{ borderRadius: '50px' }} outlined className="me-2" severity="warning" onClick={() => confirmReject(application)} />
        </>
      )}
    </>
  );

  const statusBodyTemplate = (application: ApplicationFormData) => getStatusBadge(application);
  const dateBodyTemplate = (application: ApplicationFormData) => FormatDate(application.createdAt);

  const tableColumns = [
    { field: 'uliNumber', header: 'ULI Number', isSortable: true },
    { field: 'firstName', header: 'First Name', isSortable: true },
    { field: 'lastName', header: 'Last Name', isSortable: true },
    { field: 'createdAt', header: 'Date Submitted', isSortable: true },
    { field: 'entryDate', header: 'Entry Date', body: dateBodyTemplate, isSortable: true },
    { field: 'status', header: 'Status', body: statusBodyTemplate },
    { field: '_id', header: 'Actions', body: actionBodyTemplate },
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <DashboardComponent>
      <div className="dashboard-title">Scholar Applications</div>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <LoaderBoundary isLoading={isLoading}>
        <BSButton 
          className="mb-3 btn-success" 
          onClick={() => {
            setSelectedApplication(null);
            setShowApplicationForm(true);
          }}
        >
          + Add Application
        </BSButton>

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <ButtonGroup>
              <BSButton variant={filter==='all'?'primary':'outline-primary'} onClick={()=>handleFilterChange('all')}>
                All ({allApplications.length})
              </BSButton>
              <BSButton variant={filter==='pending'?'warning':'outline-warning'} onClick={()=>handleFilterChange('pending')}>
                Pending ({allApplications.filter(r=>!r.isApproved&&!r.feedback).length})
              </BSButton>
              <BSButton variant={filter==='approved'?'success':'outline-success'} onClick={()=>handleFilterChange('approved')}>
                Approved ({allApplications.filter(r=>r.isApproved).length})
              </BSButton>
              <BSButton variant={filter==='rejected'?'danger':'outline-danger'} onClick={()=>handleFilterChange('rejected')}>
                Rejected ({allApplications.filter(r=>r.feedback && !r.isApproved).length})
              </BSButton>
            </ButtonGroup>
          </Col>
        </Row>

        {/* Table */}
        <Row>
          <Col>
            <TableComponent columns={tableColumns} data={applications} title="" />
          </Col>
        </Row>

        {/* Application Form */}
        {showApplicationForm && (
          <ApplicationsForm
            application={selectedApplication}
            submitCallback={submitApplication}
            cancelCallback={cancelApplicationForm}
          />
        )}

        {/* Details Dialog */}
        <Dialog header="Application Details" visible={detailsDialog} style={{ width:'80vw', maxWidth:'1000px' }} modal
          onHide={()=>setDetailsDialog(false)}
          footer={<PrimeButton label="Close" icon="pi pi-times" outlined onClick={()=>setDetailsDialog(false)} />}
        >
          {selectedApplication && (
            <div className="table-responsive">
              <table className="table table-stripped">
                <tbody>
                  <tr><th>Status</th><td>{getStatusBadge(selectedApplication)}</td></tr>
                  <tr><th>ULI Number</th><td>{selectedApplication.uliNumber}</td></tr>
                  <tr><th>First Name</th><td>{selectedApplication.firstName}</td></tr>
                  <tr><th>Last Name</th><td>{selectedApplication.lastName}</td></tr>
                  <tr><th>Middle Name</th><td>{selectedApplication.middleName}</td></tr>
                  <tr><th>Middle Initial</th><td>{selectedApplication.middleInitial}</td></tr>
                  {selectedApplication.feedback && <tr><th>Rejection Feedback</th><td className="text-danger">{selectedApplication.feedback}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Dialog>

        {/* Approve Dialog */}
        <Dialog header="Confirm Approval" visible={approveDialog} style={{ width:'32rem' }} modal
          footer={
            <>
              <PrimeButton label="No" icon="pi pi-times" outlined onClick={hideApproveDialog} className="me-2" />
              <PrimeButton label="Yes" icon="pi pi-check" severity="success" onClick={handleApprove} />
            </>
          }
          onHide={hideApproveDialog}
        >
          {selectedApplication && <span>Are you sure you want to approve <b>{selectedApplication.firstName} {selectedApplication.lastName}</b>?</span>}
        </Dialog>

        {/* Reject / Delete Dialog */}
        <Dialog header="Confirm Action" visible={rejectDialog} style={{ width:'32rem' }} modal
          footer={
            <>
              <PrimeButton label="No" icon="pi pi-times" outlined onClick={hideRejectDialog} className="me-2" />
              {feedback.trim() ? (
                <PrimeButton label="Yes" icon="pi pi-check" severity="danger" onClick={handleReject} />
              ) : (
                <PrimeButton label="Yes" icon="pi pi-check" severity="danger" onClick={handleDelete} />
              )}
            </>
          }
          onHide={hideRejectDialog}
        >
          {selectedApplication && !feedback && <span>Are you sure you want to delete <b>{selectedApplication.firstName} {selectedApplication.lastName}</b>?</span>}
          {selectedApplication && feedback && (
            <>
              <span>Are you sure you want to reject <b>{selectedApplication.firstName} {selectedApplication.lastName}</b>?</span>
              <div className="mt-3">
                <textarea className="form-control" rows={4} placeholder="Rejection reason" value={feedback} onChange={e=>setFeedback(e.target.value)} />
              </div>
            </>
          )}
        </Dialog>
      </LoaderBoundary>
    </DashboardComponent>
  );
};

export default ScholarApplications;
