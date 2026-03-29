import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useAppSelector } from "../../app/hooks";
import {
  getCognitoLogoutUrl,
  storeLoginReturnPath,
  storeLogoutReturnPath,
} from "../../features/auth/cognitoAuth";
import { resolveMediaUrl } from "../../features/tenant/mediaUrl";
import styles from "./Header.module.scss";

const Header = () => {
  const tenant = useAppSelector((state) => state.tenant.data);
  const tenantLoading = useAppSelector((state) => state.tenant.loading);
  const auth = useAuth();
  const { tenantName } = useParams<{ tenantName: string }>();
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = useMemo(() => resolveMediaUrl(tenant?.tenantLogo), [tenant?.tenantLogo]);
  const isLoggedIn = auth.isAuthenticated;
  const tenantHomePath = tenantName ? `/${tenantName}` : "/";
  const myBookingsPath = tenantName ? `/${tenantName}/my-bookings` : "/my-bookings";
  const adminPath = tenantName ? `/${tenantName}/admin` : "/admin";
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const userName =
    auth.user?.profile.name ??
    auth.user?.profile.given_name ??
    auth.user?.profile.preferred_username ??
    auth.user?.profile.email ??
    auth.user?.profile.sub;

  const handleAuthAction = async () => {
    if (isLoggedIn) {
      storeLogoutReturnPath(currentPath);
      await auth.removeUser();
      window.location.assign(getCognitoLogoutUrl());
      return;
    }

    storeLoginReturnPath(currentPath);
    await auth.signinRedirect({
      state: {
        returnTo: currentPath,
      },
    });
  };

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  if (tenantLoading) {
    return <header className={styles.header}>Loading...</header>;
  }

  if (!tenant) return null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={tenantHomePath} className={styles.branding}>
          {logoUrl && !logoFailed ? (
            <img
              src={logoUrl}
              alt={tenant.tenantName}
              className={styles.logoImage}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className={styles.logoText}>{tenant.tenantName}</span>
          )}

          <span className={styles.suffix}>Internet Booking Engine</span>
        </Link>

        <div className={styles.right}>
          {isLoggedIn && (
            <>
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>Welcome,</span>
                <span className={styles.userName}>{userName}</span>
              </div>

              <Link to={myBookingsPath} className={styles.myBookings}>
                MY BOOKINGS
              </Link>
            </>
          )}

          <Link to={adminPath} className={styles.adminLink}>
            ADMIN
          </Link>

          <button
            type="button"
            className={styles.loginBtn}
            onClick={() => void handleAuthAction()}
            disabled={auth.isLoading}
          >
            {isLoggedIn ? "LOGOUT" : "LOGIN"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
