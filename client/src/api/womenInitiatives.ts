import axios from './axios';

export interface WomenInitiative {
  _id: string;
  fullName: string;
  age: number;
  email: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  location?: string;
  city?: string;
  attachments: {
    idPassport?: string;
    profilePhoto?: string;
    certificates?: string;
  };
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWomenInitiativeData {
  fullName: string;
  age: number;
  email: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  location?: string;
  city?: string;
  idPassport: File;
  profilePhoto: File;
  certificates?: File;
}

// Submit women initiative application
export const submitWomenInitiative = async (data: CreateWomenInitiativeData): Promise<WomenInitiative> => {
  try {
    const formData = new FormData();
    
    // Add all text fields
    formData.append('fullName', data.fullName);
    formData.append('age', data.age.toString());
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.whatsapp) formData.append('whatsapp', data.whatsapp);
    if (data.telegram) formData.append('telegram', data.telegram);
    if (data.location) formData.append('location', data.location);
    if (data.city) formData.append('city', data.city);
    
    // Add files
    formData.append('idPassport', data.idPassport);
    formData.append('profilePhoto', data.profilePhoto);
    if (data.certificates) formData.append('certificates', data.certificates);

    const response = await axios.post('/women-initiatives', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.womenInitiative;
  } catch (error) {
    console.error('Error submitting women initiative:', error);
    throw error;
  }
};

// Get all women initiatives (admin/superadmin only)
export const getWomenInitiatives = async (): Promise<WomenInitiative[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/women-initiatives', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching women initiatives:', error);
    throw error;
  }
};

// Update women initiative status (admin/superadmin only)
export const updateWomenInitiativeStatus = async (
  id: string,
  status: 'pending' | 'reviewed' | 'approved' | 'rejected',
  notes?: string
): Promise<WomenInitiative> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `/women-initiatives/${id}/status`,
      { status, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating women initiative status:', error);
    throw error;
  }
};

