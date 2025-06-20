import React from 'react';

function DelayedBatches({ batches }) {
  return (
    <div className="delayed-section">
      <h3>⏱️ Delayed Batches</h3>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Timing</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.filter(b => b.status === "Delayed").map(b => (
            <tr key={b._id}>
              <td>{b.course?.name || "N/A"}</td>
              <td>{b.batch?.batchTiming}</td>
              <td>{new Date(b.course?.startDate).toLocaleDateString()}</td>
              <td>{new Date(b.course?.endDate).toLocaleDateString()}</td>
              <td>{b.batch?.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default DelayedBatches;
