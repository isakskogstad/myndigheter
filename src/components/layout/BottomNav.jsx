import React from 'react';
import { LayoutDashboard, PieChart, Table2, Building2, MapPin } from 'lucide-react';
import ds from '../../styles/designSystem';

const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Översikt', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analys', icon: PieChart },
    { id: 'list', label: 'Lista', icon: Table2 },
    { id: 'departments', label: 'Dept.', icon: Building2 },
    { id: 'regions', label: 'Karta', icon: MapPin },
  ];

  return (
    <nav className={ds.cn('fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t lg:hidden z-40 pb-safe')} style={{ borderColor: ds.colors.slate[200] }}>
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={ds.cn('flex flex-col items-center justify-center w-full h-full', ds.spacing.xs)} style={{ color: isActive ? ds.colors.primary[600] : ds.colors.slate[400] }}
            >
              <Icon className={ds.cn(ds.iconSizes.md)} style={{ fill: isActive ? ds.colors.primary[100] : undefined }} />
              <span className={ds.cn(ds.typography.weights.medium)} style={{ fontSize: '10px' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
