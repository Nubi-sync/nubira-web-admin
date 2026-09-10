'use client'

import React from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#FAF7F0',
        color: '#0F172A',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '90%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            padding: '4px 12px',
            borderRadius: '6px',
            marginBottom: '18px',
            textTransform: 'uppercase'
          }}>
            Critical System Interruption
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            margin: '0 0 10px 0',
            color: '#0F172A'
          }}>
            Factory Application Reset Needed
          </h1>

          <p style={{
            fontSize: '13.5px',
            color: '#475569',
            lineHeight: 1.5,
            margin: '0 0 24px 0'
          }}>
            A root layout component encountered an error. Click below to reboot the portal interface.
          </p>

          {error.digest && (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '8px 12px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#64748B',
              marginBottom: '20px'
            }}>
              Error ID: {error.digest}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#3A3564',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(58, 53, 100, 0.2)'
              }}
            >
              Reboot App
            </button>
            <button
              onClick={() => { window.location.href = '/login' }}
              style={{
                backgroundColor: '#FAF7F0',
                color: '#0F172A',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sign In Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
