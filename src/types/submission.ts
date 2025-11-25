// File: src/types/submission.ts

/**
 * Interface untuk data pengajuan lokasi usaha UMKM
 * Digunakan di:
 * - /admin/verifikasi (Admin view)
 * - /umkm/lokasi (UMKM view)
 * - API responses
 */
export interface Submission {
    id: number;
    namaLapak: string;
    businessType: string;
    izinStatus: 'Diajukan' | 'Diterima' | 'Ditolak';
    dateApplied: Date | null;
    userId: number;
    masterLocationId: number;
    // Dari JOIN dengan users table
    namaPemilik: string;
    emailPemohon: string;
}