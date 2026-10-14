import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Instagram, X, Check, Copy, ExternalLink, Smartphone } from 'lucide-react';

interface InstagramQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  instagramUrl?: string;
}

export const InstagramQRModal: React.FC<InstagramQRModalProps> = ({
  isOpen,
  onClose,
  instagramUrl = 'https://www.instagram.com/decoelectri/',
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instagramUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const modalContent = (
    <div
      id="instagram-qr-modal-backdrop"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="instagram-qr-modal-card"
        className="relative w-full max-w-sm my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-center max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

        {/* High-visibility Close Button */}
        <button
          id="close-instagram-qr-modal"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de QR"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all shadow-sm focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Instagram Badge */}
        <div className="flex flex-col items-center mt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/20 mb-2.5">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-200 dark:border-pink-800/80">
            Instagram Oficial
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
            @decoelectri
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
            Apunta la cámara de tu teléfono para seguirnos al instante.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="mt-4 mb-4 flex justify-center">
          <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 inline-block relative group">
            <QRCodeSVG
              value={instagramUrl}
              size={160}
              level="H"
              bgColor="#ffffff"
              fgColor="#0f172a"
              marginSize={1}
            />
            {/* Center Logo Accent */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm border border-slate-200 flex items-center justify-center">
                <div className="w-full h-full rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt with phone icon */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 mb-4">
          <Smartphone className="w-3.5 h-3.5 text-sky-500" />
          <span>Compatible con iPhone y Android</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            id="copy-instagram-link-btn"
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>

          <a
            id="open-instagram-link-btn"
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-sm hover:shadow-md transition-all"
          >
            <span>Ir a Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
