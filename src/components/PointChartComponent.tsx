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
  title: string
  labels: any
  datasets: {
    label: string
    data: any
    backgroundColor: string
    borderColor: string
  }[]
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

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => Math.random()),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => Math.random()),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

export const PointChartComponent: React.FC<CustomProps> = ({ title, labels, datasets }) => {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    setData({
      labels,
      datasets,
    });
  }, [])
  return (
    <div className='chart-box'>
      <h3>{title}</h3>
      {data && data?.datasets?.length > 0 ? <Line options={options} data={data} /> : <>No data to display.</>}
    </div>
  )
}

export default PointChartComponent;