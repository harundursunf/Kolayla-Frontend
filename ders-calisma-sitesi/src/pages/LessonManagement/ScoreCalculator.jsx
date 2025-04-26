import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const NetHesaplayici = () => {
  const [nets, setNets] = useState([]); 
  const [aytMat, setAytMat] = useState(''); 
  const [tytMat, setTytMat] = useState(''); 

  const handleAddNet = () => {
    if (aytMat.trim() || tytMat.trim()) {
      setNets([
        ...nets,
        { aytMat: parseFloat(aytMat), tytMat: parseFloat(tytMat), date: new Date().toLocaleDateString() }
      ]);
      setAytMat('');
      setTytMat('');
    }
  };

  const handleDeleteNet = (index) => {
    const updatedNets = nets.filter((_, i) => i !== index);
    setNets(updatedNets);
  };

  // AYT ve TYT için netlerin ortalamasını hesaplama
  const calculateAverages = () => {
    if (nets.length === 0) return { averageAyt: 0, averageTyt: 0 }; 
    const totalAyt = nets.reduce((acc, net) => acc + (net.aytMat || 0), 0); 
    const totalTyt = nets.reduce((acc, net) => acc + (net.tytMat || 0), 0); 
    const averageAyt = totalAyt / nets.length;
    const averageTyt = totalTyt / nets.length;
    return { averageAyt, averageTyt };
  };

  // Grafik için veri
  const chartData = {
    labels: nets.map((_, index) => `Deneme ${index + 1}`),
    datasets: [
      {
        label: 'AYT Deneme Neti',
        data: nets.map((net) => net.aytMat),
        
        borderColor: '#1DE9B6', 
        backgroundColor: 'rgba(29, 233, 182, 0.5)', 
        pointBackgroundColor: '#00BFA5', 
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8, 
        borderWidth: 3,
        tension: 0.4,
        fill: true, 
      },
      {
        label: 'TYT Deneme Neti',
        data: nets.map((net) => net.tytMat),
       
        borderColor: '#42A5F5', 
        backgroundColor: 'rgba(66, 165, 245, 0.5)',
        pointBackgroundColor: '#2196F3', 
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8, 
        borderWidth: 3,
        tension: 0.4,
        fill: true, 
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Roboto, sans-serif', 
            weight: 'bold',
          },
          usePointStyle: true, 
        },
      },
      tooltip: {
        backgroundColor: 'rgba(33, 33, 33, 0.9)',
        titleColor: '#fff',
        bodyColor: '#E0E0E0', 
        bodyFont: {
          size: 14,
          family: 'Roboto, sans-serif',
        },
        titleFont: {
          size: 16,
          family: 'Roboto, sans-serif',
          weight: 'bold',
        },
        padding: 12, 
        cornerRadius: 8, 
        displayColors: true, 
      },
      title: { 
        display: true,
        text: 'AYT ve TYT Deneme Sınavı Netleri Takibi',
        font: {
          size: 20,
          family: 'Roboto, sans-serif',
          weight: 'bold',
        },
        color: '#333', 
        padding: {
          top: 10,
          bottom: 30,
        },
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)', 
          drawBorder: false, 
        },
        title: {
          display: true,
          text: 'Denemeler',
          font: {
            size: 16,
            family: 'Roboto, sans-serif',
            weight: 'bold',
          },
          color: '#555', 
        },
        ticks: {
          font: {
            size: 12,
            family: 'Roboto, sans-serif',
          },
          color: '#666',
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)', 
          drawBorder: false, 
        },
        title: {
          display: true,
          text: 'Netler',
          font: {
            size: 16,
            family: 'Roboto, sans-serif',
            weight: 'bold',
          },
          color: '#555', 
        },
        ticks: { 
          font: {
            size: 12,
            family: 'Roboto, sans-serif',
          },
          color: '#666',
        },
        beginAtZero: true, 
      },
    },
    hover: { // Hover genel ayarları
      mode: 'nearest',
      intersect: true
    },
    animation: { // Grafik çizim animasyonu
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  const barChartOptions = {
    ...chartOptions, // Ortak seçenekleri al
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'AYT ve TYT Matematik Netleri Karşılaştırması', 
        font: {
          size: 20,
          family: 'Roboto, sans-serif',
          weight: 'bold',
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 30,
        },
      }
    },
    scales: {
      x: {
        ...chartOptions.scales.x,
        grid: {
          display: false 
        }
      },
      y: {
        ...chartOptions.scales.y,
        beginAtZero: true,
      }
    }
  };
  const { averageAyt, averageTyt } = calculateAverages();

  return (
    <div className="mt-[150px] bg-white p-6 rounded-3xl shadow-lg w-full max-w-[1163px] flex flex-col items-center space-y-8 m mx-auto">
      <div className="w-full flex flex-col items-center space-y-6">
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-[#2979FF]">
          AYT ve TYT Netlerinizi Kaydedin!
        </h2>
        <p className="mt-2 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-green-50 to-white p-6 rounded-lg shadow-lg border border-green-100">
          📋 Netlerinizi düzenli bir şekilde takip edin.
        </p>

        <div className="mt-4 w-full max-w-md">
          <input
            type="number" 
            value={aytMat}
            onChange={(e) => setAytMat(e.target.value)}
            placeholder="AYT Deneme Neti"
            className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#1DE9B6]" 
          />
          <input
            type="number" 
            value={tytMat}
            onChange={(e) => setTytMat(e.target.value)}
            placeholder="TYT Deneme Neti"
            className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#42A5F5] mt-2" 
          />
          <button
            onClick={handleAddNet}
            className="bg-[#00BFFF] hover:bg-[#0099CC] text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mt-4 w-full"
          >
            Net Ekle
          </button>
        </div>
    
        <div className="w-full mt-4 max-h-[300px] overflow-y-auto">
          {nets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {nets.map((net, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-xl shadow-lg flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Deneme {index + 1} ({net.date})
                    </span>
                    <button
                      onClick={() => handleDeleteNet(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AYT: {net.aytMat}</span>
                    <span className="text-sm text-gray-600">TYT: {net.tytMat}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Henüz bir net eklenmedi.</p>
          )}
        </div>
      </div>
      <div className="w-full max-w-[900px] h-[400px] bg-gray-100 p-6 rounded-lg shadow-md"> {/* Boyutları ayarla */}
        {nets.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p className="text-gray-500 text-center">Netleri görmek için ekleyin.</p>
        )}
      </div>
      <div className="w-full max-w-md mt-8">
        <div className="mt-4 text-center text-xl font-bold text-gray-700">
          AYT Ortalaması: {averageAyt.toFixed(2)} | TYT Ortalaması: {averageTyt.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default NetHesaplayici;