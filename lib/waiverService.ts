import { supabase } from './supabase';
import { EnhancedWaiverData } from '@/components/EnhancedWaiverModal';

export interface WaiverFileData {
  signature_file_path: string;
  waiver_pdf_path: string;
}

export class WaiverService {
  private static readonly BUCKET_NAME = 'waivers';
  private static readonly CURRENT_VERSION = '2025-01-01';

  /**
   * Get the current waiver version from app settings
   */
  static async getCurrentWaiverVersion(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'current_waiver_version')
        .single();

      if (error) {
        console.error('Error fetching waiver version:', error);
        return this.CURRENT_VERSION;
      }

      return data?.value || this.CURRENT_VERSION;
    } catch (error) {
      console.error('Error getting waiver version:', error);
      return this.CURRENT_VERSION;
    }
  }

  /**
   * Get user's last signed waiver version
   */
  static async getUserLastWaiverVersion(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_last_waiver_version', { user_uuid: userId });

      if (error) {
        console.error('Error fetching user waiver version:', error);
        return 'none';
      }

      return data || 'none';
    } catch (error) {
      console.error('Error getting user waiver version:', error);
      return 'none';
    }
  }

  /**
   * Check if user needs to re-sign waiver
   */
  static async needsResignature(userId: string): Promise<boolean> {
    const currentVersion = await this.getCurrentWaiverVersion();
    const lastVersion = await this.getUserLastWaiverVersion(userId);
    
    return lastVersion === 'none' || lastVersion < currentVersion;
  }

  /**
   * Upload signature data to Supabase storage
   * Handles both base64 image data and JSON signature paths
   */
  static async uploadSignature(
    userId: string,
    waiverId: string,
    signatureData: string
  ): Promise<string> {
    try {
      // Validate signature data
      if (!signatureData || typeof signatureData !== 'string') {
        throw new Error('Invalid signature data provided');
      }

      // Check if it's JSON signature data (from SignatureCanvas)
      if (signatureData.startsWith('[') || signatureData.startsWith('{')) {
        try {
          JSON.parse(signatureData);
          // Store JSON signature data as a text file
          const blob = new Blob([signatureData], { type: 'application/json' });
          const filePath = `${userId}/${waiverId}/signature.json`;
          
          const { data, error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(filePath, blob, {
              contentType: 'application/json',
              upsert: true,
            });

          if (error) {
            throw new Error(`Failed to upload signature: ${error.message}`);
          }

          return filePath;
        } catch (jsonError) {
          throw new Error('Invalid signature data format');
        }
      }

      // Handle base64 image data
      const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
      
      // Validate base64 string
      if (!this.isValidBase64(base64Data)) {
        throw new Error('Invalid base64 signature data format');
      }

      const blob = this.base64ToBlob(base64Data, 'image/png');
      
      // Create file path
      const filePath = `${userId}/${waiverId}/signature.png`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to upload signature: ${error.message}`);
      }

      return filePath;
    } catch (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }
  }

  /**
   * Generate and upload waiver PDF
   */
  static async generateAndUploadWaiverPDF(
    userId: string,
    waiverId: string,
    waiverData: EnhancedWaiverData,
    sessionData: any
  ): Promise<string> {
    try {
      // Generate PDF content
      const pdfContent = this.generateWaiverPDFContent(waiverData, sessionData);
      
      // Convert to blob
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      // Create file path
      const filePath = `${userId}/${waiverId}/waiver.pdf`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to upload waiver PDF: ${error.message}`);
      }

      return filePath;
    } catch (error) {
      console.error('Error generating waiver PDF:', error);
      throw error;
    }
  }

  /**
   * Update waiver with file paths
   */
  static async updateWaiverFiles(
    waiverId: string,
    signaturePath: string,
    pdfPath: string
  ): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Only update signature path if it's not empty
      if (signaturePath) {
        updateData.signature_file_path = signaturePath;
      }

      // Only update PDF path if it's not empty
      if (pdfPath) {
        updateData.waiver_pdf_path = pdfPath;
      }

      const { error } = await supabase
        .from('waivers')
        .update(updateData)
        .eq('id', waiverId);

      if (error) {
        throw new Error(`Failed to update waiver files: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating waiver files:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for waiver PDF
   */
  static async getWaiverPDFUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting waiver PDF URL:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for signature data
   */
  static async getSignatureImageUrl(filePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signature image URL:', error);
      throw error;
    }
  }

  /**
   * Convert JSON signature data to base64 image
   * This can be used to display signatures or include them in PDFs
   */
  static convertSignatureToBase64(signatureData: string): string {
    try {
      // Check if it's already base64
      if (signatureData.startsWith('data:image/')) {
        return signatureData;
      }

      // Try to parse as JSON signature data
      const signaturePaths = JSON.parse(signatureData);
      
      // For now, return a placeholder image
      // In a real implementation, you would render the signature paths to a canvas
      // and convert it to base64
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } catch (error) {
      console.error('Error converting signature to base64:', error);
      // Return a placeholder image
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  /**
   * Validate base64 string
   */
  private static isValidBase64(str: string): boolean {
    try {
      // Check if string is empty
      if (!str || str.length === 0) {
        return false;
      }

      // Check if length is valid (must be multiple of 4)
      if (str.length % 4 !== 0) {
        return false;
      }

      // Check if string contains only valid base64 characters
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        return false;
      }

      // Try to decode to see if it's valid
      atob(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert base64 to blob with error handling
   */
  private static base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      // Ensure proper padding
      let paddedBase64 = base64;
      while (paddedBase64.length % 4 !== 0) {
        paddedBase64 += '=';
      }

      const byteCharacters = atob(paddedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      throw new Error(`Failed to convert base64 to blob: ${(error as Error).message}`);
    }
  }

  /**
   * Generate PDF content for waiver
   */
  private static generateWaiverPDFContent(
    waiverData: EnhancedWaiverData,
    sessionData: any
  ): string {
    // This is a simplified PDF generation
    // In a real implementation, you'd use a proper PDF library like jsPDF or PDFKit
    
    const pdfContent = `
FIT4DUTY FITNESS ASSESSMENT WAIVER

Session Information:
- Session: ${sessionData.title}
- Date: ${sessionData.session_date}
- Time: ${sessionData.session_time}
- Location: ${sessionData.location_name}

Participant Information:
- Full Name: ${waiverData.full_name}
- Date of Birth: ${waiverData.date_of_birth}
- Phone: ${waiverData.phone}
- Email: ${waiverData.email}
- Address: ${waiverData.address || 'Not provided'}
- City: ${waiverData.city || 'Not provided'}
- Province: ${waiverData.province || 'Not provided'}

Emergency Contact:
- Name: ${waiverData.emergency_contact_name}
- Phone: ${waiverData.emergency_contact_phone}
- Relationship: ${waiverData.emergency_contact_relationship}

Medical Information:
- Medical Conditions: ${waiverData.medical_conditions || 'None reported'}
- Medications: ${waiverData.medications || 'None reported'}
- Allergies: ${waiverData.allergies || 'None reported'}

Legal Acknowledgments:
- Medically Fit: ${waiverData.medically_fit ? 'Yes' : 'No'}
- Understand Risks: ${waiverData.understand_risks ? 'Yes' : 'No'}
- Release Liability: ${waiverData.release_liability ? 'Yes' : 'No'}
- Consent Emergency Care: ${waiverData.consent_emergency_care ? 'Yes' : 'No'}
- Agree Policies: ${waiverData.agree_policies ? 'Yes' : 'No'}

Signature:
- Typed Legal Name: ${waiverData.typed_legal_name}
- Signature Timestamp: ${waiverData.signature_timestamp}
- Waiver Version: ${waiverData.waiver_version}

This document serves as a legally binding waiver for participation in fitness assessment activities with Fit4Duty.
    `;

    return pdfContent;
  }

  /**
   * Create booking with waiver and payment
   */
  static async createBookingWithWaiver(
    sessionId: string,
    waiverData: EnhancedWaiverData,
    paymentIntentId?: string,
    userId?: string
  ): Promise<{ bookingId: string; waiverId: string }> {
    try {
      // Additional debugging for booking duplication issue
      const { data, error } = await supabase
        .rpc('create_booking_with_waiver', {
          session_uuid: sessionId,
          waiver_data: waiverData,
          payment_intent_id: paymentIntentId,
          user_uuid: userId,
        });

      if (error) {
        throw new Error(`Failed to create booking: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from booking creation');
      }

      const result = data;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create booking');
      }

      return {
        bookingId: result.booking_id,
        waiverId: result.waiver_id,
      };
    } catch (error) {
      console.error('Error creating booking with waiver:', error);
      throw error;
    }
  }

  /**
   * Update booking payment status
   */
  static async updateBookingPayment(
    bookingId: string,
    paymentStatus: string,
    paymentMethod?: string,
    transactionId?: string,
    receiptUrl?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_booking_payment', {
          booking_uuid: bookingId,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          receipt_url: receiptUrl,
        });

      if (error) {
        throw new Error(`Failed to update booking payment: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating booking payment:', error);
      throw error;
    }
  }
}
