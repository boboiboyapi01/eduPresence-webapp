import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import BottomNavigation from '../common/BottomNavigation';

const CreateClass = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [scheduleType, setScheduleType] = useState('One Time');
  const [oneTimeDate, setOneTimeDate] = useState(new Date());
  const [oneTimeHour, setOneTimeHour] = useState('08');
  const [oneTimeMinute, setOneTimeMinute] = useState('00');
  const [weeklyDays, setWeeklyDays] = useState({
    Monday: { checked: false, hour: '08', minute: '00' },
    Tuesday: { checked: false, hour: '08', minute: '00' },
    Wednesday: { checked: false, hour: '08', minute: '00' },
    Thursday: { checked: false, hour: '08', minute: '00' },
    Friday: { checked: false, hour: '08', minute: '00' },
    Saturday: { checked: false, hour: '08', minute: '00' },
  });
  const [monthlyDate, setMonthlyDate] = useState(1);
  const [monthlyHour, setMonthlyHour] = useState('08');
  const [monthlyMinute, setMonthlyMinute] = useState('00');
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState({ latitude: -6.2, longitude: 106.816666, radius: 100 });
  const [error, setError] = useState(null);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const generateCode = (prefix = '') => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = prefix;
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 3; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    return code.toUpperCase();
  };

  const handleWeeklyDayChange = (day) => {
    setWeeklyDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], checked: !prev[day].checked },
    }));
  };

  const handleWeeklyTimeChange = (day, type, value) => {
    setWeeklyDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (!className) {
        setError('Class name is required');
        return;
      }

      const teacherName = currentUser.displayName || currentUser.email.split('@')[0];
      const teacherCodePrefix = teacherName.slice(0, 3).toUpperCase();
      const teacherCode = generateCode(teacherCodePrefix);

      let classCode;
      let isUnique = false;
      while (!isUnique) {
        classCode = generateCode();
        const q = query(collection(db, 'classes'), where('code', '==', classCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) isUnique = true;
      }

      let schedule;
      if (scheduleType === 'One Time') {
        const dateWithTime = new Date(oneTimeDate);
        dateWithTime.setHours(Number(oneTimeHour), Number(oneTimeMinute));
        schedule = { type: 'One Time', date: dateWithTime.toISOString() };
      } else if (scheduleType === 'Weekly') {
        const weeklySchedule = Object.keys(weeklyDays)
          .filter((day) => weeklyDays[day].checked)
          .map((day) => ({
            day,
            time: `${weeklyDays[day].hour}:${weeklyDays[day].minute}`,
          }));
        if (!weeklySchedule.length) {
          setError('Please select at least one day for weekly schedule');
          return;
        }
        schedule = { type: 'Weekly', days: weeklySchedule };
      } else if (scheduleType === 'Monthly') {
        if (monthlyDate < 1 || monthlyDate > 31) {
          setError('Monthly date must be between 1 and 31');
          return;
        }
        schedule = { type: 'Monthly', date: monthlyDate, time: `${monthlyHour}:${monthlyMinute}` };
      }

      await addDoc(collection(db, 'classes'), {
        name: className,
        code: classCode,
        teacherCode: teacherCode,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName || currentUser.email,
        schedule,
        location: useLocation ? location : null,
        createdAt: new Date(),
      });
      console.log('Class created successfully');
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error('Error creating class:', err);
      setError('Failed to create class');
    }
  };

  if (!currentUser || userRole !== 'teacher') {
    navigate('/login');
    return null;
  }

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="text-gray-600 hover:text-gray-800 mr-4"
          aria-label="Back"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create a New Class</h1>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter class name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Schedule Type</label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="One Time">One Time</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {scheduleType === 'One Time' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <Calendar
              onChange={setOneTimeDate}
              value={oneTimeDate}
              minDate={new Date()}
              className="mt-1"
            />
            <div className="mt-2 flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hour</label>
                <select
                  value={oneTimeHour}
                  onChange={(e) => setOneTimeHour(e.target.value)}
                  className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minute</label>
                <select
                  value={oneTimeMinute}
                  onChange={(e) => setOneTimeMinute(e.target.value)}
                  className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {scheduleType === 'Weekly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Days and Times</label>
            {Object.keys(weeklyDays).map((day) => (
              <div key={day} className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={weeklyDays[day].checked}
                    onChange={() => handleWeeklyDayChange(day)}
                    className="mr-2"
                  />
                  {day}
                </label>
                {weeklyDays[day].checked && (
                  <div className="ml-4 mt-1 flex space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hour</label>
                      <select
                        value={weeklyDays[day].hour}
                        onChange={(e) => handleWeeklyTimeChange(day, 'hour', e.target.value)}
                        className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minute</label>
                      <select
                        value={weeklyDays[day].minute}
                        onChange={(e) => handleWeeklyTimeChange(day, 'minute', e.target.value)}
                        className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>{minute}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {scheduleType === 'Monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Each Month</label>
            <input
              type="number"
              value={monthlyDate}
              onChange={(e) => setMonthlyDate(Number(e.target.value))}
              min="1"
              max="31"
              className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter date (1-31)"
            />
            <div className="mt-2 flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hour</label>
                <select
                  value={monthlyHour}
                  onChange={(e) => setMonthlyHour(e.target.value)}
                  className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minute</label>
                <select
                  value={monthlyMinute}
                  onChange={(e) => setMonthlyMinute(e.target.value)}
                  className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {minutes.map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useLocation}
              onChange={() => setUseLocation(!useLocation)}
              className="mr-2"
            />
            Use Location for Attendance
          </label>
        </div>

        {useLocation && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Attendance Location</label>
            <p className="text-sm text-gray-500">Click on the map to set the attendance point (100m radius)</p>
            <div className="mt-2 h-64 w-full">
              <MapContainer center={[location.latitude, location.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[location.latitude, location.longitude]}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      setLocation({ latitude: lat, longitude: lng, radius: 100 });
                    },
                  }}
                />
                <Circle center={[location.latitude, location.longitude]} radius={100} />
              </MapContainer>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Latitude: {location.latitude.toFixed(4)}, Longitude: {location.longitude.toFixed(4)}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Create Class
        </button>
      </form>
      <BottomNavigation userRole="teacher" />
    </div>
  );
};

export default CreateClass;