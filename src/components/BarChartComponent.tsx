import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CustomProps {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
      text: "Bar Chart",
    },
  },
};

const BarChartComponent: React.FC<CustomProps> = ({ title, labels, datasets }) => {
  const [data, setData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    setData({
      labels,
      datasets,
    });
  }, [labels, datasets]); // ✅ re-run when props change

  return (
    <div className="chart-box">
      <h3>{title}</h3>
      {data?.datasets?.length > 0 ? (
        <Bar options={options} data={data} />
      ) : (
        <>No data to display.</>
      )}
    </div>
  );
};

export default BarChartComponent;
