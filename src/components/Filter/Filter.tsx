import { useState } from "react";
import styles from "./Filter.module.scss";

export type FilterOption = {
	id: string;
	label: string;
};

export type FilterGroup = {
	id: string;
	label: string;
	options: FilterOption[];
};

type Props = {
	title?: string;
	filters: FilterGroup[];
};

const Filter = ({ title = "Narrow your results", filters }: Props) => {
	const [openGroupIds, setOpenGroupIds] = useState<string[]>(
		filters.length ? [filters[0].id] : [],
	);

	const toggleGroup = (groupId: string) => {
		setOpenGroupIds((prev) =>
			prev.includes(groupId)
				? prev.filter((id) => id !== groupId)
				: [...prev, groupId],
		);
	};

	return (
		<div className={styles.panel}>
			<h3 className={styles.title}>{title}</h3>

			{filters.map((group) => {
				const isOpen = openGroupIds.includes(group.id);
				return (
					<div className={styles.group} key={group.id}>
						<button
							type="button"
							className={styles.groupHeader}
							onClick={() => toggleGroup(group.id)}>
							<span>{group.label}</span>
							<span className={styles.button}>{isOpen ? "⌃" : "⌄"}</span>
						</button>

						{isOpen && (
							<div className={styles.options}>
								{group.options.map((option) => (
									<label className={styles.option} key={option.id}>
										<input type="checkbox" />
										<span>{option.label}</span>
									</label>
								))}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default Filter;
