import React, { useState } from 'react';
import { X, MapPinLine, ImagesSquare, User, Warning, CheckCircle, ListChecks } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

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
}

export default function ReportDetailModal({ report, onClose, onUpdateStatus }: ReportDetailModalProps) {
    const isPending = report.status === 'Belum Diperiksa';
    const nextStatus = isPending ? 'Sedang Diproses' : 'Selesai';
    const [lat, lon] = report.koordinat;
    const imageUrl = report.buktiUrl;
    const [isViewerOpen, setIsViewerOpen] = useState(false);



    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-11/12 overflow-y-auto">

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

                        <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="Bukti Visual"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setIsViewerOpen(true)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="font-bold text-gray-800">Detail Laporan</h3>
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <p className="text-sm"><strong>Tanggal Lapor:</strong> {report.tanggalLapor}</p>
                            <p className="text-sm"><strong>Koordinat:</strong> {lat}, {lon}</p>
                            <p className="text-sm"><strong>Status:</strong> <span className={isPending ? 'text-red-600' : 'text-yellow-600'}>{report.status}</span></p>
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

                {report.status !== 'Selesai' && (
                    <div className="mt-6 pt-4 border-t flex justify-end">
                        <button
                            onClick={() => onUpdateStatus(report.id, nextStatus)}
                            className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {isPending ? <ListChecks size={20} /> : <CheckCircle size={20} />}
                            Ubah Status ke {nextStatus}
                        </button>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="py-2 px-4 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                        Tutup
                    </button>
                </div>
            {isViewerOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 cursor-pointer"
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
            </div>
        </div>
    );
}