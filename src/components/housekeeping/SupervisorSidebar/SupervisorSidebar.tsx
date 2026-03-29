import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import styles from './SupervisorSidebar.module.scss';

const SIDEBAR_WIDTH = 280;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: 'dashboard' },
  { label: 'Room Status', icon: <ApartmentIcon />, path: 'rooms' },
  { label: 'Task Overview', icon: <AssignmentOutlinedIcon />, path: 'tasks' },
  { label: 'Staff Board', icon: <GroupsOutlinedIcon />, path: 'staff-board' },
  { label: 'Attendance', icon: <AccessTimeOutlinedIcon />, path: 'attendance' },
  { label: 'Performance', icon: <BarChartOutlinedIcon />, path: 'performance' },
  { label: 'Audit Logs', icon: <ShieldOutlinedIcon /> },
];

interface SidebarContentProps {
  tenantName: string;
  onClose?: () => void;
}

function SidebarContent({ tenantName, onClose }: SidebarContentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path?: string) =>
    Boolean(path) && location.pathname.endsWith(`/supervisor/${path}`);

  return (
    <Box className={styles.sidebar}>
      <Box className={styles.brand}>
        <Box className={styles.brandIcon}>
          <AssignmentTurnedInOutlinedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography className={styles.brandTitle}>IBE</Typography>
          <Typography className={styles.brandSubtitle}>Housekeeping</Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: '#fff', ml: 'auto' }} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List className={styles.nav} disablePadding>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => {
              if (item.path) {
                navigate(`/${tenantName}/supervisor/${item.path}`);
              }
              onClose?.();
            }}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
          >
            <ListItemIcon className={styles.navIcon}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} className={styles.navLabel} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default function SupervisorSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tenantName = '' } = useParams<{ tenantName: string }>();

  return (
    <>
      <IconButton
        onClick={() => setMobileOpen(true)}
        className={styles.hamburger}
        sx={{ display: { lg: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

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
        <SidebarContent tenantName={tenantName} onClose={() => setMobileOpen(false)} />
      </Drawer>

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
        <SidebarContent tenantName={tenantName} />
      </Drawer>
    </>
  );
}
