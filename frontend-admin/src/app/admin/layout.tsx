'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Route,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserCheck,
  PackagePlus,
  List,
  Plus,
  Edit,
  Menu,
  X
} from 'lucide-react';
import EventListener from './components/EventListener';
import AuthGuard from '../../components/AuthGuard';
import './components/scroll-animations.css';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  {
    name: 'Produits',
    icon: <Package size={18} />,
    subItems: [
      { name: 'Add Product', action: 'add-product', icon: <PackagePlus size={16} /> },
      { name: 'List', href: '/admin/produits', icon: <List size={16} /> }
    ]
  },
  {
    name: 'Catégories',
    icon: <Tags size={18} />,
    subItems: [
      { name: 'Add Category', action: 'add-category', icon: <Plus size={16} /> },
      { name: 'List', href: '/admin/categories', icon: <List size={16} /> }
    ]
  },
  {
    name: 'Commandes',
    icon: <ShoppingCart size={18} />,
    subItems: [
      { name: 'Add Order', action: 'add-order', icon: <Plus size={16} /> },
      { name: 'List', href: '/admin/commandes', icon: <List size={16} /> }
    ]
  },
  {
    name: 'Clients',
    icon: <Users size={18} />,
    subItems: [
      { name: 'Add Client', action: 'add-client', icon: <UserPlus size={16} /> },
      { name: 'List', href: '/admin/clients', icon: <List size={16} /> }
    ]
  },
  {
    name: 'Fournisseurs',
    icon: <Users size={18} />,
    subItems: [
      { name: 'Add Fournisseur', action: 'add-fournisseur', icon: <UserPlus size={16} /> },
      { name: 'List', href: '/admin/fournisseurs', icon: <List size={16} /> }
    ]
  },
  {
    name: 'Agents',
    icon: <UserCheck size={18} />,
    subItems: [
      { name: 'Add Agent', action: 'add-agent', icon: <UserPlus size={16} /> },
      { name: 'Liste agents', href: '/admin/Agents', icon: <List size={16} /> },
      { name: 'Edit Agent', href: '/admin/Agents/edit', icon: <Edit size={16} /> }
    ]
  },
  { name: 'Planification de livraison', href: '/admin/Routes', icon: <Route size={18} /> }
];

