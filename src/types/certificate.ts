// ============================================
// File 1: src/types/certificate.ts
// ============================================

/**
 * Interface untuk Certificate Item
 * Digunakan di:
 * - /umkm/sertifikat (UMKM view)
 * - CertificateViewerModal (Modal component)
 * - CertificateTable (Table component)
 * - API responses
 */
export interface CertificateItem {
    id: number;
    nomorSertifikat: string;
    namaUsaha: string;
    tanggalTerbit: string;
    tanggalKedaluwarsa: string;
    status: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan';
    unduhLink: string;
    namaPemilik: string;
    lokasiLapak: string;
    namaPengelola?: string;  // ✅ Made optional with default fallback
    namaPemerintah?: string; // ✅ Made optional with default fallback
}