import { useState } from "react";
import styles from "./RoomCard.module.scss";
import type { RoomItem } from "../../types/roomCard";
import guestIcon from "../../assets/u_user.png";
import BedIcon from "../../assets/u_bed-double.png";

type Props = {
  room: RoomItem;
  onSelectRoom?: (roomId: string) => void;
};

const RoomCard = ({ room, onSelectRoom }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={room.images[currentImage]} alt={room.title} />

        {room.images.length > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.left}`}
              onClick={prevImage}
              type="button"
            >
              ‹
            </button>

            <button
              className={`${styles.arrow} ${styles.right}`}
              onClick={nextImage}
              type="button"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{room.title}</h3>

        <div className={styles.metaTop}>
          <span className={styles.boardType}>Inclusive</span>
          <span>{room.area}</span>
        </div>

        <div className={styles.infoRow}>
          <img src={guestIcon} alt="" />
          <span>{room.minGuests}-{room.maxGuests}</span>
        </div>

        <div className={styles.infoRow}>
          <img src={BedIcon} alt="" />
          <span>{room.beds}</span>
        </div>

        <div className={styles.bottom}>
          <div className={styles.priceBlock}>
            <div className={styles.price}>${room.price}</div>
            <span className={styles.subText}>for the stay</span>
          </div>

          <button
            className={styles.button}
            type="button"
            onClick={() => onSelectRoom?.(room.id)}
          >
            SELECT ROOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
