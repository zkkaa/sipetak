import React, { useState } from 'react';
import { X, MapPinLine, ImagesSquare, User, Warning, CheckCircle, ListChecks, Trash } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import ConfirmationModal from '../../common/confirmmodal';

const DynamicMapInput = dynamic(
    () => import('../../MapInput'), 
    { ssr: false }
);

interface CitizenReport {
    id: number;
    jenisPelanggaran: string;
    lokasiDetail: string;
    koordinat: [number, number];
    tanggalLapor: string;
    status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
    buktiUrl: string;
    deskripsiWarga: string;
}

interface ReportDetailModalProps {
    report: CitizenReport;
    onClose: () => void;
    onUpdateStatus: (id: number, newStatus: CitizenReport['status']) => void;
    onDelete?: (id: number) => void;
}

export default function ReportDetailModal({ report, onClose, onUpdateStatus, onDelete }: ReportDetailModalProps) {
    const isPending = report.status === 'Belum Diperiksa';
    const isCompleted = report.status === 'Selesai';
    const nextStatus = isPending ? 'Sedang Diproses' : 'Selesai';
    const [lat, lon] = report.koordinat;
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);
    
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fallbackImage = '/placeholder-image.jpg';
    const imageUrl = imageError ? fallbackImage : report.buktiUrl;

    const handleImageError = () => {
        console.error('❌ Failed to load image:', report.buktiUrl);
        setImageError(true);
        setIsImageLoading(false);
    };

    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully');
        setIsImageLoading(false);
    };

    const handleConfirmUpdate = () => {
        setShowUpdateConfirm(false);
        onUpdateStatus(report.id, nextStatus);
    };

    const handleConfirmDelete = () => {
        setShowDeleteConfirm(false);
        if (onDelete) {
            onDelete(report.id);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Warning size={28} className="text-red-500" /> Detail Laporan #{report.id}
                        </h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-4 rounded-lg mb-4 bg-red-500 text-white font-semibold">
                        Laporan: {report.jenisPelanggaran} - {report.lokasiDetail}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <MapPinLine size={20} /> Lokasi & Bukti
                            </h3>
                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-md">
                                <DynamicMapInput
                                    latitude={lat.toString()}
                                    longitude={lon.toString()}
                                />
                            </div>
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2 pt-2">
                                <ImagesSquare size={20} /> Bukti Visual (Warga)
                            </h4>

                            <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-100">
                                {isImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                                
                                {imageError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
                                        <Warning size={48} weight="fill" />
                                        <p className="text-sm mt-2">Gambar tidak dapat dimuat</p>
                                    </div>
                                )}

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt="Bukti Visual"
                                    className={`w-full h-full object-cover cursor-pointer transition-opacity ${
                                        isImageLoading ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    onClick={() => !imageError && setIsViewerOpen(true)}
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <h3 className="font-bold text-gray-800">Detail Laporan</h3>
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <p className="text-sm"><strong>Tanggal Lapor:</strong> {report.tanggalLapor}</p>
                                <p className="text-sm"><strong>Koordinat:</strong> {lat.toFixed(6)}, {lon.toFixed(6)}</p>
                                <p className="text-sm">
                                    <strong>Status:</strong>{' '}
                                    <span className={
                                        isPending ? 'text-red-600 font-semibold' : 
                                        isCompleted ? 'text-green-600 font-semibold' : 
                                        'text-yellow-600 font-semibold'
                                    }>
                                        {report.status}
                                    </span>
                                </p>
                            </div>

                            <div className="pt-2 border-t">
                                <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <User size={16} /> Deskripsi Warga:
                                </h4>
                                <p className="text-sm italic text-gray-600 bg-white p-2 rounded border">
                                    -{report.deskripsiWarga}-
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                        <div>
                            {isCompleted && onDelete && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    <Trash size={20} />
                                    Hapus Laporan
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {!isCompleted && (
                                <button
                                    onClick={() => setShowUpdateConfirm(true)}
                                    className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {isPending ? <ListChecks size={20} /> : <CheckCircle size={20} />}
                                    Ubah ke {nextStatus}
                                </button>
                            )}
                            
                            <button 
                                onClick={onClose} 
                                className="py-2 px-4 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isViewerOpen && !imageError && (
                <div
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setIsViewerOpen(false)}
                >
                    <div
                        className="relative max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsViewerOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 transition z-10"
                            aria-label="Tutup Pratinjau Gambar"
                        >
                            <X size={28} weight="bold" />
                        </button>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt="Bukti Visual Ukuran Penuh"
                            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {showUpdateConfirm && (
                <ConfirmationModal
                    title="Konfirmasi Ubah Status"
                    message={`Apakah Anda yakin ingin mengubah status laporan #${report.id} menjadi "${nextStatus}"?`}
                    onClose={() => setShowUpdateConfirm(false)}
                    onConfirm={handleConfirmUpdate}
                    confirmText="Ya, Ubah Status"
                    cancelText="Batal"
                    icon={<CheckCircle size={48} color="#FFFFFF" weight="fill" />}
                    confirmColor="blue"
                />
            )}

            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Konfirmasi Hapus Laporan"
                    message={`Apakah Anda yakin ingin menghapus laporan #${report.id}?\n\nLaporan dan foto bukti akan dihapus permanen dari sistem.\n\nTindakan ini tidak dapat dibatalkan!`}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleConfirmDelete}
                    confirmText="Ya, Hapus Permanen"
                    cancelText="Batal"
                    icon={<Trash size={48} color="#FFFFFF" weight="fill" />}
                    confirmColor="red"
                />
            )}
        </>
    );
}