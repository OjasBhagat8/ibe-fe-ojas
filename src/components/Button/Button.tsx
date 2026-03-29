import styles from "./Button.module.scss";

type Props = {
	text: string;
	disabled?: boolean;
	onClick?: () => void;
};

const Button = ({ text, disabled, onClick }: Props) => {
	return (
		<button
			className={styles.button}
			disabled={disabled}
			onClick={onClick}
			style={{
				opacity: disabled ? 0.5 : 1,
				cursor: disabled ? "not-allowed" : "pointer",
			}}>
			{text}
		</button>
	);
};

export default Button;
