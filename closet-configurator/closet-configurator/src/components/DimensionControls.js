import React from 'react';

function DimensionControls({ dimensions, onChange }) {
  return (
    <div>
      <h3>Dimensions</h3>
      {Object.entries(dimensions).map(([dimension, value]) => (
        <div key={dimension} style={{ marginBottom: '10px' }}>
          <label>
            {dimension.charAt(0).toUpperCase() + dimension.slice(1)}:
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(dimension, parseFloat(e.target.value))}
              step="0.1"
              min="0.1"
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}

export default DimensionControls;
