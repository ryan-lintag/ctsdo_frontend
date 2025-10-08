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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CustomProps {
  title: string;
  labels: any;
  datasets: {
    label: string;
    data: any;
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

export const BarChartComponent: React.FC<CustomProps> = ({
  title,
  labels,
  datasets,
}) => {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    setData({
      labels,
      datasets,
    });
  }, []);
  return (
    <div className="chart-box">
      <h3>{title}</h3>
      {data && data?.datasets?.length > 0 ? (
        <Bar options={options} data={data} />
      ) : (
        <>No data to display.</>
      )}
    </div>
  );
};

export default BarChartComponent;
