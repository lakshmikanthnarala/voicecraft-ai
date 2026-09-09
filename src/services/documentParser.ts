import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import JSZip from 'jszip';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const normalizeText = (value: string) => value.replace(/\u0000/g, ' ').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let combinedText = '';
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      combinedText += `${pageText}\n\n`;
    }
  }

  return normalizeText(combinedText);
}

async function extractDocxText(file: File): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return normalizeText(result.value || '');
}

async function extractPptxText(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((path) => path.startsWith('ppt/slides/slide') && path.endsWith('.xml'))
    .sort();

  const extractedSlides: string[] = [];

  for (const slidePath of slideFiles) {
    const slideXml = zip.files[slidePath];
    if (!slideXml) continue;

    const xml = await slideXml.async('string');
    const xmlDoc = new DOMParser().parseFromString(xml, 'application/xml');
    const slideText = Array.from(xmlDoc.getElementsByTagName('a:t'))
      .map((node) => node.textContent || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (slideText) {
      extractedSlides.push(slideText);
    }
  }

  return normalizeText(extractedSlides.join('\n\n'));
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    const text = await file.text();
    return normalizeText(text);
  }

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractPdfText(file);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractDocxText(file);
  }

  if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    throw new Error('Older .doc files are not supported. Please convert the document to .docx or upload a PDF/text file instead.');
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    fileName.endsWith('.pptx')
  ) {
    return extractPptxText(file);
  }

  if (fileType === 'application/vnd.ms-powerpoint' || fileName.endsWith('.ppt')) {
    throw new Error('Older .ppt files are not supported. Please convert the presentation to .pptx or upload a PDF/text file instead.');
  }

  throw new Error('Unsupported file type. Please upload a text, Markdown, PDF, Word, or PowerPoint file.');
}
