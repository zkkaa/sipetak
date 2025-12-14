export interface Submission {
    id: number;
    namaLapak: string;
    businessType: string;
    izinStatus: 'Diajukan' | 'Diterima' | 'Ditolak';
    dateApplied: Date | null;
    userId: number;
    masterLocationId: number;
    namaPemilik: string;
    emailPemohon: string;
}