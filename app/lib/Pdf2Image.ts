// pdf2img.ts
/*
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
*/
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;


export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

// 👉 worker y core SIEMPRE de la misma versión
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
        }).promise;

        const page = await pdf.getPage(1);

        const viewport = page.getViewport({scale: 4});

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            return {
                imageUrl: "",
                file: null,
                error: "Failed to get canvas context",
            };
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        await page.render({
            canvas,
            viewport,
        }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                        return;
                    }

                    const baseName = file.name.replace(/\.pdf$/i, "");
                    const imageFile = new File([blob], `${baseName}.png`, {
                        type: "image/png",
                    });

                    resolve({
                        imageUrl: URL.createObjectURL(blob),
                        file: imageFile,
                    });
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${String(err)}`,
        };
    }
}
