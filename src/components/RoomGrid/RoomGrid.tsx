import RoomCard from "../RoomCard/RoomCard";
import styles from "./RoomGrid.module.scss";
import type { RoomItem } from "../../types/roomCard";

type Props = {
  rooms: RoomItem[];
  columns?: number;
  onSelectRoom?: (roomId: string) => void;
};

const RoomGrid = ({ rooms, columns = 3, onSelectRoom }: Props) => {
  return (
    <div
      className={styles.grid}
      style={{ ["--room-grid-columns" as string]: String(columns) }}
    >
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onSelectRoom={onSelectRoom} />
      ))}
    </div>
  );
};

export default RoomGrid;
