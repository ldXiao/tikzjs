import { AstNode } from '../parser/TikzAST'
import {
  TikzRoot,
  TikzCd,
  TikzCdRow,
  TikzCdCell,
  TikzCdArrow,
  TikzCdOption,
} from '../parser/TikzRoot'

export interface SvgGeneratorOptions {
  /** Render a LaTeX string to an HTML string (e.g. using KaTeX). Falls back to plain text. */
  renderMath?: (latex: string) => string
  /** Default column separation in pixels. Overridden by [column sep=...]. Default: 160 */
  defaultColSep?: number
  /** Default row separation in pixels. Overridden by [row sep=...]. Default: 100 */
  defaultRowSep?: number
  /** Padding in pixels around the entire diagram. Default: 40 */
  margin?: number
  /** Width of the foreignObject box for cell content. Default: 150 */
  cellWidth?: number
  /** Height of the foreignObject box for cell content. Default: 44 */
  cellHeight?: number
  /** Width of the foreignObject box for arrow labels. Default: 100 */
  labelWidth?: number
  /** Height of the foreignObject box for arrow labels. Default: 28 */
  labelHeight?: number
  /** Gap in px from cell centre to arrow start/end. Default: 28 */
  arrowMargin?: number
  /** Perpendicular offset in px for arrow labels. Default: 16 */
  labelOffset?: number
}

