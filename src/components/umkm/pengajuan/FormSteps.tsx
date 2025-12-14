import React, { useEffect, useRef, useState } from 'react';
import { Storefront, MapPin, CheckCircle, FileText, Warning } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

const DynamicMapSelectMaster = dynamic(
    () => import('./MapSelectMaster'),
    { ssr: false }
);
const InputFileComponent = dynamic(() => import('../../common/inputfile'), { ssr: false });

export interface SubmissionData {
    lapakName: string;
    businessType: 'Makanan' | 'Jasa' | 'Retail' | '';
    description: string;
    masterLocationId: number | null;
    lokasiStatus: 'Tersedia' | 'Terlarang' | null;
    ktpFile: File | null;
    suratLainnyaFile: File | null;
    setuju: boolean;
    agreementRead: boolean;
}

interface Step3DocumentsProps {
    updateData: UpdateDataHandler;
    data: SubmissionData;
}

interface Step4AgreementProps {
    data: SubmissionData;
    updateData: UpdateDataHandler;
}

export interface SubmissionData {
    ktpFile: File | null;
    suratLainnyaFile: File | null;
}

export interface MasterLocation {
    id: number;
    koordinat: [number, number];
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    umkmName: string;
    reasonForRestriction?: string;
}

export interface SubmissionData {
    lapakName: string;
    businessType: 'Makanan' | 'Jasa' | 'Retail' | '';
    description: string;
    masterLocationId: number | null;
    lokasiStatus: 'Tersedia' | 'Terlarang' | null;
    ktpFile: File | null;
    suratLainnyaFile: File | null;
    setuju: boolean;
}

export const initialData: SubmissionData = {
    lapakName: '', businessType: '', description: '', masterLocationId: null, lokasiStatus: null, ktpFile: null, suratLainnyaFile: null, setuju: false,
    agreementRead: false
};

type UpdateDataHandler = <K extends keyof SubmissionData>(name: K, value: SubmissionData[K]) => void;

export const Step1BusinessDetails: React.FC<{ data: SubmissionData; updateData: UpdateDataHandler }> = ({ data, updateData }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><Storefront size={20} className="text-blue-500" /> Detail Usaha</h3>
        <input type="text" placeholder="Nama Lapak/Cabang" className="w-full p-3 border rounded-lg" name="lapakName" value={data.lapakName} onChange={(e) => updateData('lapakName', e.target.value)} required />
        <select className="w-full p-3 border rounded-lg" name="businessType" value={data.businessType} onChange={(e) => updateData('businessType', e.target.value as SubmissionData['businessType'])} required>
            <option value="" disabled>Pilih Jenis Usaha</option>
            <option value="Makanan">Makanan & Minuman</option>
            <option value="Jasa">Jasa</option>
            <option value="Retail">Retail</option>
        </select>
        <textarea placeholder="Deskripsi Singkat Usaha" className="w-full p-3 border rounded-lg" name="description" value={data.description} onChange={(e) => updateData('description', e.target.value)} rows={3} required />
    </div>
);

