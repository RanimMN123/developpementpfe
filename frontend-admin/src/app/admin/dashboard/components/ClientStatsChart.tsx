'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, BarChart, Bar, ComposedChart
} from 'recharts';
import { Calendar, RefreshCw, TrendingUp, Users, AlertCircle, ChevronDown, Loader2, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import './charts.css';

type ClientStat = {
  date: string;
  count: number;
  formattedDate?: string;
};

type ChartType = 'line' | 'area' | 'bar' | 'composed';
type TimeRange = '7days' | '30days' | '90days' | 'year' | 'all';

const ClientStatsChart = () => {
  const [clientsData, setClientsData] = useState<ClientStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [totalClients, setTotalClients] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
      if (timeRange === 'year' || timeRange === 'all') {
        options.month = 'short';
        options.year = 'numeric';
      }
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch {
      return dateString;
    }
  };

  const fetchClientStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Vérifier le token avec une approche plus robuste
      const token = localStorage.getItem('token');
      const adminData = localStorage.getItem('adminData');

      console.log('🔍 Debug ClientStatsChart:', {
        hasToken: !!token,
        hasAdminData: !!adminData,
        tokenLength: token?.length || 0
      });

      if (!token) {
        setError('Aucun token d\'authentification trouvé. Utilisez le composant de debug ci-dessus pour générer un token.');
        setIsLoading(false);
        return;
      }

      // Vérifier si le token est expiré
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
          setError('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('adminData');
          setIsLoading(false);
          return;
        }
      } catch (tokenError) {
        console.error('Token invalide:', tokenError);
        setError('Token invalide. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('adminData');
        setIsLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:3000/api/admin/clients-stats?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Formatage des données pour l'affichage
      const formattedData = res.data.map((item: ClientStat) => ({
        ...item,
        formattedDate: formatDate(item.date)
      }));

      setClientsData(formattedData);

      // Calculer le nombre total de clients
      const total = formattedData.reduce((sum: number, item: ClientStat) => sum + item.count, 0);
      setTotalClients(total);

      // Calculer le taux de croissance (si données disponibles)
      if (formattedData.length > 1) {
        const firstHalf = formattedData.slice(0, Math.floor(formattedData.length / 2));
        const secondHalf = formattedData.slice(Math.floor(formattedData.length / 2));

        const firstHalfSum = firstHalf.reduce((sum: number, item: ClientStat) => sum + item.count, 0);
        const secondHalfSum = secondHalf.reduce((sum: number, item: ClientStat) => sum + item.count, 0);

        if (firstHalfSum > 0) {
          const growth = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
          setGrowthRate(parseFloat(growth.toFixed(1)));
        }
      }

      setIsLoading(false);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des statistiques clients:', err);

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('adminData');
        } else if (axiosError.response?.status === 403) {
          setError('Accès non autorisé.');
        } else if (axiosError.response?.status === 404) {
          setError('Endpoint non trouvé.');
        } else {
          setError('Erreur lors du chargement des statistiques clients');
        }
      } else if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'NETWORK_ERROR') {
        setError('Erreur de connexion au serveur.');
      } else if (err instanceof Error) {
        setError(err.message || 'Erreur lors du chargement des statistiques clients');
      } else {
        setError('Erreur lors du chargement des statistiques clients');
      }

      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchClientStats();
  }, [fetchClientStats]);



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

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { formattedDate?: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-700">{payload[0].payload.formattedDate || label}</p>
          <p className="text-blue-600 font-medium">
            {payload[0].value} {payload[0].value > 1 ? 'clients' : 'client'}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = useMemo(() => {
    if (clientsData.length === 0) {
      return null;
    }

    const commonProps = {
      data: clientsData,
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Nombre de clients</span>} />
            <Line
              type="monotone"
              dataKey="count"
              name="Clients"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Nombre de clients</span>} />
            <Area
              type="monotone"
              dataKey="count"
              name="Clients"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCount)"
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Nombre de clients</span>} />
            <Bar
              dataKey="count"
              name="Clients"
              fill="#3b82f6"
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
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} formatter={() => <span className="text-gray-700">Nombre de clients</span>} />
            <Bar
              dataKey="count"
              barSize={20}
              fill="#a3bffa"
              name="Clients"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Tendance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        );

      default:
        return null;
    }
  }, [clientsData, chartType]);

  const chartTypeOptions: {label: string, value: ChartType, icon: React.ReactNode}[] = [
    { label: 'Ligne', value: 'line', icon: <TrendingUp size={16} /> },
    { label: 'Aire', value: 'area', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 18h18M3 12h18M3 6h18"/> </svg> },
    { label: 'Barres', value: 'bar', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 20V10M12 20V4M4 20v-6"/> </svg> },
    { label: 'Composé', value: 'composed', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 20V10M12 20V4M4 20v-6M22 4L12 14 2 4"/> </svg> }
  ];

  const timeRangeOptions: {label: string, value: TimeRange, icon: React.ReactNode}[] = [
    { label: '7 jours', value: '7days', icon: <Calendar size={16} /> },
    { label: '30 jours', value: '30days', icon: <Calendar size={16} /> },
    { label: '90 jours', value: '90days', icon: <Calendar size={16} /> },
    { label: '12 mois', value: 'year', icon: <Calendar size={16} /> },
    { label: 'Tout', value: 'all', icon: <Calendar size={16} /> }
  ];

  return (
    <div className="stat-card-chart relative overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100 p-4 group hover:shadow-xl transition-all duration-300">
      {/* Gradient Background - Réduit */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-20"></div>

      {/* Decorative Elements - Réduits */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 opacity-3 rounded-full transform translate-x-6 -translate-y-6"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-400 to-blue-500 opacity-3 rounded-full transform -translate-x-4 translate-y-4"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 card-animate-in">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md icon-animate icon-glow">
              <Users className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center number-animate">
                Clients inscrits par période
              </h2>
              <div className="text-gray-600 text-xs mt-1 flex items-center card-animate-in">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2 gradient-animate"></div>
                <span>Visualisation de l&apos;évolution des inscriptions</span>
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
              className="control-button px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              onClick={fetchClientStats}
            >
              <RefreshCw size={12} className={`icon-animate ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

        {/* Cartes d'informations - Compactes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="info-card bg-blue-50 border border-blue-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Users size={14} className="text-blue-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Total clients</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{totalClients.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-purple-50 border border-purple-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <Calendar size={14} className="text-purple-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Moyenne par jour</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{clientsData.length > 0 ? (totalClients / Math.max(clientsData.length, 1)).toFixed(1) : '0'}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-amber-50 border border-amber-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                <ArrowUpRight size={14} className="text-amber-600 icon-animate" />
              </div>
              <div>
                <p className="text-gray-600 text-xs">Nouveaux clients</p>
                <p className="text-sm font-bold text-gray-800 number-animate">{Math.ceil(totalClients * 0.15)}</p>
              </div>
            </div>
          </div>

          <div className="info-card bg-green-50 border border-green-100 rounded p-3 card-animate-in">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <TrendingUp size={14} className={`${growthRate >= 0 ? 'text-green-600' : 'text-red-600'} icon-animate`} />
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
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700 mb-2">{error}</p>
              {error.includes('token') && (
                <button
                  onClick={() => {
                    // Générer un token de test
                    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
                    const payload = btoa(JSON.stringify({
                      id: 1,
                      email: 'admin@test.com',
                      role: 'admin',
                      exp: Math.floor(Date.now() / 1000) + 3600 // 1 heure
                    }));
                    const signature = 'test-signature';
                    const testToken = `${header}.${payload}.${signature}`;

                    localStorage.setItem('token', testToken);
                    localStorage.setItem('adminData', JSON.stringify({
                      id: 1,
                      email: 'admin@test.com',
                      nom: 'Admin',
                      prenom: 'Test'
                    }));

                    // Recharger les données
                    fetchClientStats();
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Générer Token Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      ) : clientsData.length === 0 && !error ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
          <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600 text-center">
            Aucune donnée disponible pour cette période.
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
          <Users className="h-16 w-16 text-gray-400 mb-4" />
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

export default ClientStatsChart;