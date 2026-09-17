import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Downloads an .xlsx from an API route.
 *
 * The request goes through axios rather than a plain <a download> so a failure
 * surfaces as a toast instead of the browser silently saving an error page as
 * a spreadsheet.
 */
export default function ExportButton({
  url,
  params,
  label = "Excel'ga eksport",
  disabled = false,
  className = '',
}) {
  const [isExporting, setIsExporting] = useState(false);

  async function download() {
    setIsExporting(true);
    const loadingToast = toast.loading('Fayl tayyorlanmoqda...');

    try {
      const response = await axios.get(url, { params, responseType: 'blob' });

      const blobUrl = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filenameFrom(response) || 'export.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      toast.success('Fayl yuklab olindi', { id: loadingToast });
    } catch (error) {
      // An error response still arrives as a Blob, so the JSON inside it has to
      // be read back out before the message can be shown.
      let message = 'Eksport qilishda xatolik yuz berdi';
      try {
        const text = await error.response?.data?.text?.();
        if (text) message = JSON.parse(text).error || message;
      } catch {
        // Keep the generic message.
      }
      toast.error(message, { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={disabled || isExporting}
      className={
        className ||
        'border border-green-700 text-green-700 rounded-lg py-2 px-4 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {isExporting ? 'Tayyorlanmoqda...' : label}
    </button>
  );
}

/** Reads the filename the server suggested in Content-Disposition. */
function filenameFrom(response) {
  const header = response.headers?.['content-disposition'];
  if (!header) return null;
  const match = /filename="?([^"]+)"?/.exec(header);
  return match ? match[1] : null;
}
