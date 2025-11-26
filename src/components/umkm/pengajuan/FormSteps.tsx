import React from 'react';
import { Storefront, MapPin, CheckCircle, FileText } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

const DynamicMapSelectMaster = dynamic(
    () => import('./MapSelectMaster'), 
    { ssr: false }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InputFile = ({ onChange, inputHeightClass, ...props }: any) => (
    <input
        type="file"
        className={inputHeightClass}
        onChange={(e) => { if (e.target.files) onChange(e.target.files[0]); }}
        {...props}
    />
);

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

export const Step3Documents: React.FC<{ updateData: UpdateDataHandler }> = ({ updateData }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><FileText size={20} className="text-blue-500" /> Dokumen Pendukung</h3>
        <div>
            <label className="block text-sm font-medium mb-1">Kartu Tanda Penduduk (KTP) Pemilik (Wajib)</label>
            <InputFile onChange={(file: File) => updateData('ktpFile', file)} inputHeightClass="h-24" accept="image/*,.pdf" required />
            <p className="text-xs text-gray-500 mt-1">Unggah foto/scan KTP pemilik usaha.</p>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Surat Pendukung Lainnya (Opsional)</label>
            <InputFile onChange={(file: File) => updateData('suratLainnyaFile', file)} inputHeightClass="h-24" accept=".pdf, image/*" />
        </div>
    </div>
);

export const Step4Agreement: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Perjanjian Pemanfaatan Lokasi</h3>
        <div className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-scroll bg-gray-50 text-sm leading-relaxed">
            <p className="font-bold">PASAL 1: TUJUAN DAN RUANG LINGKUP</p>
            <p className="mb-3">Dokumen ini mengatur hak dan kewajiban antara Pemerintah Kota (Admin) dan Pelaku UMKM terkait pemanfaatan lokasi yang diajukan. Persetujuan ini bersifat mengikat dan tunduk pada Peraturan Daerah No. X Tahun XXXX.</p>
            <p className="font-bold mt-4">PASAL 2: KEWAJIBAN PELAKU UMKM</p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Menjaga kebersihan dan ketertiban di area yang ditetapkan.</li>
                <li>Tidak mengubah titik lokasi yang telah disetujui tanpa izin tertulis.</li>
                <li>Bersedia dilakukan penertiban apabila melanggar aturan tata ruang.</li>
                <li>Perizinan berlaku selama 1 (satu) tahun dan harus diperpanjang.</li>
            </ol>
            <p className="font-bold mt-4">PASAL 3: PENERTIBAN DAN SANKSI</p>
            <p>Pemerintah berhak mencabut izin lokasi dan melakukan penertiban fisik tanpa pemberitahuan sebelumnya apabila terjadi pelanggaran berat, termasuk namun tidak terbatas pada: Penempatan lapak di zona terlarang, atau menempati trotoar. Dengan ini, UMKM menyatakan telah membaca dan menyetujui semua klausul di atas.</p>
        </div>

        <p className="text-xs text-red-600 mt-3">Scroll ke bawah dan klik -lanjut- untuk menandakan persetujuan Anda.</p>
    </div>
);

export const Step5Summary: React.FC<{ data: SubmissionData; updateData: UpdateDataHandler }> = ({ data, updateData }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><CheckCircle size={20} className="text-blue-500" /> Ringkasan Pengajuan</h3>
        <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
            <p><strong>Nama Lapak:</strong> {data.lapakName || 'N/A'}</p>
            <p><strong>Jenis Usaha:</strong> {data.businessType || 'N/A'}</p>
            <p><strong>Titik Lokasi:</strong> {data.masterLocationId ? `ID Master ${data.masterLocationId} (${data.lokasiStatus})` : 'Belum Dipilih'}</p>
            <p><strong>KTP:</strong> {data.ktpFile?.name || 'Belum diunggah'}</p>
        </div>
        <label className="flex items-center text-sm pt-4">
            <input
                type="checkbox"
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={data.setuju}
                onChange={(e) => updateData('setuju', e.target.checked)}
            />
            Saya mengonfirmasi bahwa semua data di atas benar. (Wajib)
        </label>
        {!data.setuju && <p className="text-xs text-red-500">Konfirmasi akhir diperlukan.</p>}
    </div>
);