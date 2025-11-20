"use client";
import React, { useState } from 'react';
import Stepper, { Step } from "../../../components/common/inputstepper";
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal'; // Untuk feedback sukses/gagal
import AdminLayout from '../../../components/adminlayout';

// 💡 IMPOR SEMUA KOMPONEN LANGKAH DARI FILE TERPISAH
import {
    Step1BusinessDetails,
    Step2LocationAndProof,
    Step3Documents, // Langkah 3 yang baru (KTP)
    Step4Agreement, // Langkah 4 yang baru (Perjanjian Scrollable)
    Step5Summary, // Langkah 5 yang baru (Ringkasan Final)
    SubmissionData,
    initialData
} from '@/components/umkm/pengajuan/FormSteps'; // Sesuaikan path


export default function NewSubmissionStepper() {
    const [formData, setFormData] = useState<SubmissionData>(initialData);
    const [currentStep, setCurrentStep] = useState(1);
    const [actionFeedback, setActionFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData = (name: keyof SubmissionData, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 💡 DEFINISI LANGKAH-LANGKAH (Sinkron dengan Stepper)
    const stepsArray = [Step1BusinessDetails, Step2LocationAndProof, Step3Documents, Step4Agreement, Step5Summary];
    const totalSteps = stepsArray.length;
    const isLastStep = currentStep === totalSteps;

    // --- LOGIKA VALIDASI PER STEP (CRUCIAL) ---
    const validateStep = (step: number, data: SubmissionData): boolean => {
        switch (step) {
            case 1: // Informasi Usaha
                return !!(data.lapakName && data.businessType && data.description);
            case 2: // Pemilihan Lokasi Master
                // Wajib memilih titik lokasi master
                return !!data.masterLocationId;
            case 3: // Dokumen Tambahan (KTP)
                // Wajib mengunggah KTP
                return !!data.ktpFile;
            case 4: // Perjanjian Formal (Scrollable)
                // Dianggap LULUS validasi (asumsi pengguna sudah membaca dan hanya perlu klik next)
                return true;
            case 5: // Ringkasan & S&K
                // Wajib menyetujui S&K
                return data.setuju;
            default:
                return false;
        }
    };

    const handleFinalCompletion = () => {
        if (!validateStep(totalSteps, formData)) {
            // Ini adalah safeguard, seharusnya tombol sudah dinonaktifkan
            setActionFeedback({ message: "Harap lengkapi dan setujui Syarat & Ketentuan.", type: 'error' });
            return;
        }

        // --- LOGIKA API SUBMISSION (MENGGUNAKAN FORMDATA) ---
        // Di sini Anda akan mengirim formData yang berisi File (ktpFile, dokumenPendukung)
        console.log("FINAL SUBMISSION DATA:", formData);
        setActionFeedback({ message: "Pengajuan Lokasi Berhasil Dikirim! Menunggu verifikasi Admin.", type: 'success' });
        // Simulasikan reset form setelah sukses
        setFormData(initialData);
        setCurrentStep(1);
    };

    // Helper untuk Tombol Next Props
    const canProceed = validateStep(currentStep, formData);

    return (
        <AdminLayout>
            <div className="flex flex-col items-center bg-gray-50">
                <h1 className="text-3xl font-bold mb-8">Ajukan Lokasi Usaha Baru</h1>

                <div className="w-full max-w-4xl">
                    <Stepper
                        initialStep={1}
                        onStepChange={setCurrentStep} // Update state currentStep
                        onFinalStepCompleted={handleFinalCompletion}

                        nextButtonText="Lanjut"
                        backButtonText="Kembali"

                        // Implementasi Validasi Dinamis di Next Button Props
                        nextButtonProps={{
                            disabled: !canProceed, // Menonaktifkan tombol jika validasi gagal
                            type: isLastStep ? 'submit' : 'button',
                            className: `duration-350 flex items-center justify-center rounded-lg bg-blue-600 py-2 px-4 font-medium tracking-tight text-white transition ${!canProceed && 'opacity-50 cursor-not-allowed'}`
                        }}
                    >
                        {/* Render Steps dinamis */}
                        {stepsArray.map((StepComponent, index) => (
                            <Step key={index}>
                                <StepComponent data={formData} updateData={updateData} />
                            </Step>
                        ))}
                    </Stepper>
                </div>
            </div>

            {/* Modal Feedback Aksi */}
            {actionFeedback && (
                <ActionFeedbackModal
                    message={actionFeedback.message}
                    type={actionFeedback.type}
                    onClose={() => setActionFeedback(null)}
                />
            )}
        </AdminLayout>
    );
}