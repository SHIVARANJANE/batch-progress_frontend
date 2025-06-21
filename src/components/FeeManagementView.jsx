import React, { useState, useEffect } from "react";
import axios from "axios";  

function FeeManagementView() {
  const [pendingFees, setPendingFees] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const fetchFees = async () => {
      const pendingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/fees/pending`);
      const monthRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/fees/monthly`);
      setPendingFees(pendingRes.data);
      setMonthlyTotal(monthRes.data.collected);
    };
    fetchFees();
  }, []);

  return (
    <div className="fee-section">
      <h3>💰 Fee Management</h3>
      <h4>Monthly Collected: ₹{monthlyTotal}</h4>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Batch Timing</th>
            <th>Expected</th>
            <th>Collected</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          {pendingFees.map((f, index) => (
            <tr key={index}>
              <td>{f.course}</td>
              <td>{f.batchTiming}</td>
              <td>₹{f.expected}</td>
              <td>₹{f.collected}</td>
              <td>₹{f.pending}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default FeeManagementView;
