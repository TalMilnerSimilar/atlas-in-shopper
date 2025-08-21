// src/components/ChannelOpportunityBox.tsx
import React from 'react';

export function Chip({ children }:{children: React.ReactNode}) {
  return <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 mr-2">{children}</span>;
}

export default function ChannelOpportunityBox({
  title, text, tags
}: { title: string; text: string; tags: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-slate-700">{text}</div>
      {tags?.length ? (
        <div className="mt-2">
          {tags.map((t,i)=> <Chip key={i}>{t}</Chip>)}
        </div>
      ) : null}
    </div>
  );
}


