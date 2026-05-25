import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
    src: string
    onConfirm: (cropped: string) => void
    onCancel: () => void
}

const SIZE = 240

export default function AvatarCropper({ src, onConfirm, onCancel }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const dragging = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })
    const baseZoom = useRef(1)
    const minZoom = 0.9

    // clamp offset so image always covers the canvas
    const clampOffset = useCallback((ox: number, oy: number, z: number) => {
        const img = imgRef.current
        if (!img) return { x: ox, y: oy }
        const w = img.naturalWidth * baseZoom.current * z
        const h = img.naturalHeight * baseZoom.current * z
        // max offset = half the overflow on each side
        const maxX = Math.max(0, (w - SIZE) / 2)
        const maxY = Math.max(0, (h - SIZE) / 2)
        return {
            x: Math.max(-maxX, Math.min(maxX, ox)),
            y: Math.max(-maxY, Math.min(maxY, oy)),
        }
    }, [])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img) return
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, SIZE, SIZE)
        const z = baseZoom.current * zoom
        const w = img.naturalWidth * z
        const h = img.naturalHeight * z
        ctx.drawImage(img, (SIZE - w) / 2 + offset.x, (SIZE - h) / 2 + offset.y, w, h)
        // circular mask
        ctx.save()
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }, [zoom, offset])

    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            imgRef.current = img
            baseZoom.current = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight)
            draw()
        }
        img.src = src
    }, [src])

    useEffect(() => { draw() }, [draw])

    const applyDrag = (dx: number, dy: number) => {
        setOffset(o => clampOffset(o.x + dx, o.y + dy, zoom))
    }

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        dragging.current = true
        lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragging.current) return
        applyDrag(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y)
        lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => { dragging.current = false }

    const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        dragging.current = true
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!dragging.current) return
        applyDrag(e.touches[0].clientX - lastPos.current.x, e.touches[0].clientY - lastPos.current.y)
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const handleZoom = (newZoom: number) => {
        setZoom(newZoom)
        // re-clamp offset with new zoom
        setOffset(o => clampOffset(o.x, o.y, newZoom))
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-zinc-500">Drag to reposition · scroll or use slider to zoom</p>

            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={SIZE}
                    height={SIZE}
                    className="rounded-full cursor-grab active:cursor-grabbing border-2 border-white/10"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onMouseUp}
                    onWheel={e => {
                        e.preventDefault()
                        handleZoom(Math.max(minZoom, Math.min(3, zoom - e.deltaY * 0.001)))
                    }}
                />
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">🔍</span>
                <input
                    type="range" min={minZoom} max={3} step={0.01}
                    value={zoom}
                    onChange={e => handleZoom(Number(e.target.value))}
                    className="flex-1 accent-rose-500"
                />
            </div>

            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold py-2 rounded-lg transition-colors">
                    Cancel
                </button>
                <button onClick={() => onConfirm(canvasRef.current!.toDataURL('image/png'))} className="flex-1 bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                    Apply
                </button>
            </div>
        </div>
    )
}