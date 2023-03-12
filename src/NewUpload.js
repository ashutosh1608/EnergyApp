import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

function NewUpload() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [isFile1Picked, setIsFile1Picked] = useState(false);
    const [isFile2Picked, setIsFile2Picked] = useState(false);
    const [floatValue, setFloatValue] = useState('');
    const [zipFileUrl, setZipFileUrl] = useState(null);
    const onDropFile1 = (acceptedFiles) => {
        setFile1(acceptedFiles[0]);
        setIsFile1Picked(true);
    }
    const onDropFile2 = (acceptedFiles) => {
        setFile2(acceptedFiles[0]);
        setIsFile2Picked(true);
    }
    const { getRootProps: getDropzoneProps1, getInputProps: getDropzoneInputProps1 } = useDropzone({
        onDrop: onDropFile1,
        accept: '.xlsx',
        multiple: false,
    });
    const { getRootProps: getDropzoneProps2, getInputProps: getDropzoneInputProps2 } = useDropzone({
        onDrop: onDropFile2,
        accept: '.xlsx',
        multiple: false,
    });
    const handleChange = (event) => {
        setFloatValue(event.target.value);
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('generation', file1);
        formData.append('consumption', file2);
        formData.append('charge_per_unit', floatValue);
        axios.post('http://127.0.0.1:5000/generate_graphs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob'
        })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setZipFileUrl(url);
        })
        .catch(error => {
            console.error(error);
        });
    };
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = zipFileUrl;
        link.setAttribute('download', 'graphs.zip');
        document.body.appendChild(link);
        link.click();
    };
    return(
        <div className='App'>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Generation File: </label>
                    <div {...getDropzoneProps1()}>
                        <input {...getDropzoneInputProps1()} />
                        <p>Drag and drop generation file here, or click to select a file</p>
                    </div>
                </div>
                <div>
                    <label>Consumption File: </label>
                    <div {...getDropzoneProps2()}>
                        <input {...getDropzoneInputProps2()} />
                        <p>Drag and drop consumption file here, or click to select a file</p>
                    </div>
                </div>
                <div>
                    <label>Charge per Unit: </label>
                    <input type="number" value={floatValue} onChange={handleChange} />
                </div>
                <button type='submit'>Submit</button>
            </form>
            {zipFileUrl && (
                <div>
                    <button onClick={handleDownload}>Download zip containing graphs</button>
                </div>
            )}
        </div>
    );
}
export default NewUpload;