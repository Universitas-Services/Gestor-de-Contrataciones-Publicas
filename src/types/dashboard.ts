export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface DashboardUser {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}
