import {useEffect, useState} from "react";
import {ProgressBar, Text} from "@canva/app-ui-kit";
import React from "react";

const INTERVAL_DURATION_MS = 100;
const TOTAL_PROGRESS_PERCENTAGE = 100;

export default function TransformProgressBar ({
    duration, transformJobComplete
}: {
    duration: number,
    transformJobComplete: boolean;
}) {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>{
        const manageLoadingProgress = (
            duration: number,
            loading: boolean,
            setProgress: (value: number) => void,
        ) => {
            let intervalId = 0;
            let progress = 0;
            const totalSteps = (duration * 1000) / INTERVAL_DURATION_MS;

            if (transformJobComplete) setIsLoading(false);
            if (loading) {
                intervalId = window.setInterval(() =>{
                    progress += TOTAL_PROGRESS_PERCENTAGE / totalSteps;
                    // if 100 is reached, clear interval
                    if (progress >= TOTAL_PROGRESS_PERCENTAGE) {
                        clearInterval(intervalId);
                    } else{
                        setProgress(progress);
                    }
                }, INTERVAL_DURATION_MS);
            }

            // return function to clear interval
            return () => clearInterval(intervalId);
        };

        const clearLoadingProgress = manageLoadingProgress(
            duration,
            isLoading,
            setProgress,
        );

        // timeout to stop loading after specified duration
        // ensures loading state is updated to false after duration
        // call setIsLoading(false) when the job you're waiting for is completed
        const timeoutId = setTimeout(() =>{
            setIsLoading(false);
        }, duration * 1000);

        return () => {
            // cleanup to clear interval and timeout when component unmounts
            // prevents interval and timeout from continuing when user cancels
            clearLoadingProgress();
            clearTimeout(timeoutId);
        };
    }, [duration, transformJobComplete, isLoading]);

    if (isLoading){
        return (
            <ProgressBar
            value={Math.min(progress, 100)}
            ariaLabel={"loading progress bar"}
            />
        );
    } else{
        return (
            <ProgressBar
            value={100}
            ariaLabel={"loading progress bar"}/>
        )
    }
}