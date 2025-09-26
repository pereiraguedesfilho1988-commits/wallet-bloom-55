// 💰 Minha Conta - Standardized Page Header Component

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center space-x-2">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}