import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeading = ({ title, subtitle, actionLabel, actionLink }) => {
  return (
    <div style={styles.container}>
      <div style={styles.textGroup}>
        <h3 style={styles.title}>{title}</h3>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      {actionLabel && actionLink && (
        <Link to={actionLink} style={styles.actionLink}>
          {actionLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '1.25rem',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#6b7280',
    margin: 0,
  },
  actionLink: {
    color: '#6c63ff',
    fontWeight: '600',
    fontSize: '0.88rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
};

export default SectionHeading;
