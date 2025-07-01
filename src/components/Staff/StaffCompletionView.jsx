import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StaffCompletionView.css';
import { CSVLink } from 'react-csv';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const StaffCompletionView = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/staff/completions`).then(res => setData(res.data));
  }, []);

  const allMonths = Array.from(new Set(
    data.flatMap(staff =>
      Object.keys(staff.completions)
    )
  )).sort();

  const totalCompletions = data.map(d =>
    Object.values(d.completions).reduce((sum, val) => sum + val, 0)
  );

  const totalSum = totalCompletions.reduce((a, b) => a + b, 0);

  const doughnutData = {
    labels: data.map(d => `${d.name} (${d.avgFeedback !== undefined ? `Avg: ${d.avgFeedback}` : 'No Feedback'})`),
    datasets: [{
      label: 'Total Completions',
      data: totalCompletions,
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#C9CBCF', '#B2FF66',
        '#66FFB2', '#FF66B2'
      ]
    }]
  };

  const doughnutOptions = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const percentage = ((value / totalSum) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14,
        }
      },
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const percentage = ((value / totalSum) * 100).toFixed(1);
            const staff = data[context.dataIndex];
            return `${context.label}: ${value} (${percentage}%) | Avg Feedback: ${staff?.avgFeedback ?? 'N/A'}`;
          }
        }
      }
    }
  };

  const csvHeaders = [
    { label: "Staff Name", key: "name" },
    { label: "Avg Feedback", key: "avgFeedback" },
    ...allMonths.map(month => ({ label: month, key: month }))
  ];

  const csvData = data.map(staff => {
    const row = { name: staff.name, avgFeedback: staff.avgFeedback };
    allMonths.forEach(month => {
      row[month] = staff.completions[month] || 0;
    });
    return row;
  });

  return (
    <div className="completion-view">
      <h3>📊 Monthly Batch Completion per Staff</h3>

      <div className="completion-controls">
        <button onClick={() => window.print()} className="export-btn">🖨️ Print Report</button>
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename="staff_batch_completion.csv"
          className="export-btn"
        >
          📁 Export CSV
        </CSVLink>
      </div>

      <table>
        <thead>
          <tr>
            <th>Staff Name</th>
            <th>Avg Feedback</th>
            {allMonths.map(month => <th key={month}>{month}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(staff => (
            <tr key={staff.email}>
              <td>{staff.name}</td>
              <td>{staff.avgFeedback ?? 'N/A'}</td>
              {allMonths.map(month => (
                <td key={month}>{staff.completions[month] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="chart-container">
        {data.length > 0 ? (
          <Doughnut
            data={doughnutData}
            options={doughnutOptions}
            plugins={[ChartDataLabels]}
          />
        ) : (
          <p>No data to display</p>
        )}
      </div>
    </div>
  );
};

export default StaffCompletionView;