import axios from "axios";
import { APIS } from "../api/apiUrls";

const useExport = () => {
  const exportData = async (customerId, type,startDate,endDate) => {
    try {
      console.log("🚀 Starting export request...");
      
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      console.log("Export URL:", APIS.export);
      console.log("Using token:", token ? "Yes" : "No");

      // Use native axios for blob downloads to avoid interceptor issues
      const res = await axios.post(
        APIS.export,
        { customerId, exportType: type,startDate,endDate },
        { 
          responseType: "blob",
          timeout: 60000,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Response received");
      console.log("Response status:", res.status);
      console.log("Response data type:", typeof res.data);
      console.log("Is Blob?", res.data instanceof Blob);
      console.log("Blob size:", res.data?.size);

      // The response should be a Blob
      const blob = res.data;
      
      // Verify the blob has content
      if (!blob || !(blob instanceof Blob) || blob.size === 0) {
        console.error("Invalid blob received:", blob);
        throw new Error("Received empty or invalid file from server");
      }

      console.log("📦 Blob type:", blob.type);
      console.log("📦 Blob size:", blob.size, "bytes");

      // Create a download URL
      const url = window.URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header if available
      let filename = `${type}_export.xlsx`;
      if (res.headers && res.headers["content-disposition"]) {
        const contentDisposition = res.headers["content-disposition"];
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      console.log("💾 Downloading as:", filename);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log("✅ Download triggered, cleanup complete");
      }, 100);

      return { success: true, filename };
    } catch (error) {
      console.error("❌ Export error:", error);
      console.error("Error response:", error.response);
      console.error("Error details:", error.response?.data);
      
      // If blob error response, try to read it
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Error message from server:", text);
      }
      
      throw error;
    }
  };

  return { exportData };
};

export default useExport;