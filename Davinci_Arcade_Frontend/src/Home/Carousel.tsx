import React, { memo, useMemo, useRef, useCallback } from 'react';

interface Game {
  id: number;
  title: string;
  icon: string;
  color: string;
  video?: string;
}

interface CarouselProps {
  games: Game[];
  selectedGameIndex: number;
  onGameClick: (index: number) => void;
  containerWidth: number;
  videoVisible: boolean;
  videoEnded: boolean;
  onVideoReplay: () => void;
  setVideoEnded: (ended: boolean) => void;
}

const CarouselCard = memo(({ 
  game, 
  index, 
  isSelected, 
  transform, 
  onClick,
  videoVisible,
  videoEnded,
  onVideoReplay,
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
  const shouldShowVideo = isSelected && videoVisible && game.video;

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
          <>
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
            {videoEnded && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#0ff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Press Start 2P',
                  textAlign: 'center',
                  border: '1px solid #0ff',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onVideoReplay();
                }}
              >
                ↻ REPLAY<br />
                <span style={{ fontSize: '10px' }}>LEERTASTE</span>
              </div>
            )}
          </>
        ) : (
          <div className="game-icon-carousel">{game.icon}</div>
        )}
        <div className="game-title-carousel">{game.title}</div>
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
  onVideoReplay,
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
              onVideoReplay={onVideoReplay}
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