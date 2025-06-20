  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import DelayedBatches from "./DelayedBatches"
  import FeeManagementView from "./FeeManagementView";
  const BatchTab = () => {
    const [batches, setBatches] = useState([]);
    const [vacantBatches, setVacantBatches] = useState([]);
    const [waitlist, setWaitlist] = useState([]);

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      const batchRes = await axios.get("http://localhost:5000/api/batches");
      const vacantRes = await axios.get("http://localhost:5000/api/batches/vacant");
      const waitlistRes = await axios.get("http://localhost:5000/api/batches/waitlist");

      setBatches(batchRes.data);
      setVacantBatches(vacantRes.data);
      setWaitlist(waitlistRes.data);
    };

    const assignToBatch = async (studentId, batchId) => {
      await axios.post("http://localhost:5000/api/batches/assign", { studentId, batchId });
      fetchData();
    };

    return (
      <div className="batch-tab">
        <h2>📊 Batch Management</h2>

        {/* Main Batches Table */}
        <table>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Batch Timing</th>
              <th>Duration</th>
              <th>Students</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => (
              <tr key={b._id}>
                <td>{b.course?.name || "N/A"}</td>
                <td>{b.batchTiming}</td>
                <td>{b.course?.duration || b.batchDuration}</td>
                <td>{b.students?.length}/{b.maxStudents}</td>
                <td>{b.status}</td>
                <td>{new Date(b.startDate).toLocaleDateString()}</td>
                <td>{new Date(b.endDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Waiting List Section */}
        <div className="waiting-section">
          <h3>📥 Waiting List</h3>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Requested Timing</th>
                <th>Vacant?</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map(w => {
                const matchBatch = vacantBatches.find(b =>
                  b.course?.name === w.course && b.batchTiming === w.requestedTiming
                );
                return (
                  <tr key={w.student._id}>
                    <td>{w.student.name}</td>
                    <td>{w.course}</td>
                    <td>{w.requestedTiming}</td>
                    <td>{matchBatch ? "Yes" : "No"}</td>
                    <td>
                      {matchBatch && (
                        <button onClick={() => assignToBatch(w.student._id, matchBatch._id)}>
                          Add to Batch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DelayedBatches batches={batches} />
        <FeeManagementView />
      </div>
    );
  };

  export default BatchTab;