/** Direction string → [Δrow, Δcol] */
const DIR_DELTA: Record<string, [number, number]> = {
  r: [0, 1],   l: [0, -1],  u: [-1, 0],  d: [1, 0],
  ur: [-1, 1], ul: [-1, -1], dr: [1, 1], dl: [1, -1],
  rr: [0, 2],  ll: [0, -2], uu: [-2, 0], dd: [2, 0],
  rrr: [0, 3], lll: [0, -3], uuu: [-3, 0], ddd: [3, 0],
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function resolveUnit(val: TikzCdOption['val'], defaultPx: number): number {
  if (typeof val === 'boolean' || typeof val === 'string') {
    // Named values: small=80, normal=120, large=160, huge=220, tiny=60
    const named: Record<string, number> = {
      tiny: 60, small: 90, normal: 130, large: 170, huge: 220,
    }
    return typeof val === 'string' ? (named[val] ?? defaultPx) : defaultPx
  }
  // Numeric with unit → convert to px (rough approximation: 1em=16px, 1pt=1.333px, 1cm=37.8px, 1mm=3.78px)
  const scale: Record<string, number> = {
    em: 16, pt: 1.333, cm: 37.8, mm: 3.78, ex: 8, px: 1,
  }
  return val.value * (scale[val.unit] ?? 1)
}

export class SvgGenerator {
  private opts: Required<SvgGeneratorOptions>

  constructor(opts: SvgGeneratorOptions = {}) {
    this.opts = {
      renderMath: opts.renderMath ?? ((s) => esc(s)),
      defaultColSep: opts.defaultColSep ?? 160,
      defaultRowSep: opts.defaultRowSep ?? 100,
      margin: opts.margin ?? 40,
      cellWidth: opts.cellWidth ?? 150,
      cellHeight: opts.cellHeight ?? 44,
      labelWidth: opts.labelWidth ?? 120,
      labelHeight: opts.labelHeight ?? 28,
      arrowMargin: opts.arrowMargin ?? 28,
      labelOffset: opts.labelOffset ?? 16,
    }
  }

  render(node: AstNode): string {
    if (node._type === 'TikzRoot') {
      const root = node as TikzRoot
      const child = (root as any)._children?.[0]
      if (child) return this.render(child)
    }
    if (node._type === 'TikzCd') {
      return this.renderTikzCd(node as unknown as TikzCd)
    }
    return `<svg xmlns="http://www.w3.org/2000/svg"><text x="4" y="16" font-size="12" fill="currentColor">Unsupported TikZ type: ${esc((node as any)._type ?? '?')}</text></svg>`
  }

  private renderTikzCd(cd: TikzCd): string {
    const { margin, cellWidth, cellHeight, labelWidth, labelHeight, arrowMargin, labelOffset } = this.opts

    // Resolve spacing from environment options
    const colSepOpt = cd._options.find((o) => o.key === 'columnSep')
    const rowSepOpt = cd._options.find((o) => o.key === 'rowSep')
    const colSep = colSepOpt ? resolveUnit(colSepOpt.val, this.opts.defaultColSep) : this.opts.defaultColSep
    const rowSep = rowSepOpt ? resolveUnit(rowSepOpt.val, this.opts.defaultRowSep) : this.opts.defaultRowSep

    const rows = cd._rows
    const numRows = rows.length
    const numCols = rows.reduce((m, r) => Math.max(m, r._cells.length), 0)

    // Cell centres
    const cx = (c: number) => margin + c * colSep + colSep / 2
    const cy = (r: number) => margin + r * rowSep + rowSep / 2

    const svgW = margin * 2 + numCols * colSep
    const svgH = margin * 2 + numRows * rowSep

    const lines: string[] = []

    // ── defs ──────────────────────────────────────────────────────────────
    lines.push(
      `<defs>`,
      `  <marker id="ah" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">`,
      `    <polygon points="0 0, 7 2.5, 0 5" fill="currentColor"/>`,
      `  </marker>`,
      `</defs>`,
    )

    // ── arrows (drawn before nodes so nodes sit on top) ──────────────────
    rows.forEach((row, r) => {
      row._cells.forEach((cell, c) => {
        cell._arrows.forEach((arrow) => {
          const delta = DIR_DELTA[arrow._direction]
          if (!delta) return
          const [dr, dc] = delta
          const tr = r + dr
          const tc = c + dc
          if (tr < 0 || tr >= numRows || tc < 0 || tc >= numCols) return

          const x1 = cx(c), y1 = cy(r), x2 = cx(tc), y2 = cy(tr)
          const dx = x2 - x1, dy = y2 - y1
          const len = Math.sqrt(dx * dx + dy * dy)
          if (len < 1) return

          const nx = dx / len, ny = dy / len
          const sx = x1 + nx * arrowMargin, sy = y1 + ny * arrowMargin
          const ex = x2 - nx * arrowMargin, ey = y2 - ny * arrowMargin

          lines.push(
            `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"`,
            `  stroke="currentColor" stroke-width="1.2" marker-end="url(#ah)"/>`,
          )

          // Label
          const labelOpt = arrow._opts.find((o) => o.type === 'label')
          if (labelOpt?.text) {
            const mx = (sx + ex) / 2, my = (sy + ey) / 2
            // Perpendicular direction: rotate nx,ny by 90°
            const px = -ny, py = nx
            const sign = labelOpt.swap ? 1 : -1
            const lx = mx + px * labelOffset * sign
            const ly = my + py * labelOffset * sign
            const html = this.opts.renderMath(labelOpt.text.trim())
            lines.push(
              `<foreignObject x="${(lx - labelWidth / 2).toFixed(1)}" y="${(ly - labelHeight / 2).toFixed(1)}"`,
              `  width="${labelWidth}" height="${labelHeight}">`,
              `  <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:11px;line-height:1">`,
              html,
              `  </div>`,
              `</foreignObject>`,
            )
          }
        })
      })
    })

    // ── nodes ─────────────────────────────────────────────────────────────
    rows.forEach((row, r) => {
      row._cells.forEach((cell, c) => {
        const content = cell._content.trim()
        if (!content) return
        const x = cx(c), y = cy(r)
        const html = this.opts.renderMath(content)
        lines.push(
          `<foreignObject x="${(x - cellWidth / 2).toFixed(1)}" y="${(y - cellHeight / 2).toFixed(1)}"`,
          `  width="${cellWidth}" height="${cellHeight}">`,
          `  <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:13px;line-height:1;text-align:center">`,
          html,
          `  </div>`,
          `</foreignObject>`,
        )
      })
    })

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
      `  width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`,
      ...lines,
      `</svg>`,
    ].join('\n')
  }
}
