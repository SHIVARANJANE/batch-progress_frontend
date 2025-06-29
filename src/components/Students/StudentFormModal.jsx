import React, { useState, useEffect } from 'react';
import DatePicker from "react-multi-date-picker";
import './StudentFormModal.css';

const TIME_SLOTS = [
  '10:30-11:30', '11:30-12:30', '02:00-03:00',
  '03:00-04:00', '04:00-05:00', '05:00-06:00',
  '06:00-07:00', '07:00-08:00'
];

// Helper to convert time slot to decimal hour value
const parseTime = timeStr => {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
};

const generateSlotOptions = (sessionLength) => {
  const parsedSlots = TIME_SLOTS.map(slot => {
    const [start, end] = slot.split('-');
    return {
      label: slot,
      start: parseTime(start),
      end: parseTime(end),
    };
  });

  const result = [];
  for (let i = 0; i < parsedSlots.length; i++) {
    let duration = 0;
    let label = parsedSlots[i].label;
    let start = parsedSlots[i].start;
    let end = parsedSlots[i].end;

    duration = end - start;

    let j = i;
    while (duration < sessionLength && j + 1 < parsedSlots.length) {
      j++;
      end = parsedSlots[j].end;
      label = `${parsedSlots[i].label.split('-')[0]}-${parsedSlots[j].label.split('-')[1]}`;
      duration = end - start;
    }

    if (duration >= sessionLength && (end - start) % 0.5 === 0) {
      result.push(label);
    }
  }

  return [...new Set(result)];
};

