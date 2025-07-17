import React, { useEffect, useState } from "react";
import "./Home.css";
import type { Player } from "./Home";

interface UserModalProps {
  onClose: () => void;
  currentPlayer: Player;
  setCurrentPlayer: React.Dispatch<
    React.SetStateAction<Player | null>
  >;
}

const UserModal: React.FC<UserModalProps> = ({
  onClose,
  currentPlayer,
  setCurrentPlayer,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const fields = [
    "NAME" as const,
    "HIGHSCORE" as const,
    "GAMES_PLAYED" as const,
    "LAST_PLAYED" as const,
    "LOGOUT" as const,
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((i) => (i + 1) % fields.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((i) =>
            (i - 1 + fields.length) % fields.length
          );
          break;
        case "Enter":
          e.preventDefault();
          if (fields[focusedIndex] === "LOGOUT") {
            logout();
          }
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusedIndex, onClose]);

  const logout = () => {
    localStorage.removeItem("currentPlayer");
    setCurrentPlayer(null);
    window.location.href = "/login";
  };

  const handleOverlay = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">User</h2>
          <button
            className={`close-button ${
              focusedIndex === 0 ? "keyboard-selected" : ""
            }`}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div
            className={`user-info ${
              focusedIndex === 1 ? "keyboard-selected" : ""
            }`}
          >
            <p>Name: {currentPlayer.name}</p>
          </div>
          <div
            className={`user-info ${
              focusedIndex === 2 ? "keyboard-selected" : ""
            }`}
          >
            <p>Highscore: {currentPlayer.totalScore}</p>
          </div>
          <div
            className={`user-info ${
              focusedIndex === 3 ? "keyboard-selected" : ""
            }`}
          >
            <p>Games Played: {currentPlayer.gamesPlayed}</p>
          </div>
          <div
            className={`user-info ${
              focusedIndex === 4 ? "keyboard-selected" : ""
            }`}
          >
            <p>
              Last Played:{" "}
              {new Date(currentPlayer.lastPlayed).toLocaleString()}
            </p>
          </div>
          <button
            className={`logout-button ${
              focusedIndex === 5 ? "keyboard-selected" : ""
            }`}
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
