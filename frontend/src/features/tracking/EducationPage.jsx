import { useParams } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineExclamationTriangle, HiOutlineLightBulb } from 'react-icons/hi2';
import './Education.css';

export default function EducationPage() {
  const { token } = useParams();

  return (
    <div className="education-page">
      <div className="education-container fade-in">
        <div className="education-icon">
          <HiOutlineShieldCheck size={56} />
        </div>

        <h1>🎯 Ini Adalah Simulasi Phishing</h1>
        <p className="education-subtitle">
          Email yang baru saja Anda klik adalah bagian dari <strong>program pelatihan kesadaran keamanan</strong> internal perusahaan.
          Tidak ada data Anda yang disimpan atau disalahgunakan.
        </p>

        <div className="education-cards">
          <div className="edu-card warning">
            <HiOutlineExclamationTriangle size={28} />
            <h3>Apa yang Terjadi?</h3>
            <p>Anda menerima email simulasi phishing dan mengeklik tautan di dalamnya. Di dunia nyata, tindakan ini bisa membahayakan data pribadi dan perusahaan Anda.</p>
          </div>

          <div className="edu-card tips">
            <HiOutlineLightBulb size={28} />
            <h3>Tips Mengenali Phishing</h3>
            <ul>
              <li>✅ Periksa alamat pengirim email — apakah domain-nya resmi?</li>
              <li>✅ Waspadai bahasa yang menimbulkan urgensi atau tekanan</li>
              <li>✅ Jangan klik tautan mencurigakan — arahkan kursor untuk melihat URL asli</li>
              <li>✅ Jangan pernah memasukkan password di halaman yang tidak Anda kenal</li>
              <li>✅ Laporkan email mencurigakan ke tim IT/Security</li>
            </ul>
          </div>
        </div>

        <div className="education-footer">
          <p>Jika Anda memiliki pertanyaan, hubungi tim Keamanan Informasi perusahaan.</p>
          <p className="education-token">Tracking ID: {token}</p>
        </div>
      </div>
    </div>
  );
}
