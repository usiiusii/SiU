import React, { useState, useEffect, useCallback, useMemo, FC, CSSProperties } from 'react';
import ReactDOM from 'react-dom/client';

// --- DATA TYPES ---
interface Video {
  id: string;
  title: string;
  teacher: string;
  date: string;
  telegramLink: string;
}

interface Post {
  id: string;
  text: string;
  imageUrl: string;
  date: string;
}

interface Teacher {
  id: string;
  name: string;
  bio: string;
}

interface AppData {
  videos: Video[];
  posts: Post[];
  teachers: Teacher[];
  schedule: string;
  courseHistory: string;
  contactViber: string;
  customFontCss: string;
  customFontFamily: string;
}

// --- TRANSLATIONS (i18n) ---
const translations = {
  en: {
    welcome: "Welcome from the Pali Speaking Course",
    appName: "Pali Speaking",
    courseVideos: "Course Videos",
    teachers: "Teachers",
    schedule: "Schedule",
    posts: "Posts",
    courseHistory: "Course History",
    contact: "Contact",
    adminLogin: "Admin",
    adminPanel: "Admin Panel",
    logout: "Logout",
    searchByTeacher: "Search by teacher name...",
    searchByDate: "Search by date (YYYY-MM-DD)...",
    openInTelegram: "Open in Telegram",
    lightMode: "Day Mode",
    darkMode: "Dark Mode",
    username: "Enter your name",
    login: "Enter",
    adminLoginTitle: "Admin Login",
    password: "Password",
    // Admin Panel
    manageVideos: "Manage Videos",
    addVideo: "Add Video",
    videoTitle: "Video Title",
    teacherName: "Teacher Name",
    date: "Date",
    telegramLink: "Telegram Link",
    managePosts: "Manage Posts",
    addPost: "Add Post",
    postText: "Post Text",
    postImageURL: "Image URL",
    manageTeachers: "Manage Teachers",
    addTeacher: "Add Teacher",
    teacherBio: "Teacher Bio",
    manageSchedule: "Manage Schedule",
    scheduleContent: "Schedule Content (HTML allowed)",
    manageHistory: "Manage Course History",
    historyContent: "History Content (HTML allowed)",
    manageContact: "Manage Contact Info",
    viberNumber: "Viber Number",
    manageAppearance: "Manage Appearance",
    customFontCss: "Custom Font CSS (@font-face)",
    customFontFamily: "Font Family Name",
    saveChanges: "Save Changes",
    edit: "Edit",
    delete: "Delete",
    installApp: "Install App",
    notification: "New content added!",
  },
  my: {
    welcome: "ပါဠိစကားပြောသင်တန်းက ကြိုဆိုပါတယ်",
    appName: "ပါဠိစကားပြော",
    courseVideos: "သင်တန်းဗီဒီယို",
    teachers: "ဆရာစာရင်း",
    schedule: "သင်တန်းအချိန်စာရင်း",
    posts: "ပိုစ်များ",
    courseHistory: "သင်တန်းသမိုင်း",
    contact: "ဆက်သွယ်ရန်",
    adminLogin: "အတ်ဒမင်",
    adminPanel: "အတ်ဒမင် စီမံခန့်ခွဲမှု",
    logout: "ထွက်ရန်",
    searchByTeacher: "ဆရာနာမည်ဖြင့်ရှာပါ...",
    searchByDate: "ရက်စွဲဖြင့်ရှာပါ (YYYY-MM-DD)...",
    openInTelegram: "တယ်လီဂရမ်တွင်ဖွင့်ပါ",
    lightMode: "နေ့မုဒ်",
    darkMode: "ညမုဒ်",
    username: "သင်၏အမည်ကိုထည့်ပါ",
    login: "ဝင်ရန်",
    adminLoginTitle: "အတ်ဒမင် လော့ဂ်အင်",
    password: "စကားဝှက်",
    manageVideos: "ဗီဒီယိုများ စီမံရန်",
    addVideo: "ဗီဒီယိုထည့်ရန်",
    videoTitle: "ဗီဒီယို ခေါင်းစဉ်",
    teacherName: "ဆရာအမည်",
    date: "ရက်စွဲ",
    telegramLink: "တယ်လီဂရမ် လင့်ခ်",
    managePosts: "ပိုစ်များ စီမံရန်",
    addPost: "ပိုစ်တင်ရန်",
    postText: "စာ",
    postImageURL: "ဓာတ်ပုံ လင့်ခ်",
    manageTeachers: "ဆရာများ စီမံရန်",
    addTeacher: "ဆရာထည့်ရန်",
    teacherBio: "ဆရာ၏ အကြောင်း",
    manageSchedule: "အချိန်စာရင်း စီမံရန်",
    scheduleContent: "အချိန်စာရင်း အကြောင်းအရာ",
    manageHistory: "သမိုင်း စီမံရန်",
    historyContent: "သမိုင်း အကြောင်းအရာ",
    manageContact: "ဆက်သွယ်ရန် အချက်အလက် စီမံရန်",
    viberNumber: "Viber ဖုန်းနံပါတ်",
    manageAppearance: "ပုံပန်းသွင်ပြင် စီမံရန်",
    customFontCss: "စိတ်ကြိုက်ဖောင့် CSS (@font-face)",
    customFontFamily: "ဖောင့်အမည်",
    saveChanges: "သိမ်းဆည်းရန်",
    edit: "ပြင်ရန်",
    delete: "ဖျက်ရန်",
    installApp: "အင်စတောလုပ်ပါ",
    notification: "အကြောင်းအရာအသစ် ထည့်လိုက်ပါပြီ!",
  },
};

