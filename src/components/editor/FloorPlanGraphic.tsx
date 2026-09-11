import type { FloorPlanRoomId, FloorPlanView } from '../../types'

function isHidden(hiddenRooms: FloorPlanRoomId[] | undefined, id: FloorPlanRoomId) {
  return hiddenRooms?.includes(id) ?? false
}

export function FloorPlanGraphic({
  className = '',
  hiddenRooms,
}: {
  className?: string
  hiddenRooms?: FloorPlanRoomId[]
}) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Floor plan"
    >
      <rect width="640" height="400" fill="#f7f8fa" />
      <rect x="24" y="24" width="592" height="352" fill="white" stroke="#111" strokeWidth="3" />
      {!isHidden(hiddenRooms, 'living') && (
        <g>
          <rect x="24" y="24" width="220" height="160" fill="#eef6ff" stroke="#111" strokeWidth="2" />
          <text x="134" y="110" textAnchor="middle" fontSize="13" fill="#6b7280" fontFamily="Inter, sans-serif">
            Living
          </text>
        </g>
      )}
      {!isHidden(hiddenRooms, 'kitchen') && (
        <g>
          <rect x="244" y="24" width="180" height="160" fill="#f3f4f6" stroke="#111" strokeWidth="2" />
          <text x="334" y="110" textAnchor="middle" fontSize="13" fill="#6b7280" fontFamily="Inter, sans-serif">
            Kitchen
          </text>
        </g>
      )}
      {!isHidden(hiddenRooms, 'bedroom') && (
        <g>
          <rect x="424" y="24" width="192" height="200" fill="#f0fdf4" stroke="#111" strokeWidth="2" />
          <rect x="500" y="24" width="14" height="40" fill="#fff" stroke="#111" strokeWidth="2" />
          <text x="520" y="130" textAnchor="middle" fontSize="13" fill="#6b7280" fontFamily="Inter, sans-serif">
            Bedroom
          </text>
        </g>
      )}
      {!isHidden(hiddenRooms, 'garden') && (
        <g>
          <rect x="24" y="184" width="400" height="192" fill="#fff7ed" stroke="#111" strokeWidth="2" />
          <rect x="200" y="330" width="48" height="14" fill="#fff" stroke="#111" strokeWidth="2" />
          <text x="224" y="284" textAnchor="middle" fontSize="13" fill="#6b7280" fontFamily="Inter, sans-serif">
            Garden terrace
          </text>
        </g>
      )}
      {!isHidden(hiddenRooms, 'bath') && (
        <g>
          <rect x="424" y="224" width="192" height="152" fill="#faf5ff" stroke="#111" strokeWidth="2" />
          <text x="520" y="308" textAnchor="middle" fontSize="13" fill="#6b7280" fontFamily="Inter, sans-serif">
            Bath
          </text>
        </g>
      )}
    </svg>
  )
}

function iso(x: number, y: number, z = 0) {
  return {
    x: 328 + (x - y) * 0.82,
    y: 86 + (x + y) * 0.42 - z,
  }
}

function points(list: { x: number; y: number }[]) {
  return list.map((point) => `${point.x},${point.y}`).join(' ')
}

function IsoRoom({
  x,
  y,
  w,
  d,
  h,
  top,
  side,
  label,
}: {
  x: number
  y: number
  w: number
  d: number
  h: number
  top: string
  side: string
  label: string
}) {
  const b = iso(x + w, y, 0)
  const c = iso(x + w, y + d, 0)
  const e = iso(x, y + d, 0)
  const a2 = iso(x, y, h)
  const b2 = iso(x + w, y, h)
  const c2 = iso(x + w, y + d, h)
  const e2 = iso(x, y + d, h)
  const mid = iso(x + w / 2, y + d / 2, h)

  return (
    <g>
      <polygon points={points([e, c, c2, e2])} fill={side} stroke="#111" strokeWidth="1.4" />
      <polygon points={points([c, b, b2, c2])} fill={top} stroke="#111" strokeWidth="1.4" />
      <polygon points={points([a2, b2, c2, e2])} fill={top} stroke="#111" strokeWidth="1.6" />
      <text
        x={mid.x}
        y={mid.y + 4}
        textAnchor="middle"
        fontSize="11"
        fill="#4b5563"
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

export function FloorPlan3DGraphic({
  className = '',
  hiddenRooms,
}: {
  className?: string
  hiddenRooms?: FloorPlanRoomId[]
}) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="3D floor plan"
    >
      <defs>
        <linearGradient id="plan-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbe7f4" />
          <stop offset="100%" stopColor="#f3f5f8" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#plan-sky)" />
      <ellipse cx="328" cy="348" rx="210" ry="18" fill="#11111112" />
      {!isHidden(hiddenRooms, 'living') && (
        <IsoRoom x={0} y={0} w={92} d={68} h={46} top="#dbeafe" side="#bfdbfe" label="Living" />
      )}
      {!isHidden(hiddenRooms, 'kitchen') && (
        <IsoRoom x={92} y={0} w={76} d={68} h={46} top="#e5e7eb" side="#d1d5db" label="Kitchen" />
      )}
      {!isHidden(hiddenRooms, 'bedroom') && (
        <IsoRoom x={168} y={0} w={80} d={84} h={50} top="#bbf7d0" side="#86efac" label="Bedroom" />
      )}
      {!isHidden(hiddenRooms, 'bath') && (
        <IsoRoom x={168} y={84} w={80} d={62} h={40} top="#e9d5ff" side="#d8b4fe" label="Bath" />
      )}
      {!isHidden(hiddenRooms, 'garden') && (
        <IsoRoom x={0} y={68} w={168} d={78} h={10} top="#fed7aa" side="#fdba74" label="Garden" />
      )}
    </svg>
  )
}

export function FloorPlanViewToggle({
  mode,
  onChange,
}: {
  mode: FloorPlanView
  onChange: (view: FloorPlanView) => void
}) {
  return (
    <div
      className="flex rounded-full bg-white p-0.5 shadow-sm ring-1 ring-black/[0.08]"
      onClick={(event) => event.stopPropagation()}
    >
      {(['2d', '3d'] as FloorPlanView[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
            mode === item ? 'bg-ink text-white' : 'text-muted hover:text-ink'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export function FloorPlanViewer({
  uploaded,
  url,
  mode = '2d',
  hiddenRooms,
  heightClass = 'h-[280px]',
}: {
  uploaded?: boolean
  url?: string
  mode?: FloorPlanView
  hiddenRooms?: FloorPlanRoomId[]
  heightClass?: string
}) {
  return (
    <div className={`overflow-hidden bg-canvas ${heightClass}`}>
      {mode === '2d' ? (
        uploaded && url ? (
          <img src={url} alt="Floor plan" className="h-full w-full object-contain" />
        ) : (
          <FloorPlanGraphic hiddenRooms={hiddenRooms} />
        )
      ) : uploaded && url ? (
        <div className="relative h-full w-full bg-gradient-to-b from-[#dbe7f4] to-[#f3f5f8]">
          <svg viewBox="0 0 640 400" className="h-full w-full" aria-label="3D floor plan">
            <g transform="translate(320 70) scale(1 0.58) rotate(-28)">
              <image
                href={url}
                x={-210}
                y={-130}
                width={420}
                height={280}
                preserveAspectRatio="xMidYMid slice"
              />
              <rect x={-210} y={-130} width={420} height={280} fill="none" stroke="#111" strokeWidth="3" />
            </g>
          </svg>
        </div>
      ) : (
        <FloorPlan3DGraphic hiddenRooms={hiddenRooms} />
      )}
    </div>
  )
}
