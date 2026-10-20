import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bouquet } from "./components/Bouquet.jsx";
import { FallingPetals } from "./components/FallingPetals.jsx";
import { Heart, Volume2, VolumeX, X } from "lucide-react";

const MUSIC_END_SECONDS = 248;

function Scene() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 700;

  return (
    <Canvas
      camera={{
        position: mobile ? [0, 2.4, 10.5] : [0, 2.4, 9.35],
        fov: mobile ? 50 : 31,
      }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#120910"]} />
      <fog attach="fog" args={["#120910", 12.2, 22]} />
      <ambientLight intensity={0.86} />
      <directionalLight
        position={[-4.8, 7.8, 5.2]}
        intensity={2.35}
        color="#ffe2d3"
        castShadow
      />
      <directionalLight
        position={[5.2, 3.4, -2.2]}
        intensity={1.15}
        color="#f3a2ae"
      />
      <pointLight
        position={[0, 3.4, 3.8]}
        intensity={10.5}
        color="#ff6c7c"
        distance={15}
      />
      <pointLight
        position={[0, 0.9, -4.5]}
        intensity={4.2}
        color="#90223a"
        distance={14}
      />

      <group position={[0, 0.05, 0]} scale={mobile ? 0.9 : 0.97}>
        <Bouquet />
      </group>
      <FallingPetals />

      <OrbitControls
        target={[0, 0.68, 0]}
        minDistance={6.5}
        maxDistance={11.5}
        minPolarAngle={0.52}
        maxPolarAngle={1.78}
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        autoRotate
        autoRotateSpeed={0.32}
      />
    </Canvas>
  );
}

export default function App() {
  const audioRef = useRef(null);
  const [sound, setSound] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const [letterOpen, setLetterOpen] = useState(false);

  const playRecording = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime >= MUSIC_END_SECONDS) audio.currentTime = 0;
    try {
      await audio.play();
      setSound(true);
      setAutoplayBlocked(false);
    } catch {
      setSound(false);
      setAutoplayBlocked(true);
    }
  }, []);

  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (sound) {
      audio?.pause();
      setSound(false);
      setAutoplayBlocked(false);
      return;
    }
    void playRecording();
  }, [playRecording, sound]);

  useEffect(() => {
    const t = setTimeout(() => {
      setIntro(false);
      setReady(true);
      void playRecording();
    }, 1950);
    return () => clearTimeout(t);
  }, [playRecording]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const stopAtLimit = () => {
      if (audio.currentTime >= MUSIC_END_SECONDS) {
        audio.pause();
        audio.currentTime = 0;
        setSound(false);
      }
    };
    const syncPlaybackState = () => setSound(!audio.paused);
    audio.addEventListener("timeupdate", stopAtLimit);
    audio.addEventListener("play", syncPlaybackState);
    audio.addEventListener("pause", syncPlaybackState);
    return () => {
      audio.removeEventListener("timeupdate", stopAtLimit);
      audio.removeEventListener("play", syncPlaybackState);
      audio.removeEventListener("pause", syncPlaybackState);
    };
  }, []);

  useEffect(() => {
    if (!letterOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setLetterOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [letterOpen]);

  return (
    <main className={`experience ${intro ? "is-intro" : "is-ready"}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="wordmark">
        Eternal <i>Roses</i>
        <span>EST. WITH LOVE</span>
      </div>

      <div className="top-actions">
        <button
          className="icon-button"
          aria-label={sound ? "Pause romantic music" : "Play romantic music"}
          onClick={toggleSound}
          title="Romantic music"
        >
          <span className="sound-note">
            {sound ? <Volume2 /> : <VolumeX />}
          </span>
        </button>
        {autoplayBlocked && (
          <span className="sound-hint">
            Trình duyệt đã chặn tự phát · chạm để bật nhạc
          </span>
        )}
        <button
          className="icon-button help-button"
          aria-label="Interaction help"
          title="Drag to rotate · Scroll to zoom"
        >
          <span>?</span>
        </button>
      </div>

      <div className="for-you">FOR YOU</div>

      <div className="scene-wrap">
        <Scene />
      </div>

      <div className="side-caption">
        <span>20 / 10</span>
        <span className="caption-line" />
        <span>FOR MY GIRLFRIEND</span>
      </div>

      <section className="bottom-content">
        <p className="eyebrow">
          <span /> MADE TO BE REMEMBERED <span />
        </p>
        <h1>
          A Bouquet <em>of Love</em>
        </h1>
        <p className="subtitle">Every petal carries a little love.</p>

        <div className="dedication">
          <p className="dedication-title">
            <Heart /> Gửi em nhân ngày 20/10
          </p>
          <button
            className="letter-trigger"
            onClick={() => setLetterOpen(true)}
          >
            <span>Anh có đôi lời muốn gửi đến em ❤️</span>
            <span className="letter-trigger-link">Bấm vào đây nhooooo</span>
          </button>
        </div>
      </section>

      <div className="corner-mark">
        HAPPY 20/10
        <br />
        MY LOVE <span>✳</span>
      </div>

      <audio ref={audioRef} src="/music/gift-recording.m4a" preload="auto" />

      {intro && (
        <div className="intro-curtain">
          <div className="intro-mark">
            Eternal <i>Roses</i>
            <span>AN EXPRESSION OF LOVE</span>
          </div>
          <div className="loading-line">
            <i />
          </div>
        </div>
      )}

      {ready && <div className="ready-mark">A moment, forever</div>}

      {letterOpen && (
        <div className="letter-overlay" onClick={() => setLetterOpen(false)}>
          <section
            className="letter-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="letter-close"
              onClick={() => setLetterOpen(false)}
              aria-label="Đóng thư"
            >
              <X />
            </button>
            <p className="letter-eyebrow">MỘT LỜI NHẮN GỬI EM</p>
            <h2 id="letter-title">Gửi cô gái anh thương</h2>
            <div className="letter-body">
              <p>
                Nhân ngày 20/10, anh muốn gửi đến em những lời yêu thương chân
                thành nhất. Chúc cô gái nhỏ của anh luôn xinh đẹp, rạng rỡ, bình
                an và hạnh phúc, không chỉ hôm nay mà trong tất cả những ngày
                sau này. Cảm ơn em vì đã xuất hiện trong cuộc đời anh.
              </p>
              <p>
                Anh biết rằng tình yêu không chỉ nằm ở những lời nói ngọt ngào
                hay những món quà đẹp, mà còn ở sự quan tâm, thấu hiểu và đồng
                hành cùng nhau qua từng ngày, mà sẽ luôn cố gắng để trở thành
                người có thể lắng nghe, sẻ chia và ở bên em những lúc em cần.
              </p>
              <p>
                Mong rằng em sẽ luôn được là chính mình, được yêu thương và trân
                trọng theo cách mà em xứng đáng.
              </p>
              <p className="letter-signoff">
                Nếu có một điều anh muốn nói với em hôm nay, thì đó là: Cảm ơn
                em vì đã đến, vì đã ở lại và vì đã cho anh cơ hội được yêu em.
                Anh thương em rất nhiều. Chúc mừng ngày 20/10, tình yêu của anh!
                ❤️
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
