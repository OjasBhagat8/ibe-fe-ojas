import { useAppSelector } from "../../app/hooks";
import { resolveMediaUrl } from "../../features/tenant/mediaUrl";
import BookingSearchForm from "../../components/BookingSearchForm/BookingSearchForm";

import styles from "./Landing.module.scss";

const Landing = () => {
  const tenant = useAppSelector((state) => state.tenant.data);

  if (!tenant) return null;

  const bannerImage = resolveMediaUrl(tenant.tenantBanner) || resolveMediaUrl(tenant.tenantLogo);

  return (
    <div
      className={styles.landing}
      style={{
        backgroundImage: `url(${bannerImage})`,
      }}
    >
      <div className={styles.content}>
        <div className={styles.searchCard}>
          <BookingSearchForm tenant={tenant} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