// --- HOOKS ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

// --- UTILITIES ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const notificationSound = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGliAvTRqP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////P/P4wIAA/sEzgQAGB4GEYAgsAgABb72B7+0th4+3d2s/9+d9/2ZkUSsSSWRJdFDifAYyVv/9g0iFISBEP//+GmM/+nZ/+1QECBf//+T5+/wE8pv/1p//+n+//9wEA8Pv//+M1//8AABAQD8//3QABAAAABAAAAAQAQAAAP/////+P/8BAAD//0CAAAAAAABAAABAAAAP//+QAAAD//4EAAAAAAAQAAAQAAAD//5gAAAP//gQAAAAAABAAAA//sBAAD//4EAAAAAAAAQAA//8CAQD//8GAAAAAAAAEAAAAAABAAEAAAAAABAQD8//3QABAAAAAAAAAAAAQD//gAAAAAAABAAAAAAAABAAAAAQABAAAAAAAQD//gAAAAAAAAAAAAQAAABAAAAAABAAQAD8//3QABAAAAAAAQD/8gAAAAAAAAAAQAAAD//4AAAAAAAAAEAAAEAAAEAAAAAABAQD8//3QAAAAAAAAAAAAAABAAAAAAAQAAAAAAAAAAEA//4AAAAAAAAAEAAAAAAAABAAAAAAAQD8//3QAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQD//gAAAAAAAAAAAAQAAAAAAAAAEAAAQD8//3QAAAAAAAAAAAAAAAAABAAAAAABAAAAAAAQD//gAAAAAAAAAABAAAAAAAQD8//3QAAAAAAAAAAAAAAAAAAABAAAAAQAAAAAQD//4EAAAAAAAQAAAAAAAAA/8A';

