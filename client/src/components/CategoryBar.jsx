import React from 'react';

const categories = [
  { id: 'all', label: 'All', icon: '🏠' },
  { id: '1', label: 'Electronics', icon: '💻' },
  { id: '2', label: 'Books', icon: '📚' },
  { id: '3', label: 'Stationery', icon: '✏️' },
  { id: '4', label: 'Furniture', icon: '🪑' },
  { id: '5', label: 'Lab Equipment', icon: '🧪' },
  { id: '6', label: 'Sports', icon: '⚽' },
  { id: '7', label: 'Clothing', icon: '👕' },
  { id: '8', label: 'Other', icon: '📦' },
];

const CategoryBar = ({ activeCategory = 'All', onSelect }) => {
  return (
    <div style={styles.bar}>
      <div style={styles.inner}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.label;
          return (
            <button
              key={cat.id}
              style={{
                ...styles.chip,
                ...(isActive ? styles.chipActive : {}),
              }}
              onClick={() => onSelect && onSelect(cat.label)}
            >
              <span style={styles.chipIcon}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  bar: {
    width: '100%',
    background: 'rgba(17, 24, 39, 0.7)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0.65rem 1.5rem',
    display: 'flex',
    gap: '0.5rem',
    minWidth: 'max-content',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#9ca3af',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    background: 'rgba(108, 99, 255, 0.15)',
    borderColor: 'rgba(108, 99, 255, 0.35)',
    color: '#a5b4fc',
  },
  chipIcon: {
    fontSize: '0.95rem',
  },
};

export default CategoryBar;
