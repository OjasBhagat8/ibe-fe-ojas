import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from '../components/housekeeping/SupervisorSidebar/SupervisorSidebar';
import styles from './SupervisorLayout.module.scss';

export default function SupervisorLayout() {
  return (
    <Box className={styles.layout}>
      <SupervisorSidebar />
      <Box component="main" className={styles.main}>
        <Outlet />
      </Box>
    </Box>
  );
}
