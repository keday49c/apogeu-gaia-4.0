import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { campaignService, Campaign, CreateCampaignData, UpdateCampaignData } from '@/services/campaignService';
import { useAuth } from '@/template';
import { useAlert } from '@/template'; // Assuming useAlert is available in @/template

interface CampaignContextType {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refreshCampaigns: () => Promise<void>;
  createCampaign: (data: CreateCampaignData) => Promise<{ success: boolean; error?: string }>;
  updateCampaign: (id: string, data: UpdateCampaignData) => Promise<{ success: boolean; error?: string }>;
  deleteCampaign: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateCampaignStatus: (id: string, status: Campaign['status']) => Promise<{ success: boolean; error?: string }>;
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function useCampaignContext() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await campaignService.getAll();
      if (err) {
        setError(err);
        showAlert('Erro ao carregar campanhas', err);
        setCampaigns([]);
      } else {
        setCampaigns(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar campanhas:', err);
      setError('Ocorreu um erro inesperado ao carregar as campanhas.');
      showAlert('Erro', 'Ocorreu um erro inesperado ao carregar as campanhas.');
    } finally {
      setLoading(false);
    }
  }, [user, showAlert]);

  const createCampaign = useCallback(async (data: CreateCampaignData) => {
    try {
      const { data: newCampaign, error: err } = await campaignService.create(data);
      if (err) {
        showAlert('Erro ao criar campanha', err);
        return { success: false, error: err };
      }
      if (newCampaign) {
        setCampaigns((prev) => [newCampaign, ...prev]);
        showAlert('Sucesso', 'Campanha criada com sucesso!');
      }
      return { success: true };
    } catch (err) {
      console.error('Erro inesperado ao criar campanha:', err);
      showAlert('Erro', 'Ocorreu um erro inesperado ao criar a campanha.');
      return { success: false, error: 'Erro inesperado ao criar campanha.' };
    }
  }, [showAlert]);

  const updateCampaign = useCallback(async (id: string, data: UpdateCampaignData) => {
    try {
      const { data: updatedCampaign, error: err } = await campaignService.update(id, data);
      if (err) {
        showAlert('Erro ao atualizar campanha', err);
        return { success: false, error: err };
      }
      if (updatedCampaign) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? updatedCampaign : c))
        );
        showAlert('Sucesso', 'Campanha atualizada com sucesso!');
      }
      return { success: true };
    } catch (err) {
      console.error('Erro inesperado ao atualizar campanha:', err);
      showAlert('Erro', 'Ocorreu um erro inesperado ao atualizar a campanha.');
      return { success: false, error: 'Erro inesperado ao atualizar campanha.' };
    }
  }, [showAlert]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      const { error: err } = await campaignService.delete(id);
      if (err) {
        showAlert('Erro ao deletar campanha', err);
        return { success: false, error: err };
      }
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      showAlert('Sucesso', 'Campanha deletada com sucesso!');
      return { success: true };
    } catch (err) {
      console.error('Erro inesperado ao deletar campanha:', err);
      showAlert('Erro', 'Ocorreu um erro inesperado ao deletar a campanha.');
      return { success: false, error: 'Erro inesperado ao deletar campanha.' };
    }
  }, [showAlert]);

  const updateCampaignStatus = useCallback(async (id: string, status: Campaign['status']) => {
    try {
      const { data: updatedCampaign, error: err } = await campaignService.updateStatus(id, status);
      if (err) {
        showAlert('Erro ao atualizar status da campanha', err);
        return { success: false, error: err };
      }
      if (updatedCampaign) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? updatedCampaign : c))
        );
        showAlert('Sucesso', 'Status da campanha atualizado com sucesso!');
      }
      return { success: true };
    } catch (err) {
      console.error('Erro inesperado ao atualizar status da campanha:', err);
      showAlert('Erro', 'Ocorreu um erro inesperado ao atualizar o status da campanha.');
      return { success: false, error: 'Erro inesperado ao atualizar status da campanha.' };
    }
  }, [showAlert]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        loading,
        error,
        refreshCampaigns: fetchCampaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        updateCampaignStatus,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

