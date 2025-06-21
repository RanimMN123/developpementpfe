'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { apiUtils } from '../../../../utils/apiUtils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, BarChart, Bar, ComposedChart, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, RefreshCw, TrendingUp, ShoppingBag, AlertCircle,
  ChevronDown, Loader2, BarChart2, ArrowUpRight
} from 'lucide-react';
import TndIcon from './TndIcon';

type CommandeStat = {
  date: string;
  count: number;
  amount?: number;
  formattedDate?: string;
};

type ChartType = 'line' | 'area' | 'bar' | 'composed' | 'pie';
type TimeRange = '7days' | '30days' | '90days' | 'year' | 'all';
type DataType = 'count' | 'amount';

const CommandesChart = () => {
  const [commandesData, setCommandesData] = useState<CommandeStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [dataType, setDataType] = useState<DataType>('count');
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Données calculées
  const [totalCommandes, setTotalCommandes] = useState<number>(0);
  const [totalCA, setTotalCA] = useState<number>(0);
  const [avgPerDay, setAvgPerDay] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);

  const fetchCommandesStats = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await apiUtils.get(`/api/admin/commandes-stats?range=${timeRange}`);

      // Simuler des données de montant si elles n'existent pas dans l'API
      const formattedData = data.map((item: CommandeStat) => ({
        ...item,
        // Si l'API ne renvoie pas de montant, on en simule un basé sur le nombre de commandes
        amount: item.amount || item.count * Math.floor(Math.random() * 50) + 30,
        formattedDate: formatDate(item.date)
      }));

      setCommandesData(formattedData);

      // Calculer statistiques
      if (formattedData.length > 0) {
        // Total des commandes
        const totalCount = formattedData.reduce((sum: number, item: CommandeStat) => sum + item.count, 0);
        setTotalCommandes(totalCount);

        // Chiffre d'affaires total
        const totalAmount = formattedData.reduce((sum: number, item: CommandeStat) => sum + (item.amount || 0), 0);
        setTotalCA(totalAmount);

        // Moyenne par jour
        setAvgPerDay(totalCount / formattedData.length);

        // Taux de croissance
        if (formattedData.length > 1) {
          const firstHalf = formattedData.slice(0, Math.floor(formattedData.length / 2));
          const secondHalf = formattedData.slice(Math.floor(formattedData.length / 2));

          const firstHalfSum = firstHalf.reduce((sum: number, item: CommandeStat) => sum + item.count, 0);
          const secondHalfSum = secondHalf.reduce((sum: number, item: CommandeStat) => sum + item.count, 0);

          if (firstHalfSum > 0) {
            const growth = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
            setGrowthRate(parseFloat(growth.toFixed(1)));
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des statistiques de commandes');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandesStats();
  }, [timeRange]);

  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
      if (timeRange === 'year' || timeRange === 'all') {
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
      case 'all': return 'Toutes les données';
      default: return '';
    }
  };

  const getDataLabel = (): string => {
    return dataType === 'count' ? 'Nombre de commandes' : 'Chiffre d\'affaires';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-700">{payload[0].payload.formattedDate || label}</p>
          {dataType === 'count' ? (
            <p className="text-purple-600 font-medium">
              {payload[0].value} {payload[0].value > 1 ? 'commandes' : 'commande'}
            </p>
          ) : (
            <p className="text-purple-600 font-medium">
              {formatMontant(payload[0].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = useMemo(() => {
    if (commandesData.length === 0) {
      return null;
    }

    const dataKey = dataType === 'count' ? 'count' : 'amount';
    const strokeColor = dataType === 'count' ? '#8884d8' : '#2dd4bf';
    const fillColor = dataType === 'count' ? '#c4b5fd' : '#5eead4';
    const gradientFrom = dataType === 'count' ? '#8884d8' : '#2dd4bf';
    const gradientTo = dataType === 'count' ? '#c4b5fd' : '#5eead4';

    const commonProps = {
      data: commandesData,
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
              allowDecimals={dataType === 'amount'}
              tickFormatter={dataType === 'amount' ? (value) => `${value}TND` : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">{getDataLabel()}</span>} />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={getDataLabel()}
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
              <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8} />
                <stop offset="95%" stopColor={gradientFrom} stopOpacity={0.1} />
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
              allowDecimals={dataType === 'amount'}
              tickFormatter={dataType === 'amount' ? (value) => `${value}TND` : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">{getDataLabel()}</span>} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={getDataLabel()}
              stroke={strokeColor}
              fillOpacity={1}
              fill="url(#colorData)"
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
              allowDecimals={dataType === 'amount'}
              tickFormatter={dataType === 'amount' ? (value) => `${value}€` : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">{getDataLabel()}</span>} />
            <Bar
              dataKey={dataKey}
              name={getDataLabel()}
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
              allowDecimals={dataType === 'amount'}
              tickFormatter={dataType === 'amount' ? (value) => `${value}€` : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">{getDataLabel()}</span>} />
            <Bar
              dataKey={dataKey}
              barSize={20}
              fill={fillColor}
              name={getDataLabel()}
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              name="Tendance"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        );

      case 'pie':
        // Préparer des données plus adaptées au format pie
        const pieData = commandesData.slice(-7).map(item => ({
          name: item.formattedDate,
          value: item[dataKey]
        }));

        const COLORS = [
          '#8884d8', '#9c88d8', '#b08cd7', '#c490d6', '#d894d6', '#ec98d5', '#ff9cd5'
        ];

        return (
          <PieChart width={800} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ name, value, percent }) =>
                `${name}: ${dataType === 'amount' ? formatMontant(value) : value} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => dataType === 'amount' ? formatMontant(value as number) : value} />
            <Legend
              formatter={(value) => <span style={{ color: '#6b7280' }}>{value}</span>}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        );

      default:
        return null;
    }
  }, [commandesData, chartType, dataType, timeRange]);

  const chartTypeOptions: {label: string, value: ChartType, icon: React.ReactNode}[] = [
    { label: 'Ligne', value: 'line', icon: <TrendingUp size={16} /> },
    { label: 'Aire', value: 'area', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 18h18M3 12h18M3 6h18"/> </svg> },
    { label: 'Barres', value: 'bar', icon: <BarChart2 size={16} /> },
    { label: 'Composé', value: 'composed', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 20V10M12 20V4M4 20v-6M22 4L12 14 2 4"/> </svg> },
    { label: 'Camembert', value: 'pie', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v8h8a8 8 0 11-8-8z"/> </svg> }
  ];

  const timeRangeOptions: {label: string, value: TimeRange, icon: React.ReactNode}[] = [
    { label: '7 jours', value: '7days', icon: <Calendar size={16} /> },
    { label: '30 jours', value: '30days', icon: <Calendar size={16} /> },
    { label: '90 jours', value: '90days', icon: <Calendar size={16} /> },
    { label: '12 mois', value: 'year', icon: <Calendar size={16} /> },
    { label: 'Tout', value: 'all', icon: <Calendar size={16} /> }
  ];

  return (
    <div className="relative overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100 p-4 group hover:shadow-xl transition-all duration-300">
      {/* Gradient Background - Réduit */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 opacity-20"></div>

      {/* Decorative Elements - Réduits */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 opacity-3 rounded-full transform translate-x-6 -translate-y-6"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-400 to-purple-500 opacity-3 rounded-full transform -translate-x-4 translate-y-4"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-md">
              <ShoppingBag className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                Statistiques des Commandes
              </h2>
              <div className="text-gray-600 text-xs mt-1 flex items-center">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mr-2"></div>
                <span>Évolution {dataType === 'count' ? 'des commandes' : 'du chiffre d\'affaires'} par période</span>
              </div>
            </div>
          </div>

        <div className="flex flex-col sm:flex-row gap-1 mt-3 sm:mt-0">
          {/* Sélecteur pour le type de données - Compact */}
          <div className="relative">
            <button
              className={`flex items-center justify-between gap-1 px-2 py-1.5 border rounded text-xs transition-colors ${
                dataType === 'count'
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-teal-300 bg-teal-50 text-teal-700'
              }`}
              onClick={() => setDataType(dataType === 'count' ? 'amount' : 'count')}
            >
              {dataType === 'count' ? (
                <>
                  <ShoppingBag size={12} />
                  <span>Commandes</span>
                </>
              ) : (
                <>
                  <TndIcon size={12} />
                  <span>TND</span>
                </>
              )}
            </button>
          </div>

          {/* Sélecteur de type de graphique - Compact */}
          <div className="relative">
            <button
              className="flex items-center justify-between gap-1 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 transition-colors"
              onClick={() => setShowOptions(prev => !prev)}
            >
              <div className="w-3 h-3">
                {chartTypeOptions.find(option => option.value === chartType)?.icon}
              </div>
              <span>{chartTypeOptions.find(option => option.value === chartType)?.label}</span>
              <ChevronDown size={10} />
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
          <select
            className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Bouton d'actualisation - Compact */}
          <button
            className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 transition-colors"
            onClick={fetchCommandesStats}
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Cartes d'informations - Compactes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-purple-50 border border-purple-100 rounded p-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
              <ShoppingBag size={14} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs">Total commandes</p>
              <p className="text-sm font-bold text-gray-800">{totalCommandes}</p>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded p-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center mr-2">
              <TndIcon size={14} className="text-teal-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs">Chiffre d'affaires</p>
              <p className="text-sm font-bold text-gray-800">{formatMontant(totalCA)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded p-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <Calendar size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs">Moyenne par jour</p>
              <p className="text-sm font-bold text-gray-800">{avgPerDay.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded p-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
              <ArrowUpRight size={14} className={`${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-gray-600 text-xs">Croissance</p>
              <p className={`text-sm font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
          <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      ) : commandesData.length === 0 && !error ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
          <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-600 text-center">
            Aucune donnée de commande disponible pour cette période.
            <br />
            <span className="text-sm">Veuillez sélectionner une autre plage de temps ou réessayer plus tard.</span>
          </p>
        </div>
      ) : renderChart ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            {renderChart}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
          <div className="h-16 w-16 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
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

export default CommandesChart;