export const Step2LocationAndProof: React.FC<{ data: SubmissionData; updateData: UpdateDataHandler; masterLocations: MasterLocation[] }> = ({ data, updateData, masterLocations }) => {
    const handleLocationSelect = (id: number | null, status: 'Tersedia' | 'Terlarang' | null) => {
        if (status === 'Tersedia') {
            updateData('masterLocationId', id);
            updateData('lokasiStatus', status);
            alert(`Titik ID ${id} berhasil dipilih!`);
        } else if (status === 'Terlarang') {
            alert("Titik ini dilarang untuk pengajuan. Pilih lokasi lain.");
            updateData('masterLocationId', null);
            updateData('lokasiStatus', null);
        } else {
            updateData('masterLocationId', null);
            updateData('lokasiStatus', null);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><MapPin size={20} className="text-blue-500" /> Pemilihan Titik Lokasi Master</h3>

            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="font-semibold text-sm">Status Titik yang Dipilih:</p>
                <div className="flex items-center gap-3 mt-1">
                    {data.masterLocationId ? (
                        <span className={`text-lg font-bold flex items-center gap-2 ${data.lokasiStatus === 'Tersedia' ? 'text-green-600' : 'text-red-600'}`}>
                            <CheckCircle size={24} weight="fill" /> Titik #{data.masterLocationId} - Siap Diajukan
                        </span>
                    ) : (
                        <span className="text-red-500 text-sm italic">Belum Ada Titik Lokasi yang Dipilih.</span>
                    )}
                </div>
            </div>

            <div className="w-full aspect-video h-96 rounded-lg overflow-hidden border border-gray-300">
                <DynamicMapSelectMaster
                    masterLocations={masterLocations}
                    onSelectLocation={handleLocationSelect}
                    selectedMasterId={data.masterLocationId}
                />
            </div>

            <p className="text-xs text-gray-500">Klik pada titik berwarna **Biru (Tersedia)** di peta untuk memilih lokasi pengajuan.</p>
        </div>
    );
};

export const Step3Documents: React.FC<Step3DocumentsProps> = ({ updateData }) => {
    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            updateData('suratLainnyaFile', file);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                <FileText size={20} className="text-blue-500" /> Dokumen Pendukung
            </h3>

            <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Kartu Tanda Penduduk (KTP) Pemilik <span className="text-red-500">*</span>
                </label>
                <InputFileComponent
                    onChange={(file: File) => updateData('ktpFile', file)}
                    inputHeightClass="h-48"
                    accept="image/*,.pdf"
                    required
                />
                <p className="text-xs text-gray-500 mt-2">
                    Unggah foto/scan KTP pemilik usaha. Format: JPG, PNG, atau PDF
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Surat Pendukung Lainnya (Opsional)
                </label>
                <div className="relative">
                    <input
                        type="file"
                        onChange={handleDocumentChange}
                        accept=".pdf,image/*"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg cursor-pointer 
                       file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                       file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                       hover:file:bg-blue-100 hover:border-blue-400 transition-all duration-200
                       text-sm text-gray-600"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Surat izin usaha, NPWP, atau dokumen pendukung lainnya (opsional)
                </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                    <strong>💡 Tips:</strong> Pastikan dokumen yang diunggah jelas dan mudah dibaca.
                    Ukuran file maksimal 10MB per dokumen.
                </p>
            </div>
        </div>
    );
};

