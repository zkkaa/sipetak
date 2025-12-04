// File: src/types/lapak.ts
// ✅ Centralized type definitions untuk menghindari inconsistency

export type IzinStatus = 'Diajukan' | 'Diterima' | 'Ditolak';

export interface LapakUsaha {
    id: number;
    userId: number;
    masterLocationId: number;
    namaLapak: string;
    businessType: string;
    izinStatus: IzinStatus;
    createdAt: string | Date;
}

export interface LocationTableProps {
    lapaks: LapakUsaha[];
    onViewDetail: (lapak: LapakUsaha) => void;
    onEdit: (lapak: LapakUsaha) => void;
    onDelete: (id: number) => void;
    formatDate: (date: string | Date | null) => string;
}

export interface LocationDetailModalProps {
    lapak: LapakUsaha;
    onClose: () => void;
    onSave: (updatedLapak: LapakUsaha) => void;
    mode: 'view' | 'edit';
    setMode: (mode: 'view' | 'edit') => void;
    formatDate: (date: string | Date | null) => string;
}