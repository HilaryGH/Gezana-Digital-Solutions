import axios from './axios';

export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  employmentModel: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid';
  specialization: string;
  postedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  location: string;
  salary?: string;
  employmentModel: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid';
  specialization: string;
}

// Get all active jobs
export const getJobs = async (): Promise<Job[]> => {
  try {
    const response = await axios.get('/jobs');
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Get a single job by ID
export const getJobById = async (id: string): Promise<Job> => {
  try {
    const response = await axios.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

// Create a new job (admin/superadmin only)
export const createJob = async (jobData: CreateJobData): Promise<Job> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/jobs', jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Update a job (admin/superadmin only)
export const updateJob = async (id: string, jobData: Partial<CreateJobData & { status?: 'active' | 'closed' }>): Promise<Job> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/jobs/${id}`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

// Delete a job (admin/superadmin only)
export const deleteJob = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Get all jobs including inactive (admin/superadmin only)
export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/jobs/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    throw error;
  }
};




















