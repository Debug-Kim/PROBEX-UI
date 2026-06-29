'use client'

import type { ReactNode } from 'react'

// Dependency-free Markdown renderer for ResearchReport.body. Handles only what the
// reports use: ## → h2, ### → h3, **bold**, *italic*, - lists, | tables |, and blank
// lines as paragraph breaks. Body headings start at h2 (the report title is the h1).

interface MarkdownBodyProps {
  content: string
  className?: string
}

// ─── Inline renderer ──────────────────────────────────────────────────────────

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  // Combined matcher: **bold** | *italic*
  const pattern = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[4]}</em>)
    }
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

// ─── Block tokenizer ──────────────────────────────────────────────────────────

type BlockType =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'li'; text: string }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'p'; text: string }
  | { kind: 'blank' }

/**
 * Pre-pass: ensure a blank line exists between a heading and a following
 * list item so the tokenizer doesn't merge them into a paragraph.
 */
function isolateHeadings(raw: string): string {
  return raw.replace(/(#{2,3} [^\n]+)\n([-|])/g, '$1\n\n$2')
}

function tokenize(raw: string): BlockType[] {
  const src = isolateHeadings(raw)
  const lines = src.split('\n')
  const blocks: BlockType[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    // Unreachable given the loop guard, but narrows `line` to `string` under
    // noUncheckedIndexedAccess without changing runtime behavior.
    if (line === undefined) break

    // Blank line
    if (line.trim() === '') {
      blocks.push({ kind: 'blank' })
      i++
      continue
    }

    // ## Heading 2
    if (/^## /.test(line)) {
      blocks.push({ kind: 'h2', text: line.slice(3).trim() })
      i++
      continue
    }

    // ### Heading 3
    if (/^### /.test(line)) {
      blocks.push({ kind: 'h3', text: line.slice(4).trim() })
      i++
      continue
    }

    // - List item (consume consecutive list lines)
    if (/^- /.test(line)) {
      let li: string | undefined = line
      while (li !== undefined && /^- /.test(li)) {
        blocks.push({ kind: 'li', text: li.slice(2).trim() })
        i++
        li = lines[i]
      }
      continue
    }

    // | Table | row | (consume all consecutive | lines including separator)
    if (/^\|/.test(line)) {
      const tableLines: string[] = []
      let row: string | undefined = line
      while (row !== undefined && /^\|/.test(row)) {
        tableLines.push(row)
        i++
        row = lines[i]
      }
      // Parse into rows, skipping separator lines (---|---)
      const rows = tableLines
        .filter((l) => !/^\|[-| :]+\|/.test(l))
        .map((l) =>
          l
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim()),
        )
      if (rows.length > 0) {
        blocks.push({ kind: 'table', rows })
      }
      continue
    }

    // Plain paragraph — consume until blank or block marker
    const paraLines: string[] = []
    let para: string | undefined = line
    while (
      para !== undefined &&
      para.trim() !== '' &&
      !/^#{2,3} /.test(para) &&
      !/^- /.test(para) &&
      !/^\|/.test(para)
    ) {
      paraLines.push(para)
      i++
      para = lines[i]
    }
    if (paraLines.length > 0) {
      blocks.push({ kind: 'p', text: paraLines.join(' ') })
    }
  }

  return blocks
}

// ─── Block renderer ───────────────────────────────────────────────────────────

function renderBlocks(blocks: BlockType[]): ReactNode[] {
  const nodes: ReactNode[] = []
  let listBuffer: string[] = []
  let keyCounter = 0

  function flushList() {
    if (listBuffer.length === 0) return
    nodes.push(
      <ul
        key={`ul-${keyCounter++}`}
        style={{
          margin: '0 0 16px 0',
          paddingLeft: '20px',
          listStyleType: 'disc',
        }}
      >
        {listBuffer.map((item, idx) => (
          <li
            key={idx}
            style={{
              color: 'var(--probex-text-secondary)',
              fontSize: '14px',
              lineHeight: '1.7',
              marginBottom: '6px',
            }}
          >
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  for (const block of blocks) {
    if (block.kind === 'li') {
      listBuffer.push(block.text)
      continue
    }

    // Flush any pending list before non-list block
    flushList()

    if (block.kind === 'blank') {
      // Blanks are structural only; already handled by paragraph grouping
      continue
    }

    if (block.kind === 'h2') {
      nodes.push(
        <h2
          key={`h2-${keyCounter++}`}
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--probex-text-primary)',
            margin: '28px 0 10px',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--probex-border)',
          }}
        >
          {block.text}
        </h2>,
      )
      continue
    }

    if (block.kind === 'h3') {
      nodes.push(
        <h3
          key={`h3-${keyCounter++}`}
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--probex-text-primary)',
            margin: '20px 0 8px',
          }}
        >
          {block.text}
        </h3>,
      )
      continue
    }

    if (block.kind === 'p') {
      nodes.push(
        <p
          key={`p-${keyCounter++}`}
          style={{
            color: 'var(--probex-text-secondary)',
            fontSize: '14px',
            lineHeight: '1.75',
            margin: '0 0 14px',
          }}
        >
          {renderInline(block.text)}
        </p>,
      )
      continue
    }

    if (block.kind === 'table') {
      const [headerRow, ...bodyRows] = block.rows
      nodes.push(
        <div
          key={`table-${keyCounter++}`}
          style={{ overflowX: 'auto', margin: '0 0 20px' }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            {headerRow && (
              <thead>
                <tr>
                  {headerRow.map((cell, ci) => (
                    <th
                      key={ci}
                      scope="col"
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'var(--probex-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--probex-border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background:
                      ri % 2 === 0 ? 'transparent' : 'var(--probex-surface)',
                  }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '8px 12px',
                        color: 'var(--probex-text-secondary)',
                        borderBottom: '1px solid var(--probex-border)',
                        verticalAlign: 'top',
                      }}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
  }

  // Flush any trailing list
  flushList()

  return nodes
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarkdownBody({ content, className }: MarkdownBodyProps) {
  if (!content || content.trim() === '') {
    return (
      <p
        style={{
          color: 'var(--probex-text-muted)',
          fontSize: '14px',
          fontStyle: 'italic',
        }}
      >
        No content available.
      </p>
    )
  }

  const blocks = tokenize(content)
  const nodes = renderBlocks(blocks)

  return (
    <div
      className={className}
      style={{ maxWidth: '100%' }}
      aria-label="Report body"
    >
      {nodes}
    </div>
  )
}
