import React from 'react';
import { DiagramFlow } from '../types';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface DiagramRendererProps {
  diagram: DiagramFlow;
  penColorClass: string;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  diagram,
  penColorClass,
}) => {
  return (
    <div className="my-3 p-3.5 rounded-lg border-2 border-dashed border-stone-400/70 bg-white/70 shadow-sm">
      {/* Title */}
      {diagram.title && (
        <div className="flex items-center justify-between border-b border-dashed border-stone-300 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-300">
              HANDWRITTEN DIAGRAM
            </span>
            <span className="font-bold text-sm tracking-wide text-stone-800">
              {diagram.title}
            </span>
          </div>
          {diagram.subtitle && (
            <span className="text-xs text-stone-500 italic">
              {diagram.subtitle}
            </span>
          )}
        </div>
      )}

      {/* Steps Flow (Horizontal Sequence) */}
      {diagram.steps && diagram.steps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
          {(Array.isArray(diagram.steps) ? diagram.steps : []).map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`p-2.5 rounded-md border-2 border-stone-800/80 bg-stone-50/90 shadow-sm relative text-center transition-transform hover:-translate-y-0.5 ${
                  step.color === 'green' ? 'bg-emerald-50/90 border-emerald-700' :
                  step.color === 'blue' ? 'bg-sky-50/90 border-sky-700' :
                  step.color === 'purple' ? 'bg-purple-50/90 border-purple-700' :
                  step.color === 'cyan' ? 'bg-cyan-50/90 border-cyan-700' :
                  'bg-amber-50/90 border-amber-700'
                }`}
              >
                {/* Step badge */}
                <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-stone-800 text-white rounded text-[10px] font-bold">
                  Step {step.step}
                </span>

                <div className="text-xl mb-0.5">{step.icon || '📦'}</div>
                <div className="font-bold text-xs leading-tight text-stone-900">
                  {step.title}
                </div>
                {step.desc && (
                  <div className="text-[11px] text-stone-600 mt-1 leading-snug">
                    {step.desc}
                  </div>
                )}
              </div>

              {/* Connecting arrow: down arrow on mobile, right arrow on desktop */}
              {idx < (diagram.steps?.length || 0) - 1 && (
                <div className="flex lg:hidden items-center justify-center my-1 text-stone-400">
                  <ArrowDown className="w-3.5 h-3.5 text-stone-500 animate-pulse" />
                </div>
              )}
              {idx < (diagram.steps?.length || 0) - 1 && (
                <div className="hidden lg:flex items-center justify-center -mx-1 text-stone-500">
                  <ArrowRight className="w-4 h-4 text-stone-600 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Cloud Services Layers (IaaS / PaaS / SaaS) */}
      {diagram.layers && diagram.layers.length > 0 && (
        <div className="mt-3.5 pt-3 border-t-2 border-dotted border-stone-300">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-stone-600 mb-2">
            ━━━ Service & Architecture Layers ━━━
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(Array.isArray(diagram.layers) ? diagram.layers : []).map((layer, lIdx) => (
              <div
                key={lIdx}
                className="p-2 rounded border border-stone-400 bg-white/90 text-center shadow-xs"
              >
                <div className="font-bold text-xs text-blue-900 border-b border-stone-200 pb-1 mb-1.5 bg-blue-50/60 rounded-xs">
                  {layer.name}
                </div>
                <ul className="text-[11px] text-stone-700 space-y-0.5 text-left pl-2">
                  {(Array.isArray(layer.items) ? layer.items : []).map((item, iIdx) => (
                    <li key={iIdx} className="list-disc list-inside">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
