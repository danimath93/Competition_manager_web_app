import React, { useState } from 'react';
import './Tabs.css';

/**
 * Componente Tab riutilizzabile
 * @param {Array} tabs - Array di oggetti con struttura: { label: string, value: string, disabled?: boolean }
 * @param {string} activeTab - Valore del tab attualmente attivo
 * @param {function} onTabChange - Callback chiamata quando si cambia tab
 * @param {object} children - Contenuto da visualizzare per ciascun tab
 */
const Tabs = ({ tabs = [], activeTab, onTabChange, children }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`tab-button ${activeTab === tab.value ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => !tab.disabled && onTabChange(tab.value)}
            disabled={tab.disabled}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {children}
      </div>
    </div>
  );
};

export default Tabs;
