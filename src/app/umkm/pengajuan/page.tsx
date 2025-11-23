// File: src/app/umkm/pengajuan/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import Stepper, { Step } from "../../../components/common/inputstepper";
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import AdminLayout from '../../../components/adminlayout';

import {
    Step1BusinessDetails,
    Step2LocationAndProof,
    Step3Documents,
    Step4Agreement,
    Step5Summary,
    SubmissionData,
    initialData,
    MasterLocation
} from '../../../components/umkm/pengajuan/FormSteps';

export default function NewSubmissionStepper() {
    const [formData, setFormData] = useState<SubmissionData>(initialData);
    const [currentStep, setCurrentStep] = useState(1);
    const [masterLocations, setMasterLocations] = useState<MasterLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string,
        type: 'success' | 'error' | 'info'
    } | null>(null);

    // Fetch master locations saat component mount
    useEffect(() => {
        fetchMasterLocations();
    }, []);

    const fetchMasterLocations = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/master/locations');
            const result = await response.json();

            if (result.success && result.data) {
                // Transform data dari API ke format component
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const locations: MasterLocation[] = result.data.map((loc: any) => ({
                    id: loc.id,
                    koordinat: [loc.latitude, loc.longitude] as [number, number],
                    status: loc.status,
                    umkmName: loc.penandaName || `Lokasi ${loc.id}`,
                    reasonForRestriction: loc.reasonRestriction
                }));
                setMasterLocations(locations);
                console.log('✅ Master locations loaded:', locations.length);
            }
        } catch (error) {
            console.error('❌ Error fetching master locations:', error);
            setActionFeedback({ 
                message: 'Gagal memuat data lokasi. Coba refresh halaman.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData = (name: keyof SubmissionData, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const stepsArray = [
        Step1BusinessDetails, 
        Step2LocationAndProof, 
        Step3Documents, 
        Step4Agreement, 
        Step5Summary
    ];
    const totalSteps = stepsArray.length;
    const isLastStep = currentStep === totalSteps;

    const validateStep = (step: number, data: SubmissionData): boolean => {
        switch (step) {
            case 1:
                return !!(data.lapakName && data.businessType && data.description);
            case 2:
                return !!data.masterLocationId;
            case 3:
                return !!data.ktpFile;
            case 4:
                return true;
            case 5:
                return data.setuju;
            default:
                return false;
        }
    };

    const handleFinalCompletion = async () => {
        if (!validateStep(totalSteps, formData)) {
            setActionFeedback({ 
                message: "Harap lengkapi dan setujui Syarat & Ketentuan.", 
                type: 'error' 
            });
            return;
        }

        setActionFeedback({ message: "Mengirim pengajuan...", type: 'info' });

        try {
            const formPayload = new FormData();
            formPayload.append('lapakName', formData.lapakName);
            formPayload.append('businessType', formData.businessType);
            formPayload.append('description', formData.description);
            formPayload.append('masterLocationId', formData.masterLocationId?.toString() || '');

            if (formData.ktpFile) {
                formPayload.append('ktpFile', formData.ktpFile);
            }
            if (formData.suratLainnyaFile) {
                formPayload.append('suratLainnyaFile', formData.suratLainnyaFile);
            }

            const response = await fetch('/api/umkm/submissions', {
                method: 'POST',
                body: formPayload,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setActionFeedback({ 
                    message: "Pengajuan berhasil dikirim! Menunggu verifikasi Admin.", 
                    type: 'success' 
                });
                setFormData(initialData);
                setCurrentStep(1);
            } else {
                setActionFeedback({ 
                    message: result.message || 'Pengiriman gagal dari server.', 
                    type: 'error' 
                });
            }

        } catch (error) {
            console.error('API Submission Error:', error);
            setActionFeedback({ 
                message: 'Terjadi kesalahan jaringan atau server.', 
                type: 'error' 
            });
        }
    };

    const canProceed = validateStep(currentStep, formData);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data lokasi...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col items-center bg-gray-50 min-h-screen py-8">
                <h1 className="text-3xl font-bold mb-8">Ajukan Lokasi Usaha Baru</h1>

                <div className="w-full max-w-4xl">
                    <Stepper
                        initialStep={1}
                        onStepChange={setCurrentStep}
                        onFinalStepCompleted={handleFinalCompletion}
                        nextButtonText="Lanjut"
                        backButtonText="Kembali"
                        nextButtonProps={{
                            disabled: !canProceed,
                            type: isLastStep ? 'submit' : 'button',
                            className: `duration-350 flex items-center justify-center rounded-lg bg-blue-600 py-2 px-4 font-medium tracking-tight text-white transition ${!canProceed && 'opacity-50 cursor-not-allowed'}`
                        }}
                    >
                        <Step>
                            <Step1BusinessDetails data={formData} updateData={updateData} />
                        </Step>
                        <Step>
                            <Step2LocationAndProof 
                                data={formData} 
                                updateData={updateData} 
                                masterLocations={masterLocations} 
                            />
                        </Step>
                        <Step>
                            <Step3Documents updateData={updateData} />
                        </Step>
                        <Step>
                            <Step4Agreement />
                        </Step>
                        <Step>
                            <Step5Summary data={formData} updateData={updateData} />
                        </Step>
                    </Stepper>
                </div>
            </div>

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