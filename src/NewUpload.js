import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@material-ui/core';
import './MyDropzone.css';

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
    const { getRootProps: getDropzoneProps1, getInputProps: getDropzoneInputProps1, isDragActive: isDragActive1 } = useDropzone({
        onDrop: onDropFile1,
        accept: '.xlsx',
        multiple: false,
    });
    const { getRootProps: getDropzoneProps2, getInputProps: getDropzoneInputProps2, isDragActive: isDragActive2 } = useDropzone({
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
                    <Box
                        {...getDropzoneProps1()}
                        className={isDragActive1 ? 'my-dropzone-active' : 'my-dropzone'}
                    >
                        <input {...getDropzoneInputProps1()} />
                        <Typography variant="h5" component="p">
                            {isFile1Picked ?(
                                <div>
                                    <p>Filename: {file1.name}</p>
                                    <p>Filetype: {file1.type}</p>
                                    <p>Size in bytes: {file1.size}</p>
                                </div>
                            ) : (
                                isDragActive1 ? "Drop the files here ..." : "Drag and drop some files here, or click to select files"
                            )}
                        </Typography>
                    </Box>
                </div>
                <div>
                    <label>Consumption File: </label>
                    <Box
                        {...getDropzoneProps2()}
                        className={isDragActive2 ? 'my-dropzone-active' : 'my-dropzone'}
                    >
                        <input {...getDropzoneInputProps2()} />
                        <Typography variant="h5" component="p">
                            {isFile2Picked ? (
                                <div>
                                    <p>Filename: {file2.name}</p>
                                    <p>Filetype: {file2.type}</p>
                                    <p>Size of file in bytes: {file2.size}</p>
                                </div>
                            ) : (
                                isDragActive2 ? 'Drop the files here ...' : 'Drag and drop some files here, or click to select files'
                            )}
                        </Typography>
                    </Box>
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