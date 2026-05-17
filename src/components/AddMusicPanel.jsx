import { useState } from 'react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { uploadAudioToCloudinary } from '../utils/cloudinaryUpload.js';

export function AddMusicPanel({ onAdded, variant = 'default' }) {
  const { isDark } = useTheme();

  const [tab, setTab] = useState('link');

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const inputClass = `w-full rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm transition ${isDark
      ? 'bg-black/30 border border-white/20 text-white placeholder-gray-500'
      : 'bg-black/10 border border-black/20 text-black placeholder-gray-600'
    }`;

  const labelClass = `block text-xs mb-1 ${isDark ? 'text-spotify-subtle' : 'text-gray-600'
    }`;

  async function submitLink(e) {
    e.preventDefault();

    setMsg(null);

    if (!url.trim()) {
      setMsg({
        type: 'err',
        text: 'Nhập link YouTube hoặc URL file nhạc.',
      });

      return;
    }

    setBusy(true);

    try {
      await api('/songs/from-link', {
        method: 'POST',
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          artist: artist.trim() || undefined,
          genre: genre.trim() || undefined,
        }),
      });

      setUrl('');
      setTitle('');
      setArtist('');
      setGenre('');

      onAdded?.();

      setMsg({
        type: 'ok',
        text: 'Đã thêm bài hát từ link.',
      });
    } catch (err) {
      setMsg({
        type: 'err',
        text: err.message,
      });
    } finally {
      setBusy(false);
    }
  }

  async function submitFile(e) {
    e.preventDefault();

    setMsg(null);

    const form = e.currentTarget;

    const input = form.elements.namedItem('audio');

    const file = input?.files?.[0];

    if (!file) {
      setMsg({
        type: 'err',
        text: 'Chọn file nhạc.',
      });

      return;
    }

    setBusy(true);

    try {
      // Upload Cloudinary
      const uploaded = await uploadAudioToCloudinary(file);

      // Save DB
      await api('/songs/upload', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim() || file.name,
          artist: artist.trim() || 'Unknown',
          genre: genre.trim() || '',
          fileUrl: uploaded.url,
        }),
      });

      form.reset();

      setTitle('');
      setArtist('');
      setGenre('');

      onAdded?.();

      setMsg({
        type: 'ok',
        text: 'Đã tải lên thành công.',
      });
    } catch (err) {
      setMsg({
        type: 'err',
        text: err.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={`border rounded-lg p-5 ${variant === 'admin' ? 'max-w-none' : 'max-w-xl'} ${isDark
          ? 'bg-spotify-panel border-white/10'
          : 'bg-gray-100 border-black/10'
        }`}
    >
      <h2 className="text-xl font-semibold mb-1">
        Thêm nhạc
      </h2>

      <p
        className={`text-sm mb-4 ${isDark
            ? 'text-spotify-subtle'
            : 'text-gray-600'
          }`}
      >
        Có thể dán link YouTube hoặc tải file nhạc từ máy.
      </p>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setTab('link');
            setMsg(null);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${tab === 'link'
              ? 'bg-spotify-green text-black'
              : isDark
                ? 'bg-spotify-hover text-spotify-subtle hover:text-white'
                : 'bg-gray-300 text-gray-700 hover:text-black'
            }`}
        >
          Từ link
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('file');
            setMsg(null);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${tab === 'file'
              ? 'bg-spotify-green text-black'
              : isDark
                ? 'bg-spotify-hover text-spotify-subtle hover:text-white'
                : 'bg-gray-300 text-gray-700 hover:text-black'
            }`}
        >
          Từ file
        </button>
      </div>

      {/* MESSAGE */}
      {msg && (
        <p
          className={`text-sm mb-4 ${msg.type === 'err'
              ? 'text-red-400'
              : 'text-spotify-green'
            }`}
        >
          {msg.text}
        </p>
      )}

      {/* LINK FORM */}
      {tab === 'link' ? (
        <form
          onSubmit={submitLink}
          className="space-y-3"
        >
          <div>
            <label className={labelClass}>
              URL
            </label>

            <input
              type="text"
              required
              value={url}
              disabled={busy}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className={inputClass}
            />
          </div>

          <SongMetaFields
            title={title}
            setTitle={setTitle}
            artist={artist}
            setArtist={setArtist}
            genre={genre}
            setGenre={setGenre}
            busy={busy}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold disabled:opacity-50"
          >
            {busy ? 'Đang thêm...' : 'Thêm từ link'}
          </button>
        </form>
      ) : (
        /* FILE FORM */
        <form
          onSubmit={submitFile}
          className="space-y-3"
        >
          <div>
            <label className={labelClass}>
              File nhạc
            </label>

            <input
              name="audio"
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              disabled={busy}
              className={`w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 ${isDark
                  ? 'text-spotify-subtle file:bg-spotify-hover file:text-white'
                  : 'text-gray-600 file:bg-gray-300 file:text-black'
                }`}
            />
          </div>

          <SongMetaFields
            title={title}
            setTitle={setTitle}
            artist={artist}
            setArtist={setArtist}
            genre={genre}
            setGenre={setGenre}
            busy={busy}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold disabled:opacity-50"
          >
            {busy
              ? 'Đang tải lên...'
              : 'Tải lên và thêm'}
          </button>
        </form>
      )}
    </section>
  );
}

function SongMetaFields({
  title,
  setTitle,
  artist,
  setArtist,
  genre,
  setGenre,
  busy,
  inputClass,
  labelClass,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div>
        <label className={labelClass}>
          Tên bài
        </label>

        <input
          type="text"
          value={title}
          disabled={busy}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Nghệ sĩ
        </label>

        <input
          type="text"
          value={artist}
          disabled={busy}
          onChange={(e) => setArtist(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Thể loại
        </label>

        <select
          value={genre}
          disabled={busy}
          onChange={(e) => setGenre(e.target.value)}
          className={inputClass}
        >
          <option value="">
            Chọn thể loại
          </option>

          {VIETNAMESE_MUSIC_GENRES.map((g) => (
            <option
              key={g}
              value={g}
            >
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
