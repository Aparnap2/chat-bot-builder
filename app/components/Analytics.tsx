import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import type { AnalyticsData } from '~/types/types';

Chart.register(...registerables);

interface AnalyticsChartProps {
  analyticsData: AnalyticsData[];
}

function AnalyticsChart({ analyticsData }: AnalyticsChartProps) {
  const chartData = useMemo(() => ({
    labels: analyticsData.map(data => data.date),
    datasets: [{
      label: 'Messages Over Time',
      data: analyticsData.map(data => data.messages),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
    }],
  }), [analyticsData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Messages Trend' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }), []);

  return (
    <div className="h-64 w-full">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
}

export default AnalyticsChart;