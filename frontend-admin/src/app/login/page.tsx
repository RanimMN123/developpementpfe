'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ maintenant 'e' est reconnu



    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Sauvegarder le token
        localStorage.setItem('token', data.access_token);

        // Sauvegarder les données de l'admin
        if (data.admin) {
          localStorage.setItem('adminData', JSON.stringify(data.admin));
        } else {
          // Si pas de données admin dans la réponse, créer des données par défaut
          localStorage.setItem('adminData', JSON.stringify({
            id: data.id || 1,
            email: email,
            nom: data.nom || 'Admin',
            prenom: data.prenom || 'User'
          }));
        }

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Rediriger vers le dashboard admin
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto shadow-2xl overflow-hidden">
        {/* Panneau latéral décoratif */}
        <div className="hidden md:flex md:w-1/2 bg-indigo-600 text-white p-12 flex-col justify-between relative">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-6">Espace Administration</h1>
            <p className="text-indigo-100">
              Gérez votre plateforme et accédez à toutes les fonctionnalités administrateur en un seul endroit.
            </p>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Lock size={16} />
              </div>
              <p className="text-sm text-indigo-100">Accès sécurisé</p>
            </div>
            <p className="text-xs text-indigo-200">
              © {new Date().getFullYear()} Votre Entreprise. Tous droits réservés.
            </p>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-block mb-4 rounded-full bg-indigo-100 p-3">
                <LogIn size={24} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Connexion Admin</h2>
              <p className="text-gray-500 text-sm mt-1">Entrez vos identifiants pour accéder au panneau</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-600">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Mot de passe oublié?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
