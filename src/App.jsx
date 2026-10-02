import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Admin from './Admin.jsx';
import {
  getJobs,
  getSession,
  login,
  register,
  logout,
  applyJob,
  getMails,
  getSaved,
  toggleSaved,
  salaryText,
  TYPES,
  MODES,
  QUALS,
  EXPS
} from './db.js';

const F0 = {
  q: '',
  type: 'All',
  mode: 'All',
  qual: 'All',
  exp: 'All',
  minSal: 0,
  sort: 'new',
  onlySaved: false
};

function Count({ to }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let i = 0;

    const t = setInterval(() => {
      i += Math.max(1, Math.ceil(to / 30));
      setN(Math.min(i, to));

      if (i >= to) clearInterval(t);
    }, 30);

    return () => clearInterval(t);
  }, [to]);

  return <>{n}</>;
}

const Confetti = () => (
  <div className="confetti">
    {Array.from({ length: 36 }, (_, i) => (
      <span
        key={i}
        style={{
          left: `${Math.random() * 100}%`,
          background: `hsl(${i * 37} 90% 60%)`,
          animationDelay: `${Math.random() * 0.5}s`
        }}
      />
    ))}
  </div>
);

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  const [f, setF] = useState(F0);
  const [ver, setVer] = useState(0);
  const [user, setUser] = useState(getSession());
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState('');
  const [view, setView] = useState('home');
  const [showF, setShowF] = useState(false);
  const [job, setJob] = useState(null);
  const [af, setAf] = useState({});
  const [inbox, setInbox] = useState(false);
  const [boom, setBoom] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setForm({});
  }, [modal]);

  const saved = user ? getSaved(user.id) : [];

  const jobs = useMemo(
    () => getJobs({ ...f, saved }),
    [f, ver, user]
  );

  const all = getJobs();

  const mails = user ? getMails(user.email) : [];

  const say = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const up = (k) => (e) => {
    setF({
      ...f,
      [k]: e.target.value
    });
  };

  const Sel = ({ k, label, list }) => (
    <div>
      <label>{label}</label>

      <select value={f[k]} onChange={up(k)}>
        <option>All</option>

        {list.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </div>
  );

  const submit = () => {
    try {
      const u =
        modal.mode === 'register'
          ? register(form)
          : login({
              ...form,
              role: modal.role
            });

      setUser(u);
      setModal(null);

      say(`Welcome, ${u.name}!`);

      if (u.role === 'admin') {
        setView('admin');
      }
    } catch (e) {
      say(e.message);
    }
  };

  const openApply = (j) => {
    if (!user) {
      return setModal({
        role: 'user',
        mode: 'login'
      });
    }

    if (user.role === 'admin') {
      return say('Admin apply nahi kar sakta');
    }

    setAf({
      name: user.name,
      email: user.email,
      phone: '',
      degree: QUALS[0],
      experience: EXPS[0],
      note: ''
    });

    setJob(j);
  };

  const doApply = () => {
    try {
      applyJob(user, job, af);

      setJob(null);
      setBoom(true);

      setTimeout(() => setBoom(false), 2800);

      say('Applied! 🎉 Confirmation email bhej diya');

      setVer((v) => v + 1);
    } catch (e) {
      say(e.message);
    }
  };

  const doLogout = () => {
    logout();
    setUser(null);
    setView('home');
  };

  const heart = (id) => {
    if (!user) {
      return setModal({
        role: 'user',
        mode: 'login'
      });
    }

    toggleSaved(user.id, id);

    setVer((v) => v + 1);
  };

  return (
    <>
      <nav>
        <div className="logo grad">Jobify</div>

        <div className="nav-r">
          <motion.button
            whileTap={{
              rotate: 180,
              scale: 0.8
            }}
            className="ghost"
            onClick={() =>
              setTheme(
                theme === 'light'
                  ? 'dark'
                  : 'light'
              )
            }
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </motion.button>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <button
                  className="btn"
                  onClick={() =>
                    setView(
                      view === 'admin'
                        ? 'home'
                        : 'admin'
                    )
                  }
                >
                  {view === 'admin'
                    ? 'Home'
                    : 'Admin Panel'}
                </button>
              ) : (
                <button
                  className="ghost"
                  onClick={() => setInbox(true)}
                >
                  📧 {mails.length}
                </button>
              )}

              <span className="hi">
                Hi, {user.name}
              </span>

              <button
                className="ghost"
                onClick={doLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="ghost"
                onClick={() =>
                  setModal({
                    role: 'user',
                    mode: 'login'
                  })
                }
              >
                Login
              </button>

              <button
                className="btn"
                onClick={() =>
                  setModal({
                    role: 'user',
                    mode: 'register'
                  })
                }
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {view === 'admin' && user?.role === 'admin' ? (
        <Admin
          say={say}
          onChange={() =>
            setVer((v) => v + 1)
          }
        />
      ) : (
        <>
          <header className="hero">
            <div className="blob b1" />
            <div className="blob b2" />

            <motion.h1
              initial={{
                y: 40,
                opacity: 0
              }}
              animate={{
                y: 0,
                opacity: 1
              }}
              transition={{
                duration: 0.7
              }}
            >
              Find Your{' '}
              <span className="grad">
                Dream Job
              </span>{' '}
              with Jobify
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              transition={{
                delay: 0.3
              }}
            >
              Smart filters, instant apply and
              email confirmation — all in one
              place.
            </motion.p>

            <motion.div
              className="search"
              initial={{
                scale: 0.9,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              transition={{
                delay: 0.5
              }}
            >
              <input
                placeholder="🔍 Job title, company, skill or city"
                value={f.q}
                onChange={up('q')}
              />

              <button className="btn">
                Search
              </button>
            </motion.div>

            <div className="stats">
              <div>
                <b className="grad">
                  <Count to={all.length} />
                </b>
                <span>Live Jobs</span>
              </div>

              <div>
                <b className="grad">
                  <Count
                    to={
                      new Set(
                        all.map((j) => j.company)
                      ).size
                    }
                  />
                </b>
                <span>Companies</span>
              </div>

              <div>
                <b className="grad">
                  <Count to={50} />
                  K+
                </b>
                <span>Job Seekers</span>
              </div>
            </div>
          </header>

          <div className="layout">
            <button
              className="ghost fbtn"
              onClick={() =>
                setShowF(!showF)
              }
            >
              ⚙ Filters
            </button>

            <aside
              className={`panel ${
                showF ? 'open' : ''
              }`}
            >
              <h3>Filters</h3>

              <Sel
                k="type"
                label="Job Type"
                list={TYPES}
              />

              <Sel
                k="mode"
                label="Work Mode"
                list={MODES}
              />

              <Sel
                k="qual"
                label="Degree / Qualification"
                list={QUALS}
              />

              <Sel
                k="exp"
                label="Experience"
                list={EXPS}
              />

              <div>
                <label>
                  Min Salary: ₹{f.minSal} LPA
                </label>

                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={f.minSal}
                  onChange={up('minSal')}
                />
              </div>

              <div>
                <label>Sort by</label>

                <select
                  value={f.sort}
                  onChange={up('sort')}
                >
                  <option value="new">
                    Newest
                  </option>

                  <option value="salary">
                    Highest salary
                  </option>
                </select>
              </div>

              <label className="chk">
                <input
                  type="checkbox"
                  checked={f.onlySaved}
                  onChange={(e) =>
                    setF({
                      ...f,
                      onlySaved:
                        e.target.checked
                    })
                  }
                />{' '}
                ❤️ Saved jobs only
              </label>

              <button
                className="ghost"
                onClick={() => setF(F0)}
              >
                Reset
              </button>
            </aside>

            <section>
              <p className="found">
                <b>{jobs.length}</b> jobs found
              </p>

              <div className="grid">
                <AnimatePresence>
                  {jobs.map((j, i) => (
                    <motion.div
                      key={j.id}
                      className="card"
                      layout
                      initial={{
                        opacity: 0,
                        y: 40
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8
                      }}
                      transition={{
                        delay: i * 0.05
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.02
                      }}
                    >
                      <div className="row">
                        <div className="ava">
                          {j.company[0]}
                        </div>

                        <motion.button
                          whileTap={{
                            scale: 1.5
                          }}
                          className="heart"
                          onClick={() =>
                            heart(j.id)
                          }
                        >
                          {saved.includes(j.id)
                            ? '❤️'
                            : '🤍'}
                        </motion.button>
                      </div>

                      <h3>{j.title}</h3>

                      <small>
                        {j.company} • 📍{' '}
                        {j.location}
                      </small>

                      <div className="tags">
                        <span>{j.type}</span>
                        <span>{j.mode}</span>
                        <span>
                          🎓 {j.qualification}
                        </span>
                        <span>
                          {j.experience}
                        </span>

                        {(j.tags || []).map(
                          (t) => (
                            <span
                              key={t}
                              className="sk"
                            >
                              {t}
                            </span>
                          )
                        )}
                      </div>

                      <div className="row">
                        <b>
                          {salaryText(j)}
                        </b>

                        <button
                          className="btn"
                          onClick={() =>
                            openApply(j)
                          }
                        >
                          Apply Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!jobs.length && (
                  <p
                    style={{
                      textAlign: 'center',
                      gridColumn: '1/-1'
                    }}
                  >
                    No jobs found 😕
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}

      <AnimatePresence>
        {(modal || job || inbox) && (
          <motion.div
            className="modal"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => {
              setModal(null);
              setJob(null);
              setInbox(false);
            }}
          >
            <motion.div
              className="box"
              initial={{
                scale: 0.8,
                y: 30
              }}
              animate={{
                scale: 1,
                y: 0
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {modal && (
                <>
                  <div className="tabs">
                    <button
                      className={`chip ${
                        modal.role === 'user'
                          ? 'on'
                          : ''
                      }`}
                      onClick={() =>
                        setModal({
                          role: 'user',
                          mode: 'login'
                        })
                      }
                    >
                      🧑 User
                    </button>

                    <button
                      className={`chip ${
                        modal.role === 'admin'
                          ? 'on'
                          : ''
                      }`}
                      onClick={() =>
                        setModal({
                          role: 'admin',
                          mode: 'login'
                        })
                      }
                    >
                      🛡 Admin
                    </button>
                  </div>

                  <h2 className="grad">
                    {modal.role === 'admin'
                      ? 'Admin Login'
                      : modal.mode === 'login'
                      ? 'User Login'
                      : 'Create account'}
                  </h2>

                  {modal.mode ===
                    'register' && (
                    <input
                      placeholder="Name"
                      value={form.name || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value
                        })
                      }
                    />
                  )}

                  <input
                    placeholder="Email"
                    type="email"
                    value={form.email || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value
                      })
                    }
                  />

                  <input
                    placeholder="Password"
                    type="password"
                    value={
                      form.password || ''
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password:
                          e.target.value
                      })
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      submit()
                    }
                  />

                  <button
                    className="btn"
                    onClick={submit}
                  >
                    {modal.mode ===
                    'register'
                      ? 'Sign up'
                      : 'Login'}
                  </button>

                  {/* Admin ke liye koi hint nahi */}
                  {modal.role !== 'admin' && (
                    <small
                      className="hint link"
                      onClick={() =>
                        setModal({
                          role: 'user',
                          mode:
                            modal.mode ===
                            'login'
                              ? 'register'
                              : 'login'
                        })
                      }
                    >
                      {modal.mode === 'login'
                        ? 'Naya account banao →'
                        : '← Already account hai? Login'}
                    </small>
                  )}
                </>
              )}

              {job && (
                <>
                  <h2 className="grad">
                    Apply: {job.title}
                  </h2>

                  <small>
                    {job.company} •{' '}
                    {salaryText(job)}
                  </small>

                  <input
                    placeholder="Full name"
                    value={af.name}
                    onChange={(e) =>
                      setAf({
                        ...af,
                        name: e.target.value
                      })
                    }
                  />

                  <input
                    placeholder="Email"
                    value={af.email}
                    onChange={(e) =>
                      setAf({
                        ...af,
                        email: e.target.value
                      })
                    }
                  />

                  <input
                    placeholder="Phone number"
                    value={af.phone}
                    onChange={(e) =>
                      setAf({
                        ...af,
                        phone: e.target.value
                      })
                    }
                  />

                  <select
                    value={af.degree}
                    onChange={(e) =>
                      setAf({
                        ...af,
                        degree: e.target.value
                      })
                    }
                  >
                    {QUALS.map((q) => (
                      <option key={q}>
                        {q}
                      </option>
                    ))}
                  </select>

                  <select
                    value={af.experience}
                    onChange={(e) =>
                      setAf({
                        ...af,
                        experience:
                          e.target.value
                      })
                    }
                  >
                    {EXPS.map((q) => (
                      <option key={q}>
                        {q}
                      </option>
                    ))}
                  </select>

                  <textarea
                    rows="2"
                    placeholder="Cover note (optional)"
                    value={af.note}
                    onChange={(e) =>
                      setAf({
                        ...af,
                        note: e.target.value
                      })
                    }
                  />

                  <button
                    className="btn"
                    onClick={doApply}
                  >
                    Submit Application 🚀
                  </button>
                </>
              )}

              {inbox && (
                <>
                  <h2 className="grad">
                    📧 My Inbox
                  </h2>

                  <div className="mails">
                    {mails.map((m) => (
                      <div
                        key={m.id}
                        className="mail"
                      >
                        <b>{m.subject}</b>

                        <p>{m.message}</p>

                        <small>
                          {new Date(
                            m.date
                          ).toLocaleString()}
                        </small>
                      </div>
                    ))}

                    {!mails.length && (
                      <p>
                        Abhi koi email nahi
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {boom && <Confetti />}

      {toast && (
        <motion.div
          className="toast"
          initial={{
            y: 40,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
        >
          {toast}
        </motion.div>
      )}

      <footer>
        © 2026 Jobify • Built with React ❤️
      </footer>
    </>
  );
}