// --- STYLES ---
const styles: { [key: string]: CSSProperties } = {
    glassButton: {
        padding: '12px 24px',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
    },
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    header: {
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    mainContent: {
        flex: 1,
        padding: '2rem',
        animation: 'slideIn 0.5s ease-out forwards'
    },
    card: {
        padding: '1.5rem',
        marginBottom: '1.5rem',
        animation: 'slideIn 0.5s ease-out forwards'
    },
    input: {
        width: 'calc(100% - 24px)',
        padding: '12px',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: '#333'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    modalContent: {
        width: '90%',
        maxWidth: '500px',
        padding: '2rem',
    },
};

// --- UI COMPONENTS ---
const GlassButton: FC<{ onClick?: () => void; children: React.ReactNode; style?: CSSProperties; className?: string, type?: 'button'|'submit'|'reset' }> = ({ onClick, children, style, className, type = 'button' }) => (
    <button onClick={onClick} style={{ ...styles.glassButton, ...style }} className={`glass-effect ${className || ''}`} type={type}>
        {children}
    </button>
);

const Modal: FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} className="glass-effect" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

const LanguageToggle: FC<{ lang: string; setLang: (lang: string) => void }> = ({ lang, setLang }) => {
    const isMy = lang === 'my';
    const toggleStyle: CSSProperties = {
        position: 'relative',
        width: '100px',
        height: '40px',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontWeight: 'bold'
    };
    const indicatorStyle: CSSProperties = {
        position: 'absolute',
        top: '2px',
        left: isMy ? '52px' : '2px',
        width: '46px',
        height: '36px',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: '18px',
        transition: 'left 0.3s ease-in-out',
        zIndex: 1,
    };
    const textStyle: CSSProperties = { zIndex: 2, fontSize: '0.8rem' };
    return (
        <div style={toggleStyle} className="glass-effect" onClick={() => setLang(isMy ? 'en' : 'my')}>
            <div style={indicatorStyle}></div>
            <span style={textStyle}>EN</span>
            <span style={textStyle}>MY</span>
        </div>
    );
};

const ThemeToggle: FC<{ theme: string; toggleTheme: () => void; t: (key: string) => string }> = ({ theme, toggleTheme, t }) => {
    return (
        <GlassButton onClick={toggleTheme} className="gradient-text-dark-only">
            {theme === 'light' ? t('darkMode') : t('lightMode')}
        </GlassButton>
    );
};

const Notification: FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const style: CSSProperties = {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 2rem',
        zIndex: 3000,
        fontWeight: 'bold',
        animation: 'slideIn 0.5s ease-out'
    };

    return <div style={style} className="glass-effect gradient-text">{message}</div>;
};

