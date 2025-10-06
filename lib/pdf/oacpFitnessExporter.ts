// lib/pdf/oacpFitnessExporter.ts
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';

export type Intensity = 'Low' | 'Moderate' | 'Vigorous';

export interface OacpDailyEntry {
  dateISO: string;
  activity: string;
  durationMins: number;
  intensity: Intensity;
  comments?: string;
  signed?: boolean;
  // OACP-specific fields for detailed tracking
  runDuration?: number;
  runDistance?: number;
  runLocation?: string;
  strengthDuration?: number;
  strengthLocation?: string;
  strengthSplit?: string;
  strengthDescription?: string;
  otherActivity?: string;
  otherDuration?: number;
  otherLocation?: string;
  stressMethod?: string;
  sleepHours?: number;
}

export interface OacpWeek { days: OacpDailyEntry[]; }

export interface OacpLogPayload {
  fullName: string;
  dob?: string;
  address?: string;
  email?: string;
  phone?: string;
  week1: OacpWeek;
  week2: OacpWeek;
  applicantDeclarationDateISO: string;
  applicantSignaturePngBase64?: string;   // "data:image/png;base64,..."
  verifier?: {
    name: string;
    title?: string;
    phone?: string;
    dateISO?: string;
    signaturePngBase64?: string;
  };
}

// Helper function to format dates correctly
const fmtDate = (iso?: string) => {
  if (!iso) return '';
  try {
    const d = iso.includes('T') ? new Date(iso) : new Date(iso + 'T00:00:00');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch { return iso || ''; }
};

// Helper function to sanitize text for PDF rendering
const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/✔/g, 'X')
    .replace(/✗/g, 'X')
    .replace(/✓/g, 'X')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/…/g, '...')
    .replace(/[^\x00-\x7F]/g, '?');
};

// Helper function to draw checkboxes
const drawCheckbox = (page: any, x: number, y: number, checked: boolean = false) => {
  // Draw checkbox square
  page.drawRectangle({
    x: x,
    y: y - 3,
    width: 8,
    height: 8,
    borderColor: rgb(0,0,0),
    borderWidth: 1
  });
  
  // Draw X if checked
  if (checked) {
    page.drawText('X', {
      x: x + 1,
      y: y - 2,
      size: 8,
      font: page.font || StandardFonts.HelveticaBold,
      color: rgb(0,0,0)
    });
  }
};

// Helper function to draw input lines
const drawInputLine = (page: any, x: number, y: number, width: number) => {
  page.drawLine({
    start: { x: x, y: y },
    end: { x: x + width, y: y },
    thickness: 1,
    color: rgb(0,0,0)
  });
};

