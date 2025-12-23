import React, {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import {resumes} from "../../constants";
import ResumeCard from "~/components/ResumeCard";
import FileUploader from "~/components/FileUploader";

const Upload = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (f: File | null) => {
        setFile(f)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {

    }
    return (
        <main className="bg-[url('images/bg-main.svg')] bg-cover">
            <Navbar/>
            <section className="main-section">
                <div className="page-heading py-15">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2><img src={"/public/images/resume-scan.gift"} className={"w-full"}/>
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )
                    }
                    {!isProcessing && (
                        <form id={"upload-form"} onSubmit={handleSubmit} className={"flex flex-col gap-4 mt-8"}>
                            <div className={"form-div"}>
                                <label htmlFor={"company-name"}>Company name</label>
                                <input type={"text"} name={"company-name"} placeholder={"Your company name..."}
                                       id={"company-name"}/>
                            </div>
                            <div className={"form-div"}>
                                <label htmlFor={"job-title"}>Job title</label>
                                <input type={"text"} name={"job-title"} placeholder={"Your job title..."}
                                       id={"job-title"}/>
                            </div>
                            <div className={"form-div"}>
                                <label htmlFor={"job-description"}>Job description</label>
                                <textarea rows={5} name={"job-description"} placeholder={"Your job description..."}
                                          id={"job description"}/>
                            </div>
                            <div className={"form-div"}>
                                <label htmlFor={"uploader"}>Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>
                            <button className={"primary-button"} type={"submit"}>
                                Analyze resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
