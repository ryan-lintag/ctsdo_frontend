import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ResumeComponentFirst.css";

type Contact = {
  email: string;
  phone: string;
};

type Education = {
  school: string;
  year: string;
};

type Experience = {
  company: string;
  period: string;
  description: string;
};

type Skill = {
  name: string;
  level: number;
};

export interface ResumeData {
  name: string;
  title?: string;
  profile?: string;
  photoUrl?: string;
  contact: Contact;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  interests?: string[];
}

interface ResumeComponentProps {
  data: ResumeData;
}

const ResumeComponentFirst: React.FC<ResumeComponentProps> = ({ data }) => {
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = resumeRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);

    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.name.replace(/\s+/g, "_")}_Resume.pdf`);
  };

  const {
    name,
    title,
    profile,
    photoUrl,
    contact,
    education,
    experience,
    skills,
    interests,
  } = data;

  return (
    <div className="resume-wrapper" ref={resumeRef}>
      <aside className="sidebar">
        <div className="profile-photo">
          {photoUrl && <img src={photoUrl} alt={name} />}
        </div>

        <section className="sidebar-section">
          <h3>CONTACTS</h3>
          <p>📞 {contact.phone}</p>
          <p>📧 {contact.email}</p>
        </section>

        <section className="sidebar-section">
          <h3>EDUCATION</h3>
          {education.map((edu, index) => (
            <div key={index} className="edu-item">
              <p className="edu-year">{edu.year}</p>
              <p className="edu-school">{edu.school}</p>
            </div>
          ))}
        </section>

        <section className="sidebar-section">
          <h3>SKILLS</h3>
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <span>{skill.name}</span>
              <div className="skill-bar">
                <div
                  className="skill-progress"
                  style={{ width: `${(skill.level / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </section>
      </aside>

      <main className="main-content">
        <div className="header-top">
          <div>
            <h1>{name}</h1>
            {title && <h2>{title}</h2>}
          </div>
          <button className="download-btn" onClick={handleDownloadPDF}>
            ⬇ Download PDF
          </button>
        </div>

        {profile && (
          <section className="profile-section">
            <h3>PROFILE</h3>
            <p>{profile}</p>
          </section>
        )}

        <section className="experience-section">
          <h3>EXPERIENCE</h3>
          {experience.map((exp, index) => (
            <div key={index} className="exp-item">
              <div className="exp-left">
                <p className="exp-period">{exp.period}</p>
              </div>
              <div className="exp-right">
                <h4>{exp.company}</h4>
                <p>{exp.description}</p>
              </div>
            </div>
          ))}
        </section>

        {interests && (
          <section className="interests-section">
            <h3>INTERESTS</h3>
            <div className="interests-list">
              {interests.map((i, idx) => (
                <span key={idx} className="interest-tag">
                  {i}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ResumeComponentFirst;
