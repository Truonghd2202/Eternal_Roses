import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Bouquet } from './components/Bouquet.jsx';
import { FallingPetals } from './components/FallingPetals.jsx';
import { Heart, Volume2, VolumeX } from 'lucide-react';

const YT_VIDEO_ID = 'ZjNi43BXWXM';
const YT_START_SECONDS = 58;
const YT_END_SECONDS = 248;

function Scene() {
  return (
    <Canvas camera={{ position: [0, 2.4, 9.35], fov: 31 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#120910']} />
      <fog attach="fog" args={['#120910', 12.2, 22]} />
      <ambientLight intensity={0.86} />
      <directionalLight position={[-4.8, 7.8, 5.2]} intensity={2.35} color="#ffe2d3" castShadow />
      <directionalLight position={[5.2, 3.4, -2.2]} intensity={1.15} color="#f3a2ae" />
      <pointLight position={[0, 3.4, 3.8]} intensity={10.5} color="#ff6c7c" distance={15} />
      <pointLight position={[0, 0.9, -4.5]} intensity={4.2} color="#90223a" distance={14} />

      <group position={[0, -0.28, 0]} scale={0.97}>
        <Bouquet />
      </group>
      <FallingPetals />

      <OrbitControls
        target={[0, 0.68, 0]}
        minDistance={6.5}
        maxDistance={11.5}
        minPolarAngle={0.52}
        maxPolarAngle={2.18}
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        autoRotate
        autoRotateSpeed={0.32}
      />
    </Canvas>
  );
}

function loadYouTubeAPI(onReady) {
  if (window.YT && window.YT.Player) {
    onReady();
    return;
  }

  const previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    previous?.();
    onReady();
  };

  const existing = document.querySelector('script[data-youtube-api="true"]');
  if (!existing) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.dataset.youtubeApi = 'true';
    document.body.appendChild(tag);
  }
}

export default function App() {
  const playerRef = useRef(null);
  const playerWantsPlayRef = useRef(true);
  const [sound, setSound] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);

  const buildPlayer = useCallback(() => {
    if (playerRef.current || !(window.YT && window.YT.Player)) return;

    playerRef.current = new window.YT.Player('youtube-romantic-player', {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        start: YT_START_SECONDS,
        loop: 1,
        playlist: YT_VIDEO_ID,
        end: YT_END_SECONDS,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(38);
          if (playerWantsPlayRef.current) {
            event.target.seekTo(YT_START_SECONDS, true);
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          if (window.YT && event.data === window.YT.PlayerState.PLAYING) {
            setSound(true);
            setAutoplayBlocked(false);
          }
          if (window.YT && event.data === window.YT.PlayerState.PAUSED) setSound(false);
          if (window.YT && event.data === window.YT.PlayerState.ENDED) {
            event.target.seekTo(YT_START_SECONDS, true);
            event.target.playVideo();
          }
        },
        onAutoplayBlocked: () => {
          setSound(false);
          setAutoplayBlocked(true);
        },
      },
    });
  }, []);

  const toggleSound = useCallback(() => {
    if (sound) {
      playerWantsPlayRef.current = false;
      playerRef.current?.pauseVideo?.();
      setSound(false);
      setAutoplayBlocked(false);
      return;
    }

    playerWantsPlayRef.current = true;
    setAutoplayBlocked(false);

    loadYouTubeAPI(() => {
      if (!playerRef.current) {
        buildPlayer();
        return;
      }
      playerRef.current.seekTo?.(YT_START_SECONDS, true);
      playerRef.current.setVolume?.(38);
      playerRef.current.playVideo?.();
    });
  }, [buildPlayer, sound]);

  useEffect(() => {
    loadYouTubeAPI(buildPlayer);
  }, [buildPlayer]);

  useEffect(() => {
    const t = setTimeout(() => {
      setIntro(false);
      setReady(true);
    }, 1950);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, []);

  return (
    <main className={`experience ${intro ? 'is-intro' : 'is-ready'}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="wordmark">
        Eternal <i>Roses</i>
        <span>EST. WITH LOVE</span>
      </div>

      <div className="top-actions">
        <button
          className="icon-button"
          aria-label={sound ? 'Pause romantic music' : 'Play romantic music'}
          onClick={toggleSound}
          title="Romantic music"
        >
          <span className="sound-note">{sound ? <Volume2 /> : <VolumeX />}</span>
        </button>
        {autoplayBlocked && <span className="sound-hint">Chạm để bật nhạc</span>}
        <button className="icon-button help-button" aria-label="Interaction help" title="Drag to rotate · Scroll to zoom">
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
          <p className="dedication-text">
            Chúc em luôn xinh đẹp, dịu dàng, vui vẻ và hạnh phúc. Cảm ơn em vì đã đến bên anh. Mong rằng bó hoa này sẽ thay lời anh nói:
            <strong> anh thương em rất nhiều.</strong>
          </p>
        </div>

      </section>

      <div className="corner-mark">
        HAPPY 20/10<br />MY LOVE <span>✳</span>
      </div>

      <div id="youtube-romantic-player" className="youtube-player-host" aria-hidden="true" />

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
    </main>
  );
}
