import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import StaffSidebar from '../components/housekeeping/Sidebar/StaffSidebar';
import styles from './StaffLayout.module.scss';

export default function StaffLayout() {
  return (
    <Box className={styles.layout}>
      <StaffSidebar />
      <Box component="main" className={styles.main}>
        <Outlet />
      </Box>
    </Box>
  );
}
