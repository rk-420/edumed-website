import { useRef, useState } from 'react';
import { MousePointer2, Hand, Plus, Minus } from 'lucide-react';
import BodyHighlighter from 'react-body-highlighter';
import { observationColor } from '../lib/bodySystems.js';

const MIN_SCALE = 1;
const MAX_SCALE = 3;

// react-body-highlighter renders its figure into a fixed 0 0 100 200
// viewBox filled edge-to-edge (no letterboxing), so a 100:200 container
// aspect ratio keeps pin percentages aligned to the visible figure.
const VIEW_W = 100;
const VIEW_H = 200;

export default function BodyModel({ annotations, view, addMode, onPick, onPinClick }) {
  const innerRef = useRef(null);
  const [tool, setTool] = useState('select');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);

  const visible = annotations.filter((a) => (a.body_view || 'front') === view);

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + 0.4).toFixed(2)));
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(MIN_SCALE, +(s - 0.4).toFixed(2));
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });

  const handlePointerDown = (e) => {
    if (tool !== 'pan') return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const { startX, startY, origin } = dragState.current;
    setOffset({ x: origin.x + (e.clientX - startX), y: origin.y + (e.clientY - startY) });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleClick = (e) => {
    if (tool !== 'select' || !addMode || !innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPick(Math.min(98, Math.max(2, x)), Math.min(98, Math.max(2, y)));
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-1.5 shrink-0">
        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} title="Select / pin">
          <MousePointer2 size={16} />
        </ToolButton>
        <ToolButton active={tool === 'pan'} onClick={() => setTool('pan')} title="Pan">
          <Hand size={16} />
        </ToolButton>
        <ToolButton onClick={zoomIn} title="Zoom in">
          <Plus size={16} />
        </ToolButton>
        <ToolButton onClick={zoomOut} title="Zoom out">
          <Minus size={16} />
        </ToolButton>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        className={`relative flex-1 max-w-[320px] mx-auto overflow-hidden rounded-lg ${
          tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : addMode ? 'cursor-crosshair' : ''
        }`}
      >
        <div
          ref={innerRef}
          onClick={handleClick}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
          className="absolute inset-0 transition-transform duration-100 ease-out"
        >
          <BodyHighlighter
            type={view === 'front' ? 'anterior' : 'posterior'}
            data={[]}
            bodyColor="#dde4ec"
            style={{ width: '100%', height: '100%' }}
          />

          {visible.map((a) => {
            const color = observationColor(a.observation_type);
            return (
              <button
                key={a.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick(a);
                }}
                style={{
                  left: `${a.pos_x ?? 50}%`,
                  top: `${a.pos_y ?? 50}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 0 3px ${color}33`
                }}
                className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white hover:scale-125 transition-transform z-10"
                title={a.title}
              />
            );
          })}
        </div>

        {addMode && tool === 'select' && (
          <div className="absolute inset-0 border-2 border-dashed border-brand-400 rounded-lg pointer-events-none" />
        )}
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
        active ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}
