// components/AnalyticsChart.tsx
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import type { AnalyticsData } from '../types/types'; // Assuming AnalyticsData type is defined

Chart.register(...registerables);

interface AnalyticsChartProps {
  analyticsData: AnalyticsData[]; // Expecting an array of AnalyticsData
}

function AnalyticsChart({ analyticsData }: AnalyticsChartProps) {
  const chartData = useMemo(() => {
    return {
      labels: analyticsData.map(data => data.date), // Assuming AnalyticsData has a date field
      datasets: [
        {
          label: 'Messages Over Time',
          data: analyticsData.map(data => data.messages), // Assuming AnalyticsData has a messages field
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  }, [analyticsData]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Messages Trend',
        },
      },
    };
  }, []);

  return <Line options={chartOptions} data={chartData} />;
}

export default AnalyticsChart;