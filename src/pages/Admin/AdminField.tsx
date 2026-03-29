import type { ReactNode } from "react";
import styles from "./AdminDashboard.module.scss";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

const AdminField = ({ label, hint, children }: FieldProps) => (
  <label className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    {children}
    {hint ? <small className={styles.fieldHint}>{hint}</small> : null}
  </label>
);

export default AdminField;
