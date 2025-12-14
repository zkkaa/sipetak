export type DeletionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface DeletionRequest {
    id: number;
    umkmLocationId: number;
    userId: number;
    reason: string;
    status: DeletionStatus;
    requestedAt: Date | string;
    reviewedBy: number | null;
    reviewedAt: Date | string | null;
    rejectionReason: string | null;
    
    // ✅ Joined data dari query
    namaLapak?: string;
    businessType?: string;
    namaPemilik?: string;
    emailPemohon?: string;
    dateApplied?: Date | string;
    latitude?: number;
    longitude?: number;
}

export interface DeletionRequestTableProps {
    requests: DeletionRequest[];
    onViewDetail: (request: DeletionRequest) => void;
}

export interface DeletionRequestModalProps {
    request: DeletionRequest;
    onClose: () => void;
    onApprove: (id: number) => Promise<void>;
    onReject: (id: number, reason: string) => Promise<void>;
}

export interface CreateDeletionRequestPayload {
    umkmLocationId: number;
    reason: string;
}

export interface DeletionRequestResponse {
    success: boolean;
    message: string;
    request?: DeletionRequest;
}