// StudentFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from "react-multi-date-picker";
import './StudentFormModal.css';
import axios from 'axios';

// Helper for parsing time slots (already present)
const parseTime = timeStr => {
  let [h, m] = timeStr.split(':').map(Number);
  if (h < 10 && h !== 0) {
    h += 12; // Convert 2 PM to 14, 3 PM to 15, etc.
  }
  return h + m / 60;
};

// Helper for generating combined time slot options (already present)
const generateSlotOptions = (sessionLength, staffAvailability, selectedStaffWorkingDays) => {
  if (!staffAvailability || !selectedStaffWorkingDays || selectedStaffWorkingDays.length === 0) {
    return [];
  }

  const allAvailableSlots = new Set();
  selectedStaffWorkingDays.forEach(day => {
    const slotsForDay = staffAvailability[day.toLowerCase()];
    if (slotsForDay) {
      slotsForDay.forEach(slot => allAvailableSlots.add(slot));
    }
  });
    const uniqueSortedSlots = Array.from(allAvailableSlots).sort((a, b) => parseTime(a.split('-')[0]) - parseTime(b.split('-')[0]));

  const result = [];

  for (let i = 0; i < uniqueSortedSlots.length; i++) {
    let currentSpanStartParsed = parseTime(uniqueSortedSlots[i].split('-')[0]);
    let currentSpanEndParsed = parseTime(uniqueSortedSlots[i].split('-')[1]);
    let currentDuration = currentSpanEndParsed - currentSpanStartParsed;
    let currentLabel = uniqueSortedSlots[i];

    // Try to extend this slot contiguously
    let j = i;
    while (currentDuration < sessionLength && j + 1 < uniqueSortedSlots.length) {
      const nextSlotStartParsed = parseTime(uniqueSortedSlots[j + 1].split('-')[0]);
      const nextSlotEndParsed = parseTime(uniqueSortedSlots[j + 1].split('-')[1]);

      // IMPORTANT: Check for contiguity
      // The start of the next slot must exactly match the end of the current span
      if (nextSlotStartParsed === currentSpanEndParsed) {
        currentSpanEndParsed = nextSlotEndParsed; // Extend the end of the combined span
        currentDuration = currentSpanEndParsed - currentSpanStartParsed; // Recalculate total duration
        // Update label to reflect the new, extended span
        currentLabel = `${uniqueSortedSlots[i].split('-')[0]}-${uniqueSortedSlots[j + 1].split('-')[1]}`;
        j++; // Move to the next slot in the uniqueSortedSlots array
      } else {
        // If not contiguous, break the inner loop as we can't combine further
        break;
      }
    }

    // After potentially combining slots, check if the total duration meets sessionLength
    // and if the end time aligns with a 30-minute boundary.
    if (currentDuration >= sessionLength && (currentSpanEndParsed * 60) % 30 === 0) {
      result.push(currentLabel);
    }
  }

  // Use Set to ensure unique labels (in case different combinations yield same label)
  return [...new Set(result)];
};

// Helper function to check payment status
const isPaymentPaidOrPartial = (enrollment) => {
  if (!enrollment || (!enrollment.feeDetails && !enrollment.installments)) {
    return false;
  }

  // Check feeDetails if present
  if (enrollment.feeDetails && enrollment.feeDetails.length > 0) {
    const hasPaid = enrollment.feeDetails.some(detail => detail.status === 'Paid');
    const hasPartial = enrollment.feeDetails.some(detail => detail.status === 'Partial');
    const allUnpaid = enrollment.feeDetails.every(detail => detail.status === 'Unpaid');
    return hasPaid || hasPartial || !allUnpaid;
  }

  // Check installments if feeDetails not present or empty
  if (enrollment.installments && enrollment.installments.length > 0) {
    const hasPaidInstallment = enrollment.installments.some(inst => inst.status === 'Paid'); // Check only for 'Paid' installments
    return hasPaidInstallment;
  }

  return false; // Default to false if no payment details
};
// Basic Popup Component (Can be styled further with CSS)
const PopupComponent = ({ type, message, onClose }) => {
    let backgroundColor = '';
    let borderColor = '';
    switch (type) {
        case 'success':
            backgroundColor = 'rgba(144, 238, 144, 0.9)'; // lightgreen with opacity
            borderColor = 'green';
            break;
        case 'error':
            backgroundColor = 'rgba(240, 128, 128, 0.9)'; // lightcoral with opacity
            borderColor = 'red';
            break;
        case 'info':
            backgroundColor = 'rgba(173, 216, 230, 0.9)'; // lightblue with opacity
            borderColor = 'steelblue';
            break;
        default:
            backgroundColor = 'rgba(255, 255, 204, 0.9)'; // lightyellow with opacity
            borderColor = 'orange';
    }

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 25px',
            backgroundColor: backgroundColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            animation: 'fadeInOut 4s forwards' // Basic animation
        }}>
            <span>{message}</span>
            <button
                onClick={onClose}
                style={{
                    marginLeft: '15px',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: '#333',
                    fontWeight: 'bold'
                }}
            >
                &times;
            </button>
            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};

