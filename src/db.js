import { EMAILJS } from './config.js';

const K = {
  u: 'jobify2_users',
  j: 'jobify2_jobs',
  a: 'jobify2_apps',
  s: 'jobify2_session',
  m: 'jobify2_mails',
  v: 'jobify2_saved'
};

const get = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

const set = (k, v) =>
  localStorage.setItem(k, JSON.stringify(v));

const uid = () =>
  Date.now().toString(36) +
  Math.random().toString(36).slice(2, 6);

export const TYPES = [
  'Full-time',
  'Internship',
  'Part-time',
  'Contract'
];

export const MODES = [
  'On-site',
  'Remote',
  'Hybrid'
];

export const QUALS = [
  'Any Graduate',
  'B.Tech/BE',
  'BCA/MCA',
  'MBA',
  'B.Com/M.Com',
  'Diploma',
  '12th Pass'
];

export const EXPS = [
  'Fresher',
  '1-3 Years',
  '3+ Years'
];

const seed = [
  [
    'React Developer',
    'Google',
    'Bengaluru',
    'Full-time',
    'Hybrid',
    'B.Tech/BE',
    '1-3 Years',
    18,
    30,
    ['React', 'JS']
  ],

  [
    'MERN Stack Intern',
    'Zoho',
    'Chennai',
    'Internship',
    'On-site',
    'BCA/MCA',
    'Fresher',
    3,
    4.8,
    ['MongoDB', 'Node']
  ],

  [
    'UI/UX Designer',
    'Swiggy',
    'Remote',
    'Full-time',
    'Remote',
    'Any Graduate',
    '1-3 Years',
    10,
    16,
    ['Figma', 'Design']
  ],

  [
    'Data Analyst',
    'TCS',
    'Pune',
    'Full-time',
    'On-site',
    'B.Tech/BE',
    'Fresher',
    6,
    10,
    ['SQL', 'Python']
  ],

  [
    'Node.js Backend Dev',
    'Razorpay',
    'Mumbai',
    'Full-time',
    'Hybrid',
    'BCA/MCA',
    '3+ Years',
    15,
    25,
    ['Node', 'API']
  ],

  [
    'Content Writer',
    'Unacademy',
    'Remote',
    'Part-time',
    'Remote',
    'Any Graduate',
    'Fresher',
    2,
    4,
    ['SEO', 'Writing']
  ],

  [
    'Marketing Manager',
    'Amazon',
    'Delhi',
    'Full-time',
    'On-site',
    'MBA',
    '3+ Years',
    20,
    35,
    ['Ads', 'Strategy']
  ],

  [
    'Accounts Executive',
    'Infosys',
    'Nashik',
    'Full-time',
    'On-site',
    'B.Com/M.Com',
    'Fresher',
    3,
    5,
    ['Tally', 'GST']
  ]
];

export function initDB() {
  if (!get(K.j)) {
    set(
      K.j,
      seed.map(
        (
          [
            title,
            company,
            location,
            type,
            mode,
            qualification,
            experience,
            salaryMin,
            salaryMax,
            tags
          ],
          i
        ) => ({
          id: uid(),
          title,
          company,
          location,
          type,
          mode,
          qualification,
          experience,
          salaryMin,
          salaryMax,
          tags,
          description: `${company} ko ${title} chahiye. Passionate candidates apply karein.`,
          createdAt:
            Date.now() - i * 1000
        })
      )
    );
  }

  if (!get(K.u)) {
    set(K.u, [
      {
        id: uid(),
        name: 'Admin',
        email: 'admin@jobify.com',
        password: 'admin123',
        role: 'admin'
      }
    ]);
  }
}

export const getSession = () =>
  get(K.s, null);

export const logout = () =>
  localStorage.removeItem(K.s);

export const salaryText = (j) =>
  `₹${j.salaryMin}-${j.salaryMax} LPA`;

export function getJobs(f = {}) {
  const s = (f.q || '').toLowerCase();

  const all = (v) =>
    !v || v === 'All';

  return get(K.j, [])
    .filter(
      (j) =>
        [
          j.title,
          j.company,
          j.location,
          ...(j.tags || [])
        ]
          .join(' ')
          .toLowerCase()
          .includes(s) &&
        (all(f.type) ||
          j.type === f.type) &&
        (all(f.mode) ||
          j.mode === f.mode) &&
        (all(f.qual) ||
          j.qualification === f.qual ||
          j.qualification ===
            'Any Graduate') &&
        (all(f.exp) ||
          j.experience === f.exp) &&
        j.salaryMax >=
          Number(f.minSal || 0) &&
        (!f.onlySaved ||
          (f.saved || []).includes(j.id))
    )
    .sort((a, b) =>
      f.sort === 'salary'
        ? b.salaryMax - a.salaryMax
        : b.createdAt - a.createdAt
    );
}

