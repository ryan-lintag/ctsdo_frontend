import { useNavigate } from 'react-router-dom';
import { CDBSidebarMenuItem } from 'cdbreact';

interface SidebarMenuItemProps {
  text: string;
  path: string;
  icon: string;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ text, path, icon }) => {
  const currentLocation = window.location.pathname;
  const navigate = useNavigate();
  const active = currentLocation === path;
  return (
    <div className={`sb-item ${active ? 'active' : ''}`} onClick={() => { navigate(path); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(path); }}>
      <CDBSidebarMenuItem className="cdb-sidebar-menu-item" icon={icon} iconSize="lg" active={active}>
        {text}
      </CDBSidebarMenuItem>
    </div>
  );
};