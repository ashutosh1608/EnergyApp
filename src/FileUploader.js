import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';

function FileUploader() {
  const [generationFile, setGenerationFile] = useState(null);
  const [consumptionFile, setConsumptionFile] = useState(null);
  const [chargePerUnit, setChargePerUnit] = useState('');

  const handleFileUpload = (files, type) => {
    if (type === 'generation') {
      setGenerationFile(files[0]);
    } else if (type === 'consumption') {
      setConsumptionFile(files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('generation', generationFile);
    formData.append('consumption', consumptionFile);
    formData.append('charge_per_unit', chargePerUnit);

    const response = await axios.post(
      'http://localhost:5000/generate_graphs',
      formData,
      {
        responseType: 'blob',
      }
    );

    const downloadUrl = window.URL.createObjectURL(
      new Blob([response.data])
    );
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'graphs.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Dropzone onDrop={(acceptedFiles) => handleFileUpload(acceptedFiles, 'generation')}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop generation file here, or click to select file</p>
            </div>
          </section>
        )}
      </Dropzone>
      <Dropzone onDrop={(acceptedFiles) => handleFileUpload(acceptedFiles, 'consumption')}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop consumption file here, or click to select file</p>
            </div>
          </section>
        )}
      </Dropzone>
      <label>
        Charge per unit:
        <input
          type="number"
          value={chargePerUnit}
          onChange={(event) => setChargePerUnit(event.target.value)}
        />
      </label>
      <button type="submit">Generate graphs</button>
    </form>
  );
}

export default FileUploader;
