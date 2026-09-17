import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Two-step Excel import: the file is checked first and the user sees what will
 * happen, then confirms. The same File object is sent again on confirm, so
 * nothing needs to be held server-side between the two calls.
 */
export default function ImportProducts({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    onDrop: (accepted) => {
      if (accepted[0]) checkFile(accepted[0]);
    },
  });

  function reset() {
    setFile(null);
    setReport(null);
    setError('');
    setIsChecking(false);
    setIsImporting(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function checkFile(selected) {
    setFile(selected);
    setReport(null);
    setError('');
    setIsChecking(true);

    const formData = new FormData();
    formData.append('file', selected);
    formData.append('dryRun', 'true');

    try {
      const response = await axios.post('/api/products/import', formData);
      setReport(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Faylni tekshirishda xatolik yuz berdi");
      setFile(null);
    } finally {
      setIsChecking(false);
    }
  }

  async function confirmImport() {
    setIsImporting(true);
    const loadingToast = toast.loading('Import qilinmoqda...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/products/import', formData);
      toast.success(response.data.data.message, { id: loadingToast });
      onImported();
      close();
    } catch (err) {
      const message = err.response?.data?.error || 'Import qilishda xatolik yuz berdi';
      toast.error(message, { id: loadingToast });
      setError(message);
    } finally {
      setIsImporting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Excel'dan import qilish</h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Yopish"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="text-blue-900 font-semibold mb-1">Fayl qanday bo'lishi kerak?</p>
            <p className="text-blue-800 mb-2">
              Birinchi qator ustun nomlari: <strong>Nomi</strong>, <strong>Narxi</strong>,
              Kategoriya, Tavsif, Miqdor, SKU, Rasmlar. Nomi va Narxi majburiy.
            </p>
            <a
              href="/api/products/import"
              className="text-blue-700 underline font-semibold"
              download
            >
              Namuna faylni yuklab olish
            </a>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {!report && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isChecking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} disabled={isChecking} />
              {isChecking ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
                  <p className="text-gray-600">Fayl tekshirilmoqda...</p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 mb-1">
                    Faylni bu yerga torting yoki bosing
                  </p>
                  <p className="text-sm text-gray-500">.xlsx yoki .csv (max 5MB)</p>
                </>
              )}
            </div>
          )}

          {report && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{file?.name}</p>
                  <p className="text-sm text-gray-600">{report.total} ta qator o'qildi</p>
                </div>
                <button
                  onClick={reset}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={isImporting}
                >
                  Boshqa fayl
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm font-semibold">Qo'shiladi</p>
                  <p className="text-2xl font-bold text-green-900">{report.validCount}</p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${
                    report.invalid.length > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      report.invalid.length > 0 ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    O'tkazib yuboriladi
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      report.invalid.length > 0 ? 'text-red-900' : 'text-gray-700'
                    }`}
                  >
                    {report.invalid.length}
                  </p>
                </div>
              </div>

              {report.unknownHeaders.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">
                    Tanilmagan ustunlar (e'tiborga olinmaydi):
                  </p>
                  <p className="text-yellow-700">{report.unknownHeaders.join(', ')}</p>
                </div>
              )}

              {report.invalid.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <p className="px-3 py-2 bg-red-50 font-semibold text-red-800 text-sm">
                    Xatolik bor qatorlar
                  </p>
                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                    {report.invalid.map((row) => (
                      <p key={row.rowNumber} className="px-3 py-2 text-sm text-gray-700">
                        <span className="font-semibold">{row.rowNumber}-qator:</span>{' '}
                        {row.errors.join('; ')}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {report.warnings.length > 0 && (
                <div className="border border-yellow-200 rounded-lg overflow-hidden">
                  <p className="px-3 py-2 bg-yellow-50 font-semibold text-yellow-800 text-sm">
                    Ogohlantirishlar (import qilinadi)
                  </p>
                  <div className="max-h-32 overflow-y-auto divide-y divide-gray-100">
                    {report.warnings.map((w, i) => (
                      <p key={i} className="px-3 py-2 text-sm text-gray-700">
                        <span className="font-semibold">{w.rowNumber}-qator:</span> {w.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {report.preview.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <p className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 text-sm">
                    Namuna (birinchi {report.preview.length} ta)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100">
                        {report.preview.map((p, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{p.title}</td>
                            <td className="px-3 py-2 text-gray-500">{p.category}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              {p.price.toLocaleString()} so'm
                            </td>
                            <td className="px-3 py-2 text-center text-gray-500">
                              {p.stock} dona
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end p-6 border-t border-gray-200">
          <button
            onClick={close}
            disabled={isImporting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={confirmImport}
            disabled={!report || report.validCount === 0 || isImporting}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isImporting
              ? 'Import qilinmoqda...'
              : report
              ? `${report.validCount} ta mahsulotni qo'shish`
              : 'Import qilish'}
          </button>
        </div>
      </div>
    </div>
  );
}
