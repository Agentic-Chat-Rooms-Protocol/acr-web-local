import React from 'react';
import { FileText, Image as ImageIcon, Download } from 'lucide-react';
import type { FileAttachment } from '../../types/protocol';

interface FileAttachmentCardProps {
  attachment: FileAttachment;
}

export const FileAttachmentCard: React.FC<FileAttachmentCardProps> = ({ attachment }) => {
  const isImage = attachment.mime_type.startsWith('image/');
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileUrl = `http://localhost:20443${attachment.url}`;

  return (
    <div className="mt-2 rounded-xl border border-white/[0.1] bg-black/40 p-2.5 max-w-sm space-y-2 backdrop-blur-md">
      {/* Image Preview if applicable */}
      {isImage && (
        <div className="rounded-lg overflow-hidden border border-white/[0.08] max-h-48 bg-black/60">
          <img
            src={fileUrl}
            alt={attachment.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* File Info & Download Action */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white truncate block" title={attachment.filename}>
              {attachment.filename}
            </span>
            <span className="text-[10px] font-mono-code text-slate-400">
              {formatSize(attachment.size)} • {attachment.mime_type.split('/')[1]?.toUpperCase() || 'BIN'}
            </span>
          </div>
        </div>

        <a
          href={fileUrl}
          download={attachment.filename}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-xs font-mono-code text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer"
          title="Download file attachment"
        >
          <Download className="h-3 w-3 text-cyan-400" />
          <span className="hidden sm:inline text-[10px]">Get</span>
        </a>
      </div>
    </div>
  );
};
