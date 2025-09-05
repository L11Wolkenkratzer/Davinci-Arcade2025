import React, { memo, useMemo, useRef, useCallback } from 'react';

interface Game {
  id: number;
  title: string;
  color: string;
  video?: string;
  image: string; // Bild ist jetzt required, icon entfernt
}

interface CarouselProps {
  games: Game[];
  selectedGameIndex: number;
  onGameClick: (index: number) => void;
  containerWidth: number;
  videoVisible: boolean;
  videoEnded: boolean;
  onVideoReplay: () => void; // kann entfernt werden, wird nicht mehr genutzt
  setVideoEnded: (ended: boolean) => void;
  getCardTransform?: (index: number) => React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const CarouselCard = memo(({ 
  game, 
  index, 
  isSelected, 
  transform, 
  onClick,
  videoVisible,
  videoEnded,
  onVideoReplay, // wird nicht mehr verwendet
  setVideoEnded
}: {
  game: Game;
  index: number;
  isSelected: boolean;
  transform: React.CSSProperties;
  onClick: () => void;
  videoVisible: boolean;
  videoEnded: boolean;
  onVideoReplay: () => void;
  setVideoEnded: (ended: boolean) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Video wird nur gezeigt wenn selected, visible UND noch nicht beendet
  const shouldShowVideo = isSelected && videoVisible && game.video && !videoEnded;

  return (
    <div
      className={`game-card-carousel ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={{
        "--game-color": game.color,
        ...transform,
      } as React.CSSProperties & Record<string, any>}
    >
      <div className="game-content">
        {shouldShowVideo ? (
          <video
            ref={videoRef}
            src={game.video}
            autoPlay
            muted
            playsInline
            controls={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
              borderRadius: '32px',
              pointerEvents: 'none',
              background: 'black',
              opacity: 1,
              transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
            }}
            onEnded={() => setVideoEnded(true)}
          />
        ) : (
          // Bild wird gezeigt wenn kein Video läuft oder Video beendet ist
          <img 
            src={game.image} 
            alt={game.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '32px',
            }}
          />
        )}
        <div
          className="game-glow"
          style={{ "--game-color": game.color } as React.CSSProperties}
        />
      </div>
    </div>
  );
});

CarouselCard.displayName = 'CarouselCard';

const Carousel: React.FC<CarouselProps> = memo(({
  games,
  selectedGameIndex,
  onGameClick,
  containerWidth,
  videoVisible,
  videoEnded,
  onVideoReplay, // wird nicht mehr verwendet
  setVideoEnded
}) => {
  const cardDimensions = useMemo(() => ({
    cardWidth: containerWidth <= 1920 ? 280 : 420,
    gap: containerWidth <= 1920 ? 200 : 240
  }), [containerWidth]);

  const cardTransforms = useMemo(() => {
    const transforms: React.CSSProperties[] = [];
    const total = games.length;
    const { cardWidth, gap } = cardDimensions;
    const spacing = cardWidth + gap;
    
    games.forEach((_, index) => {
      let rel = index - selectedGameIndex;
      if (rel > total / 2) rel -= total;
      if (rel < -total / 2) rel += total;
      const abs = Math.abs(rel);
      let scale = 0.4, opacity = 0.2, zIndex = 1;
      if (abs === 0) { scale = 1; opacity = 1; zIndex = 10; }
      else if (abs === 1) { scale = 0.8; opacity = 0.7; zIndex = 5; }
      else if (abs === 2) { scale = 0.6; opacity = 0.4; zIndex = 2; }
      transforms[index] = {
        transform: `translateX(${rel * spacing}px) scale(${scale})`,
        opacity,
        zIndex,
      };
    });
    return transforms;
  }, [selectedGameIndex, cardDimensions, games.length]);

  const handleGameClick = useCallback((index: number) => {
    onGameClick(index);
  }, [onGameClick]);

  return (
    <div className="games-carousel-container">
      <div className="games-carousel-viewport">
        <div className="games-carousel-track">
          {games.map((game, index) => (
            <CarouselCard
              key={game.id}
              game={game}
              index={index}
              isSelected={index === selectedGameIndex}
              transform={cardTransforms[index]}
              onClick={() => handleGameClick(index)}
              videoVisible={videoVisible}
              videoEnded={videoEnded}
              onVideoReplay={() => {}} // leere Funktion, da nicht mehr verwendet
              setVideoEnded={setVideoEnded}
            />
          ))}
        </div>
      </div>
      <div className="selected-game-info" style={{
        marginBottom: "4em",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <h2
          className="selected-game-title"
          style={{
            "--game-color": games[selectedGameIndex].color,
            fontSize: '2rem',
            marginTop: "-2.3rem"
          } as React.CSSProperties}
        >
          {games[selectedGameIndex].title}
        </h2>
        <div className="game-description">
          Drücke ENTER zum Spielen
        </div>
      </div>
    </div>
  );
});

Carousel.displayName = 'Carousel';

export default Carousel;
