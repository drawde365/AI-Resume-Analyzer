import React, {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import {prepareInstructions, resumes} from "../../constants";
import ResumeCard from "~/components/ResumeCard";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/Pdf2Image";
import {generateUUID} from "~/lib/utils";

const Upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}: {
        companyName: string, jobTitle: string, jobDescription: string, file: File
    }) => {
        setIsProcessing(true);

        setStatusText("Uploading resume...");
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText("Failed to upload file.");

        setStatusText("Converting to image...");
        console.log(file);
        const imageFile = await convertPdfToImage(file);
        console.log(imageFile);
        if (!imageFile.file) return setStatusText("Failed to convert PDF to image.");

        setStatusText("Uploading image...");
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText("Failed to upload image file.");

        setStatusText("Preparing data...");
        const uuid = generateUUID();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: "",
        };
        await kv.set(`resume-${uuid}`, JSON.stringify(data));
        setStatusText("Analyzing resume...");
        const feedback = await ai.feedback(data.resumePath,
            prepareInstructions({jobTitle, jobDescription}));
        if (!feedback) return setStatusText("Failed to analyze resume.");
        const feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text;
        data.feedback = feedbackText;
        await kv.set(`resume-${uuid}`, JSON.stringify(data));

        setStatusText("Analysis complete!");
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleFileSelect = (f: File | null) => {
        setFile(f);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form");
        if (!form) return;
        const fromData = new FormData(form);
        const companyName = fromData.get("company-name") as string;
        const jobTitle = fromData.get("job-title") as string;
        const jobDescription = fromData.get("job-description") as string;
        if (!file) return;
        handleAnalyze({companyName, jobTitle, jobDescription, file});
    }
    return (
        <main className="bg-[url('images/bg-main.svg')] bg-cover">
            <Navbar/>
            <section className="main-section">
                <div className="page-heading py-15">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2><img src={"/images/resume-scan.gif"} className={"w-full"}/>
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
