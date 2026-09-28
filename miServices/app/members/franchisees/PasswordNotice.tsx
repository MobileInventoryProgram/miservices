'use client';

import { useState } from 'react';
import { FiCheck, FiCopy, FiX } from 'react-icons/fi';

/** A temporary password to pass on, shown once */
export default function PasswordNotice({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Members Area login\nEmail: ${email}\nTemporary password: ${password}`);
      setCopied(true);
    } catch {
      // Copy blocked: the details are on screen to copy by hand
    }
  };
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4" role="status">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-gray-800">
          <p className="font-semibold text-green-800">Login ready: pass these details on</p>
          <p className="mt-1">
            Email: <strong>{email}</strong>
          </p>
          <p>
            Temporary password: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-base">{password}</code>
          </p>
          <p className="mt-1 text-xs text-gray-600">This is the only time the password is shown. If it&apos;s lost, use Reset password.</p>
        </div>
        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={copy} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors mt-3 bg-white text-green-800 hover:bg-green-100`}>
        {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy login details'}
      </button>
    </div>
  );
}

