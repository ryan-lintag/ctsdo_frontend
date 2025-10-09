import React, { useEffect, useState } from 'react';
import { ContentWrapper } from '../../components/ContentWrapper';
import { getReq } from '../../lib/axios';

// Define the FAQ type
interface Faq {
  _id: string;
  question: string;
  answer: string;
}

const FaqSection: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFaqs = async (): Promise<void> => {
      try {
        const response = await getReq(`${import.meta.env.VITE_API_BASE_URL}/api/faqs`) as any;
        setFaqs(response.data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  return (
    <ContentWrapper>
      <div style={{ padding: '2rem', background: '#eef3f7', borderRadius: '8px' }}>
        <h3>Frequently Asked Questions</h3>
        {loading ? (
          <p>Loading FAQs...</p>
        ) : faqs.length === 0 ? (
          <p>No FAQs available at the moment.</p>
        ) : (
          <ul>
            {faqs.map((faq: Faq) => (
              <li key={faq._id} style={{ marginBottom: '1rem' }}>
                <strong>Q: {faq.question}</strong>
                <p style={{ marginLeft: '1rem' }}>A: {faq.answer}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ContentWrapper>
  );
};

export default FaqSection;
