import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const contentFile = path.resolve(process.cwd(), 'src/content/site.md');

export interface SiteContent {
  company: string;
  shortName: string;
  phone: string;
  email: string;
  address: string;
  serviceArea: string;
  hours: string;
  heroImage: string;
}

export function getSiteContent() {
  const raw = fs.readFileSync(contentFile, 'utf8');
  const parsed = matter(raw);

  return {
    frontmatter: (parsed.data ?? {}) as Partial<SiteContent>,
    content: parsed.content,
  };
}

export function saveSiteContent(updates: Partial<SiteContent>) {
  const { frontmatter, content } = getSiteContent();
  const nextFrontmatter = {
    ...frontmatter,
    ...updates,
  } as Record<string, unknown>;

  const output = matter.stringify(content, nextFrontmatter);
  fs.writeFileSync(contentFile, output);
  return nextFrontmatter as SiteContent;
}

export const site = getSiteContent().frontmatter as SiteContent;

export const companyName = site.company;

function getSections() {
  const { content } = getSiteContent();
  const sections = new Map<string, string>();
  const sectionPattern = /^##\s*(.+?)\r?\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/gm;

  for (const match of content.matchAll(sectionPattern)) {
    const title = match[1].trim();
    const body = match[2].trim();
    sections.set(title, body);
  }

  return sections;
}

export function contentSection(title: string) {
  const sections = getSections();
  const content = sections.get(title) ?? '';
  return marked.parse(content);
}

export function contentCards(title: string) {
  const section = getSections().get(title) ?? '';

  return section
    .split(/^### /m)
    .slice(1)
    .map((card) => {
      const [cardTitle, ...body] = card.trim().split(/\r?\n/);
      return {
        title: cardTitle.trim(),
        html: marked.parse(body.join('\n').trim()),
      };
    });
}
