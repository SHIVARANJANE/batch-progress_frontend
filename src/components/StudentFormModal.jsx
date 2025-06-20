import React, { useState, useEffect } from 'react';
import DatePicker from "react-multi-date-picker";
import './StudentFormModal.css';

const StudentFormModal = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    regDate: '',
    vertical: '',
    domain: '',
    category: '',
    courseType: 'Individual',
    courseName: '',
    comboCourses: [''],
    amount: '',
    frequency: '',
    duration: '',
    startDate: '',
    endDate: '',
    batchTiming: '',
    preferredBatch: '',
    signature: '',
    breakDates: [], // ⬅️ NEW
    paymentMode: 'Single',
    feeDetails: [{ sno: 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }],
    installments: [{ sno: 1, dueDate: '', amount: '', status: '' }]
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        comboCourses: initialData.comboCourses || [''],
        feeDetails: initialData.feeDetails || [{ sno: 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }],
        installments: initialData.installments || [{ sno: 1, dueDate: '', amount: '', status: '' }],
        breakDates: initialData.breakDates || []
      }));
    }
  }, [initialData]);

  // ⏳ Auto-calculate End Date
  useEffect(() => {
    const { duration, batchTiming, frequency, startDate, breakDates } = formData;

    if (!duration || !batchTiming || !frequency || !startDate) return;

    const totalHours = parseFloat(duration);
    const hoursPerSession = parseFloat(batchTiming);
    if (isNaN(totalHours) || isNaN(hoursPerSession) || hoursPerSession === 0) return;

    const totalSessions = Math.ceil(totalHours / hoursPerSession);

    let allowedDays = [1]; // Default Sunday
    switch (frequency.toLowerCase()) {
      case 'daily':
        allowedDays = [1, 2, 3, 4, 5, 6]; break; // Mon–Sat
      case 'alternate days':
        allowedDays = [1, 3, 5]; break; // Mon, Wed, Fri
      case 'weekend':
        allowedDays = [0, 6]; break; // Sun, Sat
      case 'only sunday':
        allowedDays = [0]; break; // Sunday only
    }

    const start = new Date(startDate);
    const breakSet = new Set(
      (breakDates || []).map(dateObj => {
        const d = new Date(dateObj);
        return d.toISOString().split('T')[0];
      })
    );

    let sessionsDone = 0;
    let current = new Date(start);

    while (sessionsDone < totalSessions) {
      const day = current.getDay();
      const isoDate = current.toISOString().split('T')[0];

      if (allowedDays.includes(day) && !breakSet.has(isoDate)) {
        sessionsDone++;
      }
      current.setDate(current.getDate() + 1);
    }

    const finalDate = new Date(current);
    finalDate.setDate(finalDate.getDate() - 1); // last session date
    const isoFinal = finalDate.toISOString().split('T')[0];

    setFormData(prev => ({ ...prev, endDate: isoFinal }));
  }, [formData.duration, formData.batchTiming, formData.frequency, formData.startDate, formData.breakDates]);

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
    setFormData(prev => ({ ...prev, installments: updated }));
  };

  const addInstallmentRow = () => {
    setFormData(prev => ({
      ...prev,
      installments: [...prev.installments, { sno: prev.installments.length + 1, dueDate: '', amount: '', status: '' }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
              <input name="courseName" placeholder="Course Name" value={formData.courseName} onChange={handleChange} />
              <input name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} />
              <input name="frequency" placeholder="Frequency (e.g. daily, weekend)" value={formData.frequency} onChange={handleChange} />
              <input name="duration" placeholder="Total Duration (Hours)" value={formData.duration} onChange={handleChange} />
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
                      <td><input value={row.balance} onChange={(e) => updateFeeDetail(i, 'balance', e.target.value)} /></td>
                      <td><input value={row.status} onChange={(e) => updateFeeDetail(i, 'status', e.target.value)} /></td>
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
                      <td><input value={row.status} onChange={(e) => updateInstallment(i, 'status', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addInstallmentRow}>➕ Add Row</button>
            </div>
          )}

          <input name="batchTiming" placeholder="Batch Timing (hrs per session)" value={formData.batchTiming} onChange={handleChange} />
          <input name="preferredBatch" placeholder="Preferred Batch" value={formData.preferredBatch} onChange={handleChange} />
          <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
          <input name="endDate" type="date" value={formData.endDate} readOnly />

          {/* 🆕 Break Dates Picker */}
          <label>Break Dates (Optional):</label>
          <DatePicker
            multiple
            value={formData.breakDates}
            onChange={(dates) => setFormData(prev => ({ ...prev, breakDates: dates }))}
            format="YYYY-MM-DD"
          />

          <textarea name="signature" placeholder="Signature (base64 or text)" value={formData.signature} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit">💾 Save</button>
            <button type="button" onClick={onCancel}>❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
