import React from 'react';

function ColorPicker({ label, color, onChange }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label>
        {label}:
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </label>
    </div>
  );
}

export default ColorPicker;
