export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;

async function loadPdfJs() {
    if (pdfjsLib) return pdfjsLib;

    if (typeof window === "undefined") {
        throw new Error("pdfjs only runs in browser");
    }

    // @ts-expect-error pdfjs ESM
    const lib = await import("pdfjs-dist/build/pdf.mjs");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");

    lib.GlobalWorkerOptions.workerSrc = worker.default;
    pdfjsLib = lib;

    return lib;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const pdfjs = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({data: arrayBuffer}).promise;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({scale: 2});

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport,
        }).promise;

        return await new Promise<PdfConversionResult>((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve({
                        imageUrl: "",
                        file: null,
                        error: "Failed to create image blob",
                    });
                    return;
                }

                const imageFile = new File([blob], "page.png", {
                    type: "image/png",
                });

                resolve({
                    file: imageFile,
                    imageUrl: URL.createObjectURL(blob),
                });
            });
        });
    } catch (err: any) {
        return {
            imageUrl: "",
            file: null,
            error: err?.message ?? "PDF conversion failed",
        };
    }
}
