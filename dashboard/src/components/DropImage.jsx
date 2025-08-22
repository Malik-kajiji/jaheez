import React, { useEffect, useState } from 'react';
import {useDropzone} from 'react-dropzone';

function DropImage({children,setAcceptedFile,maxFiles}) {
    const [files, setFiles] = useState([]);
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
            accept: {
                'image/jpeg': [],
                'image/png': [],
                'image/svg': [],
                'image/jpg': [],
                'image/gif': []
            },
            onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
            },
            maxFiles,
            maxSize:5000000
        });

        useEffect(()=>{
            const fileToBase64 = async () => {
                let result = []
                for(let i = 0; i<acceptedFiles.length;i++){
                    const file = await convertImageToBase64(acceptedFiles[i])
                    result.push(file)
                }
                setAcceptedFile(result)
            }
            fileToBase64()
        },[acceptedFiles])

    return (
        <section>
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {children}
        </div>
        </section>
    );
}

export default DropImage;

function convertImageToBase64(file){
    return new Promise((resolve,reject)=> {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
            resolve(fileReader.result)
        }
        fileReader.onerror = (error) => {
            reject(error)
        }
    })
}