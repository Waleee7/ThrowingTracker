'use client';

import { useState, useRef } from 'react';
import { Session, Profile, SessionType, MediaAttachment, ThrowEntry, LandingPoint } from '@/lib/types';
import { EVENTS, RPE_SCALE, RPE_EMOJI } from '@/lib/constants';
import { toLocalDateKey } from '@/lib/dates';
import { formatDistance, parseDistanceToMeters } from '@/lib/units';
import { storeMedia, deleteMedia } from '@/lib/media-storage';
import { deriveSessionMetrics, countFouls } from '@/lib/throws';
import { windSensitive, windAdjustedMeters } from '@/lib/wind';
import { parseSpokenThrow } from '@/lib/speech';
import { suggestImplementKg } from '@/lib/implements';
import { getEffectiveLevel } from '@/lib/athlete-level';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import SectorMap from './SectorMap';
import ImplementRegistry from './ImplementRegistry';

interface LogTabProps {
  profile: Profile;
  onSave: (session: Session) => void;
  editSession?: Session | null;
  onCancelEdit?: () => void;
}

interface ThrowRow {
  mark: string;
  foul: boolean;
  landing?: LandingPoint; // present when logged by tapping the sector map
  sector?: number; // signed angle from centerline (deg): left negative, right positive
}

// Mirror SectorMap geometry so we can derive a sector angle from a tapped point.
const SECTOR_CX = 175; // CANVAS_WIDTH / 2
const SECTOR_CY = 360; // CIRCLE_Y