export function addJob(f) {
  if (
    !f.title?.trim() ||
    !f.company?.trim()
  ) {
    throw new Error(
      'Title aur Company zaruri hai'
    );
  }

  const tags = String(f.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  set(K.j, [
    ...get(K.j, []),
    {
      ...f,
      tags,
      salaryMin: +f.salaryMin || 0,
      salaryMax: +f.salaryMax || 0,
      id: uid(),
      createdAt: Date.now()
    }
  ]);
}

export const deleteJob = (id) =>
  set(
    K.j,
    get(K.j, []).filter(
      (j) => j.id !== id
    )
  );

export function register({
  name,
  email,
  password
}) {
  if (
    !name?.trim() ||
    !email?.trim() ||
    !password
  ) {
    throw new Error(
      'Name, email, password sab bharo'
    );
  }

  const users = get(K.u, []);

  if (
    users.some(
      (u) =>
        u.email ===
        email.toLowerCase()
    )
  ) {
    throw new Error(
      'Email already registered'
    );
  }

  const u = {
    id: uid(),
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: 'user'
  };

  set(K.u, [...users, u]);
  set(K.s, u);

  return u;
}

export function login({
  email,
  password,
  role
}) {
  const u = get(K.u, []).find(
    (x) =>
      x.email ===
        (email || '').toLowerCase() &&
      x.password === password &&
      x.role === role
  );

  if (!u) {
    throw new Error(
      role === 'admin'
        ? 'Admin email/password galat hai'
        : 'Email ya password galat hai'
    );
  }

  set(K.s, u);

  return u;
}

export async function sendMail(
  to,
  name,
  subject,
  message
) {
  set(K.m, [
    {
      id: uid(),
      to,
      subject,
      message,
      date: Date.now()
    },
    ...get(K.m, [])
  ]);

  const c = EMAILJS;

  if (
    !c.service &&
    !c.template &&
    !c.key
  ) {
    return;
  }

  if (
    !(c.service && c.template && c.key)
  ) {
    return;
  }

  try {
    await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          service_id: c.service,
          template_id: c.template,
          user_id: c.key,
          template_params: {
            to_email: to,
            to_name: name,
            subject,
            message
          }
        })
      }
    );
  } catch {}
}

export const getMails = (email) =>
  get(K.m, []).filter(
    (m) => m.to === email
  );

export function applyJob(user, job, d) {
  const apps = get(K.a, []);

  if (
    apps.some(
      (a) =>
        a.userId === user.id &&
        a.jobId === job.id
    )
  ) {
    throw new Error(
      'Aap pehle hi apply kar chuke ho'
    );
  }

  if (
    !d.name?.trim() ||
    !d.email?.trim() ||
    !d.phone?.trim()
  ) {
    throw new Error(
      'Name, email, phone zaruri hai'
    );
  }

  set(K.a, [
    ...apps,
    {
      ...d,
      id: uid(),
      userId: user.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: 'Pending',
      date: Date.now()
    }
  ]);

  sendMail(
    d.email,
    d.name,
    `Application received – ${job.title} at ${job.company}`,
    `Hi ${d.name}, aapne ${job.title} (${job.company}) ke liye successfully apply kar diya hai. Hum aapko jaldi update denge. – Team Jobify`
  );
}

export const getApps = () =>
  get(K.a, []).sort(
    (a, b) => b.date - a.date
  );

export function setStatus(
  id,
  status
) {
  const apps = get(K.a, []);

  const a = apps.find(
    (x) => x.id === id
  );

  if (!a) return;

  a.status = status;

  set(K.a, apps);

  sendMail(
    a.email,
    a.name,
    `Application update – ${a.jobTitle}`,
    `Hi ${a.name}, ${a.company} me ${a.jobTitle} ke liye aapka status: ${status}. – Team Jobify`
  );
}

export const getUsersCount = () =>
  get(K.u, []).filter(
    (u) => u.role === 'user'
  ).length;

export const getSaved = (uid_) =>
  get(K.v + uid_, []);

export function toggleSaved(
  uid_,
  id
) {
  const s = getSaved(uid_);

  set(
    K.v + uid_,
    s.includes(id)
      ? s.filter((x) => x !== id)
      : [...s, id]
  );
}