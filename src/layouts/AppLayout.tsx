import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageMetadata from "../components/PageMetadata/PageMetadata";
import styles from "./AppLayout.module.scss";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { fetchTenantConfig } from "../features/tenant/tenantSlice";
import { useAppSelector } from "../app/hooks";

const AppLayout = () => {
  const { tenantName } = useParams<{ tenantName: string }>();
  const dispatch = useAppDispatch();

  const { data, loading, error } = useAppSelector(
    (state) => state.tenant
  );

  useEffect(() => {
    if (tenantName) {
      dispatch(fetchTenantConfig(tenantName));
    }
  }, [tenantName, dispatch]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading tenant...</p>
      </div>
    );
  }

  if (error) {
    return <div>Tenant not found</div>;
  }

  if (!data) {
    return null; 
  }
  return (
    <div className={styles.layoutContainer}>
      <PageMetadata />
      <Header />
      
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;
