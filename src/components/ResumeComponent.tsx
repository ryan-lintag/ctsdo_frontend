import React, { useRef } from "react";
import "./ResumeComponent.css";
import type { Portfolio } from "../types/common.types";
import { FaFacebook, FaGithub, FaGlobe, FaInstagram, FaLink, FaLinkedin, FaTwitter } from "react-icons/fa";

// a lightweight resume shape (the structure you provided)
export interface SimpleResume {
  name: string;
  photoUrl?: string;
  contact?: { email?: string; phone?: string; address?: string };
  education?: { school: string; degree?: string; year?: string }[];
  experience?: { company: string; period?: string; description?: string }[];
  skills?: { name: string; level?: number }[]; // level 1-5
  socialLinks?: { platform: string; url: string }[];
  profileSummary?: string;
  contactNumber?: string;
  address?: string;
}

type ResumeInput = Portfolio | SimpleResume;

interface ResumeProps {
  data: ResumeInput;
}

const ResumeComponent: React.FC<ResumeProps> = ({ data }) => {
  // normalize incoming data so the template can render consistently
  const isPortfolio = (d: ResumeInput): d is Portfolio => (d as Portfolio).profile !== undefined;
  const normalized: SimpleResume = isPortfolio(data)
    ? {
        name: [data.profile.firstName, data.profile.middleName, data.profile.lastName].filter(Boolean).join(' '),
        photoUrl: data.profile.profilePicture,
        contact: { 
          email: data.profile.email,
          phone: data.profile.contactNumber,
          address: data.profile.address
        },
        education: [],
        experience: [],
        skills: data.profile.highlightedSkills?.map(s => ({ name: s, level: 3 })) ?? [],
        socialLinks: data.profile.socialLinks?.map(s => ({ platform: s.platform, url: s.url })) ?? [],
        profileSummary: data.profile.bio ?? ''
      }
    : data;
  const resumeRef = useRef<HTMLDivElement>(null);

  const skillPct = (level?: number) => `${Math.max(0, Math.min(10, level ?? 3)) * 10}%`;
  
  const getSocialIcon = (platform: string) => {
      switch (platform) {
        case "linkedin":
          return <FaLinkedin className="text-primary" />;
        case "github":
          return <FaGithub className="text-dark" />;
        case "facebook":
          return <FaFacebook className="text-primary" />;
        case "twitter":
          return <FaTwitter className="text-info" />;
        case "instagram":
          return <FaInstagram className="text-danger" />;
        case "website":
          return <FaGlobe className="text-success" />;
        default:
          return <FaLink className="text-secondary" />;
      }
    };

  return (
    <div className="resume" ref={resumeRef}>
      {/* LEFT SIDE */}
      <div className="resume-left">
        <div className="profile-photo">
          <img src={normalized.photoUrl ?? '/logo.png'} alt={normalized.name} />
        </div>

        <div className="contact">
          <h3>CONTACT</h3>
          {normalized.contact?.email && <p>📧 {normalized.contact.email}</p>}
          {normalized.contact?.phone && <p>📞 {normalized.contact.phone}</p>}
          {normalized.contact?.address && <p>🏠 {normalized.contact.address}</p>}
        </div>

        <div className="contact">
          <h3>SOCIAL LINKS</h3>
          {normalized.socialLinks?.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none mb-3 d-block"
            >
              <p>{getSocialIcon(link.platform)}
                {' ' + link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                {link.url && <span className="text-muted text-white"> ({link.url})</span>}
              </p>
            </a>
          ))}
        </div>

        {normalized.skills && normalized.skills.length > 0 && (
          <div className="skills">
            <h3>SKILLS</h3>
            {normalized.skills.map((s: { name: string; level?: number }, idx: number) => (
              <div className="skill" key={idx}>
                <p>{s.name}</p>
                <div className="bar"><div className="fill" style={{ width: skillPct(s.level) }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="resume-right">
        <div className="header">
          <h1>{normalized.name}</h1>
          {normalized.profileSummary && <p className="lead">{normalized.profileSummary}</p>}
        </div>

        {normalized.education && normalized.education.length > 0 && (
          <section>
            <h3 className="section-title">EDUCATION</h3>
            <ul>
              {normalized.education.map((ed, i) => (
                <li key={i}>
                  <strong>{ed.school}</strong>
                  {ed.year ? <><br />({ed.year})</> : ''}
                  {ed.degree ? <><br />{ed.degree}</> : ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        {normalized.experience && normalized.experience.length > 0 && (
          <section>
            <h3 className="section-title">WORK EXPERIENCE</h3>
            <ul>
              {normalized.experience.map((ex, i) => (
                <li key={i}>
                  <strong>{ex.company}</strong>
                  {ex.period ? <><br />({ex.period})</> : ''}
                  {ex.description ? <><br />{ex.description}</> : ''}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumeComponent;
