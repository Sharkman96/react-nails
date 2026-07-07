import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import { ChevronDown, HelpCircle } from 'lucide-react';

import { prerenderInitial } from '../utils/prerender';

import './FAQ.css';



const FAQ_ITEM_KEYS = ['q1', 'q2', 'q3', 'q4'];



const FAQ = () => {

  const { t } = useTranslation();

  const [openItems, setOpenItems] = useState(new Set());



  const faqData = FAQ_ITEM_KEYS.map((key) => ({

    question: t(`faq.${key}`),

    answer: t(`faq.a${key.slice(1)}`),

  }));



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

      <div className="faq-container">

        <motion.div

          initial={prerenderInitial({ opacity: 0, y: 30 })}

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

          initial={prerenderInitial({ opacity: 0 })}

          whileInView={{ opacity: 1 }}

          transition={{ duration: 0.6, delay: 0.2 }}

          viewport={{ once: true }}

          className="faq-list"

          itemScope

          itemType="https://schema.org/FAQPage"

        >

          {faqData.map((item, index) => (

            <motion.div

              key={index}

              initial={prerenderInitial({ opacity: 0, y: 20 })}

              whileInView={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.5, delay: index * 0.1 }}

              viewport={{ once: true }}

              className="faq-item"

              itemScope

              itemProp="mainEntity"

              itemType="https://schema.org/Question"

            >

              <button

                type="button"

                className={`faq-question ${openItems.has(index) ? 'active' : ''}`}

                onClick={() => toggleItem(index)}

                aria-expanded={openItems.has(index)}

                aria-controls={`faq-answer-${index}`}

              >

                <span className="question-text" itemProp="name">

                  {item.question}

                </span>

                <motion.div

                  animate={{ rotate: openItems.has(index) ? 180 : 0 }}

                  transition={{ duration: 0.3 }}

                  className="question-icon"

                >

                  <ChevronDown size={20} />

                </motion.div>

              </button>



              <div

                id={`faq-answer-${index}`}

                className={`faq-answer ${openItems.has(index) ? 'is-open' : ''}`}

                itemScope

                itemProp="acceptedAnswer"

                itemType="https://schema.org/Answer"

              >

                <div className="faq-answer-inner">

                  <p className="answer-content" itemProp="text">

                    {item.answer}

                  </p>

                </div>

              </div>

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

};



export default FAQ;

