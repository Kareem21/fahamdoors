import React from 'react';

function FeatureToggle({ label, enabled, onToggle }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
        />
        {label}
      </label>
    </div>
  );
}

export default FeatureToggle;
