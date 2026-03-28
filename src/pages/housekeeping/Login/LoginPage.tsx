import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import { fetchTenantConfig } from '../../../features/tenant/tenantSlice';
import type { AppDispatch, RootState } from '../../../app/store';
import styles from './Login.module.scss';

interface LoginPageProps {
  role: 'STAFF' | 'SUPERVISOR';
  redirectTo: string;
  switchLink: { label: string; to: string };
}

export default function LoginPage({ role, redirectTo, switchLink }: LoginPageProps) {
  const { tenantName = '' } = useParams<{ tenantName: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const tenantConfig = useSelector((state: RootState) => state.tenant.data);
  const tenantLoading = useSelector((state: RootState) => state.tenant.loading);

  const { login, loading, error, isAuthenticated, dismissError } = useHousekeepingAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [propertyId, setPropertyId] = useState('');

  // Load tenant config (properties list) on mount
  useEffect(() => {
    if (tenantName && !tenantConfig) {
      void dispatch(fetchTenantConfig(tenantName));
    }
  }, [dispatch, tenantName, tenantConfig]);

  // Pre-select first property when config loads
  useEffect(() => {
    if (tenantConfig?.properties?.length && !propertyId) {
      setPropertyId(tenantConfig.properties[0].propertyId);
    }
  }, [tenantConfig, propertyId]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !propertyId) return;
    const result = await login(email, password, propertyId);
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(redirectTo, { replace: true });
    }
  };

  const subtitle = role === 'STAFF' ? 'Staff Portal' : 'Supervisor Portal';

  return (
    <Box className={styles.page}>
      <Box className={styles.card} component="form" onSubmit={handleSubmit}>
        {/* Logo */}
        <Box className={styles.logoBox}>
          <Typography className={styles.logoText}>HK</Typography>
        </Box>

        <Typography variant="h5" className={styles.title}>
          Welcome Back
        </Typography>
        <Typography variant="body2" className={styles.subtitle}>
          {subtitle}
        </Typography>

        {error && (
          <Alert severity="error" onClose={dismissError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="small"
          sx={{ mb: 2 }}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Property</InputLabel>
          <Select
            value={propertyId}
            label="Property"
            onChange={(e) => setPropertyId(e.target.value)}
            required
            disabled={tenantLoading}
            endAdornment={
              tenantLoading ? (
                <InputAdornment position="end" sx={{ mr: 2 }}>
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined
            }
          >
            {tenantConfig?.properties?.map((p) => (
              <MenuItem key={p.propertyId} value={p.propertyId}>
                {p.propertyName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !email || !password || !propertyId}
          className={styles.loginBtn}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'LOGIN'}
        </Button>

        <Typography variant="body2" className={styles.switchLink}>
          <Link to={`/${tenantName}${switchLink.to}`}>{switchLink.label}</Link>
        </Typography>
      </Box>
    </Box>
  );
}
