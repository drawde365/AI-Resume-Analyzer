import React from 'react';
import ScoreGauge from "~/components/ScoreGauge";

const Category = ({title, score}: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600' : score > 49 ? 'text-yellow-600' : 'text-red-600';
    return (
        <div className={"resume-summary"}>
            <div className={"category"}>
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p>{title}</p>
                </div>
                <p className="text-2xl">
                    <span className={textColor}>{score}</span>
                    /100
                </p>
            </div>
        </div>
    )
}

const Sumary = ({feedback}: { feedback: Feedback }) => {
    console.log(feedback);
    return (

        <div className="bg-white rounded-2xl shadow-md w-full">
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreGauge score={feedback.overallScore}/>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Your Resume Score</h2>
                    <p className="text-sm text-gray-500">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>
            {feedback.toneAndStyle.score === null ? (
                <div>Es null</div>
            ) : (
                <div>No es null</div>
            )
            }
        </div>
    );
};

export default Sumary;
