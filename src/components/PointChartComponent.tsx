import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CustomProps {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
      text: 'Line Chart',
    },
  },
};

const PointChartComponent: React.FC<CustomProps> = ({ title, labels, datasets }) => {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    setData({ labels, datasets });
  }, [labels, datasets]); // ✅ update chart when props change

  return (
    <div className="chart-box">
      <h3>{title}</h3>
      {data.datasets.length > 0 ? (
        <Line options={options} data={data} />
      ) : (
        <>No data to display.</>
      )}
    </div>
  );
};

export default PointChartComponent;
