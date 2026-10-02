import { useState } from 'react';
import { motion } from 'framer-motion';
import { getJobs, addJob, deleteJob, getApps, setStatus, getUsersCount, TYPES, MODES, QUALS, EXPS } from './db.js';

const empty = { title: '', company: '', location: '', type: 'Full-time', mode: 'On-site', qualification: 'Any Graduate',
  experience: 'Fresher', salaryMin: '', salaryMax: '', tags: '', description: '' };

export default function Admin({ say, onChange }) {
  const [tab, setTab] = useState('dash');
  const [f, setF] = useState(empty);
  const [, tick] = useState(0);
  const jobs = getJobs(), apps = getApps();
  const refresh = () => { tick(x => x + 1); onChange(); };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const Sel = ({ k, list }) => <select value={f[k]} onChange={set(k)}>{list.map(t => <option key={t}>{t}</option>)}</select>;

  const add = () => { try { addJob(f); say('Job post ho gayi ✅'); setF(empty); refresh(); } catch (e) { say(e.message); } };
  const csv = () => {
    const rows = [['Name', 'Email', 'Phone', 'Job', 'Company', 'Degree', 'Experience', 'Status'],
      ...apps.map(a => [a.name, a.email, a.phone, a.jobTitle, a.company, a.degree, a.experience, a.status])];
    const url = URL.createObjectURL(new Blob([rows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'applicants.csv' }).click();
  };
  const max = Math.max(1, ...jobs.map(j => apps.filter(a => a.jobId === j.id).length));
  const stats = [['💼', jobs.length, 'Jobs'], ['📩', apps.length, 'Applications'], ['👥', getUsersCount(), 'Users'],
    ['⭐', apps.filter(a => a.status === 'Shortlisted').length, 'Shortlisted']];

  return (
    <motion.div className="admin" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="grad">Admin Panel</h2>
      <div className="tabs" style={{ margin: '14px 0' }}>
        {[['dash', '📊 Dashboard'], ['apps', '📩 Applicants'], ['post', '➕ Post Job']].map(([k, l]) =>
          <button key={k} className={`chip ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {tab === 'dash' && <>
        <div className="statg">{stats.map(([i, n, l]) => <div className="card" key={l}><div style={{ fontSize: '1.6rem' }}>{i}</div><b className="grad" style={{ fontSize: '2rem' }}>{n}</b><br /><small>{l}</small></div>)}</div>
        <div className="card" style={{ marginTop: 18 }}><h3>Applications per job</h3>
          {jobs.map(j => { const n = apps.filter(a => a.jobId === j.id).length;
            return <div className="bar" key={j.id}><small>{j.title}</small>
              <motion.i initial={{ width: 0 }} animate={{ width: `${(n / max) * 100}%` }} /><b>{n}</b></div>; })}
        </div>
      </>}

      {tab === 'apps' && <>
        <div className="row" style={{ margin: '0 0 12px' }}><h3>Applicants ({apps.length})</h3><button className="btn" onClick={csv}>⬇ Export CSV</button></div>
        <div className="tbl card"><table>
          <thead><tr><th>Applicant</th><th>Job</th><th>Degree</th><th>Exp</th><th>Applied</th><th>Status</th></tr></thead>
          <tbody>{apps.map(a => <tr key={a.id}>
            <td><b>{a.name}</b><br /><small>{a.email}<br />📞 {a.phone}</small></td>
            <td>{a.jobTitle}<br /><small>{a.company}</small></td><td>{a.degree}</td><td>{a.experience}</td>
            <td><small>{new Date(a.date).toLocaleDateString()}</small></td>
            <td><select value={a.status} onChange={e => { setStatus(a.id, e.target.value); say(`${a.name} ko email bhej diya 📧`); refresh(); }}>
              {['Pending', 'Shortlisted', 'Rejected', 'Hired'].map(s => <option key={s}>{s}</option>)}</select></td>
          </tr>)}</tbody></table>
          {!apps.length && <p style={{ padding: 20, textAlign: 'center' }}>Abhi koi application nahi aayi</p>}
        </div>
      </>}

      {tab === 'post' && <>
        <div className="aform card">
          <input placeholder="Job Title *" value={f.title} onChange={set('title')} />
          <input placeholder="Company *" value={f.company} onChange={set('company')} />
          <input placeholder="Location" value={f.location} onChange={set('location')} />
          <Sel k="type" list={TYPES} /><Sel k="mode" list={MODES} /><Sel k="qualification" list={QUALS} /><Sel k="experience" list={EXPS} />
          <input type="number" placeholder="Min salary (LPA)" value={f.salaryMin} onChange={set('salaryMin')} />
          <input type="number" placeholder="Max salary (LPA)" value={f.salaryMax} onChange={set('salaryMax')} />
          <input placeholder="Skills (comma se alag)" value={f.tags} onChange={set('tags')} />
          <textarea placeholder="Description" rows="3" value={f.description} onChange={set('description')} />
          <button className="btn" onClick={add}>＋ Post Job</button>
        </div>
        <h3 style={{ margin: '24px 0 12px' }}>All Jobs ({jobs.length})</h3>
        {jobs.map(j => <div className="card arow" key={j.id}>
          <div><b>{j.title}</b><br /><small>{j.company} • {j.location} • {j.mode}</small></div>
          <button className="ghost" onClick={() => { deleteJob(j.id); say('Job delete ho gayi'); refresh(); }}>🗑</button></div>)}
      </>}
    </motion.div>
  );
}