const StudentFormModal = ({ initialData, onSave, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', regDate: '',
    vertical: '', domain: '', category: '',
    courseType: 'Individual', courseName: '',
    comboCourses: [''], amount: '',
    frequency: '', duration: '', sessionLength: 1,
    startDate: '', endDate: '',
    signature: '', breakDates: [],
    paymentMode: 'Single',
    feeDetails: [{ sno: 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }],
    installments: [{ sno: 1, dueDate: '', amount: '', status: '' }],
    preferredTimeSlot: ''
  });
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [suggestedSlot, setSuggestedSlot] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Failed to fetch courses', err));
  }, []);

  useEffect(() => {
    if (initialData) {
      const cleanFeeDetails = (initialData.feeDetails || []).map((fd, i) => ({
        ...fd,
        date: fd.date && !isNaN(new Date(fd.date)) ? new Date(fd.date).toISOString().split('T')[0] : '',
      }));
      const cleanInstallments = (initialData.installments || []).map(ins => ({
        ...ins,
        dueDate: ins.dueDate && !isNaN(new Date(ins.dueDate)) ? new Date(ins.dueDate).toISOString().split('T')[0] : ''
      }));

      setFormData(prev => ({
        ...prev,
        ...initialData,
        courseName: initialData.courseType === 'Individual'
          ? initialData.courseName?._id || initialData.courseName || ''
          : '',
        regDate: initialData.regDate ? new Date(initialData.regDate).toISOString().split('T')[0] : '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        comboCourses: Array.isArray(initialData.comboCourses) && initialData.comboCourses.length
          ? initialData.comboCourses
          : [''],
        breakDates: initialData.breakDates || [],
        feeDetails: cleanFeeDetails.length ? cleanFeeDetails : prev.feeDetails,
        installments: cleanInstallments.length ? cleanInstallments : prev.installments
      }));
    }
  }, [initialData]);

  // End date calculation
  useEffect(() => {
    const { duration, frequency, startDate, breakDates, sessionLength } = formData;

    if (!duration || !frequency || !startDate || !sessionLength) return;

    const totalHours = parseFloat(duration);
    const hoursPerSession = parseFloat(sessionLength);
    if (isNaN(totalHours) || isNaN(hoursPerSession) || hoursPerSession <= 0) return;

    const totalSessions = Math.ceil(totalHours / hoursPerSession);

    let allowedDays = [1];
    switch (frequency.toLowerCase()) {
      case 'daily': allowedDays = [1, 2, 3, 4, 5, 6]; break;
      case 'alternate days': allowedDays = [1, 3, 5]; break;
      case 'weekend': allowedDays = [0, 6]; break;
      case 'only sunday': allowedDays = [0]; break;
      default: allowedDays = [1]; break;
    }

    const start = new Date(startDate);
    const breakSet = new Set(
      (breakDates || [])
        .map(d => {
          try {
            const jsDate = d instanceof Date ? d : d?.toDate?.(); // handles multi-date-picker format
            return jsDate && !isNaN(jsDate) ? jsDate.toISOString().split('T')[0] : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    );

    let sessionsDone = 0;
    let current = new Date(start);
    while (sessionsDone < totalSessions) {
      const day = current.getDay();
      const iso = current.toISOString().split('T')[0];
      if (allowedDays.includes(day) && !breakSet.has(iso)) sessionsDone++;
      current.setDate(current.getDate() + 1);
    }

    current.setDate(current.getDate() - 1);
    setFormData(prev => ({ ...prev, endDate: current.toISOString().split('T')[0] }));
  }, [
    formData.duration,
    formData.frequency,
    formData.startDate,
    formData.breakDates,
    formData.sessionLength
  ]);

  // Dynamic time slot generator based on sessionLength
  useEffect(() => {
    const length = parseFloat(formData.sessionLength);
    if (!isNaN(length) && length > 0) {
      setPreferredTimeSlots(generateSlotOptions(length));
    }
  }, [formData.sessionLength]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComboChange = (index, value) => {
    const updated = [...formData.comboCourses];
    updated[index] = value;
    setFormData(prev => ({ ...prev, comboCourses: updated }));
  };

  const addComboCourse = () => {
    setFormData(prev => ({ ...prev, comboCourses: [...prev.comboCourses, ''] }));
  };

  const updateFeeDetail = (index, field, value) => {
    const updated = [...formData.feeDetails];
    updated[index][field] = value;

    if (field === 'amount') {
      const entered = parseFloat(value) || 0;
      const total = parseFloat(formData.amount) || 0;
      if (entered === total) {
        updated[index].balance = 0;
        updated[index].status = 'Paid';
      } else if (entered === 0) {
        updated[index].balance = total;
        updated[index].status = 'Unpaid';
      } else {
        updated[index].balance = total - entered;
        updated[index].status = 'Partial';
      }
    }

    setFormData(prev => ({ ...prev, feeDetails: updated }));
  };

  const addFeeDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      feeDetails: [...prev.feeDetails, { sno: prev.feeDetails.length + 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }]
    }));
  };

  const updateInstallment = (index, field, value) => {
    const updated = [...formData.installments];
    updated[index][field] = value;

    if (field === 'amount') {
      const entered = parseFloat(value) || 0;
      const total = parseFloat(formData.amount) || 0;
      if (entered === total) {
        updated[index].status = 'Paid';
      } else if (entered === 0) {
        updated[index].status = 'Pending';
      } else {
        updated[index].status = 'Partial';
      }
    }

    setFormData(prev => ({ ...prev, installments: updated }));
  };

  const addInstallmentRow = () => {
    setFormData(prev => ({
      ...prev,
      installments: [...prev.installments, { sno: prev.installments.length + 1, dueDate: '', amount: '', status: '' }]
    }));
  };

  const assignToBatch = async (studentId) => {
    setIsAssigning(true);
    setAssignmentStatus(null);

    const hasPaid = formData.paymentMode === 'Single'
      ? formData.feeDetails.some(fd => fd.status === 'Paid')
      : formData.installments.some(ins => ins.status === 'Paid');

    if (!hasPaid) {
      alert('❌ Cannot assign to batch. No payment received. Student will be added to the waiting list upon saving.');
      setAssignmentStatus('waitlist');
      setIsAssigning(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/batch/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId }),
      });

      const result = await res.json();

      if (result.status === 'assigned') {
        alert('✅ Student successfully assigned to batch.');
        setAssignmentStatus('assigned');
      } else if (result.status === 'suggested') {
        setSuggestedSlot(result.suggestedSlot);
        setAssignmentStatus('suggest');
      } else {
        alert('⚠️ No available batch found. Student will be added to waiting list.');
        setAssignmentStatus('waitlist');
      }
    } catch (err) {
      console.error('❌ Batch assignment failed', err);
      alert('❌ Batch assignment failed. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSubmit = async () => {
    setIsAssigning(true);
    setAssignmentStatus(null);

    // Step 1: Create student in DB to get ID
    const studentPayload = { ...formData };
    const enrollment = {
      courseId: formData.courseName,
      courseType: formData.courseType,
      comboCourses: formData.comboCourses,
      amount: formData.amount,
      frequency: formData.frequency,
      duration: formData.duration,
      sessionLength: formData.sessionLength,
      startDate: formData.startDate,
      endDate: formData.endDate,
      paymentMode: formData.paymentMode,
      feeDetails: formData.feeDetails,
      installments: formData.paymentMode === 'Installment' ? formData.installments : []
    };

    const studentData = {
      ...studentPayload,
      enrollment,
    };

    try {
       const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/students`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(studentData),
       });
       const savedStudent = await response.json();
       const newStudentId = savedStudent?._id;
       if (!newStudentId) {
         alert("❌ Failed to retrieve student ID after saving.");
         setIsAssigning(false);
         return;
       }
       // Proceed with assigning to batch
       await assignToBatch(newStudentId);
     } catch (err) {
       console.error("❌ Save or assign failed:", err);
       alert("An error occurred while saving student and assigning to batch.");
     } finally {
       setIsAssigning(false);
       onSave && onSave();
     }
   };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <h3>{initialData ? '✏️ Edit Student' : '➕ Add Student'}</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="regDate" type="date" value={formData.regDate} onChange={handleChange} required />

          <input name="vertical" placeholder="Vertical" value={formData.vertical} onChange={handleChange} />
          <input name="domain" placeholder="Domain" value={formData.domain} onChange={handleChange} />
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} />

          <select name="courseType" value={formData.courseType} onChange={handleChange}>
            <option value="Individual">Individual</option>
            <option value="Combo">Combo</option>
          </select>

          {formData.courseType === 'Individual' && (
            <>
              <select name="courseName" value={formData.courseName} onChange={handleChange} required>
                <option value="">-- Select Course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
              <input name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} />
              <input name="frequency" placeholder="Frequency" value={formData.frequency} onChange={handleChange} />
              <input name="duration" placeholder="Total Duration (Hours)" value={formData.duration} onChange={handleChange} />
              <input name="sessionLength" type="number" step="0.25" min="0.25" placeholder="Session Length (hrs)" value={formData.sessionLength} onChange={handleChange} />
              <select
                name="preferredTimeSlot"
                value={formData.preferredTimeSlot}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Preferred Time Slot --</option>
                {preferredTimeSlots.map((slot, i) => (
                  <option key={i} value={slot}>{slot}</option>
                ))}
              </select>
            </>
          )}

          {formData.courseType === 'Combo' && (
            <>
              {formData.comboCourses.map((course, idx) => (
                <input
                  key={idx}
                  placeholder={`Combo Course ${idx + 1}`}
                  value={course}
                  onChange={(e) => handleComboChange(idx, e.target.value)}
                />
              ))}
              <button type="button" onClick={addComboCourse}>➕ Add Course</button>
            </>
          )}

          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option value="Single">Single</option>
            <option value="Installment">Installment</option>
          </select>

          {formData.paymentMode === 'Single' && (
            <div className="fee-table">
              <h4>💰 Fee Details</h4>
              <table>
                <thead>
                  <tr><th>S.NO</th><th>Date</th><th>Rec No.</th><th>Amount</th><th>Balance</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {formData.feeDetails.map((row, i) => (
                    <tr key={i}>
                      <td>{row.sno}</td>
                      <td><input type="date" value={row.date} onChange={(e) => updateFeeDetail(i, 'date', e.target.value)} /></td>
                      <td><input value={row.receiptNo} onChange={(e) => updateFeeDetail(i, 'receiptNo', e.target.value)} /></td>
                      <td><input value={row.amount} onChange={(e) => updateFeeDetail(i, 'amount', e.target.value)} /></td>
                      <td><input value={row.balance} readOnly /></td>
                      <td>
                        <select value={row.status} onChange={(e) => updateFeeDetail(i, 'status', e.target.value)}>
                          <option value="">-- Select --</option>
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Partial">Partial</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addFeeDetailRow}>➕ Add Row</button>
            </div>
          )}

          {formData.paymentMode === 'Installment' && (
            <div className="installment-table">
              <h4>📅 Installment Schedule</h4>
              <table>
                <thead>
                  <tr><th>S.NO</th><th>Due Date</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {formData.installments.map((row, i) => (
                    <tr key={i}>
                      <td>{row.sno}</td>
                      <td><input type="date" value={row.dueDate} onChange={(e) => updateInstallment(i, 'dueDate', e.target.value)} /></td>
                      <td><input value={row.amount} onChange={(e) => updateInstallment(i, 'amount', e.target.value)} /></td>
                      <td>
                        <select value={row.status} onChange={(e) => updateInstallment(i, 'status', e.target.value)}>
                          <option value="">-- Select --</option>
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addInstallmentRow}>➕ Add Row</button>
            </div>
          )}

          <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
          <input name="endDate" type="date" value={formData.endDate} readOnly />

          <label>Break Dates (Optional):</label>
          <DatePicker
            multiple
            value={formData.breakDates}
            onChange={(dates) => setFormData(prev => ({ ...prev, breakDates: dates }))}
            format="YYYY-MM-DD"
          />

          <textarea name="signature" placeholder="Signature (base64 or text)" value={formData.signature} onChange={handleChange} />
          
          <div className="modal-actions">
            {assignmentStatus === 'suggest' && (
              <div className="suggestion-box">
                <p>Suggested Time Slot: <strong>{suggestedSlot}</strong></p>
                <button type="button" onClick={() => {
                  setFormData(prev => ({ ...prev, preferredTimeSlot: suggestedSlot }));
                  setAssignmentStatus('assigned');
                  alert('✅ Suggested slot accepted. You can now save.');
                }}>✅ Accept</button>
                <button type="button" onClick={() => {
                  alert('Student will be added to waiting list.');
                  setAssignmentStatus('waitlist');
                }}>🚫 Reject</button>
              </div>
            )}

            {assignmentStatus !== 'assigned' && (
              <button type="button" onClick={() => assignToBatch(initialData?._id)} disabled={isAssigning}>
                🚀 Assign to Batch
              </button>
            )}
            <button type="submit">💾 Save</button>
            <button type="button" onClick={onCancel}>❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
