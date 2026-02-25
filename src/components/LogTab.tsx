'use client';

import { useState, useRef } from 'react';
import { Session, Profile, SessionType, MediaAttachment } from '@/lib/types';
import { EVENTS, RPE_SCALE } from '@/lib/constants';

interface LogTabProps {
  profile: Profile;
  onSave: (session: Session) => void;
  editSession?: Session | null;
  onCancelEdit?: () => void;
}

export default function LogTab({ profile, onSave, editSession, onCancelEdit }: LogTabProps) {
  const isEditing = !!editSession;
  const today = new Date().toISOString().split('T')[0];

  const [sessionType, setSessionType] = useState<SessionType>(editSession?.sessionType || 'training');
  const [date, setDate] = useState(editSession?.date || today);
  const [event, setEvent] = useState(editSession?.event || '');
  const [rpe, setRpe] = useState(editSession?.rpe || 5);
  const [throws, setThrows] = useState(editSession?.throws?.toString() || '');
  const [weight, setWeight] = useState(editSession?.implementWeight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState(editSession?.weightUnit || 'kg');
  const [bestMark, setBestMark] = useState(editSession?.bestMark?.toString() || '');
  const [avgMark, setAvgMark] = useState(editSession?.avgMark?.toString() || '');
  const [meetName, setMeetName] = useState(editSession?.meetName || '');
  const [placement, setPlacement] = useState(editSession?.placement || '');
  const [notes, setNotes] = useState(editSession?.notes || '');
  const [saving, setSaving] = useState(false);

  const [mediaFiles, setMediaFiles] = useState<Array<{ name: string; type: string; url: string; file?: File }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!event) newErrors.event = 'Select event';
    if (!throws || parseInt(throws) < 1) newErrors.throws = 'Required';
    if (!weight) newErrors.weight = 'Required';
    if (!bestMark) newErrors.best = 'Required';
    if (!avgMark) newErrors.avg = 'Required';
    if (bestMark && avgMark && parseFloat(avgMark) > parseFloat(bestMark)) {
      newErrors.avg = 'Cannot exceed best';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    // Convert media files to base64 for persistence
    const processMedia = async (): Promise<MediaAttachment[]> => {
      const attachments: MediaAttachment[] = [];
      for (const mf of mediaFiles) {
        if (mf.file && mf.file.type.startsWith('image/') && mf.file.size < 2 * 1024 * 1024) {
          const dataUrl = await fileToBase64(mf.file);
          attachments.push({ id: Date.now().toString() + Math.random(), name: mf.name, type: mf.type, dataUrl });
        } else {
          attachments.push({ id: Date.now().toString() + Math.random(), name: mf.name, type: mf.type });
        }
      }
      return attachments;
    };

    processMedia().then((media) => {
      const session: Session = {
        id: editSession?.id || Date.now().toString(),
        date,
        event,
        sessionType,
        rpe,
        throws: parseInt(throws),
        implementWeight: parseFloat(weight),
        weightUnit: weightUnit as 'kg' | 'lbs',
        bestMark: parseFloat(bestMark),
        avgMark: parseFloat(avgMark),
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

        {/* RPE */}
        <div className="form-group">
          <label className="label">RPE (1-10)</label>
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
        </div>

        {/* Throws & Weight row */}
        <div className="form-row">
          <div className="form-group">
            <label className="label">Throws</label>
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

          <div className="form-group">
            <label className="label">Weight</label>
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
          </div>
        </div>

        {/* Best & Avg row */}
        <div className="form-row">
          <div className="form-group">
            <label className="label">Best (m)</label>
            <input
              type="number"
              step="0.01"
              className={`input${errors.best ? ' error' : ''}`}
              value={bestMark}
              onChange={(e) => { setBestMark(e.target.value); setErrors((prev) => ({ ...prev, best: '' })); }}
              placeholder="15.50"
            />
            {errors.best && <span className="error-text">{errors.best}</span>}
          </div>

          <div className="form-group">
            <label className="label">Avg (m)</label>
            <input
              type="number"
              step="0.01"
              className={`input${errors.avg ? ' error' : ''}`}
              value={avgMark}
              onChange={(e) => { setAvgMark(e.target.value); setErrors((prev) => ({ ...prev, avg: '' })); }}
              placeholder="14.20"
            />
            {errors.avg && <span className="error-text">{errors.avg}</span>}
          </div>
        </div>

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
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Session' : 'Save Session'}
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
