import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input 
        id={inputId} 
        className={`${styles.input} ${error ? styles.hasError : ''}`} 
        {...props} 
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
