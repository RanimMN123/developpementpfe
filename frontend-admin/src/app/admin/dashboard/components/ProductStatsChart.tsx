'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, BarChart, Bar, ComposedChart, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, RefreshCw, TrendingUp, Package, AlertCircle,
  ChevronDown, Loader2, BarChart2, ArrowUpRight, Tag, Star, Settings
} from 'lucide-react';

type ProductStat = {
  date: string;
  count: number;
  avgPrice?: number;
  totalViews?: number;
  formattedDate?: string;
};

type ChartType = 'line' | 'area' | 'bar' | 'composed' | 'pie';
type TimeRange = '7days' | '30days' | '90days' | 'year' | 'all';
type DataType = 'count' | 'avgPrice' | 'totalViews';

const ProductStatsChart = () => {
  const [productsData, setProductsData] = useState<ProductStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [dataType, setDataType] = useState<DataType>('count');
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Stats calculées
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [avgPerDay, setAvgPerDay] = useState<number>(0);
  const [avgPrice, setAvgPrice] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);

  const fetchProductStats = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Aucun token d\'authentification trouvé');
        setIsLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:3000/api/admin/produits-stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });


      // Simuler des données additionnelles si nécessaire (prix moyen, vues)
      const formattedData = res.data.map((item: ProductStat) => ({
        ...item,
        avgPrice: item.avgPrice || Math.floor(Math.random() * 100) + 20,
        totalViews: item.totalViews || Math.floor(Math.random() * 200) + 50,
        formattedDate: formatDate(item.date)
      }));

      setProductsData(formattedData);

      // Calculer les statistiques
      if (formattedData.length > 0) {
        // Total des produits
        const totalCount = formattedData.reduce((sum: number, item: ProductStat) => sum + item.count, 0);
        setTotalProducts(totalCount);

        // Prix moyen
        const avgPriceCalc = formattedData.reduce((sum: number, item: ProductStat) => sum + (item.avgPrice || 0), 0) / formattedData.length;
        setAvgPrice(avgPriceCalc);

        // Moyenne par jour
        setAvgPerDay(totalCount / formattedData.length);

        // Taux de croissance
        if (formattedData.length > 1) {
          const firstHalf = formattedData.slice(0, Math.floor(formattedData.length / 2));
          const secondHalf = formattedData.slice(Math.floor(formattedData.length / 2));

          const firstHalfSum = firstHalf.reduce((sum: number, item: ProductStat) => sum + item.count, 0);
          const secondHalfSum = secondHalf.reduce((sum: number, item: ProductStat) => sum + item.count, 0);

          if (firstHalfSum > 0) {
            const growth = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
            setGrowthRate(parseFloat(growth.toFixed(1)));
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des statistiques des produits');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductStats();
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

  const formatPrix = (prix: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(prix);
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
    switch (dataType) {
      case 'count': return 'Nombre de produits';
      case 'avgPrice': return 'Prix moyen';
      case 'totalViews': return 'Nombre de vues';
      default: return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-700">{payload[0].payload.formattedDate || label}</p>
          {dataType === 'count' ? (
            <p className="text-teal-600 font-medium">
              {payload[0].value} {payload[0].value > 1 ? 'produits' : 'produit'}
            </p>
          ) : dataType === 'avgPrice' ? (
            <p className="text-teal-600 font-medium">
              {formatPrix(payload[0].value)}
            </p>
          ) : (
            <p className="text-teal-600 font-medium">
              {payload[0].value} vues
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = useMemo(() => {
    if (productsData.length === 0) {
      return null;
    }

    const dataKey = dataType;
    const strokeColor = dataType === 'count' ? '#14b8a6' : dataType === 'avgPrice' ? '#8884d8' : '#f59e0b';
    const fillColor = dataType === 'count' ? '#99f6e4' : dataType === 'avgPrice' ? '#c4b5fd' : '#fcd34d';

    const commonProps = {
      data: productsData,
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
              allowDecimals={dataType === 'avgPrice'}
              tickFormatter={dataType === 'avgPrice' ? (value) => `${value}TND` : undefined}
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
              allowDecimals={dataType === 'avgPrice'}
              tickFormatter={dataType === 'avgPrice' ? (value) => `${value}TND` : undefined}
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
              allowDecimals={dataType === 'avgPrice'}
              tickFormatter={dataType === 'avgPrice' ? (value) => `${value}TND` : undefined}
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
              allowDecimals={dataType === 'avgPrice'}
              tickFormatter={dataType === 'avgPrice' ? (value) => `${value}€` : undefined}
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
        const pieData = productsData.slice(-7).map(item => ({
          name: item.formattedDate,
          value: item[dataKey]
        }));

        const COLORS = [
          '#14b8a6', '#0ea5e9', '#8884d8', '#f59e0b', '#ec4899', '#10b981', '#6366f1'
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
                `${name}: ${dataType === 'avgPrice' ? formatPrix(value) : value} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => dataType === 'avgPrice' ? formatPrix(value as number) : value} />
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
  }, [productsData, chartType, dataType, timeRange]);

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

  const dataTypeOptions: {label: string, value: DataType, icon: React.ReactNode, color: string}[] = [
    { label: 'Produits', value: 'count', icon: <Package size={16} />, color: 'teal' },
    { label: 'Prix moyen', value: 'avgPrice', icon: <Tag size={16} />, color: 'purple' },
    { label: 'Vues', value: 'totalViews', icon: <Star size={16} />, color: 'amber' }
  ];

  const currentDataType = dataTypeOptions.find(item => item.value === dataType);

  return (
    <div className="stat-card-chart relative overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100 p-4 group hover:shadow-xl transition-all duration-300">
      {/* Gradient Background - Réduit */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 opacity-20"></div>

      {/* Decorative Elements - Réduits */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 opacity-3 rounded-full transform translate-x-6 -translate-y-6"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-400 to-teal-500 opacity-3 rounded-full transform -translate-x-4 translate-y-4"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 card-animate-in">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-lg shadow-md icon-animate icon-glow">
              <Package className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center number-animate">
                Statistiques des Produits
              </h2>
              <div className="text-gray-600 text-xs mt-1 flex items-center card-animate-in">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full mr-2 gradient-animate"></div>
                <span>{getDataLabel()} par période</span>
              </div>
            </div>
          </div>

        <div className="flex flex-col sm:flex-row gap-1 mt-3 sm:mt-0 card-animate-in">
          {/* Sélecteur pour le type de données - Compact */}
          <div className="relative stagger-item">
            <button
              className={`control-button flex items-center justify-between gap-1 px-2 py-1.5 border rounded text-xs transition-colors border-teal-300 bg-teal-50 text-teal-700`}
              onClick={() => {
                const currentIndex = dataTypeOptions.findIndex(item => item.value === dataType);
                const nextIndex = (currentIndex + 1) % dataTypeOptions.length;
                setDataType(dataTypeOptions[nextIndex].value);
              }}
            >
              <div className="w-3 h-3 icon-animate">
                {currentDataType?.icon}
              </div>
              <span>{currentDataType?.label}</span>
            </button>
          </div>

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
              onClick={fetchProductStats}
            >
              <RefreshCw size={12} className={`icon-animate ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

        {/* Cartes d'informations - Compactes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="info-card bg-teal-50 border border-teal-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center mr-2">
                <Package size={14} className="text-teal-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Total produits</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-purple-50 border border-purple-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <Tag size={14} className="text-purple-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Prix moyen</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{formatPrix(avgPrice)}</p>
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
                <p className="text-sm font-bold text-gray-800 number-animate">{avgPerDay.toFixed(1)}</p>
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
            <p className="text-gray-600">Chargement des statistiques de produits...</p>
          </div>
        ) : productsData.length === 0 && !error ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              Aucune donnée de produit disponible pour cette période.
              <br />
              <span className="text-sm">Veuillez sélectionner une autre plage de temps ou réessayer plus tard.</span>
            </p>
          </div>
        ) : renderChart ? (
          <div className="h-64 chart-animate-in">
            <ResponsiveContainer width="100%" height="100%" className="recharts-wrapper">
              {renderChart}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
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

export default ProductStatsChart;