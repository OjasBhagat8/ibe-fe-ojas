import styles from "../Checkout.module.scss";

type Props = {
  isOpen: boolean;
  sections?: string[] | null;
  title?: string | null;
  onClose: () => void;
};

const fallbackSections = [
  "Rates, taxes, and the amount due at resort are subject to property policies",
  "Cancellations, card authorization, and property-specific policies apply to every reservation.",
];

const TermsModal = ({ isOpen, sections, title, onClose }: Props) => {
  if (!isOpen) {
    return null;
  }

  const resolvedSections = sections?.filter((section): section is string => Boolean(section?.trim())) ?? fallbackSections;

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.termsModal}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title?.trim() || "Terms and Policies"}</h2>
        {resolvedSections.map((section) => (
          <p key={section}>{section}</p>
        ))}
        <button type="button" className={styles.primaryButton} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
};

export default TermsModal;
