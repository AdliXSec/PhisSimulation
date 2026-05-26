import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiOutlineGlobeAlt, 
  HiOutlineTrash, 
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import StepWizard from '../../components/wizard/StepWizard';
import './Osint.css';

const WIZARD_STEPS = [
  { label: 'Data Target' },
  { label: 'Data OSINT' },
];

export default function Osint() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for form
  const [showForm, setShowForm] = useState(false);
  const [osintForm, setOsintForm] = useState({ target_name: '', target_role: '', public_data: '' });
  const [osintUrl, setOsintUrl] = useState('');
  const [isOsintLoading, setIsOsintLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [step, setStep] = useState(0);
  
  // State for detail view
  const [selectedProfile, setSelectedProfile] = useState(null);

  const loadProfiles = useCallback(async () => {
    try {
      const res = await api.get('/osint');
      setProfiles(res.data);
    } catch (err) {
      if (loading) toast.error('Gagal memuat profil OSINT');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { loadProfiles(); }, []);

  // Real-time polling every 5 seconds
  usePolling(loadProfiles, 5000);

  const handleOsintScrape = async () => {
    if (!osintUrl) return toast.error("Masukkan URL terlebih dahulu");
    setIsScraping(true);
    toast.loading("Scraping URL...", { id: 'scrape' });
    try {
      const res = await api.post('/osint/scrape', { url: osintUrl });
      setOsintForm(prev => ({ 
        ...prev, 
        public_data: prev.public_data ? `${prev.public_data}\n\n[Scraped from ${osintUrl}]:\n${res.data.text}` : `[Scraped from ${osintUrl}]:\n${res.data.text}`
      }));
      setOsintUrl('');
      toast.success("Berhasil mengekstrak teks dari URL", { id: 'scrape' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal melakukan scraping", { id: 'scrape' });
    } finally {
      setIsScraping(false);
    }
  };

  const handleOsintAnalyze = async (e) => {
    e.preventDefault();
    if (!osintForm.target_name || !osintForm.public_data) return toast.error("Nama dan data OSINT wajib diisi!");
    
    setIsOsintLoading(true);
    toast.loading("AI sedang menganalisis jejak digital...", { id: 'osint' });
    try {
      const res = await api.post('/osint/analyze', osintForm);
      toast.success("Analisis OSINT Selesai & Disimpan!", { id: 'osint' });
      setOsintForm({ target_name: '', target_role: '', public_data: '' });
      setSelectedProfile(res.data);
      setShowForm(false);
      setStep(0);
      loadProfiles(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal melakukan analisis", { id: 'osint' });
    } finally {
      setIsOsintLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Yakin ingin menghapus profil OSINT ini?")) return;
    try {
      await api.delete(`/osint/${id}`);
      toast.success("Profil dihapus");
      if (selectedProfile?.id === id) setSelectedProfile(null);
      loadProfiles();
    } catch (err) {
      toast.error("Gagal menghapus profil");
    }
  };

  const renderDetail = () => {
    if (!selectedProfile) return null;
    return (
      <div className="osint-detail card card-glow slide-up">
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ color: 'var(--neon-cyan)' }}>{selectedProfile.target_name}</h2>
          <button className="btn btn-secondary" onClick={() => setSelectedProfile(null)}>Tutup</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Jabatan: {selectedProfile.target_role || '-'}</p>

        <div className="risk-banner" style={{ 
          borderColor: selectedProfile.risk_level === 'CRITICAL' ? 'var(--danger)' : selectedProfile.risk_level === 'HIGH' ? 'var(--warning)' : 'var(--neon-purple)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)'
        }}>
          <h3 style={{ color: selectedProfile.risk_level === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)', marginBottom: '8px' }}>
            RISIKO: {selectedProfile.risk_level}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            {selectedProfile.vulnerability_summary}
          </p>
        </div>

        <div className="intel-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '10px' }}>Vektor Serangan (Attack Vectors)</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {selectedProfile.attack_vectors?.map((vec, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{vec}</li>
            ))}
          </ul>
        </div>

        <div className="intel-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-md)', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', marginBottom: 'var(--space-md)' }}>
          <h4 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Draf Spear Phishing (AI Generated)</h4>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', width: '100%' }}>
            <p><strong>From:</strong> {selectedProfile.example_phishing_email?.sender}</p>
            <p><strong>Subject:</strong> {selectedProfile.example_phishing_email?.subject}</p>
            <hr style={{ borderColor: 'var(--border)', margin: '10px 0' }} />
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {selectedProfile.example_phishing_email?.body}
            </div>
          </div>
        </div>

        <div className="intel-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-md)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Data Mentah (OSINT Input)</h4>
          <pre style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
            {selectedProfile.public_data}
          </pre>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1><HiOutlineGlobeAlt size={28} style={{ verticalAlign: 'bottom', marginRight: '10px', color: 'var(--neon-cyan)' }}/> OSINT & Spear Phishing</h1>
          <p>Kumpulkan jejak digital target dan simulasikan serangan *Social Engineering*</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelectedProfile(null); setStep(0); setOsintForm({ target_name: '', target_role: '', public_data: '' }); }}>
            <HiOutlinePlus size={18} /> Profil Baru
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card card-glow slide-down">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h2>Buat Profil OSINT Baru</h2>
          </div>
          
          <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
            Simulasikan bagaimana peretas mengumpulkan jejak digital (OSINT) untuk menyusun serangan <i>Spear Phishing</i> yang sangat terpersonalisasi.
          </p>

          <StepWizard steps={WIZARD_STEPS} currentStep={step} onStepClick={(i) => { if (i <= step) setStep(i); }} />

          <form onSubmit={handleOsintAnalyze} className="osint-form">
            {/* ===== STEP 1: Data Target ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>🎯 Data Target</h3>
                  <p>Masukkan informasi dasar mengenai target Anda</p>
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label>Nama Target</label>
                    <input type="text" className="input" placeholder="Misal: Budi Santoso" value={osintForm.target_name} onChange={e => setOsintForm({...osintForm, target_name: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Jabatan Target</label>
                    <input type="text" className="input" placeholder="Misal: Manager HRD" value={osintForm.target_role} onChange={e => setOsintForm({...osintForm, target_role: e.target.value})} />
                  </div>
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!osintForm.target_name.trim()} onClick={() => setStep(1)}>
                      Selanjutnya <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Data OSINT ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>🕵️‍♂️ Data OSINT</h3>
                  <p>Kumpulkan dan masukkan jejak digital target</p>
                </div>

                <div className="input-group">
                  <label>URL Scraping (Opsional)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="url" className="input" placeholder="Masukkan URL publik untuk di-scrape..." value={osintUrl} onChange={e => setOsintUrl(e.target.value)} />
                    <button type="button" className="btn btn-secondary" onClick={handleOsintScrape} disabled={isScraping || !osintUrl}>
                      {isScraping ? '...' : 'Scrape'}
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Gunakan untuk mengambil teks dari artikel berita, blog, atau profil publik.</small>
                </div>

                <div className="input-group">
                  <label>Data Jejak Digital (Manual / Hasil Scrape)</label>
                  <textarea 
                    className="input" 
                    rows="6" 
                    placeholder="Masukkan postingan terakhir di medsos, hobi, masalah yang sedang dihadapi, atau hasil scraping..." 
                    value={osintForm.public_data} 
                    onChange={e => setOsintForm({...osintForm, public_data: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> Sebelumnya
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary" disabled={isOsintLoading || !osintForm.public_data.trim()}>
                      {isOsintLoading ? <span className="spinner"></span> : '>> JALANKAN AI PROFILER'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="osint-layout">
          <div className="osint-list card card-glow">
            <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--neon-cyan)' }}>Riwayat Profiling</h3>
            {profiles.length === 0 ? (
              <div className="empty-state">Belum ada riwayat profil OSINT.</div>
            ) : (
              <div className="profile-list">
                {profiles.map(p => (
                  <div 
                    key={p.id} 
                    className={`profile-item ${selectedProfile?.id === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedProfile(p)}
                  >
                    <div className="profile-info">
                      <strong>{p.target_name}</strong>
                      <span className="role">{p.target_role || 'No Role'}</span>
                    </div>
                    <div className="profile-actions">
                      <span className={`badge ${p.risk_level === 'CRITICAL' ? 'badge-danger' : p.risk_level === 'HIGH' ? 'badge-warning' : 'badge-default'}`}>
                        {p.risk_level}
                      </span>
                      <button className="delete-btn" title="Hapus Profil" onClick={(e) => handleDelete(e, p.id)}>
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="osint-content">
            {selectedProfile ? (
              renderDetail()
            ) : (
              <div className="empty-state card card-glow" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Pilih profil di sebelah kiri untuk melihat detail analisis.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