// Composant amélioré pour les éléments de navigation de la sidebar
const SidebarNavItem = ({
  item,
  pathname,
  onAction,
  onNavigate,
  index
}: {
  item: any;
  pathname: string;
  onAction?: (action: string) => void;
  onNavigate?: () => void;
  index: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Si l'élément a des sous-éléments
  if (item.subItems) {
    const isActive = item.subItems.some((subItem: any) => pathname === subItem.href);

    return (
      <div className="mb-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group transform hover:scale-105 ${
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900 hover:shadow-md'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              isActive
                ? 'bg-white bg-opacity-20 shadow-sm'
                : 'bg-slate-100 group-hover:bg-blue-100 group-hover:shadow-sm'
            }`}>
              {item.icon}
            </div>
            <span className="font-semibold text-sm">{item.name}</span>
          </div>
          <div className={`transition-all duration-300 ${isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`}>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Sous-menu avec animation */}
        <div className={`overflow-hidden transition-all duration-500 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="ml-6 mt-3 space-y-2 border-l-2 border-gradient-to-b from-blue-200 to-indigo-200 pl-4">
            {item.subItems.map((subItem: any, subIndex: number) => {
              // Si c'est une action personnalisée
              if (subItem.action) {
                return (
                  <div
                    key={subIndex}
                    onClick={() => {
                      onAction && onAction(subItem.action);
                      onNavigate && onNavigate();
                    }}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-slate-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:shadow-md transform hover:translate-x-2 hover:scale-105"
                    style={{ animationDelay: `${(index * 50) + (subIndex * 25)}ms` }}
                  >
                    <div className="p-1.5 rounded-md bg-slate-100 hover:bg-white hover:bg-opacity-20 transition-all duration-300">
                      {subItem.icon}
                    </div>
                    <span className="text-xs font-medium">{subItem.name}</span>
                  </div>
                );
              }

              // Si c'est un lien normal
              return (
                <Link key={subItem.href} href={subItem.href}>
                  <div
                    onClick={() => onNavigate && onNavigate()}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 transform hover:translate-x-2 hover:scale-105 ${
                      pathname === subItem.href
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${(index * 50) + (subIndex * 25)}ms` }}
                  >
                    <div className={`p-1.5 rounded-md transition-all duration-300 ${
                      pathname === subItem.href
                        ? 'bg-white bg-opacity-20 shadow-sm'
                        : 'bg-slate-100 hover:bg-white hover:bg-opacity-20'
                    }`}>
                      {subItem.icon}
                    </div>
                    <span className="text-xs font-medium">{subItem.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Élément de navigation simple
  return (
    <div className="mb-2">
      <Link href={item.href}>
        <div
          onClick={() => onNavigate && onNavigate()}
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:translate-x-1 ${
            pathname === item.href
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900 hover:shadow-md'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`p-2 rounded-lg transition-all duration-300 ${
            pathname === item.href
              ? 'bg-white bg-opacity-20 shadow-sm'
              : 'bg-slate-100 hover:bg-blue-100 hover:shadow-sm'
          }`}>
            {item.icon}
          </div>
          <span className="font-semibold text-sm">{item.name}</span>
        </div>
      </Link>
    </div>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ajouter les styles CSS pour l'animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Gérer les actions personnalisées
  const handleAction = (action: string) => {
    switch (action) {
      case 'add-agent':
        window.dispatchEvent(new CustomEvent('open-add-agent-modal'));
        break;
      case 'add-product':
        window.dispatchEvent(new CustomEvent('open-add-product-modal'));
        break;
      case 'add-category':
        window.dispatchEvent(new CustomEvent('open-add-category-modal'));
        break;
      case 'add-order':
        window.dispatchEvent(new CustomEvent('open-add-order-modal'));
        break;
      case 'add-client':
        window.dispatchEvent(new CustomEvent('open-add-client-modal'));
        break;
      case 'add-fournisseur':
        window.dispatchEvent(new CustomEvent('open-add-fournisseur-modal'));
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen bg-gray-50 max-h-[100vh]">
        {/* Event Listener Global */}
        <EventListener />

        {/* Bouton Menu Flottant - Position moderne */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-6 left-6 z-50 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-110"
          title="Menu de navigation"
          style={{
            top:"6%",
            left:'4%',
            zIndex:2
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar - Navigation à gauche sans overlay noir */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex justify-start">
            {/* Sidebar Moderne à gauche */}
            <aside
              className="relative flex flex-col w-80 bg-gradient-to-b from-white via-slate-50 to-blue-50 text-slate-800 shadow-2xl shadow-blue-500/10 max-h-screen overflow-hidden transform transition-transform duration-300 ease-in-out border-r border-blue-100"
              style={{
                animation: 'slideInLeft 0.3s ease-out'
              }}
            >
              {/* Header de la Sidebar moderne */}
              <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Admin Panel</h2>
                      <p className="text-slate-500 text-sm">Panneau de gestion</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all duration-300 transform hover:scale-110"
                    title="Fermer le menu"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Navigation Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <nav className="p-4 space-y-1">
                  {navItems.map((item, index) => (
                    <div key={item.name} className="group">
                      <SidebarNavItem
                        item={item}
                        pathname={pathname}
                        onAction={handleAction}
                        onNavigate={() => setIsMobileMenuOpen(false)}
                        index={index}
                      />
                    </div>
                  ))}
                </nav>
              </div>

            </aside>

            {/* Zone cliquable transparente pour fermer */}
            <div
              className="flex-1 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Main content */}
        <main className={`w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen transition-all duration-300 ${
          isMobileMenuOpen ? 'blur-[2px] brightness-90' : ''
        }`}>
          {/* <div className="p-6"> */}
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg shadow-blue-500/5 border border-blue-100/50 p-6 backdrop-blur-sm">
                {children}
              </div>
            </div>
          {/* </div> */}
        </main>
      </div>
    </AuthGuard>
  );
}
