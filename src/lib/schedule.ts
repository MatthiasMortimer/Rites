import fs from 'node:fs';
import path from 'node:path';

export interface WeeklyScheduleCard {
  id: string;
  day: string;
  title: string;
  details: string;
}

export interface WeeklyScheduleSection {
  id: string;
  name: string;
  cards: WeeklyScheduleCard[];
}

const schedulePath = path.resolve(process.cwd(), 'src/data/weekly-schedule.json');

export function getDefaultWeeklySchedule(): WeeklyScheduleSection[] {
  return [
    {
      id: 'section-finishes',
      name: 'Finish Carpentry',
      cards: [
        {
          id: 'fc-mon',
          day: 'Mon',
          title: 'Cabinet install',
          details: 'Set and shim base cabinets for the kitchen remodel.',
        },
        {
          id: 'fc-wed',
          day: 'Wed',
          title: 'Trim and shelving',
          details: 'Install trim details, shelving, and final wall prep.',
        },
      ],
    },
    {
      id: 'section-roofing',
      name: 'Exterior Crew',
      cards: [
        {
          id: 'ex-tue',
          day: 'Tue',
          title: 'Roofing coordination',
          details: 'Material delivery and flashing prep at the Cedar project.',
        },
        {
          id: 'ex-fri',
          day: 'Fri',
          title: 'Final inspection',
          details: 'Walk the site with the superintendent and complete punch items.',
        },
      ],
    },
    {
      id: 'section-service',
      name: 'Service Calls',
      cards: [
        {
          id: 'svc-thu',
          day: 'Thu',
          title: 'Repair and maintenance',
          details: 'Address leak repairs and hardware replacements in the tenant units.',
        },
      ],
    },
  ];
}

export function getWeeklySchedule(): WeeklyScheduleSection[] {
  try {
    const raw = fs.readFileSync(schedulePath, 'utf8');
    const parsed = JSON.parse(raw) as WeeklyScheduleSection[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fall through to default schedule below
  }

  const fallback = getDefaultWeeklySchedule();
  saveWeeklySchedule(fallback);
  return fallback;
}

export function saveWeeklySchedule(sections: WeeklyScheduleSection[]) {
  const directory = path.dirname(schedulePath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(schedulePath, JSON.stringify(sections, null, 2) + '\n');
  return sections;
}
