import * as pdfjsLib from 'pdfjs-dist';
// Vite-friendly worker import (bundled, no CDN dependency)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ExtractedDoctorRow {
  name: string;
  specialty: string;
  opdTiming: string;
  roomNo: string;
  rawLine: string;
}

// Matches "Dr. X - Specialty - Mon-Sat, 9:00 AM - 1:00 PM - Room 104"
// and variants separated by |, :, en-dash, or 2+ spaces (table-style PDFs).
const DOCTOR_LINE_RE = /(Dr\.?\s+[A-Za-z.'\- ]{3,60}?)\s*[-|:\u2013]\s*(.+)/i;
const TIME_RE = /((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[A-Za-z\-,/ ]{0,20})?\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/;
const ROOM_RE = /(Room\s*[\w-]+|OPD\s*Room\s*[\w-]+)/i;

function parseLine(rawLine: string): ExtractedDoctorRow | null {
  const line = rawLine.trim();
  if (line.length < 5 || !/dr\.?\s/i.test(line + ' ')) return null;

  let name = '';
  let rest = '';

  const m = DOCTOR_LINE_RE.exec(line);
  if (m) {
    name = m[1].trim();
    rest = m[2].trim();
  } else if (/^dr\.?\s/i.test(line)) {
    const parts = line.split(/\s{2,}|\t/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      name = parts[0];
      rest = parts.slice(1).join(' | ');
    } else {
      return null;
    }
  } else {
    return null;
  }

  const timeMatch = TIME_RE.exec(rest);
  const opdTiming = timeMatch ? timeMatch[0].trim() : '';

  const roomMatch = ROOM_RE.exec(rest);
  const roomNo = roomMatch ? roomMatch[0].trim() : '';

  let specialtyPart = rest;
  if (timeMatch) specialtyPart = specialtyPart.replace(timeMatch[0], '');
  if (roomMatch) specialtyPart = specialtyPart.replace(roomMatch[0], '');
  const specialty = specialtyPart.replace(/[-|:\u2013]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^[,\s]+|[,\s]+$/g, '');

  return { name, specialty, opdTiming, roomNo, rawLine: line };
}

/** Extracts doctor name + OPD timing rows from a PDF File in the browser. */
export async function extractDoctorsFromPdfFile(file: File): Promise<ExtractedDoctorRow[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const lines: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Group text items into lines by their vertical (y) position
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items as any[]) {
      if (!('str' in item)) continue;
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: item.str });
    }

    const sortedYs = Array.from(rows.keys()).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const rowItems = rows.get(y)!.sort((a, b) => a.x - b.x);
      const lineText = rowItems.map(r => r.str).join(' ').replace(/\s+/g, ' ').trim();
      if (lineText) lines.push(lineText);
    }
  }

  const results: ExtractedDoctorRow[] = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) results.push(parsed);
  }
  return results;
}