const StudentFormModal = ({ initialData, onSave, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
  const [verticalOptions, setVerticalOptions] = useState([]);
  const [domainOptions, setDomainOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [suggestionReason, setSuggestionReason] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [errors, setErrors] = useState({});
  const role = localStorage.getItem('role');
  const isAdminOrSuperUser = role === 'admin' || role === 'super_user';

  // State for popups
  const [popup, setPopup] = useState({ visible: false, type: '', message: '' });

  // Function to show UI popups
  const showUIPopup = (type, message) => {
      setPopup({ visible: true, type, message });
      setTimeout(() => {
          setPopup({ visible: false, type: '', message: '' });
      }, 4000); // Popup disappears after 4 seconds
  };

  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', regDate: '',
    vertical: '', domain: '', category: '',
    courseType: 'Individual', courseName: '', comboCourses: [],
    amount: '', frequency: '', duration: '', sessionLength: 1,
    startDate: '', endDate: '', breakDates: [],
    paymentMode: 'Single',
    feeDetails: [{ sno: 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }],
    installments: [{ sno: 1, dueDate: '', amount: '', balance: '', status: 'Unpaid' }],
    preferredTimeSlot: '', preferredFrequency: '', preferredDuration: '',
    staffId: ''
  });

// ✅ Load initial data and set both formData.staffId AND selectedStaffId
useEffect(() => {
  if (initialData) {
    console.log('🟡 Loaded initialData:', initialData);

    const cleanFeeDetails = (initialData.feeDetails || []).map(det => ({
      ...det,
      date: det.date && !isNaN(new Date(det.date)) ? new Date(det.date).toISOString().split('T')[0] : ''
    }));
    const cleanInstallments = (initialData.installments || []).map(ins => ({
      ...ins,
      dueDate: ins.dueDate && !isNaN(new Date(ins.dueDate)) ? new Date(ins.dueDate).toISOString().split('T')[0] : ''
    }));
     const initialComboCourses = (initialData.enrollmentId?.comboCourses || [])
      .filter(name => name) // Filter out empty strings if any
      .map(courseName => {
        const course = courses.find(c => c.name === courseName && c.courseType === 'Individual');
        return course ? { courseId: course._id, courseName: course.name } : { courseId: '', courseName: courseName };
      });
    const updated = {
      ...initialData,
      courseName: initialData.courseType === 'Individual' && initialData.enrollmentId?.courseId?._id
        ? initialData.enrollmentId.courseId._id
        : initialData.enrollmentId?.courseName || '',
      comboCourses: initialData.courseType === 'Combo' ? initialComboCourses : [],
      regDate: initialData.regDate ? new Date(initialData.regDate).toISOString().split('T')[0] : '',
      startDate: initialData.enrollmentId?.startDate ? new Date(initialData.enrollmentId.startDate).toISOString().split('T')[0] : '',
      endDate: initialData.enrollmentId?.endDate ? new Date(initialData.enrollmentId.endDate).toISOString().split('T')[0] : '',
      amount: initialData.enrollmentId?.amount || '',
      duration: initialData.enrollmentId?.duration || '',
      // MODIFICATION START
      // Prioritize student's own fields, then enrollment's if available
      frequency: initialData.preferredFrequency || initialData.enrollmentId?.frequency || '', // Use preferredFrequency first
      sessionLength: initialData.sessionLength || initialData.enrollmentId?.sessionLength || 1, // Use sessionLength first
      // MODIFICATION END
      paymentMode: initialData.enrollmentId?.paymentMode || 'Single',
      feeDetails: cleanFeeDetails,
      installments: cleanInstallments,
      staffId: initialData.staffId?._id || '',
      preferredTimeSlot: initialData.preferredTimeSlot || '',
      preferredFrequency: initialData.preferredFrequency || '',
      preferredDuration: initialData.preferredDuration || '',
      breakDates: (initialData.breakDates || []).map(dateStr => {
        const timestamp = parseInt(dateStr, 10);
        return isNaN(timestamp) ? null : new Date(timestamp);
      }).filter(Boolean),
    };

    setFormData(prev => ({ ...prev, ...updated }));

    // Set selectedStaffId to match the staffId from initialData
    if (initialData.staffId && initialData.staffId._id) {
      setSelectedStaffId(initialData.staffId._id);
    } else if (typeof initialData.staffId === 'string') {
      setSelectedStaffId(initialData.staffId);
    }
  }
}, [initialData,courses]);

// ✅ Sync selectedStaffDetails when selectedStaffId changes and staffList is available
// This is the SINGLE SOURCE OF TRUTH for selectedStaffDetails
useEffect(() => {
  if (selectedStaffId && staffList.length > 0) {
    const staff = staffList.find(s => s._id === selectedStaffId);
    if (staff) {
      setSelectedStaffDetails(staff);

      // Only populate frequency if form doesn't already have a value from initialData
      // This is to ensure that if a preferred frequency is not already set in formData
      // (e.g., for a new student, or if initialData didn't have it),
      // it defaults to the staff's frequency.
      // If formData.preferredFrequency is already set from initialData, we keep it.
      if (!formData.preferredFrequency) {
        setFormData(prev => ({
          ...prev,
          preferredFrequency: staff.frequency,
        }));
      }
    } else {
      // If selectedStaffId is set but not found in staffList (e.g., staff list not fully loaded yet or invalid ID)
      setSelectedStaffDetails(null);
    }
  } else {
    // If selectedStaffId is empty or staffList is empty
    setSelectedStaffDetails(null);
  }
}, [selectedStaffId, staffList, formData.preferredFrequency]); // Added formData.preferredFrequency as a dependency for completeness

  // Fetch all courses to populate course dropdown, and extract vertical, domain, category options
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`);
        setCourses(res.data);

        const uniqueVerticals = [...new Set(res.data.map(c => c.vertical))];
        const uniqueDomains = [...new Set(res.data.map(c => c.domain))];
        const uniqueCategories = [...new Set(res.data.map(c => c.category))];

        setVerticalOptions(uniqueVerticals);
        setDomainOptions(uniqueDomains);
        setCategoryOptions(uniqueCategories);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!formData.courseName) {
      setStaffList([]);
      // Do NOT clear selectedStaffId or selectedStaffDetails here directly.
      // Let the other useEffect handle selectedStaffDetails based on selectedStaffId and staffList.
      return;
    }

    const fetchStaffByCourse = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/staff/by-course?courseId=${formData.courseName}`);
        setStaffList(res.data);
        // REMOVED: Redundant setSelectedStaffDetails call here.
        // The other useEffect ([selectedStaffId, staffList]) will handle this.
      } catch (err) {
        console.error('Failed to fetch staff by course:', err);
        setStaffList([]);
        // Do NOT clear selectedStaffDetails here directly.
      }
    };
    fetchStaffByCourse();
  }, [formData.courseName, initialData]); // initialData is a dependency to ensure refetch if student changes


  // Effect to calculate end date whenever relevant fields change
  useEffect(() => {
    const { duration, preferredFrequency, startDate, breakDates, sessionLength } = formData;

    if (!duration || !preferredFrequency || !startDate || !sessionLength) return;

    const totalHours = parseFloat(duration);
    const hoursPerSession = parseFloat(sessionLength);
    if (isNaN(totalHours) || isNaN(hoursPerSession) || hoursPerSession <= 0) return;

    const totalSessions = Math.ceil(totalHours / hoursPerSession);

    let allowedDays = [1];
    switch (preferredFrequency.toLowerCase()) {
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
      let jsDate = null;
      if (d instanceof Date) {
        jsDate = d; // Already a JS Date object
      } else if (typeof d === 'object' && d?.toDate) {
        jsDate = d.toDate(); // DatePicker object
      } else if (typeof d === 'string' || typeof d === 'number') {
        // Attempt to parse as timestamp or date string
        const timestamp = parseInt(d, 10);
        jsDate = !isNaN(timestamp) ? new Date(timestamp) : new Date(d); // Try both timestamp and date string
      }

      return jsDate && !isNaN(jsDate) ? jsDate.toISOString().split('T')[0] : null;
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
    formData.preferredFrequency,
    formData.startDate,
    formData.breakDates,
    formData.sessionLength
  ]);


  const handleChange = async (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === 'mobile') {
      if (value.length > 10 || !/^\d*$/.test(value)) {
        newErrors.mobile = 'Mobile number must be 10 digits and contain only numbers.';
      } else {
        delete newErrors.mobile;
      }
    } else if (name === 'startDate') {
      const regDate = new Date(formData.regDate);
      regDate.setHours(0, 0, 0, 0);
      const selectedStartDate = new Date(value);
      selectedStartDate.setHours(0, 0, 0, 0);
      if (selectedStartDate < regDate) {
        newErrors.startDate = 'Start date cannot be before registration date.';
      } else {
        delete newErrors.startDate;
      }
    } else if (name === 'courseType') {
      if (value === 'Individual') {
        setFormData(prev => ({
          ...prev,
          courseType: value,
          comboCourses: [], // Clear comboCourses if switching to Individual
          courseName: '', // Clear individual courseName
        }));
      } if(value === 'Combo') {
        setFormData(prev => ({
          ...prev,
          courseType: value,
          courseName: '', // Clear individual courseName
          comboCourses: [{ courseId: '', courseName: '' }], // Start with one empty combo course row
        }));
      }
    }
    else if (name === 'courseName') {
  const selectedCourse = courses.find(c => c._id === value);
  if (selectedCourse) {
    setFormData(prev => ({
      ...prev,
      duration: selectedCourse.duration, // ✅ Just store numeric
      vertical: selectedCourse.vertical,
      domain: selectedCourse.domain,
      category: selectedCourse.category,
    }));

      } else {
        setFormData(prev => ({
          ...prev,
          duration: '',
          vertical: '',
          domain: '',
          category: '',
        }));
      }
    } else if (name === 'staffId') {
      console.log('🟡 Staff ID changed:', value);
      setSelectedStaffId(value);
    // If the user deselects the staff, THEN we clear the dependent fields
    if (!value) {
      setFormData(prev => ({
        ...prev,
        preferredTimeSlot: '',
        preferredFrequency: '',
        sessionLength: 1 // Reset to default
      }));
    }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(newErrors);
  };

  const handleFeeDetailChange = (index, field, value) => {
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
    setFormData(prev => ({ ...prev, feeDetails: [...prev.feeDetails, { sno: prev.feeDetails.length + 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }] }));
  };

   const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...formData.installments];
    updatedInstallments[index][field] = value;

    // Calculate balance and set next installment amount if current installment is paid
    if (field === 'status') {
      if (value === 'Paid') {
        const paidAmount = parseFloat(updatedInstallments[index].amount) || 0;
        const totalCourseAmount = parseFloat(formData.amount) || 0;
        let remainingBalance = totalCourseAmount;

        // Sum up paid amounts from previous installments including current
        for (let i = 0; i <= index; i++) {
          if (updatedInstallments[i].status === 'Paid') {
            remainingBalance -= (parseFloat(updatedInstallments[i].amount) || 0);
          }
        }
        updatedInstallments[index].balance = remainingBalance > 0 ? remainingBalance : 0;

        // Set the amount for the next installment
        if (index + 1 < updatedInstallments.length) {
          updatedInstallments[index + 1].amount = remainingBalance > 0 ? remainingBalance : 0;
          updatedInstallments[index + 1].balance = 0; // Reset balance for next installment
          updatedInstallments[index + 1].status = 'Unpaid'; // Reset status for next installment
        }
      } else {
        // If status is not Paid, clear balance for current installment
        updatedInstallments[index].balance = '';
      }
    } else if (field === 'amount') {
      // If amount changes, status might implicitly become 'Unpaid' or 'Partial' based on UI logic/backend.
      // For now, only handle balance logic when status is 'Paid'
      const enteredAmount = parseFloat(value) || 0;
      const totalCourseAmount = parseFloat(formData.amount) || 0;
      let currentTotalPaid = 0;
      for (let i = 0; i < index; i++) {
        if (updatedInstallments[i].status === 'Paid') {
          currentTotalPaid += (parseFloat(updatedInstallments[i].amount) || 0);
        }
      }
      const remainingBalanceBeforeCurrent = totalCourseAmount - currentTotalPaid;
      updatedInstallments[index].balance = remainingBalanceBeforeCurrent - enteredAmount;

      if (updatedInstallments[index].balance <= 0) {
        updatedInstallments[index].status = 'Paid';
        updatedInstallments[index].balance = 0;
      } else if (enteredAmount > 0) {
        updatedInstallments[index].status = 'Partial';
      } else {
        updatedInstallments[index].status = 'Unpaid';
      }

      // Propagate balance to the next installment's amount
      if (index + 1 < updatedInstallments.length) {
        const nextAmount = updatedInstallments[index].balance;
        if (nextAmount !== undefined && nextAmount !== null && nextAmount >= 0) {
          updatedInstallments[index + 1].amount = nextAmount;
          updatedInstallments[index + 1].balance = 0; // Reset balance for next installment
          updatedInstallments[index + 1].status = 'Unpaid'; // Reset status for next installment
        }
      }
    }


    setFormData(prev => ({ ...prev, installments: updatedInstallments }));
  };

  const addInstallmentRow = () => {
    setFormData(prev => ({
      ...prev,
      installments: [
        ...prev.installments,
        {
          sno: prev.installments.length + 1,
          dueDate: '',
          amount: prev.installments.length > 0 ? prev.installments[prev.installments.length - 1].balance : '', // Set amount of new row to balance of previous
          balance: '',
          status: 'Unpaid'
        }
      ]
    }));
  };
