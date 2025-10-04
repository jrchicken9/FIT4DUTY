import type { FitnessLog, FitnessLogDay, FitnessLogExportOptions } from '@/types/fitness-log';

export interface FitnessLogPDFData {
  log: FitnessLog;
  days: FitnessLogDay[];
  userInfo: {
    name: string;
    email: string;
  };
  exportOptions: FitnessLogExportOptions;
}

/**
 * Generate HTML template for OACP Fitness Log PDF
 */
export function generateOACPFitnessLogHTML(data: FitnessLogPDFData): string {
  const { log, days, userInfo, exportOptions } = data;
  
  const isSigned = log.signed && !exportOptions.includeWatermark;
  const watermarkClass = exportOptions.includeWatermark ? 'watermark' : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OACP Fitness Log - ${userInfo.name}</title>
      <style>
        ${getPDFStyles()}
      </style>
    </head>
    <body class="${watermarkClass}">
      <div class="container">
        ${generateHeader(log, userInfo, isSigned)}
        ${generateLogTable(days, log)}
        ${generateFooter(log, isSigned)}
      </div>
    </body>
    </html>
  `;
}

/**
 * Get CSS styles for PDF
 */
function getPDFStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1e1b4b;
      background: white;
    }
    
    .watermark {
      position: relative;
    }
    
    .watermark::before {
      content: "DRAFT - NOT SIGNED";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48pt;
      color: rgba(220, 38, 38, 0.1);
      font-weight: bold;
      z-index: -1;
      pointer-events: none;
    }
    
    .container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 24pt;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .header h2 {
      font-size: 16pt;
      font-weight: 600;
      color: #374151;
      margin-bottom: 15px;
    }
    
    .header-info {
      display: flex;
      justify-content: space-between;
      font-size: 12pt;
      color: #6b7280;
    }
    
    .log-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 10pt;
    }
    
    .log-table th,
    .log-table td {
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: left;
      vertical-align: top;
    }
    
    .log-table th {
      background-color: #f3f4f6;
      font-weight: 600;
      color: #1e1b4b;
      text-align: center;
    }
    
    .log-table .date-col {
      width: 80px;
      text-align: center;
    }
    
    .log-table .run-col {
      width: 120px;
    }
    
    .log-table .strength-col {
      width: 140px;
    }
    
    .log-table .activity-col {
      width: 120px;
    }
    
    .log-table .stress-col {
      width: 100px;
    }
    
    .log-table .sleep-col {
      width: 60px;
      text-align: center;
    }
    
    .activity-row {
      margin-bottom: 4px;
    }
    
    .activity-row:last-child {
      margin-bottom: 0;
    }
    
    .activity-label {
      font-weight: 600;
      color: #374151;
    }
    
    .activity-value {
      color: #6b7280;
    }
    
    .empty-cell {
      color: #9ca3af;
      font-style: italic;
    }
    
    .required-field {
      font-weight: 600;
      color: #1e40af;
    }
    
    .footer {
      margin-top: 40px;
      border-top: 2px solid #1e40af;
      padding-top: 20px;
    }
    
    .attestation {
      margin-bottom: 30px;
    }
    
    .attestation h3 {
      font-size: 14pt;
      font-weight: 600;
      color: #1e1b4b;
      margin-bottom: 15px;
    }
    
    .attestation-text {
      font-size: 11pt;
      line-height: 1.6;
      color: #374151;
      margin-bottom: 20px;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .signature-info {
      flex: 1;
    }
    
    .signature-line {
      border-bottom: 1px solid #1e1b4b;
      width: 200px;
      margin-bottom: 5px;
    }
    
    .signature-label {
      font-size: 10pt;
      color: #6b7280;
    }
    
    .signature-image {
      max-width: 200px;
      max-height: 100px;
      border: 1px solid #d1d5db;
    }
    
    .completion-info {
      text-align: right;
      font-size: 10pt;
      color: #6b7280;
      margin-top: 20px;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .watermark::before {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
}

/**
 * Generate header section
 */
function generateHeader(log: FitnessLog, userInfo: { name: string; email: string }, isSigned: boolean): string {
  const startDate = new Date(log.start_date).toLocaleDateString('en-CA');
  const endDate = new Date(log.end_date).toLocaleDateString('en-CA');
  
  return `
    <div class="header">
      <h1>OACP Fitness Log</h1>
      <h2>14-Day Physical Activity & Wellness Tracking</h2>
      <div class="header-info">
        <div>
          <strong>Candidate:</strong> ${userInfo.name}
        </div>
        <div>
          <strong>Period:</strong> ${startDate} to ${endDate}
        </div>
      </div>
      <div class="header-info">
        <div>
          <strong>Email:</strong> ${userInfo.email}
        </div>
        <div>
          <strong>Status:</strong> ${isSigned ? 'Completed & Signed' : 'In Progress'}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate the main log table
 */
function generateLogTable(days: FitnessLogDay[], log: FitnessLog): string {
  const sortedDays = days.sort((a, b) => 
    new Date(a.day_date).getTime() - new Date(b.day_date).getTime()
  );
  
  let tableHTML = `
    <table class="log-table">
      <thead>
        <tr>
          <th class="date-col">Date</th>
          <th class="run-col">Run</th>
          <th class="strength-col">Strength Training</th>
          <th class="activity-col">Other Activity</th>
          <th class="stress-col">Stress Management</th>
          <th class="sleep-col">Sleep (hrs)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sortedDays.forEach(day => {
    const date = new Date(day.day_date).toLocaleDateString('en-CA');
    const dayNumber = Math.ceil((new Date(day.day_date).getTime() - new Date(log.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    tableHTML += `
      <tr>
        <td class="date-col">
          <strong>Day ${dayNumber}</strong><br>
          ${date}
        </td>
        <td class="run-col">
          ${formatRunData(day)}
        </td>
        <td class="strength-col">
          ${formatStrengthData(day)}
        </td>
        <td class="activity-col">
          ${formatOtherActivityData(day)}
        </td>
        <td class="stress-col">
          ${formatStressData(day)}
        </td>
        <td class="sleep-col">
          ${formatSleepData(day)}
        </td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  return tableHTML;
}

/**
 * Format run data for table cell
 */
function formatRunData(day: FitnessLogDay): string {
  if (!day.run_duration_min && !day.run_distance_km && !day.run_location) {
    return '<span class="empty-cell">No run</span>';
  }
  
  let html = '';
  
  if (day.run_duration_min) {
    html += `<div class="activity-row">
      <span class="activity-label">Duration:</span> 
      <span class="activity-value">${day.run_duration_min} min</span>
    </div>`;
  }
  
  if (day.run_distance_km) {
    html += `<div class="activity-row">
      <span class="activity-label">Distance:</span> 
      <span class="activity-value">${day.run_distance_km} km</span>
    </div>`;
  }
  
  if (day.run_location) {
    html += `<div class="activity-row">
      <span class="activity-label">Location:</span> 
      <span class="activity-value">${day.run_location}</span>
    </div>`;
  }
  
  return html;
}

/**
 * Format strength training data for table cell
 */
function formatStrengthData(day: FitnessLogDay): string {
  if (!day.strength_duration_min && !day.strength_description) {
    return '<span class="empty-cell">No strength training</span>';
  }
  
  let html = '';
  
  if (day.strength_duration_min) {
    html += `<div class="activity-row">
      <span class="activity-label">Duration:</span> 
      <span class="activity-value">${day.strength_duration_min} min</span>
    </div>`;
  }
  
  if (day.strength_env) {
    html += `<div class="activity-row">
      <span class="activity-label">Environment:</span> 
      <span class="activity-value">${day.strength_env}</span>
    </div>`;
  }
  
  if (day.strength_split) {
    html += `<div class="activity-row">
      <span class="activity-label">Split:</span> 
      <span class="activity-value">${day.strength_split}</span>
    </div>`;
  }
  
  if (day.strength_description) {
    html += `<div class="activity-row">
      <span class="activity-label">Description:</span> 
      <span class="activity-value">${day.strength_description}</span>
    </div>`;
  }
  
  return html;
}

/**
 * Format other activity data for table cell
 */
function formatOtherActivityData(day: FitnessLogDay): string {
  if (!day.other_activity_type && !day.other_activity_duration_min) {
    return '<span class="empty-cell">No other activity</span>';
  }
  
  let html = '';
  
  if (day.other_activity_type) {
    html += `<div class="activity-row">
      <span class="activity-label">Type:</span> 
      <span class="activity-value">${day.other_activity_type}</span>
    </div>`;
  }
  
  if (day.other_activity_duration_min) {
    html += `<div class="activity-row">
      <span class="activity-label">Duration:</span> 
      <span class="activity-value">${day.other_activity_duration_min} min</span>
    </div>`;
  }
  
  if (day.other_activity_location) {
    html += `<div class="activity-row">
      <span class="activity-label">Location:</span> 
      <span class="activity-value">${day.other_activity_location}</span>
    </div>`;
  }
  
  return html;
}

/**
 * Format stress management data for table cell
 */
function formatStressData(day: FitnessLogDay): string {
  if (!day.stress_method) {
    return '<span class="empty-cell required-field">Required</span>';
  }
  
  return `<span class="required-field">${day.stress_method}</span>`;
}

/**
 * Format sleep data for table cell
 */
function formatSleepData(day: FitnessLogDay): string {
  if (day.sleep_hours === null || day.sleep_hours === undefined) {
    return '<span class="empty-cell required-field">Required</span>';
  }
  
  return `<span class="required-field">${day.sleep_hours}</span>`;
}

/**
 * Generate footer section with attestation and signature
 */
function generateFooter(log: FitnessLog, isSigned: boolean): string {
  const attestationText = `
    I certify that the information provided in this 14-day fitness log is true and accurate to the best of my knowledge. 
    I understand that providing false information may result in disqualification from the application process. 
    This log represents my actual physical activity, stress management practices, and sleep patterns during the 
    specified period from ${new Date(log.start_date).toLocaleDateString('en-CA')} to ${new Date(log.end_date).toLocaleDateString('en-CA')}.
  `;
  
  let signatureHTML = '';
  
  if (isSigned && log.signed_name) {
    const signedDate = log.signed_at ? new Date(log.signed_at).toLocaleDateString('en-CA') : 'Unknown';
    
    signatureHTML = `
      <div class="signature-section">
        <div class="signature-info">
          <div class="signature-line"></div>
          <div class="signature-label">Electronic Signature</div>
          <div style="margin-top: 10px; font-weight: 600;">${log.signed_name}</div>
          <div style="font-size: 10pt; color: #6b7280;">Signed on ${signedDate}</div>
        </div>
        ${log.signature_blob ? `
          <div>
            <img src="data:image/png;base64,${log.signature_blob}" alt="Signature" class="signature-image" />
          </div>
        ` : ''}
      </div>
    `;
  } else {
    signatureHTML = `
      <div class="signature-section">
        <div class="signature-info">
          <div class="signature-line"></div>
          <div class="signature-label">Signature Required</div>
          <div style="margin-top: 10px; color: #6b7280; font-style: italic;">
            This log must be signed to be considered complete and official.
          </div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="footer">
      <div class="attestation">
        <h3>Attestation</h3>
        <div class="attestation-text">
          ${attestationText}
        </div>
        ${signatureHTML}
      </div>
      
      <div class="completion-info">
        <div><strong>Log ID:</strong> ${log.id}</div>
        <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-CA')} at ${new Date().toLocaleTimeString('en-CA')}</div>
        ${isSigned ? `
          <div><strong>Status:</strong> Completed and Signed</div>
        ` : `
          <div><strong>Status:</strong> Draft - Not Signed</div>
        `}
      </div>
    </div>
  `;
}

/**
 * Generate summary statistics for the log
 */
export function generateLogSummary(days: FitnessLogDay[]): {
  totalRunMinutes: number;
  totalRunDistance: number;
  totalStrengthMinutes: number;
  totalOtherActivityMinutes: number;
  averageSleepHours: number;
  completedDays: number;
  stressMethods: string[];
} {
  const completedDays = days.filter(day => day.is_complete);
  
  const totalRunMinutes = days.reduce((sum, day) => sum + (day.run_duration_min || 0), 0);
  const totalRunDistance = days.reduce((sum, day) => sum + (day.run_distance_km || 0), 0);
  const totalStrengthMinutes = days.reduce((sum, day) => sum + (day.strength_duration_min || 0), 0);
  const totalOtherActivityMinutes = days.reduce((sum, day) => sum + (day.other_activity_duration_min || 0), 0);
  
  const sleepHours = completedDays.map(day => day.sleep_hours || 0).filter(hours => hours > 0);
  const averageSleepHours = sleepHours.length > 0 
    ? sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length 
    : 0;
  
  const stressMethods = [...new Set(completedDays.map(day => day.stress_method).filter(Boolean))];
  
  return {
    totalRunMinutes,
    totalRunDistance,
    totalStrengthMinutes,
    totalOtherActivityMinutes,
    averageSleepHours,
    completedDays: completedDays.length,
    stressMethods,
  };
}

/**
 * Generate HTML for summary statistics
 */
export function generateSummaryHTML(summary: ReturnType<typeof generateLogSummary>): string {
  return `
    <div class="summary-section">
      <h3>14-Day Summary</h3>
      <div class="summary-stats">
        <div class="stat-row">
          <span class="stat-label">Completed Days:</span>
          <span class="stat-value">${summary.completedDays}/14</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Run Time:</span>
          <span class="stat-value">${summary.totalRunMinutes} minutes</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Run Distance:</span>
          <span class="stat-value">${summary.totalRunDistance.toFixed(1)} km</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Strength Training:</span>
          <span class="stat-value">${summary.totalStrengthMinutes} minutes</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Other Activities:</span>
          <span class="stat-value">${summary.totalOtherActivityMinutes} minutes</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Average Sleep:</span>
          <span class="stat-value">${summary.averageSleepHours.toFixed(1)} hours</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Stress Management Methods:</span>
          <span class="stat-value">${summary.stressMethods.join(', ') || 'None recorded'}</span>
        </div>
      </div>
    </div>
  `;
}
