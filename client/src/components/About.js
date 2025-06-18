import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, Clock } from 'lucide-react';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Award size={40} />,
      title: t('about.experience'),
      description: t('about.experienceDesc')
    },
    // {
    //   icon: <Shield size={40} />,
    //   title: t('about.certificates'),
    //   description: t('about.certificatesDesc')
    // },
    {
      icon: <Clock size={40} />,
      title: t('about.materials'),
      description: t('about.materialsDesc')
    }
  ];

  return (
    <section id="about" className="about">
      <div className="about-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="about-header"
        >
          <h2 className="about-title">{t('about.title')}</h2>
          <div className="about-underline"></div>
        </motion.div>

        <div className="about-content">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="about-text"
          >
            <p className="about-description">{t('about.description')}</p>
            
            <div className="about-features">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="about-feature"
                >
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="about-image"
          >
            <div className="about-image-placeholder">
              <div className="master-portrait">
                <div className="portrait-circle">
                  <div className="portrait-icon">👩‍🎨</div>
                </div>
                <div className="portrait-decoration">
                  <div className="decoration-dot"></div>
                  <div className="decoration-dot"></div>
                  <div className="decoration-dot"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About; 