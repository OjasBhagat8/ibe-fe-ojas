import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LogoutIcon from '@mui/icons-material/Logout';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import styles from './StaffSidebar.module.scss';

const NAV_ITEMS = [
  { label: 'Overview', icon: <DashboardIcon />, path: 'overview' },
  { label: 'My Tasks', icon: <AssignmentIcon />, path: 'tasks' },
  { label: 'Attendance Summary', icon: <AccessTimeIcon />, path: 'clock' },
  { label: 'Apply Leave', icon: <EventNoteIcon />, path: 'leave' },
  { label: 'Shift Progress', icon: <TrendingUpIcon />, path: 'progress' },
];

const SIDEBAR_WIDTH = 208;

interface SidebarContentProps {
  tenantName: string;
  staffName: string | null;
  onClose?: () => void;
}

function SidebarContent({ tenantName, staffName, onClose }: SidebarContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useHousekeepingAuth();

  const handleNav = (path: string) => {
    navigate(`/${tenantName}/staff/${path}`);
    onClose?.();
  };

  const isActive = (path: string) => location.pathname.endsWith(`/staff/${path}`);

  return (
    <Box className={styles.sidebar}>
      {/* Logo / brand */}
      <Box className={styles.brand}>
        <Box className={styles.logoBox}>
          <Typography className={styles.logoText}>HK</Typography>
        </Box>
        <Typography className={styles.brandName}>Staff Portal</Typography>
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: '#fff', ml: 'auto' }} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Staff info */}
      <Box className={styles.staffInfo}>
        <Avatar className={styles.avatar}>
          {staffName ? staffName.charAt(0).toUpperCase() : 'S'}
        </Avatar>
        <Typography className={styles.staffName}>{staffName ?? 'Staff'}</Typography>
      </Box>

      {/* Nav */}
      <List className={styles.nav} disablePadding>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNav(item.path)}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
          >
            <ListItemIcon className={styles.navIcon}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} className={styles.navLabel} />
          </ListItemButton>
        ))}
      </List>

      {/* Logout */}
      <Box className={styles.footer}>
        <ListItemButton onClick={logout} className={styles.navItem}>
          <ListItemIcon className={styles.navIcon}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" className={styles.navLabel} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function StaffSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tenantName = '' } = useParams<{ tenantName: string }>();
  const { staffName } = useHousekeepingAuth();

  return (
    <>
      {/* Mobile hamburger button — shown only on small screens */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        className={styles.hamburger}
        sx={{ display: { lg: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            border: 'none',
            backgroundColor: 'transparent',
          },
        }}
      >
        <SidebarContent
          tenantName={tenantName}
          staffName={staffName}
          onClose={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* Desktop permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            border: 'none',
            backgroundColor: 'transparent',
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            overflow: 'hidden',
          },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
        }}
        open
      >
        <SidebarContent tenantName={tenantName} staffName={staffName} />
      </Drawer>
    </>
  );
}