export const Step4Agreement: React.FC<Step4AgreementProps> = ({ data, updateData }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const agreementRead = data?.agreementRead ?? isAgreed;
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isAtBottom = 
      container.scrollHeight - container.scrollTop <= container.clientHeight + 5;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      if (updateData) {
        updateData('agreementRead', true);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckboxChange = (checked: boolean) => {
    setIsAgreed(checked);
    if (updateData) {
      updateData('agreementRead', checked);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Perjanjian Pemanfaatan Lokasi
      </h3>

      <div
        ref={scrollContainerRef}
        className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-scroll bg-gray-50 text-sm leading-relaxed relative"
      >
        <p className="font-bold">PASAL 1: TUJUAN DAN RUANG LINGKUP</p>
        <p className="mb-3">
          Dokumen ini mengatur hak dan kewajiban antara Pemerintah Kota (Admin) dan Pelaku UMKM 
          terkait pemanfaatan lokasi yang diajukan. Persetujuan ini bersifat mengikat dan tunduk 
          pada Peraturan Daerah No. X Tahun XXXX.
        </p>

        <p className="font-bold mt-4">PASAL 2: KEWAJIBAN PELAKU UMKM</p>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>Menjaga kebersihan dan ketertiban di area yang ditetapkan.</li>
          <li>Tidak mengubah titik lokasi yang telah disetujui tanpa izin tertulis.</li>
          <li>Bersedia dilakukan penertiban apabila melanggar aturan tata ruang.</li>
          <li>Perizinan berlaku selama 1 (satu) tahun dan harus diperpanjang.</li>
        </ol>

        <p className="font-bold mt-4">PASAL 3: PENERTIBAN DAN SANKSI</p>
        <p className="mb-4">
          Pemerintah berhak mencabut izin lokasi dan melakukan penertiban fisik tanpa pemberitahuan 
          sebelumnya apabila terjadi pelanggaran berat, termasuk namun tidak terbatas pada: 
          Penempatan lapak di zona terlarang, atau menempati trotoar.
        </p>

        <p className="font-bold mt-4">PASAL 4: PERPANJANGAN DAN PEMBATALAN</p>
        <p className="mb-4">
          Pelaku UMKM wajib mengajukan perpanjangan izin 30 (tiga puluh) hari sebelum masa berlaku 
          berakhir. Keterlambatan perpanjangan dapat mengakibatkan pencabutan izin secara otomatis.
        </p>

        <p className="font-semibold mt-6 mb-2 text-gray-700">
          Dengan ini, UMKM menyatakan telah membaca dan menyetujui semua klausul di atas.
        </p>
      </div>

      {!hasScrolledToBottom && (
        <div className="flex items-center gap-2 text-orange-600 text-xs animate-pulse">
          <Warning size={16} weight="fill" />
          <span>Scroll ke bawah untuk membaca semua peraturan</span>
        </div>
      )}

      <div className="mt-4">
        <label 
          className={`flex items-start text-sm pt-4 ${
            !hasScrolledToBottom ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            className="mr-2 mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:cursor-not-allowed"
            checked={agreementRead && hasScrolledToBottom}
            disabled={!hasScrolledToBottom}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
          />
          <span>
            Saya telah membaca dan menyetujui semua ketentuan dalam Perjanjian Pemanfaatan Lokasi. 
            <span className="text-red-500"> *</span>
          </span>
        </label>

        {hasScrolledToBottom && !agreementRead && (
          <p className="text-xs text-red-500 mt-2 ml-6">
            Anda harus menyetujui perjanjian untuk melanjutkan.
          </p>
        )}

        {hasScrolledToBottom && agreementRead && (
          <div className="flex items-center gap-2 text-green-600 text-xs mt-2 ml-6">
            <CheckCircle size={16} weight="fill" />
            <span>Perjanjian telah disetujui</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface Step5SummaryProps {
  data: SubmissionData;
  updateData: UpdateDataHandler;
}

export const Step5Summary: React.FC<Step5SummaryProps> = ({ data, updateData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
      <CheckCircle size={20} className="text-blue-500" /> Ringkasan Pengajuan
    </h3>
    
    <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
      <p><strong>Nama Lapak:</strong> {data?.lapakName || 'N/A'}</p>
      <p><strong>Jenis Usaha:</strong> {data?.businessType || 'N/A'}</p>
      <p><strong>Titik Lokasi:</strong> {data?.masterLocationId ? `ID Master ${data.masterLocationId} (${data.lokasiStatus})` : 'Belum Dipilih'}</p>
      <p><strong>KTP:</strong> {data?.ktpFile?.name || 'Belum diunggah'}</p>
      <p><strong>Dokumen Lainnya:</strong> {data?.suratLainnyaFile?.name || 'Tidak ada'}</p>
    </div>

    <label className="flex items-center text-sm pt-4 cursor-pointer">
      <input
        type="checkbox"
        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
        checked={data?.setuju ?? false}
        onChange={(e) => updateData('setuju', e.target.checked)}
      />
      Saya mengonfirmasi bahwa semua data di atas benar dan bertanggung jawab atas kebenaran informasi yang diberikan. 
      <span className="text-red-500"> *</span>
    </label>

    {!data?.setuju && (
      <p className="text-xs text-red-500">Konfirmasi akhir diperlukan sebelum mengirim pengajuan.</p>
    )}

    {data?.setuju && (
      <div className="flex items-center gap-2 text-green-600 text-xs">
        <CheckCircle size={16} weight="fill" />
        <span>Siap untuk diajukan!</span>
      </div>
    )}
  </div>
);