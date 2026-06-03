import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineShieldCheck, HiOutlineExclamationTriangle, HiOutlineLightBulb } from 'react-icons/hi2';
import './Education.css';

export default function EducationPage() {
  const { token } = useParams();
  const { t } = useTranslation();

  return (
    <div className="education-page">
      <div className="education-container fade-in">
        <div className="education-icon">
          <HiOutlineShieldCheck size={56} />
        </div>

        <h1>{t('education_page.title')}</h1>
        <p className="education-subtitle">
          {t('education_page.subtitle_1')}<strong>{t('education_page.subtitle_strong')}</strong>{t('education_page.subtitle_2')}
        </p>

        <div className="education-cards">
          <div className="edu-card warning">
            <HiOutlineExclamationTriangle size={28} />
            <h3>{t('education_page.card1_title')}</h3>
            <p>{t('education_page.card1_desc')}</p>
          </div>

          <div className="edu-card tips">
            <HiOutlineLightBulb size={28} />
            <h3>{t('education_page.card2_title')}</h3>
            <ul>
              {t('education_page.tips', { returnObjects: true }).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="education-footer">
          <p>{t('education_page.footer')}</p>
          <p className="education-token">{t('education_page.tracking_id')}{token}</p>
        </div>
      </div>
    </div>
  );
}
