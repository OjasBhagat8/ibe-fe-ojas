import { useAppSelector } from "../../app/hooks";
import styles from "./Footer.module.scss";

const Footer = () => {
  const tenant = useAppSelector((state) => state.tenant.data);

  if (!tenant) return null;
  const copyrightText = (tenant.tenantCopyright || "All rights reserved.").replace(
    ". ",
    ".\n",
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {tenant.tenantLogo && (
            <img
              src={tenant.tenantLogo}
              alt="footer logo"
              className={styles.footerLogo}
            />
          )}
          <span className={styles.brandName}>{tenant.tenantName}</span>
        </div>

        <div className={styles.copyright}>
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
