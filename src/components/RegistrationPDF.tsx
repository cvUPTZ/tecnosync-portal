import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  serialNumber: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '8 12',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 15,
    borderBottom: '3 solid #2563eb',
    paddingBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
  },
  logo: {
    width: 70,
    height: 70,
    marginLeft: 20,
    borderRadius: 35,
    border: '2 solid #2563eb',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: 'normal',
  },
  section: {
    marginBottom: 18,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1 solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 6,
    backgroundColor: '#dbeafe',
    padding: '8 12',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: '4 0',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    width: '40%',
    paddingRight: 10,
  },
  value: {
    fontSize: 12,
    color: '#1f2937',
    width: '60%',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'left',
    marginBottom: 20,
  },
});

interface RegistrationPDFProps {
  data: {
    full_name: string;
    date_of_birth: string;
    nationality: string;
    phone: string;
    email: string;
    address: string;
    parent_name: string;
    parent_phone: string;
    parent_email?: string;
    parent_id_number: string;
    parent_profession?: string;
    position?: string;
    previous_experience?: string;
    medical_conditions?: string;
    preferred_foot?: string;
    program_preference?: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
    how_did_you_hear?: string;
    additional_notes?: string;
  };
  serialNumber?: string;
}

const translatePosition = (position: string) => {
  const translations: { [key: string]: string } = {
    'goalkeeper': 'Goalkeeper',
    'defender': 'Defender', 
    'midfielder': 'Midfielder',
    'forward': 'Forward',
    'any': 'Any Position'
  };
  return translations[position] || position;
};

const translateFoot = (foot: string) => {
  const translations: { [key: string]: string } = {
    'right': 'Right',
    'left': 'Left',
    'both': 'Both'
  };
  return translations[foot] || foot;
};

const translateProgram = (program: string) => {
  const translations: { [key: string]: string } = {
    'children': 'Children (5-8 years)',
    'youth': 'Youth (9-12 years)', 
    'junior': 'Junior (13-16 years)'
  };
  return translations[program] || program;
};

const translateHowHeard = (source: string) => {
  const translations: { [key: string]: string } = {
    'social_media': 'Social Media',
    'friends': 'Friends',
    'family': 'Family',
    'internet': 'Internet Search',
    'advertisement': 'Advertisement',
    'other': 'Other'
  };
  return translations[source] || source;
};

export const RegistrationPDF: React.FC<RegistrationPDFProps> = ({ data, serialNumber }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Serial Number */}
      {serialNumber && (
        <Text style={styles.serialNumber}>
          Registration No: {serialNumber}
        </Text>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Tecno Football Academy</Text>
          <Text style={styles.subtitle}>Electronic Registration Form</Text>
        </View>
      </View>

      {/* Date */}
      <Text style={styles.date}>
        Registration Date: {new Date().toLocaleDateString('en-US')}
      </Text>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>{data.full_name || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{data.date_of_birth || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nationality:</Text>
          <Text style={styles.value}>{data.nationality || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{data.phone || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.address || 'Not specified'}</Text>
        </View>
      </View>

      {/* Parent Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parent Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Parent Name:</Text>
          <Text style={styles.value}>{data.parent_name || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{data.parent_phone || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.parent_email || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ID Number:</Text>
          <Text style={styles.value}>{data.parent_id_number || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Profession:</Text>
          <Text style={styles.value}>{data.parent_profession || 'Not specified'}</Text>
        </View>
      </View>

      {/* Technical Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technical Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Preferred Position:</Text>
          <Text style={styles.value}>{data.position ? translatePosition(data.position) : 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Preferred Foot:</Text>
          <Text style={styles.value}>{data.preferred_foot ? translateFoot(data.preferred_foot) : 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Program Preference:</Text>
          <Text style={styles.value}>{data.program_preference ? translateProgram(data.program_preference) : 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Previous Experience:</Text>
          <Text style={styles.value}>{data.previous_experience || 'None'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Medical Conditions:</Text>
          <Text style={styles.value}>{data.medical_conditions || 'None'}</Text>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Contact Name:</Text>
          <Text style={styles.value}>{data.emergency_contact_name || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{data.emergency_contact_phone || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Relationship:</Text>
          <Text style={styles.value}>{data.emergency_contact_relation || 'Not specified'}</Text>
        </View>
      </View>

      {/* Additional Information */}
      {(data.how_did_you_hear || data.additional_notes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {data.how_did_you_hear && (
            <View style={styles.row}>
              <Text style={styles.label}>How did you hear about us:</Text>
              <Text style={styles.value}>{translateHowHeard(data.how_did_you_hear)}</Text>
            </View>
          )}
          {data.additional_notes && (
            <View style={styles.row}>
              <Text style={styles.label}>Additional Notes:</Text>
              <Text style={styles.value}>{data.additional_notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Tecno Football Academy - Algiers{'\n'}
        +213 XXX XXX XXX | info@tecnofootball.dz{'\n'}
        © 2024 All Rights Reserved
      </Text>
    </Page>
  </Document>
);

// Function to generate serial number
const generateSerialNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TFA${timestamp}${random}`;
};

// Function to generate and download PDF
export const generateRegistrationPDF = async (data: RegistrationPDFProps['data']) => {
  try {
    const serialNumber = generateSerialNumber();
    const doc = <RegistrationPDF data={data} serialNumber={serialNumber} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تسجيل-${data.full_name.replace(/\s+/g, '-')}-${serialNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return serialNumber;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('فشل في إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
  }
};