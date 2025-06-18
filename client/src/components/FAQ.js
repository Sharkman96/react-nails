import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SEO from './SEO';
import { createFAQSchema } from '../utils/schema';
import './FAQ.css';

const FAQ = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5')
    },
    {
      question: t('faq.q6'),
      answer: t('faq.a6')
    }
  ];

  // Создаем Schema.org разметку для FAQ
  const faqSchema = createFAQSchema(faqData);

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section id="faq" className="faq">
      <SEO 
        title="Часто задаваемые вопросы"
        description="Ответы на популярные вопросы о маникюре, педикюре и услугах салона"
        keywords="вопросы маникюр, педикюр, салон красоты, уход за ногтями"
        url="/faq"
        schema={faqSchema}
      />
      
      <div className="faq-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="faq-header"
        >
          <div className="faq-icon">
            <HelpCircle size={40} />
          </div>
          <h2 className="faq-title">{t('faq.title')}</h2>
          <p className="faq-description">{t('faq.description')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="faq-list"
        >
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="faq-item"
            >
              <button
                className={`faq-question ${openItems.has(index) ? 'active' : ''}`}
                onClick={() => toggleItem(index)}
                aria-expanded={openItems.has(index)}
              >
                <span className="question-text">{item.question}</span>
                <motion.div
                  animate={{ rotate: openItems.has(index) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="question-icon"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openItems.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="faq-answer"
                  >
                    <div className="answer-content">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="faq-contact"
        >
          <p>{t('faq.contactText')}</p>
          <div className="contact-methods">
            <a href="tel:+4907111234567" className="contact-link phone">
              +49 (711) 123-45-67
            </a>
            <a href="https://wa.me/4907111234567" className="contact-link whatsapp">
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ; 