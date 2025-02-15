import { useEffect, useState } from "react";
import { Stage, Layer, Text, Image, Rect } from "react-konva";
import useImage from "use-image";
import useSound from "use-sound";

const SCREEN_WIDTH = window.innerWidth * 0.9;
const SCREEN_HEIGHT = window.innerHeight * 0.9;
const PLAYER_SPEED = 10;
const ROSE_FALL_SPEED = 3;
const WIN_SCORE = 20;

export default function ValentineGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2 - 40);
  const [roses, setRoses] = useState([]);
  const [score, setScore] = useState(0);
  const [win, setWin] = useState(false);

  const [playerImage] = useImage("/partner-new.png");
  const [roseImage] = useImage("/rose.png");
  const [background] = useImage("/background.png");
  const [bossBackground] = useImage("/boss-background.png");
  const [heartImage] = useImage("/heart.png");
  const [rajImage] = useImage("/raj-full-pixel.png");
  const [playBackgroundMusic, { stop: stopBackgroundMusic }] = useSound(
    "/boss_music.mp3",
    { loop: true }
  );
  const [playCollect] = useSound("/sounds/collect.wav");

  useEffect(() => {
    const startMusic = () => {
      playBackgroundMusic();
      setGameStarted(true);
      window.removeEventListener("click", startMusic);
    };
    window.addEventListener("click", startMusic);
    return () => window.removeEventListener("click", startMusic);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setPlayerX((prev) => Math.max(prev - PLAYER_SPEED, 0));
      } else if (e.key === "ArrowRight") {
        setPlayerX((prev) => Math.min(prev + PLAYER_SPEED, SCREEN_WIDTH - 120));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || win) return;
    const interval = setInterval(() => {
      setRoses((prev) =>
        prev.map((rose) => ({ ...rose, y: rose.y + ROSE_FALL_SPEED }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, [gameStarted, win]);

  useEffect(() => {
    if (!gameStarted || win) return;
    const roseSpawnInterval = setInterval(() => {
      setRoses((prev) => [
        ...prev,
        { x: Math.random() * (SCREEN_WIDTH - 40), y: 0, collected: false },
      ]);
    }, 1000);
    return () => clearInterval(roseSpawnInterval);
  }, [gameStarted, win]);

  useEffect(() => {
    if (!gameStarted || win) return;
    setRoses((prev) =>
      prev.filter((rose) => {
        if (rose.y >= SCREEN_HEIGHT - 80 && !rose.collected) {
          if (rose.x > playerX && rose.x < playerX + 120) {
            setScore((s) => s + 1);
            playCollect();
            return false;
          }
        }
        return true;
      })
    );
  }, [playerX, gameStarted, win]);

  useEffect(() => {
    if (score >= WIN_SCORE) {
      setWin(true);
      stopBackgroundMusic();
    }
  }, [score]);

  const restartGame = () => {
    setGameStarted(false);
    setScore(0);
    setWin(false);
    setRoses([]);
    window.location.reload();
  };

  return (
    <div>
      <Stage width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        <Layer>
          <Image
            image={win ? bossBackground : background}
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
          />
          {!gameStarted && (
            <Text
              text="Click to Start\nCatch 10 Roses to Win!"
              fontSize={30}
              x={SCREEN_WIDTH / 4}
              y={SCREEN_HEIGHT / 3}
              fill="white"
              align="center"
            />
          )}
          {gameStarted && !win && (
            <>
              <Image
                image={playerImage}
                x={playerX}
                y={SCREEN_HEIGHT - 120}
                width={120}
                height={120}
              />
              {roses.map((rose, i) => (
                <Image
                  key={i}
                  image={roseImage}
                  x={rose.x}
                  y={rose.y}
                  width={40}
                  height={40}
                />
              ))}
              <Text
                text={`Score: ${score}`}
                fontSize={20}
                x={20}
                y={20}
                fill="white"
              />
            </>
          )}
          {win && (
            <>
              <Image
                image={playerImage}
                x={SCREEN_WIDTH / 2 - 130}
                y={SCREEN_HEIGHT - 220}
                width={130}
                height={130}
              />
              <Image
                image={rajImage}
                x={SCREEN_WIDTH / 2}
                y={SCREEN_HEIGHT - 220}
                width={130}
                height={130}
              />
              <Image
                image={heartImage}
                x={SCREEN_WIDTH / 2 - 50}
                y={SCREEN_HEIGHT / 2 - 50}
                width={100}
                height={100}
              />
              <Text
                text="Happy Valentine's Day My Love! 💖"
                fontSize={30}
                x={150}
                y={150}
                fill="pink"
              />
              <Rect
                x={SCREEN_WIDTH / 2 - 50}
                y={SCREEN_HEIGHT / 2 + 50}
                width={100}
                height={40}
                fill="red"
                shadowBlur={5}
                onClick={restartGame}
              />
              <Text
                text="Replay"
                fontSize={20}
                x={SCREEN_WIDTH / 2 - 30}
                y={SCREEN_HEIGHT / 2 + 60}
                fill="white"
                onClick={restartGame}
              />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