export default function LogTab({ profile, onSave, editSession, onCancelEdit }: LogTabProps) {
  const isEditing = !!editSession;
  const today = toLocalDateKey();
  const distanceUnit = profile.distanceUnit ?? 'm';

  // W7 tier UX: rookies get a friendlier, simpler surface (emoji RPE here).
  const isRookie = getEffectiveLevel(profile) === 'rookie';
  // Map a stored numeric RPE to its emoji bucket for highlighting.
  const rpeBucket = (v: number) => RPE_EMOJI.find((r) => v <= r.value)?.value ?? 10;

  // Convert a stored canonical-meters value into the entry string for the chosen unit.
  const markToInput = (meters: number | undefined): string => {
    if (meters === undefined) return '';
    return distanceUnit === 'ft' ? formatDistance(meters, 'ft', { withUnit: false }) : meters.toString();
  };

  const [sessionType, setSessionType] = useState<SessionType>(editSession?.sessionType || 'training');
  const [date, setDate] = useState(editSession?.date || today);
  const [event, setEvent] = useState(editSession?.event || '');
  const [rpe, setRpe] = useState(editSession?.rpe || 5);
  const [throws, setThrows] = useState(editSession?.throws?.toString() || '');
  const [weight, setWeight] = useState(editSession?.implementWeight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState(editSession?.weightUnit || 'kg');
  const [bestMark, setBestMark] = useState(markToInput(editSession?.bestMark));
  const [avgMark, setAvgMark] = useState(markToInput(editSession?.avgMark));
  const [meetName, setMeetName] = useState(editSession?.meetName || '');
  const [placement, setPlacement] = useState(editSession?.placement || '');
  const [notes, setNotes] = useState(editSession?.notes || '');
  const [saving, setSaving] = useState(false);

  const [showRegistry, setShowRegistry] = useState(false);

  // Profile-aware standard implement for the selected event (W6 registry).
  const suggestion = event ? suggestImplementKg(profile, event) : null;
  const suggestionApplied =
    suggestion !== null && weightUnit === 'kg' && parseFloat(weight) === suggestion.kg;

  const [mediaFiles, setMediaFiles] = useState<Array<{ name: string; type: string; url: string; file?: File }>>([]);
  const [keptMedia, setKeptMedia] = useState<MediaAttachment[]>(editSession?.media ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rapid throw-by-throw log (W5/W6). When on, it is the source of truth for
  // throws/best/avg (fouls count as attempts but are excluded from best+avg) and
  // also produces landingZone points (sector map) + per-throw sector + wind.
  const [useDetailed, setUseDetailed] = useState<boolean>((editSession?.throwLog?.length ?? 0) > 0);
  const [throwRows, setThrowRows] = useState<ThrowRow[]>(() => {
    const logs = editSession?.throwLog;
    if (!logs) return [];
    const lz = editSession?.landingZone ?? [];
    return logs.map((t, i) => ({
      mark: t.foul ? '' : markToInput(t.mark),
      foul: t.foul,
      sector: t.sector,
      landing: lz.find((p) => p.throwIndex === i),
    }));
  });
  const [wind, setWind] = useState<string>(() => {
    const w = editSession?.throwLog?.find((t) => typeof t.wind === 'number')?.wind;
    return typeof w === 'number' ? String(w) : '';
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVoiceText = (text: string) => {
    const { foul, value } = parseSpokenThrow(text);
    if (foul) {
      setThrowRows((prev) => [...prev, { mark: '', foul: true }]);
      setErrors((p) => ({ ...p, detailed: '' }));
    } else if (value) {
      setThrowRows((prev) => [...prev, { mark: value, foul: false }]);
      setErrors((p) => ({ ...p, detailed: '' }));
    }
  };
  const voice = useVoiceCapture(handleVoiceText);

  const windNum = parseFloat(wind);
  const hasWind = isFinite(windNum);
  const detailedThrows: ThrowEntry[] = throwRows.map((r) => ({
    mark: r.foul ? 0 : parseDistanceToMeters(r.mark, distanceUnit),
    foul: r.foul,
    sector: r.sector,
    wind: hasWind ? windNum : undefined,
  }));
  const derived = deriveSessionMetrics(detailedThrows);

  const landingPoints: LandingPoint[] = throwRows
    .map((r, i): LandingPoint | null => (r.landing ? { ...r.landing, throwIndex: i } : null))
    .filter((p): p is LandingPoint => p !== null);

  const sectorDepthDefault =
    event === 'javelin' ? 90 : event === 'discus' || event === 'hammer' ? 70 : 25;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!event) newErrors.event = 'Select event';
    if (!weight) newErrors.weight = 'Required';

    if (useDetailed) {
      if (throwRows.length === 0) {
        newErrors.detailed = 'Add at least one throw';
      } else {
        const anyInvalid = throwRows.some((r) => {
          if (r.foul) return false;
          const m = parseDistanceToMeters(r.mark, distanceUnit);
          return !r.mark || !isFinite(m) || m <= 0;
        });
        if (anyInvalid) newErrors.detailed = 'Every non-foul throw needs a valid mark';
        else if (derived.bestMark <= 0) newErrors.detailed = 'Add at least one legal (non-foul) mark';
      }
    } else {
      if (!throws || parseInt(throws) < 1) newErrors.throws = 'Required';
      const bestMeters = parseDistanceToMeters(bestMark, distanceUnit);
      const avgMeters = parseDistanceToMeters(avgMark, distanceUnit);
      if (!bestMark) newErrors.best = 'Required';
      else if (!isFinite(bestMeters) || bestMeters <= 0) newErrors.best = 'Invalid mark';
      if (!avgMark) newErrors.avg = 'Required';
      else if (!isFinite(avgMeters) || avgMeters <= 0) newErrors.avg = 'Invalid mark';
      if (isFinite(bestMeters) && isFinite(avgMeters) && avgMeters > bestMeters) {
        newErrors.avg = 'Cannot exceed best';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    // Small images persist inline as base64; videos + large images go to
    // IndexedDB (localStorage can't hold them) and store only a key on the session.
    const processMedia = async (): Promise<MediaAttachment[]> => {
      const attachments: MediaAttachment[] = [];
      for (const mf of mediaFiles) {
        if (!mf.file) continue;
        const id = Date.now().toString() + Math.random();
        const isSmallImage = mf.file.type.startsWith('image/') && mf.file.size < 2 * 1024 * 1024;
        if (isSmallImage) {
          const dataUrl = await fileToBase64(mf.file);
          attachments.push({ id, name: mf.name, type: mf.type, dataUrl });
        } else {
          const key = `media-${id}`;
          try {
            await storeMedia(key, mf.file);
            attachments.push({ id, name: mf.name, type: mf.type, indexedDbKey: key });
          } catch (err) {
            // Don't record an attachment we couldn't actually persist.
            console.error('Failed to store media:', err);
          }
        }
      }
      return attachments;
    };

    processMedia().then((newMedia) => {
      const media = [...keptMedia, ...newMedia];

      // On edit: clean up IndexedDB blobs whose attachments the user removed.
      if (editSession?.media) {
        const finalKeys = new Set(media.map((m) => m.indexedDbKey).filter(Boolean) as string[]);
        for (const old of editSession.media) {
          if (old.indexedDbKey && !finalKeys.has(old.indexedDbKey)) {
            deleteMedia(old.indexedDbKey).catch(() => {});
          }
        }
      }

      const session: Session = {
        id: editSession?.id || Date.now().toString(),
        date,
        event,
        sessionType,
        rpe,
        throws: useDetailed ? derived.throws : parseInt(throws),
        throwLog: useDetailed ? detailedThrows : undefined,
        landingZone: useDetailed ? (landingPoints.length ? landingPoints : undefined) : editSession?.landingZone,
        implementWeight: parseFloat(weight),
        weightUnit: weightUnit as 'kg' | 'lbs',
        bestMark: useDetailed ? derived.bestMark : parseDistanceToMeters(bestMark, distanceUnit),
        avgMark: useDetailed ? derived.avgMark : parseDistanceToMeters(avgMark, distanceUnit),
        notes,
        meetName: sessionType === 'competition' ? meetName : '',
        placement: sessionType === 'competition' ? placement : '',
        media: media.length > 0 ? media : undefined,
      };

      // Clean up blob URLs
      mediaFiles.forEach((mf) => {
        if (mf.url.startsWith('blob:')) URL.revokeObjectURL(mf.url);
      });

      setTimeout(() => {
        onSave(session);
        setSaving(false);
      }, 300);
    });
  };

  const addMediaFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
    }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  // Drops the reference only; the IndexedDB blob is cleaned up on save (see
  // handleSubmit) so cancelling an edit never loses media.
  const removeKeptMedia = (id: string) => setKeptMedia((prev) => prev.filter((m) => m.id !== id));

  const addManualThrow = () => setThrowRows((prev) => [...prev, { mark: '', foul: false }]);
  const addFoulThrow = () => {
    setThrowRows((prev) => [...prev, { mark: '', foul: true }]);
    setErrors((p) => ({ ...p, detailed: '' }));
  };
  const addLandingThrow = (point: LandingPoint) => {
    const dx = point.x - SECTOR_CX;
    const dy = SECTOR_CY - point.y;
    const sector = Math.round(Math.atan2(dx, dy) * (180 / Math.PI) * 10) / 10;
    setThrowRows((prev) => [...prev, { mark: markToInput(point.distance), foul: false, landing: point, sector }]);
    setErrors((p) => ({ ...p, detailed: '' }));
  };
  const updateThrowRow = (i: number, patch: Partial<ThrowRow>) =>
    setThrowRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeThrowRow = (i: number) => setThrowRows((prev) => prev.filter((_, idx) => idx !== i));

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const removed = prev[index];
      if (removed?.url.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="tab-content" id="tab-log">
      <h2 className="tab-title">{isEditing ? 'Edit Session' : 'Log Session'}</h2>

      {/* Session type toggle */}
      <div className="toggle-group">
        <button
          className={`toggle-button${sessionType === 'training' ? ' active' : ''}`}
          onClick={() => setSessionType('training')}
          type="button"
        >
          Training
        </button>
        <button
          className={`toggle-button${sessionType === 'competition' ? ' active' : ''}`}
          onClick={() => setSessionType('competition')}
          type="button"
        >
          Competition
        </button>
      </div>

      <form id="log-form" className="form" onSubmit={handleSubmit}>
        {/* Date */}
        <div className="form-group">
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Meet name (competition only) */}
        {sessionType === 'competition' && (
          <div className="form-group">
            <label className="label">Meet Name</label>
            <input
              type="text"
              className="input"
              value={meetName}
              onChange={(e) => setMeetName(e.target.value)}
              placeholder="Conference Championships"
            />
          </div>
        )}

        {/* Event */}
        <div className="form-group">
          <label className="label">Event</label>
          <select
            className={`input${errors.event ? ' error' : ''}`}
            value={event}
            onChange={(e) => { setEvent(e.target.value); setErrors((prev) => ({ ...prev, event: '' })); }}
          >
            <option value="">Select an event</option>
            {EVENTS.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
          {errors.event && <span className="error-text">{errors.event}</span>}
        </div>

        {/* RPE — tier-adaptive (W7): rookies get emoji, others get the 1-10 scale */}
        <div className="form-group">
          <label className="label">{isRookie ? 'How hard was it?' : 'RPE (1-10)'}</label>
          {isRookie ? (
            <div className="rpe-emoji-grid">
              {RPE_EMOJI.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`rpe-emoji-button${rpeBucket(rpe) === r.value ? ' active' : ''}`}
                  onClick={() => setRpe(r.value)}
                >
                  <span className="rpe-emoji">{r.emoji}</span>
                  <span className="rpe-emoji-label">{r.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rpe-grid">
              {RPE_SCALE.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`rpe-button${rpe === value ? ' active' : ''}`}
                  onClick={() => setRpe(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="form-group">
          <label className="label">{isRookie ? 'Weight' : 'Implement Weight'}</label>
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              className={`input-small${errors.weight ? ' error' : ''}`}
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setErrors((prev) => ({ ...prev, weight: '' })); }}
              placeholder="7.26"
            />
            <select
              className="select"
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          {errors.weight && <span className="error-text">{errors.weight}</span>}

          {/* Standard implement suggestion + catalog (W6 registry) */}
          <div className="impl-suggest-row">
            {suggestion && !suggestionApplied && (
              <button
                type="button"
                className="impl-suggest-chip"
                onClick={() => {
                  setWeight(suggestion.kg.toString());
                  setWeightUnit('kg');
                  setErrors((prev) => ({ ...prev, weight: '' }));
                }}
              >
                Use {suggestion.kg} kg · {suggestion.label}
              </button>
            )}
            {suggestion && suggestionApplied && (
              <span className="impl-suggest-ok">✓ {suggestion.label} weight</span>
            )}
            <button
              type="button"
              className="impl-toggle"
              onClick={() => setShowRegistry((v) => !v)}
            >
              {showRegistry ? 'Hide' : 'Standard weights'}
            </button>
          </div>
          {showRegistry && (
            <ImplementRegistry
              event={event || undefined}
              highlightGrade={profile.grade}
              highlightSex={profile.sex}
            />
          )}
        </div>

        {/* Detailed throw-log toggle — advanced, hidden for rookies (W7 gating) */}
        {!isRookie && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useDetailed}
                onChange={(e) => {
                  setUseDetailed(e.target.checked);
                  setErrors((prev) => ({ ...prev, detailed: '', throws: '', best: '', avg: '' }));
                }}
              />
              <span>Rapid log — tap, speak, or type each throw</span>
            </label>
          </div>
        )}

        {!useDetailed ? (
          <>
            {/* Throws */}
            <div className="form-group">
              <label className="label">{isRookie ? 'How many throws?' : 'Throws'}</label>
              <input
                type="number"
                className={`input${errors.throws ? ' error' : ''}`}
                value={throws}
                onChange={(e) => { setThrows(e.target.value); setErrors((prev) => ({ ...prev, throws: '' })); }}
                placeholder="20"
                min="1"
              />
              {errors.throws && <span className="error-text">{errors.throws}</span>}
            </div>

            {/* Best & Avg row */}
            <div className="form-row">
              <div className="form-group">
                <label className="label">{isRookie ? 'Best throw' : distanceUnit === 'ft' ? 'Best (ft/in)' : 'Best (m)'}</label>
                <input
                  type={distanceUnit === 'ft' ? 'text' : 'number'}
                  inputMode="decimal"
                  step="0.01"
                  className={`input${errors.best ? ' error' : ''}`}
                  value={bestMark}
                  onChange={(e) => { setBestMark(e.target.value); setErrors((prev) => ({ ...prev, best: '' })); }}
                  placeholder={distanceUnit === 'ft' ? `199' 6"` : '15.50'}
                />
                {errors.best && <span className="error-text">{errors.best}</span>}
              </div>

              <div className="form-group">
                <label className="label">{isRookie ? 'Average throw' : distanceUnit === 'ft' ? 'Avg (ft/in)' : 'Avg (m)'}</label>
                <input
                  type={distanceUnit === 'ft' ? 'text' : 'number'}
                  inputMode="decimal"
                  step="0.01"
                  className={`input${errors.avg ? ' error' : ''}`}
                  value={avgMark}
                  onChange={(e) => { setAvgMark(e.target.value); setErrors((prev) => ({ ...prev, avg: '' })); }}
                  placeholder={distanceUnit === 'ft' ? `185' 0"` : '14.20'}
                />
                {errors.avg && <span className="error-text">{errors.avg}</span>}
              </div>
            </div>
          </>
        ) : (
          /* Rapid throw-by-throw log (W6): sector tap + voice + manual, with wind */
          <div className="form-group">
            <label className="label">Throws</label>

            {windSensitive(event) && (
              <div className="wind-row">
                <span className="wind-label">Wind</span>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  className="input-small wind-input"
                  value={wind}
                  onChange={(e) => setWind(e.target.value)}
                  placeholder="-2.0"
                />
                <span className="wind-hint">m/s · +tail / −head</span>
              </div>
            )}

            <SectorMap
              key={event || 'na'}
              sectorDepth={sectorDepthDefault}
              distanceUnit={distanceUnit}
              points={landingPoints}
              onAddPoint={addLandingThrow}
              hideList
            />
            <p className="sector-hint">Tap the sector to log where a throw lands — distance is read from the tap.</p>

            <div className="rapid-actions">
              {voice.supported && (
                <button
                  type="button"
                  className={`voice-button${voice.listening ? ' listening' : ''}`}
                  onClick={() => (voice.listening ? voice.stop() : voice.start())}
                >
                  {voice.listening ? '● Listening…' : '🎤 Voice'}
                </button>
              )}
              <button type="button" className="secondary-button rapid-manual" onClick={addManualThrow}>
                + Manual
              </button>
              <button type="button" className="foul-add-button" onClick={addFoulThrow}>
                + Foul
              </button>
            </div>

            {throwRows.length > 0 && (
              <div className="throw-rows">
                {throwRows.map((r, i) => (
                  <div className="throw-row" key={i}>
                    <span className="throw-num">{i + 1}</span>
                    <input
                      type={distanceUnit === 'ft' ? 'text' : 'number'}
                      inputMode="decimal"
                      step="0.01"
                      className="input throw-mark-input"
                      value={r.foul ? '' : r.mark}
                      disabled={r.foul}
                      onChange={(e) => { updateThrowRow(i, { mark: e.target.value }); setErrors((p) => ({ ...p, detailed: '' })); }}
                      placeholder={r.foul ? 'Foul' : distanceUnit === 'ft' ? `199' 6"` : '15.50'}
                    />
                    {typeof r.sector === 'number' && !r.foul && (
                      <span className="sector-chip">{r.sector < 0 ? 'L' : 'R'}{Math.abs(Math.round(r.sector))}&deg;</span>
                    )}
                    <button
                      type="button"
                      className={`foul-toggle${r.foul ? ' active' : ''}`}
                      onClick={() => { updateThrowRow(i, { foul: !r.foul }); setErrors((p) => ({ ...p, detailed: '' })); }}
                      title="Mark as foul"
                    >
                      Foul
                    </button>
                    <button type="button" className="remove-throw-button" onClick={() => removeThrowRow(i)} title="Remove throw">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.detailed && <span className="error-text">{errors.detailed}</span>}

            {throwRows.length > 0 && derived.bestMark > 0 && (
              <div className="derived-summary">
                {derived.throws} throws &middot; Best {formatDistance(derived.bestMark, distanceUnit)} &middot; Avg {formatDistance(derived.avgMark, distanceUnit)}
                {countFouls(detailedThrows) > 0 ? ` · ${countFouls(detailedThrows)} foul${countFouls(detailedThrows) > 1 ? 's' : ''}` : ''}
                {windSensitive(event) && hasWind && windNum !== 0 && (
                  <span className="wind-adj"> &middot; still-air est. {formatDistance(windAdjustedMeters(derived.bestMark, windNum, event), distanceUnit)}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Placement (competition only) */}
        {sessionType === 'competition' && (
          <div className="form-group">
            <label className="label">Placement (Optional)</label>
            <input
              type="text"
              className="input"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              placeholder="1st, 3rd, etc."
            />
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label className="label">Notes</label>
          <textarea
            className="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Technical notes..."
            rows={3}
          />
        </div>

        {/* Media */}
        <div className="form-group">
          <label className="label">Media (Photos/Videos)</label>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept="image/*,video/*"
            multiple
            onChange={(e) => addMediaFiles(e.target.files)}
          />
          <button
            type="button"
            className="media-upload-button"
            onClick={() => fileInputRef.current?.click()}
          >
            &#128206; Add Photos/Videos
          </button>
          {keptMedia.length > 0 && (
            <div className="media-grid">
              {keptMedia.map((m) => (
                <div key={m.id} className="media-item">
                  {m.type.startsWith('image/') && m.dataUrl ? (
                    <img src={m.dataUrl} alt={m.name} className="media-thumbnail" />
                  ) : (
                    <div className="video-placeholder">
                      <span className="video-icon">{m.type.startsWith('image/') ? '\u{1F5BC}\u{FE0F}' : '\u{1F3AC}'}</span>
                      <span className="video-name">{m.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="remove-media-button"
                    onClick={() => removeKeptMedia(m.id)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          {mediaFiles.length > 0 && (
            <div className="media-grid">
              {mediaFiles.map((item, index) => (
                <div key={index} className="media-item">
                  {item.type.startsWith('image/') ? (
                    <img src={item.url} alt={item.name} className="media-thumbnail" />
                  ) : (
                    <div className="video-placeholder">
                      <span className="video-icon">&#127909;</span>
                      <span className="video-name">{item.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="remove-media-button"
                    onClick={() => removeMedia(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          {isEditing && onCancelEdit && (
            <button type="button" className="secondary-button" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
          <button type="submit" className={`primary-button${isRookie ? ' big-cta' : ''}`} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Session' : isRookie ? 'Save my session 💪' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