const handleComboCourseChange = (index, courseId) => {
    const updatedComboCourses = [...formData.comboCourses];
    const selectedCourse = courses.find(c => c._id === courseId);

    if (selectedCourse) {
      updatedComboCourses[index] = {
        courseId: selectedCourse._id,
        courseName: selectedCourse.name
      };
    } else {
      updatedComboCourses[index] = { courseId: '', courseName: '' };
    }

    // Recalculate amount and duration for combo courses
    const totalAmount = updatedComboCourses.reduce((sum, course) => {
      const foundCourse = courses.find(c => c._id === course.courseId);
      return sum + (foundCourse ? foundCourse.fees : 0);
    }, 0);

    const totalDuration = updatedComboCourses.reduce((sum, course) => {
        const foundCourse = courses.find(c => c._id === course.courseId);
        // Ensure duration is a number for addition. Handle cases where it might be a string like "60 hrs".
        return sum + (foundCourse ? parseFloat(foundCourse.duration) : 0);
    }, 0);


    setFormData(prev => ({
      ...prev,
      comboCourses: updatedComboCourses,
      amount: totalAmount,
      duration: totalDuration.toString(), // Store back as string if expected
    }));
  };

  const addComboCourseRow = () => {
    if (formData.comboCourses.length < 10) { // Limit to 10 courses
      setFormData(prev => ({
        ...prev,
        comboCourses: [...prev.comboCourses, { courseId: '', courseName: '' }]
      }));
    } else {
      showUIPopup('info', 'Maximum of 10 combo courses can be added.');
    }
  };

  const removeComboCourseRow = (index) => {
    const updatedComboCourses = formData.comboCourses.filter((_, i) => i !== index);

    // Recalculate amount and duration after removal
    const totalAmount = updatedComboCourses.reduce((sum, course) => {
      const foundCourse = courses.find(c => c._id === course.courseId);
      return sum + (foundCourse ? foundCourse.fees : 0);
    }, 0);

    const totalDuration = updatedComboCourses.reduce((sum, course) => {
        const foundCourse = courses.find(c => c._id === course.courseId);
        return sum + (foundCourse ? parseFloat(foundCourse.duration) : 0);
    }, 0);

    setFormData(prev => ({
      ...prev,
      comboCourses: updatedComboCourses,
      amount: totalAmount,
      duration: totalDuration.toString(),
    }));
  };
  // The assignToBatch function now correctly makes the API call and uses UI popups
  const assignToBatch = async () => {
    // Ensure initialData is available and has necessary IDs and preferredTimeSlot
    if (!initialData || !initialData._id || !formData.courseName || !selectedStaffId || !formData.preferredTimeSlot) {
        showUIPopup('error', 'Student, Course, Staff, or Preferred Time Slot not selected.');
        return;
    }

    try {
        setIsAssigning(true); // Disable button while assigning
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/batches/assign`, {
            studentId: initialData._id,
            courseId: formData.courseName, // Use formData.courseName which holds the courseId
            staffId: selectedStaffId,   // Use selectedStaffId
            preferredTimeSlot: formData.preferredTimeSlot, // Use formData.preferredTimeSlot
        });

        if (response.data.success) {
            showUIPopup('success', response.data.message);
            setAssignmentStatus('assigned'); // Update UI state for assignment
            // Optionally, call onSave or a prop to refresh parent component's student list
            // onSave is typically for saving the student form itself, not just batch assignment.
            // You might need a separate callback or re-fetch logic in the parent component
        } else {
            showUIPopup('info', response.data.message); // For "Slot is full" etc.
        }
    } catch (error) {
        console.error('Error assigning student to batch:', error);
        showUIPopup('error', error.response?.data?.message || 'Failed to assign student to batch. Server error.');
    } finally {
        setIsAssigning(false); // Re-enable button
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      showUIPopup('error', 'Please fix the errors in the form.'); // Replaced alert
      return;
    }

    // Prepare enrollment data
    const enrollmentPayload = {
      courseId: formData.courseType === 'Individual' ? formData.courseName : null, // Only set courseId for Individual
      courseType: formData.courseType,
      courseName: formData.courseType === 'Individual' ? courses.find(c => c._id === formData.courseName)?.name : '', // Store name for Individual
      comboCourses: formData.courseType === 'Combo' ? formData.comboCourses.map(c => c.courseName).filter(Boolean) : [], // Map to names for Combo
      amount: parseFloat(formData.amount),
      frequency: formData.preferredFrequency,
      duration: formData.duration,
      sessionLength: parseInt(formData.sessionLength),
      startDate: formData.startDate,
      endDate: formData.endDate,
      paymentMode: formData.paymentMode,
      feeDetails: formData.feeDetails,
      installments: formData.paymentMode === 'Installment' ? formData.installments : []
    };


    const studentPayload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      regDate: formData.regDate,
      vertical: formData.vertical,
      domain: formData.domain,
      category: formData.category,
      preferredTimeSlot: formData.preferredTimeSlot,
      preferredFrequency: formData.preferredFrequency,
      preferredDuration: formData.preferredDuration,
      breakDates: formData.breakDates,
      staffId: selectedStaffId,
      enrollment: enrollmentPayload
    };

    onSave(studentPayload);
  };
   const showAssignToBatchButton = formData.paymentMode === 'Installment' && isPaymentPaidOrPartial(formData) && isAdminOrSuperUser;
  const getSessionLengthOptions = () => {
    if (!selectedStaffDetails || !selectedStaffDetails.maxHoursPerDay) return [];
    const options = [];
    for (let i = 1; i <= selectedStaffDetails.maxHoursPerDay; i++) {
      options.push(i);
    }
    return options;
  };

  const getPreferredFrequencyOptions = () => {
    if (!selectedStaffDetails) return [];

    const staffFrequency = selectedStaffDetails.frequency;
    const staffWorkingDays = selectedStaffDetails.workingDays || [];
    const options = [];

    // Base options always available
    options.push('Daily');
    options.push('Alternate Days');

    if (staffWorkingDays.includes('saturday') || staffWorkingDays.includes('sunday')) {
      options.push('Weekend');
    }
    if (staffWorkingDays.includes('only sunday')) {
        options.push('Only Sunday');
    }
    if (staffWorkingDays.includes('only saturday')) {
        options.push('Only Saturday');
    }

    // Refine based on staff's specific frequency setting
    switch (staffFrequency) {
      case 'daily':
        break;
      case 'alternatedays':
        options.length = 0;
        options.push('Alternate Days');
        break;
      case 'weekend':
        options.length = 0;
        options.push('Weekend');
        if (staffWorkingDays.includes('saturday')) options.push('Only Saturday');
        if (staffWorkingDays.includes('sunday')) options.push('Only Sunday');
        break;
      case 'only sunday':
        options.length = 0;
        options.push('Only Sunday');
        break;
      default:
        break;
    }
    return [...new Set(options)];
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialData ? 'Edit Student' : 'Add New Student'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Student Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required maxLength="10" />
              {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Registration Date:</label>
              <DatePicker
                value={formData.regDate}
                onChange={(date) => {
                  let formattedDate = '';
                  if (date) {
                    const d = date.toDate();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}`;
                  }
                  handleChange({ target: { name: 'regDate', value: formattedDate } });
                }}
                format="YYYY-MM-DD"
                minDate={new Date()}
              />
              {errors.regDate && <span className="error">{errors.regDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vertical</label>
              <select name="vertical" value={formData.vertical} onChange={handleChange} required>
                <option value="">Select Vertical</option>
                {verticalOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Domain</label>
              <select name="domain" value={formData.domain} onChange={handleChange} required>
                <option value="">Select Domain</option>
                {domainOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categoryOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Course Type</label>
              <select name="courseType" value={formData.courseType} onChange={handleChange} required>
                <option value="Individual">Individual</option>
                <option value="Combo">Combo</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Course Name(s)</label>
              {formData.courseType === 'Individual' ? (
                <select name="courseName" value={formData.courseName} onChange={handleChange} required>
                  <option value="">Select Course</option>
                  {courses.filter(c => c.courseType === 'Individual').map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              ) : (
                <>
                  {formData.comboCourses.map((comboCourse, index) => {
                    const selectedCourseIds = formData.comboCourses
                      .filter((_, i) => i !== index) // Exclude current row's selection for filtering others
                      .map(c => c.courseId);

                    const availableCourses = courses.filter(c =>
                      c.courseType === 'Individual' &&
                      !selectedCourseIds.includes(c._id)
                    );

                    return (
                      <div key={index} className="combo-course-row">
                        <select
                          value={comboCourse.courseId}
                          onChange={(e) => handleComboCourseChange(index, e.target.value)}
                          required
                          style={{ width: '85%', marginRight: '5px' }}
                        >
                          <option value="">Select Course {index + 1}</option>
                          {availableCourses.map(course => (
                            <option key={course._id} value={course._id}>{course.name}</option>
                          ))}
                        </select>
                        {formData.comboCourses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeComboCourseRow(index)}
                            className="remove-combo-button"
                            title="Remove Course"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {formData.comboCourses.length < 10 && (
                    <button type="button" onClick={addComboCourseRow} className="add-combo-button">
                      + Add Course
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Total Duration</label>
              <input type="text" name="duration" value={formData.duration} readOnly />
            </div>
            <div className="form-group">
              <label>Staff Name</label>
              <select name="staffId" value={selectedStaffId} onChange={handleChange} required>
                <option value="">Select Staff</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Payment Type</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
                <option value="Single">Single</option>
                <option value="Installment">Installment</option>
              </select>
            </div>
          </div>

          {/* Fee Details / Installments */}
          {formData.paymentMode === 'Single' && (
            <div className="fee-table">
              <h4>💰 Fee Details</h4>
              <table>
                <thead>
                  <tr><th>S.NO</th><th>Date</th><th>Rec No.</th><th>Amount</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {formData.feeDetails.map((row, index) => (
                    <tr key={index}>
                      <td>{row.sno}</td>
                      <td><input type="date" value={row.date} onChange={(e) => handleFeeDetailChange(index, 'date', e.target.value)} /></td>
                      <td><input type="text" value={row.receiptNo} onChange={(e) => handleFeeDetailChange(index, 'receiptNo', e.target.value)} /></td>
                      <td><input type="number" value={row.amount} onChange={(e) => handleFeeDetailChange(index, 'amount', e.target.value)} /></td>
                      <td><input type="number" value={row.balance} readOnly /></td>
                      <td><input type="text" value={row.status} readOnly /></td>
                      <td>
                        {/* Remove button if needed */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addFeeDetailRow}>+ Add Fee Detail</button>
            </div>
          )}

          {formData.paymentMode === 'Installment' && (
              <div className="installments-section">
                <h3>Installments</h3>
                <table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Balance</th> {/* Added Balance column header */}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.installments.map((row, index) => (
                      <tr key={index}>
                        <td>{row.sno}</td>
                        <td><input type="date" value={row.dueDate} onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)} /></td>
                        <td><input type="number" value={row.amount} onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)} /></td>
                        <td><input type="number" value={row.balance} readOnly /></td> {/* Display balance */}
                        <td>
                          <select value={row.status} onChange={(e) => handleInstallmentChange(index, 'status', e.target.value)}> {/* Dropdown for status */}
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={addInstallmentRow} className="add-button">Add Installment</button>
              </div>
            )}

          <div className="form-row">
            <div className="form-group">
              <label>Session Length</label>
              <select name="sessionLength" value={formData.sessionLength} onChange={handleChange} required disabled={!selectedStaffDetails}>
                {getSessionLengthOptions().map(len => (
                  <option key={len} value={len}>{len}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Frequency</label>
              <select name="preferredFrequency" value={formData.preferredFrequency} onChange={handleChange} required disabled={!selectedStaffDetails}>
                <option value="">Select Frequency</option>
                {getPreferredFrequencyOptions().map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Time Slot</label>
              <select name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleChange} required disabled={!selectedStaffDetails || !formData.sessionLength}>
                <option value="">Select Time Slot</option>
                {generateSlotOptions(formData.sessionLength, selectedStaffDetails?.availability, selectedStaffDetails?.workingDays).map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => {
                  let formattedDate = '';
                  if (date) {
                    const d = date.toDate();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}`;
                  }
                  handleChange({
                    target: {
                      name: 'startDate',
                      value: formattedDate
                    }
                  });
                }}
                format="YYYY-MM-DD"
                inputProps={{ readOnly: true }}
              />
              {errors.startDate && <span className="error">{errors.startDate}</span>}
            </div>
                 <label>Break Dates (Optional):</label>
          <DatePicker
            multiple
            value={formData.breakDates}
            onChange={(dates) => setFormData(prev => ({ ...prev, breakDates: dates }))}
            format="YYYY-MM-DD"
          />

            <div className="form-group">
              <label>End Date</label>
              <input name="endDate" type="date" value={formData.endDate} readOnly />

            </div>
          </div>

          <div className="form-actions">
            {/* "Assign to Batch" button conditional rendering updated to use initialData */}
            {initialData && initialData.enrollmentId && isPaymentPaidOrPartial(initialData.enrollmentId) && (
                <button
                    type="button" // Use type="button" to prevent form submission
                    onClick={assignToBatch} // Updated to call the correct function
                    className="assign-batch-button" // Add your CSS class
                    disabled={isAssigning} // Disable button during API call
                >
                    🚀 Assign to Batch
                </button>
            )}
            <button
                  type="button"
                  onClick={() => {
                    // Removed window.alert, now uses showUIPopup
                    showUIPopup('info', 'Student will be added to waiting list for admin approval/unpaid.');
                    setAssignmentStatus('waiting');
                    // The assignToBatch here seems to conflict with the main assignment flow
                    // You might need to refine this "Reject All" logic.
                    // For now, I'm just removing the alert and keeping the original logic.
                  }}
                >
                  🚫 Reject All
                </button>
            <button type="submit" disabled={Object.keys(errors).length > 0}>💾 Save</button>
            <button type="button" onClick={onCancel}>❌ Cancel</button>
          </div>
        </form>
      </div>
      {/* Render the PopupComponent */}
      {popup.visible && (
          <PopupComponent type={popup.type} message={popup.message} onClose={() => setPopup({ visible: false })} />
      )}
    </div>
  );
};

export default StudentFormModal;