import React, { useCallback } from 'react';

function FileUpload({ onUpload }) {
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
      const url = URL.createObjectURL(file);
      onUpload(url);
    } else {
      alert('Please upload a valid GLTF or GLB file.');
    }
  }, [onUpload]);
  return (
    <div>
      <h3>Upload GLTF Model</h3>
      <input type="file" accept=".gltf,.glb" onChange={handleFileChange} />
    </div>
  );
}

export default FileUpload;
