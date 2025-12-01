import axios from './axios';

export interface JobApplication {
  _id: string;
  job: {
    _id: string;
    title: string;
    location?: string;
    employmentModel?: string;
    specialization?: string;
  };
  applicant?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  guestInfo?: {
    fullName: string;
    email: string;
    phone: string;
    alternativePhone?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  coverLetter: string;
  resume?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobApplicationData {
  jobId: string;
  coverLetter: string;
  resume?: File;
  // Guest info (if not logged in)
  fullName?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Apply for a job
export const applyForJob = async (applicationData: CreateJobApplicationData): Promise<JobApplication> => {
  try {
    const formData = new FormData();
    formData.append('jobId', applicationData.jobId);
    formData.append('coverLetter', applicationData.coverLetter);
    
    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }
    
    // Add guest info if provided
    if (applicationData.fullName) formData.append('fullName', applicationData.fullName);
    if (applicationData.email) formData.append('email', applicationData.email);
    if (applicationData.phone) formData.append('phone', applicationData.phone);
    if (applicationData.alternativePhone) formData.append('alternativePhone', applicationData.alternativePhone);
    if (applicationData.dateOfBirth) formData.append('dateOfBirth', applicationData.dateOfBirth);
    if (applicationData.gender) formData.append('gender', applicationData.gender);
    if (applicationData.nationality) formData.append('nationality', applicationData.nationality);
    if (applicationData.address) formData.append('address', applicationData.address);
    if (applicationData.city) formData.append('city', applicationData.city);
    if (applicationData.country) formData.append('country', applicationData.country);

    const token = localStorage.getItem('token');
    const response = await axios.post('/job-applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
};

// Get user's applications
export const getMyApplications = async (): Promise<JobApplication[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/job-applications/my-applications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my applications:', error);
    throw error;
  }
};

// Get applications for a job (admin/superadmin only)
export const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/job-applications/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
};

// Update application status (admin/superadmin only)
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted',
  notes?: string
): Promise<JobApplication> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `/job-applications/${applicationId}/status`,
      { status, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

