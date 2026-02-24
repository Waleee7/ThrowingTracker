'use client';

import { useState, useRef } from 'react';
import { Profile } from '@/lib/types';
import { EVENTS, HEIGHT_UNITS, WEIGHT_UNITS } from '@/lib/constants';
import { exportToJSON, exportToCSV, importFromJSON } from '@/lib/export';

interface ProfileTabProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onDataImported: () => void;
}

export default function ProfileTab({ profile, onSave, onDataImported }: ProfileTabProps) {
  const [name, setName] = useState(profile.name);
  const [heightValue, setHeightValue] = useState(profile.height.value);
  const [heightUnit, setHeightUnit] = useState(profile.height.unit);
  const [heightFeet, setHeightFeet] = useState(profile.height.feet || '');
  const [heightInches, setHeightInches] = useState(profile.height.inches || '');
  const [weightValue, setWeightValue] = useState(profile.weight.value);
  const [weightUnit, setWeightUnit] = useState(profile.weight.unit);
  const [sex, setSex] = useState(profile.sex);
  const [events, setEvents] = useState<string[]>(profile.events);
  const [notes, setNotes] = useState(profile.notes);
  const [saveMsg, setSaveMsg] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const newProfile: Profile = {
      name,
      height: {
        value: heightUnit === 'cm' ? heightValue : '',
        unit: heightUnit,
        feet: heightUnit === 'ft/in' ? heightFeet : '',
        inches: heightUnit === 'ft/in' ? heightInches : '',
      },
      weight: { value: weightValue, unit: weightUnit },
      sex,
      events,
      notes,
    };
    onSave(newProfile);
    setSaveMsg('\u2713 Saved');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const toggleEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const handleHeightUnitChange = (newUnit: string) => {
    setHeightUnit(newUnit as 'cm' | 'ft/in');
    setHeightValue('');
    setHeightFeet('');
    setHeightInches('');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importFromJSON(content, 'merge');
      if (result.success) {
        setImportMsg(`Imported ${result.sessionsImported} new sessions`);
        onDataImported();
      } else {
        setImportMsg(`Error: ${result.error}`);
      }
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="tab-content" id="tab-profile">
      <h2 className="tab-title">Profile</h2>
      <div className="form">
        {/* Name */}
        <div className="form-group">
          <label className="label">Name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Height & Weight Row */}
        <div className="form-row">
          <div className="form-group">
            <label className="label">Height</label>
            <div className="input-group">
              {heightUnit === 'cm' ? (
                <input
                  type="number"
                  className="input-small"
                  value={heightValue}
                  onChange={(e) => setHeightValue(e.target.value)}
                  placeholder="180"
                />
              ) : (
                <div className="feet-inches">
                  <input
                    type="number"
                    className="input-tiny"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder="5"
                  />
                  <span className="unit-text">ft</span>
                  <input
                    type="number"
                    className="input-tiny"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="11"
                  />
                  <span className="unit-text">in</span>
                </div>
              )}
              <select
                className="select"
                value={heightUnit}
                onChange={(e) => handleHeightUnitChange(e.target.value)}
              >
                {HEIGHT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Weight</label>
            <div className="input-group">
              <input
                type="number"
                className="input-small"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                placeholder={weightUnit === 'kg' ? '75' : '165'}
              />
              <select
                className="select"
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
              >
                {WEIGHT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sex */}
        <div className="form-group">
          <label className="label">Sex</label>
          <div className="radio-group">
            {(['M', 'F'] as const).map((s) => (
              <label key={s} className="radio-label">
                <input
                  type="radio"
                  name="sex"
                  value={s}
                  checked={sex === s}
                  onChange={() => setSex(s)}
                />
                <span>{s === 'M' ? 'Male' : 'Female'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="form-group">
          <label className="label">Events</label>
          <div className="event-grid">
            {EVENTS.map((event) => (
              <button
                key={event.id}
                type="button"
                className={`event-button${events.includes(event.id) ? ' active' : ''}`}
                onClick={() => toggleEvent(event.id)}
              >
                <div
                  className="event-icon"
                  dangerouslySetInnerHTML={{ __html: event.svg }}
                />
                <span className="event-name">{event.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="label">Notes</label>
          <textarea
            className="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Goals, injuries, training notes..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <button className="primary-button" onClick={handleSave}>
          {saveMsg || 'Save Profile'}
        </button>

        {/* Data Management */}
        <div className="data-section">
          <h3 className="section-title">Data Management</h3>
          <div className="data-buttons">
            <button className="secondary-button" onClick={exportToJSON}>
              Export JSON
            </button>
            <button className="secondary-button" onClick={exportToCSV}>
              Export CSV
            </button>
            <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </div>
          {importMsg && <p className="import-msg">{importMsg}</p>}
        </div>
      </div>
    </div>
  );
}
