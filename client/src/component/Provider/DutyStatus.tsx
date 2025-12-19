import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ToggleLeft, ToggleRight, Plus, X, Save } from 'lucide-react';
import axios from '../../api/axios';

interface DutySchedule {
  _id?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isOnDuty: boolean;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

const DutyStatus: React.FC = () => {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DutySchedule | null>(null);
  
  const [newSchedule, setNewSchedule] = useState<DutySchedule>({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isOnDuty: true,
    daysOfWeek: []
  });

  useEffect(() => {
    fetchDutyStatus();
  }, []);

  const fetchDutyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/provider/duty-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setIsOnDuty(response.data.isOnDuty || false);
        setSchedules(response.data.schedules || []);
      }
    } catch (error: any) {
      console.error('Error fetching duty status:', error);
      // If endpoint doesn't exist yet, set defaults
      setIsOnDuty(false);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDuty = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const newStatus = !isOnDuty;
      
      await axios.put('/provider/duty-status', 
        { isOnDuty: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsOnDuty(newStatus);
    } catch (error: any) {
      console.error('Error updating duty status:', error);
      alert('Failed to update duty status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setNewSchedule({
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      isOnDuty: true,
      daysOfWeek: []
    });
    setShowAddSchedule(true);
  };

  const handleEditSchedule = (schedule: DutySchedule) => {
    setEditingSchedule(schedule);
    setNewSchedule({ ...schedule });
    setShowAddSchedule(true);
  };

  const handleSaveSchedule = async () => {
    if (!newSchedule.startDate || !newSchedule.endDate || !newSchedule.startTime || !newSchedule.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Prepare schedule data
      const scheduleData = {
        startDate: newSchedule.startDate,
        endDate: newSchedule.endDate,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        isOnDuty: newSchedule.isOnDuty !== false,
        daysOfWeek: newSchedule.daysOfWeek || []
      };
      
      if (editingSchedule?._id) {
        // Update existing schedule
        const response = await axios.put(`/provider/duty-schedule/${editingSchedule._id}`, scheduleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Schedule updated:', response.data);
      } else {
        // Create new schedule
        const response = await axios.post('/provider/duty-schedule', scheduleData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Schedule created:', response.data);
      }
      
      await fetchDutyStatus();
      setShowAddSchedule(false);
      setEditingSchedule(null);
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save schedule. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/provider/duty-schedule/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchDutyStatus();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = newSchedule.daysOfWeek || [];
    if (currentDays.includes(day)) {
      setNewSchedule({
        ...newSchedule,
        daysOfWeek: currentDays.filter(d => d !== day)
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        daysOfWeek: [...currentDays, day]
      });
    }
  };

  const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Duty Status */}
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Current Duty Status
            </h3>
            <p className="text-sm text-gray-600">
              {isOnDuty ? 'You are currently ON DUTY' : 'You are currently OFF DUTY'}
            </p>
          </div>
          <button
            onClick={handleToggleDuty}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isOnDuty
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isOnDuty ? (
              <>
                <ToggleRight className="w-5 h-5" />
                ON DUTY
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                OFF DUTY
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schedule Management */}
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Duty Schedule
          </h3>
          <button
            onClick={handleAddSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>

        {schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule._id || Math.random()}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        schedule.isOnDuty
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {schedule.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Start Date</p>
                        <p className="font-medium">{new Date(schedule.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">End Date</p>
                        <p className="font-medium">{new Date(schedule.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Start Time</p>
                        <p className="font-medium">{schedule.startTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">End Time</p>
                        <p className="font-medium">{schedule.endTime}</p>
                      </div>
                      {schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-gray-500 mb-1">Days of Week</p>
                          <div className="flex gap-1">
                            {schedule.daysOfWeek.map(day => (
                              <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {daysOfWeekLabels[day]}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditSchedule(schedule)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => schedule._id && handleDeleteSchedule(schedule._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No schedules set. Add a schedule to manage your availability.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Schedule Modal */}
      {showAddSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddSchedule(false);
                    setEditingSchedule(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Duty Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duty Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dutyStatus"
                        checked={newSchedule.isOnDuty}
                        onChange={() => setNewSchedule({ ...newSchedule, isOnDuty: true })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm font-medium">ON DUTY</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dutyStatus"
                        checked={!newSchedule.isOnDuty}
                        onChange={() => setNewSchedule({ ...newSchedule, isOnDuty: false })}
                        className="w-4 h-4 text-gray-600"
                      />
                      <span className="text-sm font-medium">OFF DUTY</span>
                    </label>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newSchedule.startDate}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={newSchedule.endDate}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
                      min={newSchedule.startDate}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Days of Week (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Days of Week (Optional - Leave empty for all days)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {daysOfWeekLabels.map((label, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDayOfWeek(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          newSchedule.daysOfWeek?.includes(index)
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {newSchedule.daysOfWeek && newSchedule.daysOfWeek.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {newSchedule.daysOfWeek.map(day => daysOfWeekLabels[day]).join(', ')}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveSchedule}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Schedule'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSchedule(false);
                      setEditingSchedule(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutyStatus;

