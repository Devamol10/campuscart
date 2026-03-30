import React from 'react';

const ProductGrid = ({ children, layout = 'grid' }) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
    width: '100%',
    animation: 'fadeIn 0.3s ease',
  };

  const rowStyle = {
    display: 'flex',
    gap: '1.25rem',
    overflowX: 'auto',
    paddingBottom: '1rem',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <div style={layout === 'row' ? rowStyle : gridStyle}>
      {layout === 'row'
        ? React.Children.map(children, (child) => (
            <div style={{ minWidth: '280px', maxWidth: '300px', flexShrink: 0 }}>{child}</div>
          ))
        : children}
    </div>
  );
};

export default ProductGrid;
