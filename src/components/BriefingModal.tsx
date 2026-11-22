import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Send, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { OmavLockup } from './OmavMark';
import { fill, useContent } from '../content/content';

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
  // Which page the visitor was on, stored with the enquiry
  page?: string;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export const BriefingModal: React.FC<BriefingModalProps> = ({ isOpen, onClose, page = '' }) => {
  const t = useContent().briefingForm;
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [mandate, setMandate] = useState(t.fields.mandates[0] ?? '');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: hidden from people
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const startedAt = useRef(0);
  const submitted = status === 'sent';

  // Each opening starts the clock the server uses to spot bots
  useEffect(() => {
    if (isOpen) startedAt.current = Date.now();
  }, [isOpen]);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // The phone's Back button closes the dialog rather than leaving the page
  useEffect(() => {
    if (!isOpen) return;
    let popped = false;
    window.history.pushState({ omavModal: true }, '');
    const onPop = () => {
      popped = true;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!popped && window.history.state?.omavModal) window.history.back();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, institution, email, mandate, message, page, website, startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
      } else {
        // Field problems (422) carry a specific message; anything else gets the editable fallback
        setError(res.status === 422 && data.error ? data.error : t.actions.error);
        setStatus('error');
      }
    } catch {
      setError(t.actions.error);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setError('');
    setName('');
    setInstitution('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.header.title}
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* On phones the close control stays pinned to the screen while the form scrolls */}
      <button
        type="button"
        onClick={onClose}
        className="sm:hidden fixed top-3 right-3 z-10 inline-flex items-center gap-1.5 h-10 pl-3 pr-3.5 rounded-full bg-[#0B1018]/90 text-[13px] text-[#E9EDF3] shadow-[inset_0_0_0_1px_rgb(220_228_238/0.18)] backdrop-blur-md cursor-pointer"
        aria-label="Close dialog"
      >
        <X size={16} aria-hidden="true" /> Close
      </button>
      <div className="min-h-full flex items-start sm:items-center justify-center px-3 pt-16 pb-6 sm:p-6">
      <div
        className="relative w-full max-w-xl bg-[#080B12] border border-[#DCE4EE]/14 rounded-lg shadow-2xl p-6 sm:p-8 text-[#E9EDF3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="hidden sm:block absolute top-5 right-5 p-2 text-[#9AA4B2] hover:text-white rounded-[3px] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#8CC8D8]/10 border border-[#8CC8D8]/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={30} className="text-[#8CC8D8]" />
            </div>
            <h3 className="text-2xl font-medium text-white tracking-tight">
              {t.success.title}
            </h3>
            <p className="mt-3 text-sm text-[#AEB7C3] max-w-md leading-relaxed">
              {fill(t.success.body, { name: name.trim(), mandate })}
            </p>
            <button
              onClick={handleReset}
              className="mt-8 px-6 py-2.5 bg-[#E9EDF3] text-[#05070B] text-xs uppercase tracking-wider font-medium rounded-[3px] hover:bg-white transition-colors cursor-pointer"
            >
              {t.success.button}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <OmavLockup size="sm" />
              <div>
                <span className="font-jost text-xs tracking-[0.24em] font-medium text-[#8CC8D8] uppercase">
                  {t.header.eyebrow}
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-[#F2F5F9] tracking-tight">
                  {t.header.title}
                </h3>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              {t.header.intro}
            </p>

            <form onSubmit={handleSubmit} className="relative mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                    {t.fields.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fields.namePlaceholder}
                    autoComplete="name"
                    maxLength={120}
                    className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                    {t.fields.institutionLabel}
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder={t.fields.institutionPlaceholder}
                    autoComplete="organization"
                    maxLength={160}
                    className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                  {t.fields.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.fields.emailPlaceholder}
                  autoComplete="email"
                  maxLength={200}
                  className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                  {t.fields.mandateLabel}
                </label>
                <select
                  value={mandate}
                  onChange={(e) => setMandate(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8CC8D8] transition-colors cursor-pointer"
                >
                  {t.fields.mandates.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                  {t.fields.messageLabel}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.fields.messagePlaceholder}
                  maxLength={4000}
                  className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors resize-none"
                />
              </div>

              {/* Spam trap: off-screen and skipped by keyboard and screen readers.
                  People leave it empty; bots that fill every field don't. */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>

              {status === 'error' && error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-[3px] border border-[#E7A27A]/30 bg-[#E7A27A]/[0.07] px-3.5 py-3 text-[13px] leading-relaxed text-[#F2C7AE]"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8C96A6] font-mono">
                  <Shield size={13} className="text-[#8CC8D8]" />
                  <span>{t.actions.privacyNote}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:hidden flex-1 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[#E9EDF3] rounded-[3px] shadow-[inset_0_0_0_1px_rgb(220_228_238/0.18)] cursor-pointer"
                  >
                    {t.actions.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    aria-busy={status === 'sending'}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#E9EDF3] text-[#05070B] text-xs font-medium uppercase tracking-wider rounded-[3px] hover:bg-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                  >
                    <span>{status === 'sending' ? t.actions.sending : t.actions.submit}</span>
                    {status === 'sending' ? (
                      <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Send size={13} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
