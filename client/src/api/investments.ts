import axios from './axios';

export interface Investment {
  _id: string;
  type: 'investor' | 'strategic-partner' | 'sponsorship';
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  companyName?: string;
  sector?: string;
  investmentType?: string;
  officePhone?: string;
  motto?: string;
  specialPackages?: string;
  messages?: string;
  effectiveDate?: string;
  expiryDate?: string;
  attachments?: {
    idPassport?: string;
    license?: string;
    tradeRegistration?: string;
    businessProposal?: string;
    businessPlan?: string;
    logo?: string;
    mouSigned?: string;
    contractSigned?: string;
  };
  enquiries?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentData {
  type: 'investor' | 'strategic-partner' | 'sponsorship';
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  companyName?: string;
  sector?: string;
  investmentType?: string;
  officePhone?: string;
  motto?: string;
  specialPackages?: string;
  messages?: string;
  effectiveDate?: string;
  expiryDate?: string;
  enquiries?: string;
  // Files
  idPassport?: File;
  license?: File;
  tradeRegistration?: File;
  businessProposal?: File;
  businessPlan?: File;
  logo?: File;
  mouSigned?: File;
  contractSigned?: File;
}

// Submit investment/partnership application
export const submitInvestment = async (data: CreateInvestmentData): Promise<Investment> => {
  try {
    const formData = new FormData();
    
    // Add all text fields
    formData.append('type', data.type);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    if (data.whatsapp) formData.append('whatsapp', data.whatsapp);
    if (data.companyName) formData.append('companyName', data.companyName);
    if (data.sector) formData.append('sector', data.sector);
    if (data.investmentType) formData.append('investmentType', data.investmentType);
    if (data.officePhone) formData.append('officePhone', data.officePhone);
    if (data.motto) formData.append('motto', data.motto);
    if (data.specialPackages) formData.append('specialPackages', data.specialPackages);
    if (data.messages) formData.append('messages', data.messages);
    if (data.effectiveDate) formData.append('effectiveDate', data.effectiveDate);
    if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
    if (data.enquiries) formData.append('enquiries', data.enquiries);
    
    // Add files
    if (data.idPassport) formData.append('idPassport', data.idPassport);
    if (data.license) formData.append('license', data.license);
    if (data.tradeRegistration) formData.append('tradeRegistration', data.tradeRegistration);
    if (data.businessProposal) formData.append('businessProposal', data.businessProposal);
    if (data.businessPlan) formData.append('businessPlan', data.businessPlan);
    if (data.logo) formData.append('logo', data.logo);
    if (data.mouSigned) formData.append('mouSigned', data.mouSigned);
    if (data.contractSigned) formData.append('contractSigned', data.contractSigned);

    const response = await axios.post('/investments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.investment;
  } catch (error) {
    console.error('Error submitting investment:', error);
    throw error;
  }
};

// Get all investments (admin/superadmin only)
export const getInvestments = async (): Promise<Investment[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/investments', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

// Update investment status (admin/superadmin only)
export const updateInvestmentStatus = async (
  id: string,
  status: 'pending' | 'reviewed' | 'approved' | 'rejected',
  notes?: string
): Promise<Investment> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `/investments/${id}/status`,
      { status, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating investment status:', error);
    throw error;
  }
};


