import React, { useState } from 'react';
import { X, Check, FileUp } from 'lucide-react';

interface BidCheckModalProps {
  open: boolean;
  initialMode?: 'Upload' | 'Chat' | 'Report';
  onClose: () => void;
}

export function BidCheckModal({ open, initialMode = 'Upload', onClose }: BidCheckModalProps) {
  const [tenderRef, setTenderRef] = useState('');
  const [email, setEmail] = useState('');
  const [fileName, setFileName] = useState('');
  const [checkFocus, setCheckFocus] = useState<string>(
    initialMode === 'Report'
      ? 'Full Risk & Clause Report'
      : initialMode === 'Chat'
        ? 'Interactive Tender Q&A'
        : 'Compliance & Eligibility Audit'
  );
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderRef.trim()) {
      setError('Please enter a tender reference or project title.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bid-modal-title"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#121016]/95 border border-white/15 p-6 sm:p-8 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Close bid check dialog"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/75 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E0A458] text-[#1A1206]">
              <Check className="h-6 w-6" />
            </div>
            <h2 id="bid-modal-title" className="text-xl font-semibold tracking-tight">
              Bid Audit Queued
            </h2>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Tender <span className="text-white font-medium">{tenderRef.trim()}</span>
              {fileName ? ` (${fileName})` : ''} is queued for {checkFocus}. Your report will be
              dispatched to <span className="text-white">{email.trim()}</span>.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-6 h-11 px-7 rounded-full bg-[#E0A458] hover:bg-[#EBB46B] text-[#1A1206] text-sm font-semibold transition-colors cursor-pointer"
            >
              Back to TenderKavach
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-light tracking-[0.2em] uppercase text-[#E0A458]">
              TenderKavach Audit
            </p>
            <h2 id="bid-modal-title" className="mt-1.5 text-2xl font-semibold tracking-tight">
              Check Your Bid Readiness
            </h2>
            <p className="mt-1.5 text-sm text-white/75">
              Screen technical clauses, EMD mandates, and disqualification triggers before submission.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="tk-ref" className="block text-xs text-white/75 mb-1.5">
                  Tender ID or Department Name
                </label>
                <input
                  id="tk-ref"
                  type="text"
                  value={tenderRef}
                  onChange={(e) => setTenderRef(e.target.value)}
                  placeholder="GCC/SWD/2026-0418 or Greater Chennai Corp"
                  className="w-full h-11 rounded-xl bg-white/8 border border-white/15 px-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#E0A458]"
                />
              </div>

              <div>
                <label htmlFor="tk-email" className="block text-xs text-white/75 mb-1.5">
                  Work Email
                </label>
                <input
                  id="tk-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bids@company.in"
                  className="w-full h-11 rounded-xl bg-white/8 border border-white/15 px-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#E0A458]"
                />
              </div>

              <div>
                <label htmlFor="tk-focus" className="block text-xs text-white/75 mb-1.5">
                  Verification Mode
                </label>
                <select
                  id="tk-focus"
                  value={checkFocus}
                  onChange={(e) => setCheckFocus(e.target.value)}
                  className="w-full h-11 rounded-xl bg-[#18151d] border border-white/15 px-3.5 text-sm text-white focus:outline-none focus:border-[#E0A458]"
                >
                  <option value="Compliance & Eligibility Audit">Compliance &amp; Eligibility Audit</option>
                  <option value="Full Risk & Clause Report">Full Risk &amp; Clause Report</option>
                  <option value="Interactive Tender Q&A">Interactive Tender Q&amp;A</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tk-file"
                  className="flex items-center justify-between w-full h-11 rounded-xl bg-white/6 border border-dashed border-white/20 px-3.5 text-xs text-white/80 hover:border-[#E0A458]/70 transition-colors cursor-pointer"
                >
                  <span className="truncate pr-2">
                    {fileName || 'Attach NIT / Bid PDF (optional)'}
                  </span>
                  <FileUp className="h-4 w-4 shrink-0 text-[#E0A458]" />
                </label>
                <input
                  id="tk-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </div>

              {error && (
                <p className="text-xs text-[#E0A458]" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-[#E0A458] hover:bg-[#EBB46B] text-[#1A1206] text-sm font-semibold transition-all hover:-translate-y-px cursor-pointer"
              >
                Check my bid
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
