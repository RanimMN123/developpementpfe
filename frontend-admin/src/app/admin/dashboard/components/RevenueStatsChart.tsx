'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, BarChart, Bar, ComposedChart
} from 'recharts';
import {
  Calendar, RefreshCw, TrendingUp,
  ChevronDown, Loader2, BarChart2, ArrowUpRight, AlertCircle
} from 'lucide-react';
import TndIcon from './TndIcon';
import './charts.css';

type RevenueData = {
  date: string;
  total: number;
  formattedDate?: string;
};

type ChartType = 'line' | 'area' | 'bar' | 'composed';
type TimeRange = '7days' | '30days' | '90days' | 'year';

const DailyRevenueChart = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Données calculées
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [avgRevenue, setAvgRevenue] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);
  const [highestDay, setHighestDay] = useState<{date: string, amount: number}>({date: '', amount: 0});

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Aucun token d\'authentification trouvé');
        setIsLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:3000/orders/daily-revenue?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedData = res.data.map((item: RevenueData) => ({
        ...item,
        formattedDate: formatDate(item.date)
      }));

      setRevenueData(formattedData);

      // Calculer statistiques
      if (formattedData.length > 0) {
        // Total du revenu
        const total = formattedData.reduce((sum: number, item: RevenueData) => sum + item.total, 0);
        setTotalRevenue(total);

        // Moyenne par jour
        setAvgRevenue(total / formattedData.length);

        // Jour avec le plus de revenu
        const maxRevenueDay = formattedData.reduce((max: {date: string, amount: number}, item: RevenueData) =>
          item.total > max.amount ? {date: item.formattedDate || item.date, amount: item.total} : max,
          {date: '', amount: 0}
        );
        setHighestDay(maxRevenueDay);

        // Taux de croissance
        if (formattedData.length > 1) {
          const firstHalf = formattedData.slice(0, Math.floor(formattedData.length / 2));
          const secondHalf = formattedData.slice(Math.floor(formattedData.length / 2));

          const firstHalfSum = firstHalf.reduce((sum: number, item: RevenueData) => sum + item.total, 0);
          const secondHalfSum = secondHalf.reduce((sum: number, item: RevenueData) => sum + item.total, 0);

          if (firstHalfSum > 0) {
            const growth = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
            setGrowthRate(parseFloat(growth.toFixed(1)));
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données de revenu');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
      if (timeRange === 'year') {
        options.month = 'short';
        options.year = 'numeric';
      }
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (e) {
      return dateString;
    }
  };

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(montant);
  };

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case '7days': return '7 derniers jours';
      case '30days': return '30 derniers jours';
      case '90days': return '90 derniers jours';
      case 'year': return '12 derniers mois';
      default: return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-700">{payload[0].payload.formattedDate || label}</p>
          <p className="text-teal-600 font-medium">
            {formatMontant(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = useMemo(() => {
    if (revenueData.length === 0) {
      return null;
    }

    const strokeColor = '#2dd4bf';
    const fillColor = '#5eead4';

    const commonProps = {
      data: revenueData,
      margin: { top: 5, right: 20, left: 10, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}TND`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Revenue Agents</span>} />
            <Line
              type="monotone"
              dataKey="total"
              name="Revenue Agents"
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ fill: strokeColor, r: 3 }}
              activeDot={{ r: 6, fill: strokeColor }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}TND`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Revenue Agents</span>} />
            <Area
              type="monotone"
              dataKey="total"
              name="Revenue Agents"
              stroke={strokeColor}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}TND`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Revenue Agents</span>} />
            <Bar
              dataKey="total"
              name="Revenue Agents"
              fill={fillColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}TND`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Revenue Agents</span>} />
            <Bar
              dataKey="total"
              barSize={20}
              fill={fillColor}
              name="Revenue Agents"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Tendance"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        );

      default:
        return null;
    }
  }, [revenueData, chartType, timeRange]);

  const chartTypeOptions: {label: string, value: ChartType, icon: React.ReactNode}[] = [
    { label: 'Ligne', value: 'line', icon: <TrendingUp size={16} /> },
    { label: 'Aire', value: 'area', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 18h18M3 12h18M3 6h18"/> </svg> },
    { label: 'Barres', value: 'bar', icon: <BarChart2 size={16} /> },
    { label: 'Composé', value: 'composed', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 20V10M12 20V4M4 20v-6M22 4L12 14 2 4"/> </svg> }
  ];

  const timeRangeOptions: {label: string, value: TimeRange, icon: React.ReactNode}[] = [
    { label: '7 jours', value: '7days', icon: <Calendar size={16} /> },
    { label: '30 jours', value: '30days', icon: <Calendar size={16} /> },
    { label: '90 jours', value: '90days', icon: <Calendar size={16} /> },
    { label: '12 mois', value: 'year', icon: <Calendar size={16} /> }
  ];

  return (
    <div className="chart-container stat-card-chart relative overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100 p-4 group hover:shadow-xl transition-all duration-300">
      {/* Gradient Background - Réduit */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-20"></div>

      {/* Decorative Elements - Réduits */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-3 rounded-full transform translate-x-6 -translate-y-6"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400 to-cyan-500 opacity-3 rounded-full transform -translate-x-4 translate-y-4"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 card-animate-in">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-md icon-animate icon-glow">
              <TndIcon className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center number-animate">
                Revenue Agents
              </h2>
              <div className="text-gray-600 text-xs mt-1 flex items-center card-animate-in">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-2 gradient-animate"></div>
                <span>Évolution des revenus générés par les agents</span>
              </div>
            </div>
          </div>

        <div className="flex flex-col sm:flex-row gap-1 mt-3 sm:mt-0 card-animate-in">
          {/* Sélecteur de type de graphique - Compact */}
          <div className="relative stagger-item">
            <button
              className="control-button flex items-center justify-between gap-1 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 transition-colors"
              onClick={() => setShowOptions(prev => !prev)}
            >
              <div className="w-3 h-3 icon-animate">
                {chartTypeOptions.find(option => option.value === chartType)?.icon}
              </div>
              <span>{chartTypeOptions.find(option => option.value === chartType)?.label}</span>
              <ChevronDown size={10} className="icon-animate" />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-32">
                {chartTypeOptions.map(option => (
                  <button
                    key={option.value}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setChartType(option.value);
                      setShowOptions(false);
                    }}
                  >
                    <div className="w-3 h-3">
                      {option.icon}
                    </div>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sélecteur de plage de temps - Compact */}
          <div className="stagger-item">
            <select
              className="control-button px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton d'actualisation - Compact */}
          <div className="stagger-item">
            <button
              className="control-button flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 transition-colors"
              onClick={fetchRevenueData}
            >
              <RefreshCw size={12} className={`icon-animate ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

        {/* Cartes d'informations - Compactes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="info-card bg-emerald-50 border border-emerald-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                <TndIcon size={14} className="text-emerald-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Total Revenus</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{formatMontant(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-blue-50 border border-blue-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Calendar size={14} className="text-blue-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Moyenne par jour</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{formatMontant(avgRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-purple-50 border border-purple-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 icon-animate">
                  <path d="M12 2v20M2 12h20M18 12a6 6 0 01-6 6M6 12a6 6 0 016-6"/>
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Meilleur jour</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{formatMontant(highestDay.amount)}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-green-50 border border-green-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <ArrowUpRight size={14} className={`${growthRate >= 0 ? 'text-green-600' : 'text-red-600'} icon-animate`} />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Croissance</p>
                <p className={`text-sm font-bold number-animate ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growthRate >= 0 ? '+' : ''}{growthRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 size={48} className="text-teal-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des données de revenu...</p>
        </div>
      ) : revenueData.length === 0 && !error ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
          <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-center">
            Aucune donnée de revenu disponible pour cette période.
            <br />
            <span className="text-sm">Veuillez sélectionner une autre plage de temps ou réessayer plus tard.</span>
          </p>
        </div>
      ) : renderChart ? (
        <div className="h-64 chart-animate-in">
          <ResponsiveContainer width="100%" height="100%" className="recharts-wrapper" debounce={50}>
            {renderChart}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
          <TndIcon className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            Impossible de charger le graphique.
            <br />
            <span className="text-sm">Veuillez réessayer plus tard.</span>
          </p>
        </div>
      )}

        {/* Légende de période */}
        <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center">
          <Calendar size={14} className="mr-1" />
          <span>Période: {getTimeRangeLabel(timeRange)}</span>
        </div>
      </div>
    </div>
  );
};

export default DailyRevenueChart;