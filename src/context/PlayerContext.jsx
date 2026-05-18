import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import YouTube from 'react-youtube';
import { api, streamUrlForSong } from '../api.js';

const PlayerContext = createContext(null);

/** @see https://developers.google.com/youtube/iframe_api_reference#Events */
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_BUFFERING = 3;

const YT_OPTS = {
  height: '1',
  width: '1',
  playerVars: {
    autoplay: 0,
    controls: 0,
    disablekb: 1,
    fs: 0,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
  },
};
const AUTH_CHANGED_EVENT = 'spotify-auth-changed';

export function normalizePlayerTrack(t) {
  if (!t || t.id == null) return null;
  return {
    id: t.id,
    title: t.title ?? '',
    artist: t.artist ?? '',
    duration: Number(t.duration) || 0,
    ...(t.youtubeId ? { youtubeId: t.youtubeId } : {}),
  };
}

function sameTrackId(a, b) {
  return String(a) === String(b);
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const queueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const shuffleRef = useRef(false);
  const playNextTrackRef = useRef(async () => {});

  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);

  const resetPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    try {
      ytPlayerRef.current?.stopVideo?.();
    } catch {
      /* ignore */
    }
    queueRef.current = [];
    queueIndexRef.current = 0;
    setQueue([]);
    setQueueIndex(0);
    setCurrent(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, []);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  const recordPlay = useCallback(async (songId) => {
    try {
      await api('/history/play', { method: 'POST', body: JSON.stringify({ songId }) });
    } catch {
      /* non-fatal */
    }
  }, []);

  const beginPlayback = useCallback(
    async (track) => {
      const t = normalizePlayerTrack(track);
      if (!t) return;

      setError(null);
      setCurrentTime(0);
      setDuration(Number.isFinite(t.duration) && t.duration > 0 ? t.duration : 0);
      setCurrent(t);

      if (t.youtubeId) {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
        }
        setPlaying(false);
        void recordPlay(t.id);
        return;
      }

      try {
        ytPlayerRef.current?.stopVideo?.();
      } catch {
        /* ignore */
      }

      const audio = audioRef.current;
      if (!audio) return;
      audio.src = streamUrlForSong(t.id);
      try {
        await audio.play();
        setPlaying(true);
        void recordPlay(t.id);
      } catch (e) {
        setError(e.message || 'Playback failed');
        setPlaying(false);
      }
    },
    [recordPlay]
  );

  const playNextTrack = useCallback(async () => {
    const q = queueRef.current;
    const i = queueIndexRef.current;
    if (!q.length) {
      setPlaying(false);
      return;
    }

    let nextIdx;
    if (shuffleRef.current) {
      if (q.length <= 1) {
        setPlaying(false);
        return;
      }
      do {
        nextIdx = Math.floor(Math.random() * q.length);
      } while (nextIdx === i);
    } else {
      nextIdx = i + 1;
      if (nextIdx >= q.length) {
        setPlaying(false);
        return;
      }
    }

    const next = q[nextIdx];
    if (!next) {
      setPlaying(false);
      return;
    }
    queueIndexRef.current = nextIdx;
    setQueueIndex(nextIdx);
    await beginPlayback(next);
  }, [beginPlayback]);

  useEffect(() => {
    playNextTrackRef.current = playNextTrack;
  }, [playNextTrack]);

  const playPreviousTrack = useCallback(async () => {
    const q = queueRef.current;
    const i = queueIndexRef.current;
    if (!q.length) {
      setPlaying(false);
      return;
    }

    let prevIdx;
    if (shuffleRef.current) {
      if (q.length <= 1) {
        setPlaying(false);
        return;
      }
      do {
        prevIdx = Math.floor(Math.random() * q.length);
      } while (prevIdx === i);
    } else {
      prevIdx = i - 1;
      if (prevIdx < 0) {
        setPlaying(false);
        return;
      }
    }

    const prev = q[prevIdx];
    if (!prev) {
      setPlaying(false);
      return;
    }

    queueIndexRef.current = prevIdx;
    setQueueIndex(prevIdx);
    await beginPlayback(prev);
  }, [beginPlayback]);

  const playTrack = useCallback(
    async (track, options = {}) => {
      const t = normalizePlayerTrack(track);
      if (!t) return;

      let q = (options.queue || []).map(normalizePlayerTrack).filter(Boolean);
      if (!q.length) q = [t];

      let idx = options.index;
      if (typeof idx !== 'number' || idx < 0 || idx >= q.length) {
        idx = q.findIndex((x) => sameTrackId(x.id, t.id));
      }
      if (idx < 0) idx = 0;

      queueRef.current = q;
      queueIndexRef.current = idx;
      setQueue(q);
      setQueueIndex(idx);

      await beginPlayback(t);
    },
    [beginPlayback]
  );

  const playRandomTrack = useCallback(async () => {
    let q = queueRef.current;
    if (!q.length) {
      try {
        const { songs } = await api('/songs');
        if (!songs?.length) return;
        q = songs.map(normalizePlayerTrack).filter(Boolean);
        if (!q.length) return;
        queueRef.current = q;
        setQueue(q);
      } catch {
        return;
      }
    }

    const nextIdx = Math.floor(Math.random() * q.length);
    const next = q[nextIdx];
    if (!next) return;
    queueIndexRef.current = nextIdx;
    setQueueIndex(nextIdx);
    await beginPlayback(next);
  }, [beginPlayback]);

  const togglePlay = useCallback(async () => {
    if (!current) return;

    if (current.youtubeId) {
      const p = ytPlayerRef.current;
      if (!p || typeof p.playVideo !== 'function') return;
      try {
        if (playing) {
          p.pauseVideo();
          setPlaying(false);
        } else {
          p.playVideo();
          setPlaying(true);
        }
      } catch (e) {
        setError(e.message || 'Playback failed');
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch (e) {
        setError(e.message || 'Playback failed');
      }
    }
  }, [current, playing]);

  const seek = useCallback(
    (ratio) => {
      if (!current || !Number.isFinite(ratio)) return;

      if (current.youtubeId) {
        const p = ytPlayerRef.current;
        const d = p?.getDuration?.();
        if (!p || !Number.isFinite(d) || d <= 0) return;
        const t = Math.max(0, Math.min(ratio * d, d));
        try {
          p.seekTo(t, true);
        } catch {
          return;
        }
        setCurrentTime(t);
        setDuration(d);
        return;
      }

      const audio = audioRef.current;
      if (!audio || !duration) return;
      const t = Math.max(0, Math.min(duration * ratio, duration));
      audio.currentTime = t;
      setCurrentTime(t);
    },
    [current, duration]
  );

  const onYoutubeReady = useCallback((event) => {
    ytPlayerRef.current = event.target;
    try {
      event.target.playVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const onYoutubeStateChange = useCallback((event) => {
    const st = event.data;
    if (st === YT_ENDED) {
      void playNextTrackRef.current();
      return;
    }
    if (st === YT_PLAYING || st === YT_BUFFERING) {
      setPlaying(true);
    } else if (st === YT_PAUSED) {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || current?.duration || 0);
    const onEnded = () => {
      setPlaying(false);
      void playNextTrackRef.current();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [current]);

  useEffect(() => {
    if (!current?.youtubeId) return;

    const id = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;
      try {
        const t = p.getCurrentTime();
        const d = p.getDuration();
        if (Number.isFinite(t)) setCurrentTime(t);
        if (Number.isFinite(d) && d > 0) setDuration(d);
      } catch {
        /* ignore */
      }
    }, 400);

    return () => clearInterval(id);
  }, [current?.youtubeId, current?.id]);

  useEffect(() => {
    const onAuthChanged = () => resetPlayer();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, [resetPlayer]);

  const value = useMemo(
    () => ({
      current,
      playing,
      currentTime,
      duration,
      error,
      queue,
      queueIndex,
      shuffle,
      setShuffle,
      playTrack,
      playNextTrack,
      playPreviousTrack,
      playRandomTrack,
      togglePlay,
      seek,
      formatTime,
    }),
    [
      current,
      playing,
      currentTime,
      duration,
      error,
      queue,
      queueIndex,
      shuffle,
      playTrack,
      playNextTrack,
      playPreviousTrack,
      playRandomTrack,
      togglePlay,
      seek,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" className="hidden" crossOrigin="anonymous" />
      {current?.youtubeId ? (
        <div className="fixed left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0" aria-hidden>
          <YouTube
            key={current.id}
            videoId={current.youtubeId}
            opts={YT_OPTS}
            onReady={onYoutubeReady}
            onStateChange={onYoutubeStateChange}
            onError={() => setError('Không phát được video YouTube (hạn chế nhúng hoặc đã gỡ).')}
          />
        </div>
      ) : null}
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
