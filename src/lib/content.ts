import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const contentFile = path.resolve(process.cwd(), 'src/content/site.md');
const raw = fs.readFileSync(contentFile, 'utf8');
const parsed = matter(raw);

const frontmatter = parsed.data ?? {};

export const site = {
  company: frontmatter.company ?? 'Summit & Stone Contracting',
  shortName: frontmatter.shortName ?? 'Summit & Stone',
  phone: frontmatter.phone ?? '(555) 948-2201',
  email: frontmatter.email ?? 'hello@summitandstone.com',
  address: frontmatter.address ?? '214 Cedar Lane, Suite 400, Portland, OR 97205',
  serviceArea: frontmatter.serviceArea ?? 'Serving Portland and the greater metro area',
  hours: frontmatter.hours ?? 'Mon-Fri • 7:00 AM - 6:00 PM',
  heroImage: frontmatter.heroImage ?? '/images/contractor-team.jpg',
};

function getSections() {
  const sections = new Map<string, string>();
  const sectionPattern = /^##\s*(.+?)\n([\s\S]*?)(?=^##\s|\Z)/gm;

  for (const match of parsed.content.matchAll(sectionPattern)) {
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
