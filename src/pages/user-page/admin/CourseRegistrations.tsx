import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Row, Col, Button as BSButton, Alert, Badge, ButtonGroup } from 'react-bootstrap';
import { Dialog } from 'primereact/dialog';
import { Button as PrimeButton } from 'primereact/button';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import { deleteReq, getReq, putReq } from '../../../lib/axios';
import { FormatDate } from '../../../lib/formatter';
import TableComponent from '../../../components/TableComponent';
import { RegistrationForm, type RegistrationData } from '../../../components/RegistrationComponent';
import { type Course } from '../../../types/common.types';

const CourseRegistration: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<RegistrationData[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await getReq('/api/registration');
      setAllRegistrations(data);
      filterRegistrations(data, filter);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      setError('Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getReq('/api/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

const filterRegistrations = (data: RegistrationData[], filter: 'all' | 'pending' | 'approved' | 'rejected') => {
  let filtered: RegistrationData[] = [];
  if (filter === 'all') {
    filtered = data;
  } else if (filter === 'pending') {
    filtered = data.filter(r => !r.isApproved && !r.feedback);
  } else if (filter === 'approved') {
    filtered = data.filter(r => r.isApproved);
  } else if (filter === 'rejected') {
    filtered = data.filter(r => r.feedback && !r.isApproved);
  }
  setRegistrations(filtered);
}

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'approved' | 'rejected') => {
    setFilter(newFilter);
    filterRegistrations(allRegistrations, newFilter);
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.title : courseId;
  };

  const getStatusBadge = (registration: RegistrationData) => {
    if (registration.isApproved) {
      return <Badge bg="success">Approved</Badge>;
    } else if (registration.feedback) {
      return <Badge bg="danger">Rejected</Badge>;
    } else {
      return <Badge bg="warning">Pending</Badge>;
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleDelete = async () => {
    if (!selectedRegistration?._id) return;
    setIsLoading(true);
    try {
      await deleteReq(`/api/registration/${selectedRegistration._id}`);
      setSuccess('Registration deleted successfully!');
      setRejectDialog(false);
      setSelectedRegistration(null);
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete registration:', err);
      setError('Failed to delete registration');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRegistration = async (data: RegistrationData) => {
    if (!selectedRegistration?._id) return;
    setIsLoading(true);
    try {
      await putReq(`/api/registration/${selectedRegistration._id}`, data);
      setSuccess('Registration updated successfully!');
      setShowRegistrationForm(false);
      setSelectedRegistration(null);
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      console.error('Failed to update registration:', err);
      setError('Failed to update registration');
    } finally {
      setIsLoading(false);
    }
  };


  const cancelRegistrationForm = () => {
    setShowRegistrationForm(false);
    setSelectedRegistration(null);
  };

  const approveStudent = async () => {
    if (!selectedRegistration?._id) return;
    setIsLoading(true);
    try {
      await putReq(`/api/registration/${selectedRegistration._id}/approve`, {});
      setSuccess('Registration approved successfully!');
      setApproveDialog(false);
      setSelectedRegistration(null);
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      console.error('Failed to approve student:', err);
      setError('Failed to approve registration');
    } finally {
      setIsLoading(false);
    }
  };

  const rejectStudent = async () => {
    if (!selectedRegistration?._id || !feedback.trim()) return;
    setIsLoading(true);
    try {
      await putReq(`/api/registration/${selectedRegistration._id}/reject`, { feedback });
      setSuccess('Registration rejected successfully!');
      setRejectDialog(false);
      setSelectedRegistration(null);
      setFeedback('');
      await fetchRegistrations(); // Refresh the list
    } catch (err) {
      console.error('Failed to reject student:', err);
      setError('Failed to reject registration');
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetails = (registration: RegistrationData) => {
    setSelectedRegistration(registration);
    setDetailsDialog(true);
  };

  const confirmApprove = (registration: RegistrationData) => {
    setSelectedRegistration(registration);
    setApproveDialog(true);
  };

  const confirmReject = (registration: RegistrationData) => {
    setSelectedRegistration(registration);
    setRejectDialog(true);
  };

  const confirmDelete = (registration: RegistrationData) => {
    setSelectedRegistration(registration);
    setRejectDialog(true);
  };

  const editRegistration = (registration: RegistrationData) => {
    setSelectedRegistration(registration);
    setShowRegistrationForm(true);
  };

  // Action buttons template for table
  const actionBodyTemplate = (registration: RegistrationData) => {
    return (
      <React.Fragment>
        <PrimeButton 
          icon="pi pi-eye" 
          style={{ borderRadius: '50px' }} 
          outlined 
          className="mr-2" 
          onClick={() => viewDetails(registration)} 
        />
        <PrimeButton 
          icon="pi pi-pencil" 
          style={{ borderRadius: '50px' }} 
          outlined 
          className="mr-2" 
          onClick={() => editRegistration(registration)} 
        />
        <PrimeButton 
          icon="pi pi-trash" 
          style={{ borderRadius: '50px' }} 
          outlined 
          severity="danger" 
          onClick={() => confirmDelete(registration)} 
        />
        {!registration.isApproved && !registration.feedback && (
          <>
            <PrimeButton 
              icon="pi pi-check" 
              style={{ borderRadius: '50px' }} 
              outlined 
              severity="success" 
              className="mr-2" 
              onClick={() => confirmApprove(registration)} 
            />
            <PrimeButton 
              icon="pi pi-times" 
              style={{ borderRadius: '50px' }} 
              outlined 
              severity="danger" 
              onClick={() => confirmReject(registration)} 
            />
          </>
        )}
      </React.Fragment>
    );
  };

  // Status template for table
  const statusBodyTemplate = (registration: RegistrationData) => {
    return getStatusBadge(registration);
  };

  // Course template for table
  const courseBodyTemplate = (registration: RegistrationData) => {
    return getCourseTitle(registration.courseId);
  };

  // Date template for table
  const dateBodyTemplate = (registration: RegistrationData) => {
    return FormatDate(registration.entryDate);
  };

  const tableColumns = [
    {
      field: 'uliNumber',
      header: 'ULI Number',
      isSortable: true,
    },
    {
      field: 'firstName',
      header: 'First Name',
      isSortable: true,
    },
    {
      field: 'lastName',
      header: 'Last Name',
      isSortable: true,
    },
    {
      field: 'email',
      header: 'Email',
      isSortable: true,
    },
    {
      field: 'courseId',
      header: 'Course',
      body: courseBodyTemplate,
    },
    {
      field: 'entryDate',
      header: 'Entry Date',
      body: dateBodyTemplate,
      isSortable: true,
    },
    {
      field: 'status',
      header: 'Status',
      body: statusBodyTemplate,
    },
    {
      field: '_id',
      header: 'Actions',
      body: actionBodyTemplate,
    }
  ];

  const hideDeleteRegistrationDialog = () => {
    setRejectDialog(false);
    setSelectedRegistration(null);
    setFeedback('');
  };

  const hideApproveRegistrationDialog = () => {
    setApproveDialog(false);
    setSelectedRegistration(null);
  };

  const rejectRegistrationDialogFooter = (
    <React.Fragment>
      <PrimeButton 
        label="No" 
        icon="pi pi-times" 
        outlined 
        className='mr-3' 
        onClick={hideDeleteRegistrationDialog} 
      />
      <PrimeButton 
        label="Yes" 
        icon="pi pi-check" 
        severity="danger" 
        onClick={rejectStudent}
        disabled={!feedback.trim()}
      />
    </React.Fragment>
  );

  const approveRegistrationDialogFooter = (
    <React.Fragment>
      <PrimeButton 
        label="No" 
        icon="pi pi-times" 
        outlined 
        className='mr-3' 
        onClick={hideApproveRegistrationDialog} 
      />
      <PrimeButton 
        label="Yes" 
        icon="pi pi-check" 
        severity="success" 
        onClick={approveStudent} 
      />
    </React.Fragment>
  );

  return (
    <DashboardComponent>
      <div className="dashboard-title">Course Registration Management</div>
      
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <LoaderBoundary isLoading={isLoading}>
        {/* Filter Buttons */}
        <Row className="mb-4">
          <Col>
            <ButtonGroup>
              <BSButton 
                variant={filter === 'all' ? 'primary' : 'outline-primary'}
                onClick={() => handleFilterChange('all')}
              >
                All ({allRegistrations.length})
              </BSButton>
              <BSButton 
                variant={filter === 'pending' ? 'warning' : 'outline-warning'}
                onClick={() => handleFilterChange('pending')}
              >
                Pending ({allRegistrations.filter(r => !r.isApproved && !r.feedback).length})
              </BSButton>
              <BSButton 
                variant={filter === 'approved' ? 'success' : 'outline-success'}
                onClick={() => handleFilterChange('approved')}
              >
                Approved ({allRegistrations.filter(r => r.isApproved).length})
              </BSButton>
              <BSButton 
                variant={filter === 'rejected' ? 'danger' : 'outline-danger'}
                onClick={() => handleFilterChange('rejected')}
              >
                Rejected ({allRegistrations.filter(r => r.feedback && !r.isApproved).length})
              </BSButton>
            </ButtonGroup>
          </Col>
        </Row>

        {/* Registration Table */}
        <Row>
          <Col>
            <TableComponent
              title=""
              columns={tableColumns}
              data={registrations}
            />
          </Col>
        </Row>
      </LoaderBoundary>

      {/* Replace RegistrationData with your actual registration form component, e.g. RegistrationForm */}
      {showRegistrationForm && selectedRegistration !== null && (
        <RegistrationForm
          registration={selectedRegistration}
          submitCallback={submitRegistration}
          cancelCallback={cancelRegistrationForm}
        />
      )}

      {/* Details Dialog */}
      <Dialog
        header="Registration Details"
        visible={detailsDialog}
        style={{ width: '80vw', maxWidth: '1000px' }}
        modal
        onHide={() => setDetailsDialog(false)}
        footer={
          <PrimeButton 
            label="Close" 
            icon="pi pi-times"
            outlined
            onClick={() => setDetailsDialog(false)} 
          />
        }
      >
        {selectedRegistration && (
          <div className="table-responsive">
            <table className="table table-striped">
              <tbody>
                <tr><th width="200">Status</th><td>{getStatusBadge(selectedRegistration)}</td></tr>
                <tr><th>ULI Number</th><td>{selectedRegistration.uliNumber}</td></tr>
                <tr><th>Entry Date</th><td>{FormatDate(selectedRegistration.entryDate)}</td></tr>
                <tr><th>Full Name</th><td>{`${selectedRegistration.firstName} ${selectedRegistration.middleName || ''} ${selectedRegistration.lastName}`}</td></tr>
                <tr><th>Extension Name</th><td>{selectedRegistration.extensionName || 'N/A'}</td></tr>
                <tr><th>Email</th><td>{selectedRegistration.email}</td></tr>
                <tr><th>Contact</th><td>{selectedRegistration.contactNumber}</td></tr>
                <tr><th>Facebook</th><td>{selectedRegistration.facebook}</td></tr>
                <tr><th>Address</th><td>{`${selectedRegistration.address.street}, ${selectedRegistration.address.barangay}, ${selectedRegistration.address.district}, ${selectedRegistration.address.city}, ${selectedRegistration.address.province}, ${selectedRegistration.address.region}`}</td></tr>
                <tr><th>Date of Birth</th><td>{FormatDate(selectedRegistration.dob)}</td></tr>
                <tr><th>Birth Place</th><td>{`${selectedRegistration.birthPlace.city}, ${selectedRegistration.birthPlace.province}, ${selectedRegistration.birthPlace.region}`}</td></tr>
                <tr><th>Nationality</th><td>{selectedRegistration.nationality}</td></tr>
                <tr><th>Sex</th><td>{selectedRegistration.sex}</td></tr>
                <tr><th>Civil Status</th><td>{selectedRegistration.civilStatus}</td></tr>
                <tr><th>Employment Status</th><td>{selectedRegistration.employmentStatus}</td></tr>
                <tr><th>Educational Attainment</th><td>{Array.isArray(selectedRegistration.educationalAttainment) ? selectedRegistration.educationalAttainment.join(', ') : selectedRegistration.educationalAttainment}</td></tr>
                <tr><th>Parent/Guardian Name</th><td>{selectedRegistration.parentGuardian.name}</td></tr>
                <tr><th>Parent/Guardian Address</th><td>{selectedRegistration.parentGuardian.address}</td></tr>
                <tr><th>Classification</th><td>{Array.isArray(selectedRegistration.classifications) ? selectedRegistration.classifications.join(', ') : selectedRegistration.classifications}</td></tr>
                <tr><th>Disability Type</th><td>{Array.isArray(selectedRegistration.disabilityType) ? selectedRegistration.disabilityType.join(', ') : selectedRegistration.disabilityType || 'N/A'}</td></tr>
                <tr><th>Disability Cause</th><td>{Array.isArray(selectedRegistration.disabilityCause) ? selectedRegistration.disabilityCause.join(', ') : selectedRegistration.disabilityCause || 'N/A'}</td></tr>
                <tr><th>Course</th><td>{getCourseTitle(selectedRegistration.courseId)}</td></tr>
                <tr><th>Scholarship Type</th><td>{selectedRegistration.scholarshipType || 'N/A'}</td></tr>
                <tr><th>Privacy Agreement</th><td>{selectedRegistration.privacyAgreement ? 'Agreed' : 'Not Agreed'}</td></tr>
                <tr><th>Date Accomplished</th><td>{FormatDate(selectedRegistration.dateAccomplished)}</td></tr>
                <tr><th>Date Received</th><td>{FormatDate(selectedRegistration.dateReceived)}</td></tr>
                {selectedRegistration.feedback && (
                  <tr><th>Rejection Feedback</th><td className="text-danger">{selectedRegistration.feedback}</td></tr>
                )}
              </tbody>
            </table>
            
            {/* Images Section */}
            <div className="mt-4">
              <h5>Uploaded Documents</h5>
              <Row>
                {selectedRegistration.idPicture && (
                  <Col md={3} className="mb-3">
                    <div className="text-center">
                      <strong>ID Picture</strong>
                      <br />
                      <img 
                        src={selectedRegistration.idPicture} 
                        alt="ID Picture" 
                        className="img-thumbnail" 
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                      />
                    </div>
                  </Col>
                )}
                {selectedRegistration.image && (
                  <Col md={3} className="mb-3">
                    <div className="text-center">
                      <strong>1x1 Picture</strong>
                      <br />
                      <img 
                        src={selectedRegistration.image} 
                        alt="1x1 Picture" 
                        className="img-thumbnail" 
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                      />
                    </div>
                  </Col>
                )}
                {selectedRegistration.thumbmark && (
                  <Col md={3} className="mb-3">
                    <div className="text-center">
                      <strong>Thumbmark</strong>
                      <br />
                      <img 
                        src={selectedRegistration.thumbmark} 
                        alt="Thumbmark" 
                        className="img-thumbnail" 
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                      />
                    </div>
                  </Col>
                )}
                {selectedRegistration.applicantSignature && (
                  <Col md={3} className="mb-3">
                    <div className="text-center">
                      <strong>Applicant Signature</strong>
                      <br />
                      <img 
                        src={selectedRegistration.applicantSignature as string} 
                        alt="Applicant Signature" 
                        className="img-thumbnail" 
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        )}
      </Dialog>

      {/* Approve Dialog */}
      <Dialog 
        visible={approveDialog} 
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
        header="Confirm Approval"
        modal 
        footer={approveRegistrationDialogFooter} 
        onHide={hideApproveRegistrationDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-question-circle mr-3" style={{ fontSize: '2rem' }} />
          {selectedRegistration && (
            <span>
              Are you sure you want to approve the registration for <b>{selectedRegistration.firstName} {selectedRegistration.lastName}</b>?
            </span>
          )}
        </div>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        visible={rejectDialog} 
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
        header="Confirm Rejection"
        modal 
        footer={rejectRegistrationDialogFooter} 
        onHide={hideDeleteRegistrationDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          {selectedRegistration && (
            <div>
              <span>
                Are you sure you want to reject the registration for <b>{selectedRegistration.firstName} {selectedRegistration.lastName}</b>?
              </span>
              <div className="mt-3">
                <label htmlFor="feedback" className="form-label">
                  <strong>Rejection Reason (Required):</strong>
                </label>
                <textarea
                  id="feedback"
                  className="form-control"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </DashboardComponent>
  );
};

export default CourseRegistration;