// --- APP SECTIONS/PAGES ---
const AdminPanel: FC<{ data: AppData; setData: (data: AppData) => void; t: (key: string) => string; notify: () => void }> = ({ data, setData, t, notify }) => {
    const [formData, setFormData] = useState(data);
    useEffect(() => setFormData(data), [data]);

    const handleSave = () => {
        setData(formData);
        alert('Changes saved!');
    };
    
    const createHandler = <T, K extends keyof T>(section: keyof AppData, item: T, key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedItems = (formData[section] as any[]).map(i => i.id === (item as any).id ? { ...i, [key]: e.target.value } : i);
        setFormData(prev => ({ ...prev, [section]: updatedItems }));
    };

    const add = (section: keyof AppData, newItem: any) => {
        setFormData(prev => ({...prev, [section]: [newItem, ...(prev[section] as any[])]}));
        notify();
    }
    const remove = (section: keyof AppData, id: string) => {
        if(confirm('Are you sure you want to delete this?')) {
            setFormData(prev => ({...prev, [section]: (prev[section] as any[]).filter(i => i.id !== id)}));
        }
    }
    
    return (
        <div style={{...styles.card, animation: 'none'}}>
            <h1 className="gradient-text">{t('adminPanel')}</h1>

            {/* Videos */}
            <section style={styles.card}>
                <h2 className="gradient-text">{t('manageVideos')}</h2>
                <GlassButton onClick={() => add('videos', {id: generateId(), title: '', teacher: '', date: '', telegramLink: ''})}>{t('addVideo')}</GlassButton>
                {formData.videos.map(video => (
                    <div key={video.id} style={{ ...styles.card, marginTop: '1rem' }}>
                         <input style={styles.input} placeholder={t('videoTitle')} value={video.title} onChange={createHandler('videos', video, 'title')} />
                         <input style={styles.input} placeholder={t('teacherName')} value={video.teacher} onChange={createHandler('videos', video, 'teacher')} />
                         <input style={styles.input} type="date" value={video.date} onChange={createHandler('videos', video, 'date')} />
                         <input style={styles.input} placeholder={t('telegramLink')} value={video.telegramLink} onChange={createHandler('videos', video, 'telegramLink')} />
                         <GlassButton onClick={() => remove('videos', video.id)}>{t('delete')}</GlassButton>
                    </div>
                ))}
            </section>
            
             {/* Posts */}
            <section style={styles.card}>
                <h2 className="gradient-text">{t('managePosts')}</h2>
                <GlassButton onClick={() => add('posts', {id: generateId(), text: '', imageUrl: '', date: new Date().toISOString()})}>{t('addPost')}</GlassButton>
                {formData.posts.map(post => (
                    <div key={post.id} style={{ ...styles.card, marginTop: '1rem' }}>
                         <textarea style={{...styles.input, height: '100px'}} placeholder={t('postText')} value={post.text} onChange={createHandler('posts', post, 'text')} />
                         <input style={styles.input} placeholder={t('postImageURL')} value={post.imageUrl} onChange={createHandler('posts', post, 'imageUrl')} />
                         <GlassButton onClick={() => remove('posts', post.id)}>{t('delete')}</GlassButton>
                    </div>
                ))}
            </section>

             {/* Other settings */}
            <section style={styles.card}>
                 <h2 className="gradient-text">{t('manageTeachers')}</h2>
                 <GlassButton onClick={() => add('teachers', {id: generateId(), name: '', bio: ''})}>{t('addTeacher')}</GlassButton>
                 {formData.teachers.map(teacher => (
                    <div key={teacher.id} style={{ ...styles.card, marginTop: '1rem' }}>
                        <input style={styles.input} placeholder={t('teacherName')} value={teacher.name} onChange={createHandler('teachers', teacher, 'name')} />
                        <textarea style={{...styles.input, height: '80px'}} placeholder={t('teacherBio')} value={teacher.bio} onChange={createHandler('teachers', teacher, 'bio')} />
                        <GlassButton onClick={() => remove('teachers', teacher.id)}>{t('delete')}</GlassButton>
                    </div>
                 ))}
            </section>
            <section style={styles.card}>
                <h2 className="gradient-text">{t('manageSchedule')}</h2>
                <textarea style={{...styles.input, height: '150px'}} placeholder={t('scheduleContent')} value={formData.schedule} onChange={e => setFormData(p => ({...p, schedule: e.target.value}))} />
            </section>
             <section style={styles.card}>
                <h2 className="gradient-text">{t('manageHistory')}</h2>
                <textarea style={{...styles.input, height: '150px'}} placeholder={t('historyContent')} value={formData.courseHistory} onChange={e => setFormData(p => ({...p, courseHistory: e.target.value}))} />
            </section>
            <section style={styles.card}>
                <h2 className="gradient-text">{t('manageContact')}</h2>
                <input style={styles.input} placeholder={t('viberNumber')} value={formData.contactViber} onChange={e => setFormData(p => ({...p, contactViber: e.target.value}))} />
            </section>
            <section style={styles.card}>
                <h2 className="gradient-text">{t('manageAppearance')}</h2>
                <p>Paste a full @font-face rule from a service like Google Fonts.</p>
                <textarea style={{...styles.input, height: '150px'}} placeholder={t('customFontCss')} value={formData.customFontCss} onChange={e => setFormData(p => ({...p, customFontCss: e.target.value}))} />
                <p>Enter the exact 'font-family' name from the rule above.</p>
                <input style={styles.input} placeholder={t('customFontFamily')} value={formData.customFontFamily} onChange={e => setFormData(p => ({...p, customFontFamily: e.target.value}))} />
            </section>

            <GlassButton onClick={handleSave} style={{width: '100%', padding: '1.5rem', fontSize: '1.2rem'}} className="gradient-text">{t('saveChanges')}</GlassButton>
        </div>
    );
};