export async function exportOacpFitnessLog(payload: OacpLogPayload) {
  try {
    console.log('Starting OACP PDF export - 3-Page Official Template Recreation...');
    
    // Create a new PDF document with 3 pages
    const pdf = await PDFDocument.create();
    
    // Embed fonts
    const helv = await pdf.embedFont(StandardFonts.Helvetica);
    const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
    
    console.log('PDF created with fonts embedded');

    // Helper functions
    const drawText = (page: any, text: string, x: number, y: number, size = 10, bold = false) => {
      page.drawText(sanitizeText(text || ''), { x, y, size, font: bold ? helvB : helv, color: rgb(0,0,0) });
    };

    const drawLine = (page: any, x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: rgb(0,0,0) });
    };

    const drawRectangle = (page: any, x: number, y: number, width: number, height: number, fill = false, fillColor = rgb(0,0,0)) => {
      if (fill) {
        page.drawRectangle({ x, y, width, height, color: fillColor });
      } else {
        page.drawRectangle({ x, y, width, height, borderColor: rgb(0,0,0), borderWidth: 1 });
      }
    };

    // Define colors
    const darkGreen = rgb(0, 0.4, 0.2); // Dark green for headers
    const white = rgb(1, 1, 1);
    const black = rgb(0, 0, 0);
    
    // PAGE 1: Main Fitness Log (Days 1-7)
    const page1 = pdf.addPage([612, 792]); // Letter size
    
    // 1. HEADER SECTION - Exact template positioning
    // OACP Logo (dark green box)
    drawRectangle(page1, 50, 750, 40, 40, true, darkGreen);
    drawText(page1, 'OACP', 58, 760, 12, true);
    
    // Main title - centered
    drawText(page1, 'Fitness Log', 306, 780, 20, true);
    drawText(page1, 'OACP Certificate Process', 280, 760, 16, true);
    
    // Instructions text - exact template text
    const instructions = [
      'This fitness log is to be provided to the Police Service that you are applying to.',
      'For more information on fitness logs or to view the guide, please see OACPCertificate.ca'
    ];
    
    let instructionY = 740;
    instructions.forEach(instruction => {
      drawText(page1, instruction, 50, instructionY, 10);
      instructionY -= 15;
    });
    
    // 2. CANDIDATE INFORMATION SECTION - exact template positioning
    const candidateY = 700;
    drawText(page1, 'Candidate Name:', 50, candidateY, 10, true);
    drawText(page1, payload.fullName || '', 150, candidateY - 5, 10);
    drawInputLine(page1, 150, candidateY - 8, 250);
    
    drawText(page1, 'Date from:', 450, candidateY, 10, true);
    const startDate = payload.week1?.days?.[0]?.dateISO || payload.week2?.days?.[0]?.dateISO || '';
    drawText(page1, fmtDate(startDate), 520, candidateY - 5, 10);
    drawInputLine(page1, 520, candidateY - 8, 80);
    
    drawText(page1, 'Date to:', 450, candidateY - 20, 10, true);
    const endDate = payload.week2?.days?.[6]?.dateISO || payload.week1?.days?.[6]?.dateISO || '';
    drawText(page1, fmtDate(endDate), 520, candidateY - 25, 10);
    drawInputLine(page1, 520, candidateY - 28, 80);
    
    // 3. MAIN FITNESS LOG TABLE - PAGE 1 (Days 1-7) - Exact template layout
    const tableStartY = 670;
    const tableWidth = 562;
    const rowHeight = 70; // Height for each day row - matches template
    const dayColumnWidth = 70;
    
    // Table structure - exact template column positions
    const columns = {
      day: 50,
      run: 120,
      strength: 220,
      other: 320,
      stress: 420,
      sleep: 520
    };
    
    // Draw main table border
    drawRectangle(page1, 50, tableStartY - (rowHeight * 8), tableWidth, rowHeight * 8);
    
    // Draw vertical lines
    drawLine(page1, columns.run, tableStartY, columns.run, tableStartY - (rowHeight * 8));
    drawLine(page1, columns.strength, tableStartY, columns.strength, tableStartY - (rowHeight * 8));
    drawLine(page1, columns.other, tableStartY, columns.other, tableStartY - (rowHeight * 8));
    drawLine(page1, columns.stress, tableStartY, columns.stress, tableStartY - (rowHeight * 8));
    drawLine(page1, columns.sleep, tableStartY, columns.sleep, tableStartY - (rowHeight * 8));
    
    // Draw horizontal lines for each day + header
    for (let i = 0; i <= 8; i++) {
      const y = tableStartY - (i * rowHeight);
      drawLine(page1, 50, y, 612, y);
    }
    
    // 4. HEADERS - exact template headers
    // Day column header
    drawRectangle(page1, 50, tableStartY - rowHeight, dayColumnWidth, rowHeight, true, darkGreen);
    drawText(page1, 'Day', 75, tableStartY - 35, 12, true);
    
    // Run column header
    drawRectangle(page1, columns.run, tableStartY - rowHeight, 100, rowHeight, true, darkGreen);
    drawText(page1, 'Run', columns.run + 35, tableStartY - 35, 12, true);
    
    // Strength Training column header
    drawRectangle(page1, columns.strength, tableStartY - rowHeight, 100, rowHeight, true, darkGreen);
    drawText(page1, 'Strength Train', columns.strength + 20, tableStartY - 35, 12, true);
    
    // Other Activities column header
    drawRectangle(page1, columns.other, tableStartY - rowHeight, 100, rowHeight, true, darkGreen);
    drawText(page1, 'Other Activities', columns.other + 15, tableStartY - 35, 12, true);
    
    // Stress Management column header
    drawRectangle(page1, columns.stress, tableStartY - rowHeight, 100, rowHeight, true, darkGreen);
    drawText(page1, 'Stress Manager', columns.stress + 10, tableStartY - 35, 12, true);
    
    // Sleep column header
    drawRectangle(page1, columns.sleep, tableStartY - rowHeight, 42, rowHeight, true, darkGreen);
    drawText(page1, 'Sleep', columns.sleep + 10, tableStartY - 35, 12, true);
    
    // 5. DETAILED SUB-HEADERS FOR EACH ACTIVITY COLUMN - exact template layout
    const subHeaderY = tableStartY - 60;
    
    // Run sub-headers
    drawText(page1, 'Duration:', columns.run + 5, subHeaderY, 9);
    drawText(page1, 'Distance:', columns.run + 5, subHeaderY - 12, 9);
    drawText(page1, 'Indoors', columns.run + 5, subHeaderY - 24, 9);
    drawText(page1, 'Outdoors', columns.run + 50, subHeaderY - 24, 9);
    drawText(page1, 'Location:', columns.run + 5, subHeaderY - 36, 9);
    
    // Strength Training sub-headers
    drawText(page1, 'Duration:', columns.strength + 5, subHeaderY, 9);
    drawText(page1, 'Location:', columns.strength + 5, subHeaderY - 12, 9);
    drawText(page1, 'Upper Body', columns.strength + 5, subHeaderY - 24, 9);
    drawText(page1, 'Lower Body', columns.strength + 50, subHeaderY - 24, 9);
    drawText(page1, 'Description:', columns.strength + 5, subHeaderY - 36, 9);
    
    // Other Activities sub-headers
    drawText(page1, 'Sport/Activity:', columns.other + 5, subHeaderY, 9);
    drawText(page1, 'Duration:', columns.other + 5, subHeaderY - 12, 9);
    drawText(page1, 'Location:', columns.other + 5, subHeaderY - 24, 9);
    
    // Stress Management sub-headers
    drawText(page1, 'Method:', columns.stress + 5, subHeaderY, 9);
    drawText(page1, 'Duration:', columns.stress + 5, subHeaderY - 12, 9);
    
    // Sleep sub-headers
    drawText(page1, 'Hours:', columns.sleep + 5, subHeaderY, 9);
    
    // 6. DAY LABELS AND DATA - PAGE 1 (Days 1-7) - exact template positioning
    const week1Days = payload.week1?.days || [];
    
    for (let dayNum = 1; dayNum <= 7; dayNum++) {
      const dayY = tableStartY - (dayNum + 1) * rowHeight;
      const dayData = week1Days[dayNum - 1];
      
      // Day label (dark green background)
      drawRectangle(page1, 50, dayY, dayColumnWidth, rowHeight, true, darkGreen);
      drawText(page1, `Day ${dayNum}`, 75, dayY + 40, 14, true);
      
      if (dayData) {
        // Run data
        if (dayData.runDuration && dayData.runDuration > 0) {
          drawText(page1, String(dayData.runDuration), columns.run + 5, dayY + 50, 9);
          drawText(page1, String(dayData.runDistance || ''), columns.run + 5, dayY + 38, 9);
          drawCheckbox(page1, columns.run + 35, dayY + 26, dayData.runLocation?.toLowerCase().includes('indoor'));
          drawCheckbox(page1, columns.run + 80, dayY + 26, dayData.runLocation?.toLowerCase().includes('outdoor'));
          drawText(page1, dayData.runLocation || '', columns.run + 5, dayY + 14, 9);
        }
        
        // Strength Training data
        if (dayData.strengthDuration && dayData.strengthDuration > 0) {
          drawText(page1, String(dayData.strengthDuration), columns.strength + 5, dayY + 50, 9);
          drawText(page1, dayData.strengthLocation || '', columns.strength + 5, dayY + 38, 9);
          drawCheckbox(page1, columns.strength + 35, dayY + 26, dayData.strengthSplit?.toLowerCase().includes('upper'));
          drawCheckbox(page1, columns.strength + 80, dayY + 26, dayData.strengthSplit?.toLowerCase().includes('lower'));
          drawText(page1, dayData.strengthDescription || '', columns.strength + 5, dayY + 14, 9);
        }
        
        // Other Activities data
        if (dayData.otherActivity && dayData.otherDuration && dayData.otherDuration > 0) {
          drawText(page1, dayData.otherActivity, columns.other + 5, dayY + 50, 9);
          drawText(page1, String(dayData.otherDuration), columns.other + 5, dayY + 38, 9);
          drawText(page1, dayData.otherLocation || '', columns.other + 5, dayY + 26, 9);
        }
        
        // Stress Management data
        if (dayData.stressMethod) {
          drawText(page1, dayData.stressMethod, columns.stress + 5, dayY + 50, 9);
          drawText(page1, '', columns.stress + 5, dayY + 38, 9);
        }
        
        // Sleep data
        if (dayData.sleepHours && dayData.sleepHours > 0) {
          drawText(page1, String(dayData.sleepHours), columns.sleep + 5, dayY + 50, 9);
        }
        
        // OACP-specific fields: Show signature/initials if available
        if (dayData.signerInitials || dayData.signed) {
          const signatureText = dayData.signerInitials || (dayData.signed ? '✓' : '');
          // This would need to be positioned in a signature column if the template has one
          // For now, we'll add it as a note in the comments area
          if (signatureText) {
            drawText(page1, signatureText, columns.other + 5, dayY + 9, 8);
          }
        }
      }
    }
    
    // 7. FOOTER SECTION - exact template text and positioning
    const footerY = 110;
    
    // Disclaimer paragraphs - exact template text
    const disclaimerTexts = [
      'Please consider your current health and fitness status and consult with your physician before beginning any physical training program.',
      'As part of the OACP Certificate Process, you are to conduct a minimum of 2-weeks worth of fitness logs.',
      'By signing below, you are acknowledging the OACP, TNT and any Police Service in which you apply to are not legally responsible if you become injured while completing this fitness log.',
      'Even if you do not run or strength train each day, you should be completing the "Stress Management" and "Sleep" sections.',
      'The personal information contained on this form is collected pursuant to section 38(2) of the Freedom of Information and Protection of Privacy Act (FIPPA) for the sole purpose of determining the suitability of the applicant for hire for any of the Police Services you choose to apply to.',
      'Questions regarding the collection of this information can be directed to OACP Certificate Administrators which can be found on the OACPCertificate.ca website.',
      'By signing below, I hereby certify that the above information contained in this Fitness Log is a true representation of my current activity level.',
      'I understand that any misrepresentation of my fitness and activity levels could lead to disqualification from the recruitment process.'
    ];
    
    let currentY = footerY;
    disclaimerTexts.forEach(text => {
      drawText(page1, text, 50, currentY, 9);
      currentY -= 15;
    });
    
    // Signature section
    drawText(page1, 'Signature: x', 50, currentY - 20, 10, true);
    drawInputLine(page1, 120, currentY - 25, 200);
    
    drawText(page1, 'Date:', 350, currentY - 20, 10, true);
    drawText(page1, fmtDate(payload.applicantDeclarationDateISO), 380, currentY - 25, 10);
    drawInputLine(page1, 380, currentY - 28, 100);
    
    // Add signature if available
    if (payload.applicantSignaturePngBase64?.startsWith('data:image/png')) {
      try {
        const pngB64 = payload.applicantSignaturePngBase64.split(',')[1];
        const bytes = Uint8Array.from(atob(pngB64), c => c.charCodeAt(0));
        const img = await pdf.embedPng(bytes);
        page1.drawImage(img, { x: 120, y: currentY - 30, width: 100, height: 20 });
      } catch (error) {
        console.log('Could not embed signature image:', error);
      }
    }
    
    // Courtesy text - exact template positioning
    drawText(page1, 'This form is courtesy of the', 450, 50, 9);
    drawText(page1, 'Ontario Provincial Police', 450, 35, 9);
    
    // PAGE 2: Week 2 Fitness Log (Days 8-14)
    const page2 = pdf.addPage([612, 792]);
    
    // 1. HEADER SECTION - PAGE 2
    // OACP Logo
    drawRectangle(page2, 50, 720, 40, 40, true, darkGreen);
    drawText(page2, 'OACP', 58, 730, 12, true);
    
    // Main title
    drawText(page2, 'Week 2 Fitness Log', 300, 760, 18, true);
    
    // Candidate information
    drawText(page2, 'Candidate Name:', 50, 720, 10, true);
    drawInputLine(page2, 150, 715, 200);
    
    drawText(page2, 'Date from:', 400, 720, 10, true);
    drawInputLine(page2, 470, 715, 80);
    
    drawText(page2, 'Date to:', 400, 700, 10, true);
    drawInputLine(page2, 470, 695, 80);
    
    // 2. MAIN FITNESS LOG TABLE - PAGE 2 (Days 8-14)
    const page2TableStartY = 680;
    const activityColumnWidth = 100; // Define the missing variable
    
    // Draw main table border
    drawRectangle(page2, 50, page2TableStartY - (rowHeight * 7), tableWidth, rowHeight * 7);
    
    // Draw vertical lines
    drawLine(page2, columns.run, page2TableStartY, columns.run, page2TableStartY - (rowHeight * 7));
    drawLine(page2, columns.strength, page2TableStartY, columns.strength, page2TableStartY - (rowHeight * 7));
    drawLine(page2, columns.other, page2TableStartY, columns.other, page2TableStartY - (rowHeight * 7));
    drawLine(page2, columns.stress, page2TableStartY, columns.stress, page2TableStartY - (rowHeight * 7));
    drawLine(page2, columns.sleep, page2TableStartY, columns.sleep, page2TableStartY - (rowHeight * 7));
    
    // Draw horizontal lines for each day
    for (let i = 0; i <= 7; i++) {
      const y = page2TableStartY - (i * rowHeight);
      drawLine(page2, 50, y, 612, y);
    }
    
    // Headers
    drawRectangle(page2, 50, page2TableStartY - rowHeight, dayColumnWidth, rowHeight, true, darkGreen);
    drawText(page2, 'Day', 75, page2TableStartY - 25, 12, true);
    
    drawRectangle(page2, columns.run, page2TableStartY - rowHeight, activityColumnWidth, rowHeight, true, darkGreen);
    drawText(page2, 'Run', columns.run + 35, page2TableStartY - 25, 12, true);
    
    drawRectangle(page2, columns.strength, page2TableStartY - rowHeight, activityColumnWidth, rowHeight, true, darkGreen);
    drawText(page2, 'Strength Training', columns.strength + 15, page2TableStartY - 25, 12, true);
    
    drawRectangle(page2, columns.other, page2TableStartY - rowHeight, activityColumnWidth, rowHeight, true, darkGreen);
    drawText(page2, 'Other Activities', columns.other + 15, page2TableStartY - 25, 12, true);
    
    drawRectangle(page2, columns.stress, page2TableStartY - rowHeight, activityColumnWidth, rowHeight, true, darkGreen);
    drawText(page2, 'Stress Management', columns.stress + 10, page2TableStartY - 25, 12, true);
    
    drawRectangle(page2, columns.sleep, page2TableStartY - rowHeight, 52, rowHeight, true, darkGreen);
    drawText(page2, 'Sleep', columns.sleep + 15, page2TableStartY - 25, 12, true);
    
    // Sub-headers
    const page2SubHeaderY = page2TableStartY - 50;
    
    // Run sub-headers
    drawText(page2, 'Duration:', columns.run + 5, page2SubHeaderY, 8);
    drawText(page2, 'Distance:', columns.run + 5, page2SubHeaderY - 12, 8);
    drawText(page2, 'Indoors', columns.run + 5, page2SubHeaderY - 24, 8);
    drawText(page2, 'Outdoors', columns.run + 50, page2SubHeaderY - 24, 8);
    drawText(page2, 'Location:', columns.run + 5, page2SubHeaderY - 36, 8);
    
    // Strength Training sub-headers
    drawText(page2, 'Duration:', columns.strength + 5, page2SubHeaderY, 8);
    drawText(page2, 'Location:', columns.strength + 5, page2SubHeaderY - 12, 8);
    drawText(page2, 'Upper Body', columns.strength + 5, page2SubHeaderY - 24, 8);
    drawText(page2, 'Lower Body', columns.strength + 50, page2SubHeaderY - 24, 8);
    drawText(page2, 'Description:', columns.strength + 5, page2SubHeaderY - 36, 8);
    
    // Other Activities sub-headers
    drawText(page2, 'Sport/Activity:', columns.other + 5, page2SubHeaderY, 8);
    drawText(page2, 'Duration:', columns.other + 5, page2SubHeaderY - 12, 8);
    drawText(page2, 'Location:', columns.other + 5, page2SubHeaderY - 24, 8);
    
    // Stress Management sub-headers
    drawText(page2, 'Method:', columns.stress + 5, page2SubHeaderY, 8);
    drawText(page2, 'Duration:', columns.stress + 5, page2SubHeaderY - 12, 8);
    
    // Sleep sub-headers
    drawText(page2, 'Hours:', columns.sleep + 5, page2SubHeaderY, 8);
    
    // 3. DAY LABELS AND DATA - PAGE 2 (Days 8-14)
    const week2Days = payload.week2?.days || [];
    
    for (let dayNum = 8; dayNum <= 14; dayNum++) {
      const dayY = page2TableStartY - ((dayNum - 7) + 1) * rowHeight;
      const dayData = week2Days[dayNum - 8];
      
      // Day label (dark green background)
      drawRectangle(page2, 50, dayY, dayColumnWidth, rowHeight, true, darkGreen);
      drawText(page2, `Day ${dayNum}`, 65, dayY + 35, 14, true);
      
      if (dayData) {
        // Run data
        if (dayData.runDuration && dayData.runDuration > 0) {
          drawText(page2, String(dayData.runDuration), columns.run + 5, dayY + 45, 8);
          drawText(page2, String(dayData.runDistance || ''), columns.run + 5, dayY + 33, 8);
          drawCheckbox(page2, columns.run + 35, dayY + 21, dayData.runLocation?.toLowerCase().includes('indoor'));
          drawCheckbox(page2, columns.run + 80, dayY + 21, dayData.runLocation?.toLowerCase().includes('outdoor'));
          drawText(page2, dayData.runLocation || '', columns.run + 5, dayY + 9, 8);
        }
        
        // Strength Training data
        if (dayData.strengthDuration && dayData.strengthDuration > 0) {
          drawText(page2, String(dayData.strengthDuration), columns.strength + 5, dayY + 45, 8);
          drawText(page2, dayData.strengthLocation || '', columns.strength + 5, dayY + 33, 8);
          drawCheckbox(page2, columns.strength + 35, dayY + 21, dayData.strengthSplit?.toLowerCase().includes('upper'));
          drawCheckbox(page2, columns.strength + 80, dayY + 21, dayData.strengthSplit?.toLowerCase().includes('lower'));
          drawText(page2, dayData.strengthDescription || '', columns.strength + 5, dayY + 9, 8);
        }
        
        // Other Activities data
        if (dayData.otherActivity && dayData.otherDuration && dayData.otherDuration > 0) {
          drawText(page2, dayData.otherActivity, columns.other + 5, dayY + 45, 8);
          drawText(page2, String(dayData.otherDuration), columns.other + 5, dayY + 33, 8);
          drawText(page2, dayData.otherLocation || '', columns.other + 5, dayY + 21, 8);
        }
        
        // Stress Management data
        if (dayData.stressMethod) {
          drawText(page2, dayData.stressMethod, columns.stress + 5, dayY + 45, 8);
          drawText(page2, '', columns.stress + 5, dayY + 33, 8);
        }
        
        // Sleep data
        if (dayData.sleepHours && dayData.sleepHours > 0) {
          drawText(page2, String(dayData.sleepHours), columns.sleep + 5, dayY + 45, 8);
        }
      }
    }
    
    // Signature section for page 2
    drawText(page2, 'Signature: x', 300, 100, 10, true);
    drawInputLine(page2, 370, 95, 150);
    
    // PAGE 3: Daily Fitness Journal
    const page3 = pdf.addPage([612, 792]);
    
    // 1. HEADER SECTION - PAGE 3
    // OACP Logo
    drawRectangle(page3, 50, 720, 40, 40, true, darkGreen);
    drawText(page3, 'OACP', 58, 730, 12, true);
    
    // Main title
    drawText(page3, 'Daily Fitness Journal', 300, 760, 18, true);
    
    // Instructions
    drawText(page3, 'For each day you run or strength train, you are to outline the exact workouts you conducted.', 50, 720, 10);
    drawText(page3, 'Please feel free to make multiple copies of this page or use a blank sheet of paper instead.', 50, 705, 10);
    drawText(page3, 'Please see the Fitness Log Guide for clear instructions.', 50, 690, 10);
    
    // 2. STRENGTH TRAINING SECTION
    drawText(page3, 'Strength Training', 50, 660, 14, true);
    drawLine(page3, 50, 655, 200, 655);
    
    drawText(page3, 'Please list all exercises outlined in your workout', 50, 640, 10);
    drawText(page3, '(Include reps and sets)', 50, 625, 10);
    drawText(page3, '(please include resistance band intensity and/or dumbbell weight if used)', 50, 610, 10);
    
    // Large blank area for strength training details
    drawRectangle(page3, 50, 450, 500, 150);
    
    drawText(page3, 'Time spent strength training:', 50, 430, 10, true);
    drawInputLine(page3, 200, 425, 100);
    
    // 3. RUNNING SECTION
    drawText(page3, 'Running', 50, 400, 14, true);
    drawLine(page3, 50, 395, 150, 395);
    
    drawText(page3, 'Please circle the speed of your run below.', 50, 380, 10);
    drawText(page3, '(if you travelled at two different speeds, please circle both)', 50, 365, 10);
    
    // Speed options
    drawText(page3, '(Moderate walk  Fast walk  Moderate Jog  Fast Jog  Sprint)', 50, 340, 10);
    
    drawText(page3, 'Please list any dynamics of today\'s run (If used).', 50, 320, 10);
    drawText(page3, '(i.e. uphill, downhill, ankle weights, weighted vest)', 50, 305, 10);
    drawInputLine(page3, 50, 290, 300);
    
    drawText(page3, 'Please identify duration of break', 50, 270, 10);
    drawText(page3, '(if you took a break or slowed down mid-run)', 50, 255, 10);
    drawInputLine(page3, 50, 240, 300);
    
    // 4. DATE AND SIGNATURE SECTION
    drawText(page3, 'Corresponding Date to Fitness Log (i.e. Day 4):', 50, 200, 10, true);
    drawInputLine(page3, 50, 185, 400);
    
    drawText(page3, 'Applicant Signature', 50, 150, 10, true);
    drawInputLine(page3, 50, 135, 200);
    
    drawText(page3, 'Date Signed', 300, 150, 10, true);
    drawInputLine(page3, 300, 135, 150);
    
    // Disclaimer
    drawText(page3, '(Falsifying any information above may lead to your getting disqualified from the Constable Selection Process)', 150, 100, 9);
    
    // 8. SAVE AND SHARE THE PDF
    const bytes = await pdf.save();
    
    // Get cache directory
    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '/tmp/';
    console.log('Using cache directory:', cacheDir);
    const outPath = `${cacheDir}oacp_fitness_log.pdf`;
    
    // Write the PDF bytes
    const base64 = btoa(String.fromCharCode(...bytes));
    await FileSystem.writeAsStringAsync(outPath, base64, {
      encoding: FileSystem.EncodingType.Base64
    });
    console.log('PDF written successfully to:', outPath);

    // Open iOS share sheet
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(outPath, { mimeType: 'application/pdf', dialogTitle: 'Share OACP Fitness Log' });
      console.log('Share sheet opened successfully');
    } else {
      console.log('Sharing not available');
    }
    
    console.log('OACP PDF export completed successfully - 3 pages generated');
    return outPath;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error(`Failed to export OACP PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}