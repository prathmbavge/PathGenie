import { useRef, useCallback } from "react";
import { showErrorToast } from "../../../utils/toastUtils";
import { requestHandler } from "../../../utils/index";
import { downloadResources } from "../../api/mindmapApi";
/**
 * Hook: useDownloadResources
 * - setLoading: state setter for loading state
 */
export const useDownloadResources = (setLoading) => {
    const abortControllerRef = useRef(null);

    const downloadResourcesHandler = useCallback(
        (nodeId, format = "pdf") => {
            console.log("Downloading resources for node:", nodeId, "Format:", format);
            if (!nodeId) {
                showErrorToast("Node ID is required");
                return;
            }

            // Validate format
            if (!["pdf", "doc"].includes(format)) {
                showErrorToast("Invalid format. Use 'pdf' or 'doc'");
                return;
            }

            // Abort any ongoing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();


            // Make API call to generate document   
            requestHandler(
                () => downloadResources(nodeId, format, abortControllerRef.current.signal),
                setLoading,
                "Downloading resources...",
                (response) => {
                    // console.log("Download response:", response);
                    // Extract filename from Content-Disposition header
                    const contentDisposition = response.headers['content-disposition'];
                    const fileNameMatch = contentDisposition
                        ? contentDisposition.match(/filename="(.+)"/)
                        : null;
                    const fileName = fileNameMatch
                        ? fileNameMatch[1]
                        : `node_${nodeId}.${format === 'pdf' ? 'pdf' : 'docx'}`;

                    // Create a Blob URL and trigger download
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', fileName);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }
            );
        },
        [setLoading]
    );

    return downloadResourcesHandler;
};