const VideosPage: FC<{ videos: Video[]; t: (key: string) => string }> = ({ videos, t }) => {
    const [teacherSearch, setTeacherSearch] = useState('');
    const [dateSearch, setDateSearch] = useState('');

    const filteredVideos = useMemo(() => videos
        .filter(v => v.teacher.toLowerCase().includes(teacherSearch.trim().toLowerCase()))
        .filter(v => v.date.includes(dateSearch))
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [videos, teacherSearch, dateSearch]
    );

    return (
        <div>
            <h1 className="gradient-text">{t('courseVideos')}</h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <input style={styles.input} placeholder={t('searchByTeacher')} value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} />
                <input style={styles.input} type="text" placeholder={t('searchByDate')} value={dateSearch} onChange={e => setDateSearch(e.target.value)} />
            </div>
            {filteredVideos.map(video => (
                <div key={video.id} style={styles.card} className="glass-effect">
                    <h2 className="gradient-text">{video.title}</h2>
                    <p><strong>{t('teacherName')}:</strong> {video.teacher}</p>
                    <p><strong>{t('date')}:</strong> {new Date(video.date).toLocaleDateString()}</p>
                    <GlassButton onClick={() => window.open(video.telegramLink, '_blank')} className="gradient-text-dark-only">{t('openInTelegram')}</GlassButton>
                </div>
            ))}
        </div>
    );
};

