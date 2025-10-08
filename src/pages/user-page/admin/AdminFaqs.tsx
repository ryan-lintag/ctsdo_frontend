import React, { useEffect, useState } from 'react';
import { DashboardComponent } from '../../../components/DashboardComponent';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { LoaderBoundary } from '../../../components/LoaderBoundary';
import TableComponent from '../../../components/TableComponent';
import { deleteReq, getReq, postReq, putReq } from '../../../lib/axios';

interface Faq {
  _id: string;
  question: string;
  answer: string;
}

const FAQ_DEFAULT = { _id: '', question: '', answer: '' };

const AdminFaqs: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faq, setFaq] = useState<Faq>(FAQ_DEFAULT);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await getReq('/api/faqs');
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (faq._id) await putReq(`/api/faqs/${faq._id}`, faq);
      else await postReq('/api/faqs', faq);
      await fetchFaqs();
    } catch (err) {
      console.error('Failed to submit FAQ', err);
    } finally {
      setShowForm(false);
      setFaq(FAQ_DEFAULT);
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Faq) => {
    setFaq(item);
    setShowForm(true);
  };

  const confirmDeleteFaq = (item: Faq) => {
    setFaq(item);
    setDeleteDialog(true);
  };

  const deleteFaq = async () => {
    setDeleteDialog(false);
    setIsLoading(true);
    try {
      await deleteReq(`/api/faqs/${faq._id}`);
      await fetchFaqs();
    } catch (err) {
      console.error('Failed to delete FAQ', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hideDeleteDialog = () => setDeleteDialog(false);

  const faqTableActions = (item: Faq) => (
    <>
      <PrimeButton
        icon="pi pi-pencil"
        outlined
        style={{ borderRadius: '50px', width: '40px', height: '40px', marginRight: '0.5rem' }}
        onClick={() => handleEdit(item)}
      />
      <PrimeButton
        icon="pi pi-trash"
        severity="danger"
        outlined
        style={{ borderRadius: '50px', width: '40px', height: '40px' }}
        onClick={() => confirmDeleteFaq(item)}
      />
    </>
  );

  return (
    <DashboardComponent>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="dashboard-title">FAQs Management</h2>
        <PrimeButton
          icon="pi pi-plus"
          severity="success"
          outlined
          style={{ borderRadius: '50px', width: '40px', height: '40px' }}
          onClick={() => { setFaq(FAQ_DEFAULT); setShowForm(true); }}
        />
      </div>

      <LoaderBoundary isLoading={isLoading}>
        {showForm && (
          <div className="card p-4 mb-4">
            <h4>{faq._id ? 'Edit FAQ' : 'Add FAQ'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => setFaq({ ...faq, question: e.target.value })}
                  required
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => setFaq({ ...faq, answer: e.target.value })}
                  required
                />
              </div>
              <div>
                <button className="btn btn-primary me-2" type="submit">{faq._id ? 'Save' : 'Add'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => { setShowForm(false); setFaq(FAQ_DEFAULT); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          <TableComponent
            title=""
            columns={[
              { field: 'question', header: 'Question', isSortable: true },
              { field: 'answer', header: 'Answer', isSortable: false },
              { field: '_id', header: 'Actions', body: faqTableActions },
            ]}
            data={faqs}
          />
        )}
      </LoaderBoundary>

      <Dialog
        visible={deleteDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={
          <>
            <PrimeButton label="No" icon="pi pi-times" outlined className="me-3" onClick={hideDeleteDialog} />
            <PrimeButton label="Yes" icon="pi pi-check" severity="danger" onClick={deleteFaq} />
          </>
        }
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle me-3" style={{ fontSize: '2rem' }} />
          {faq && <span>Are you sure you want to delete <b>{faq.question}</b>?</span>}
        </div>
      </Dialog>
    </DashboardComponent>
  );
};

export default AdminFaqs;