const PostsPage: FC<{ posts: Post[]; t: (key: string) => string }> = ({ posts, t }) => {
     const sortedPosts = useMemo(() => posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [posts]);
    return (
        <div>
            <h1 className="gradient-text">{t('posts')}</h1>
            {sortedPosts.map(post => (
                <div key={post.id} style={styles.card} className="glass-effect">
                    {post.imageUrl && <img src={post.imageUrl} alt="Post image" style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} />}
                    <p style={{ whiteSpace: 'pre-wrap' }}>{post.text}</p>
                    <small>{new Date(post.date).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
};

const GenericPage: FC<{ title: string; content: string }> = ({ title, content }) => (
    <div>
        <h1 className="gradient-text">{title}</h1>
        <div style={styles.card} className="glass-effect" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
);

const TeachersPage: FC<{ teachers: Teacher[]; t: (key: string) => string }> = ({ teachers, t }) => (
     <div>
        <h1 className="gradient-text">{t('teachers')}</h1>
        {teachers.map(teacher => (
            <div key={teacher.id} style={styles.card} className="glass-effect">
                <h2 className="gradient-text">{teacher.name}</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{teacher.bio}</p>
            </div>
        ))}
    </div>
);

const UserLoginScreen: FC<{ onLogin: (name: string) => void; t: (key: string) => string }> = ({ onLogin, t }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) onLogin(name.trim());
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
            <form onSubmit={handleSubmit} style={{...styles.card, width: '100%', maxWidth: '400px'}} className="glass-effect">
                <h2 className="gradient-text">{t('welcome')}</h2>
                <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder={t('username')} autoFocus />
                <GlassButton type="submit" style={{width: '100%'}} className="gradient-text-dark-only">{t('login')}</GlassButton>
            </form>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const [lang, setLang] = useLocalStorage('lang', 'my');
    const [user, setUser] = useLocalStorage('user', null);
    const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
    const [data, setData] = useLocalStorage<AppData>('appData', {
        videos: [], posts: [], teachers: [], schedule: '', courseHistory: '', contactViber: '+123456789', customFontCss: '', customFontFamily: ''
    });
    
    const [activePage, setActivePage] = useState('videos');
    const [isAdminModalOpen, setAdminModalOpen] = useState(false);
    const [password, setPassword] = useState('');

    const [notification, setNotification] = useState('');
    const audio = useMemo(() => new Audio(notificationSound), []);

    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredInstallPrompt(e);
        });
    }, []);

    const handleInstallClick = () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                setDeferredInstallPrompt(null);
            });
        }
    };

    const notify = useCallback(() => {
        setNotification(translations[lang as 'en'|'my'].notification);
        audio.play().catch(e => console.error("Audio play failed:", e));
    }, [lang, audio]);
    
    const t = useCallback((key: string) => translations[lang as 'en'|'my'][key as keyof typeof translations.en] || key, [lang]);

    useEffect(() => {
        document.body.className = `${theme}-mode`;
        document.documentElement.lang = lang;
    }, [theme, lang]);

    useEffect(() => {
        if(data.customFontFamily) {
             document.documentElement.style.setProperty('--font-family-main', data.customFontFamily);
        }
    }, [data.customFontFamily]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleAdminLogin = () => {
        if (password === 'sivali') {
            setIsAdmin(true);
            setAdminModalOpen(false);
            setPassword('');
            setActivePage('admin');
        } else {
            alert('Incorrect password');
        }
    };
    
    const logout = () => {
        setIsAdmin(false);
        setUser(null);
    }
    
    const renderPage = () => {
        switch (activePage) {
            case 'videos': return <VideosPage videos={data.videos} t={t} />;
            case 'posts': return <PostsPage posts={data.posts} t={t} />;
            case 'teachers': return <TeachersPage teachers={data.teachers} t={t} />;
            case 'schedule': return <GenericPage title={t('schedule')} content={data.schedule} />;
            case 'history': return <GenericPage title={t('courseHistory')} content={data.courseHistory} />;
            case 'admin': return isAdmin ? <AdminPanel data={data} setData={setData} t={t} notify={notify} /> : <p>Access Denied</p>;
            default: return <VideosPage videos={data.videos} t={t} />;
        }
    };

    if (!user) {
        return (
             <>
                <UserLoginScreen onLogin={setUser} t={t} />
                <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 10 }}>
                    <GlassButton onClick={() => setAdminModalOpen(true)}>{t('adminLogin')}</GlassButton>
                </div>
                <Modal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)}>
                    <h2 className="gradient-text">{t('adminLoginTitle')}</h2>
                    <input style={{...styles.input, backgroundColor: 'white'}} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password')} />
                    <GlassButton onClick={handleAdminLogin} style={{width: '100%'}} className="gradient-text-dark-only">{t('login')}</GlassButton>
                </Modal>
            </>
        );
    }

    return (
        <div style={styles.appContainer}>
            <style>{data.customFontCss}</style>
            {notification && <Notification message={notification} onDismiss={() => setNotification('')} />}

            <header style={styles.header} className="glass-effect">
                <h1 className="gradient-text" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setActivePage('videos')}>{t('appName')}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                     <LanguageToggle lang={lang} setLang={setLang} />
                     <ThemeToggle theme={theme} toggleTheme={toggleTheme} t={t} />
                     {isAdmin && <GlassButton onClick={() => setActivePage('admin')} className="gradient-text-dark-only">{t('adminPanel')}</GlassButton>}
                     {isAdmin ? <GlassButton onClick={logout} className="gradient-text-dark-only">{t('logout')}</GlassButton> :
                        <div style={{position: 'relative', top: '-10000px'}}> 
                           <GlassButton onClick={() => setAdminModalOpen(true)}>{t('adminLogin')}</GlassButton>
                        </div>
                     }
                </div>
            </header>

            <nav style={{ padding: '0 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <GlassButton onClick={() => setActivePage('videos')} className="gradient-text-dark-only">{t('courseVideos')}</GlassButton>
                <GlassButton onClick={() => setActivePage('teachers')} className="gradient-text-dark-only">{t('teachers')}</GlassButton>
                <GlassButton onClick={() => setActivePage('schedule')} className="gradient-text-dark-only">{t('schedule')}</GlassButton>
                <GlassButton onClick={() => setActivePage('posts')} className="gradient-text-dark-only">{t('posts')}</GlassButton>
                <GlassButton onClick={() => setActivePage('history')} className="gradient-text-dark-only">{t('courseHistory')}</GlassButton>
                <GlassButton onClick={() => alert(`${t('contact')}: ${data.contactViber}`)} className="gradient-text-dark-only">{t('contact')}</GlassButton>
                {deferredInstallPrompt && <GlassButton onClick={handleInstallClick} className="gradient-text">{t('installApp')}</GlassButton>}
            </nav>

            <main style={styles.mainContent}>
                {renderPage()}
            </main>

            <Modal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)}>
                 <h2 className="gradient-text">{t('adminLoginTitle')}</h2>
                 <input style={{...styles.input, backgroundColor: 'white'}} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password')} />
                 <GlassButton onClick={handleAdminLogin} style={{width: '100%'}} className="gradient-text-dark-only">{t('login')}</GlassButton>
            </Modal>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
}