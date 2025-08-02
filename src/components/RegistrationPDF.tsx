import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from '@react-pdf/renderer';

// Register Arabic font with a reliable source
Font.register({
  family: 'Amiri',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/amiri/v19/J7aRnpd8CGxBHqUpvrIw74j0.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/amiri/v19/J7afnpd8CGxBHqUpvq6J6Lj9eA.woff2',
      fontWeight: 'bold',
    }
  ]
});

// Fallback: register a simple Arabic-supporting font
Font.registerHyphenationCallback(word => [word]);

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Amiri',
    fontSize: 11,
    direction: 'rtl',
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
    'goalkeeper': 'حارس مرمى',
    'defender': 'مدافع',
    'midfielder': 'وسط ميدان',
    'forward': 'مهاجم',
    'any': 'أي مركز'
  };
  return translations[position] || position;
};

const translateFoot = (foot: string) => {
  const translations: { [key: string]: string } = {
    'right': 'اليمنى',
    'left': 'اليسرى',
    'both': 'كلاهما'
  };
  return translations[foot] || foot;
};

const translateProgram = (program: string) => {
  const translations: { [key: string]: string } = {
    'children': 'البراعم (5-8 سنوات)',
    'youth': 'الأشبال (9-12 سنة)',
    'junior': 'الناشئين (13-16 سنة)'
  };
  return translations[program] || program;
};

const translateHowHeard = (source: string) => {
  const translations: { [key: string]: string } = {
    'social_media': 'وسائل التواصل الاجتماعي',
    'friends': 'من الأصدقاء',
    'family': 'من العائلة',
    'internet': 'البحث على الإنترنت',
    'advertisement': 'إعلان',
    'other': 'أخرى'
  };
  return translations[source] || source;
};

export const RegistrationPDF: React.FC<RegistrationPDFProps> = ({ data, serialNumber }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Serial Number */}
      {serialNumber && (
        <Text style={styles.serialNumber}>
          رقم التسجيل: {serialNumber}
        </Text>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>أكاديمية تكنو لكرة القدم</Text>
          <Text style={styles.subtitle}>استمارة التسجيل الإلكترونية</Text>
        </View>
        <Image
          style={styles.logo}
          src="/lovable-uploads/110f1368-cc3e-49a8-ba42-0e0f2e7ec6ee.png"
        />
      </View>

      {/* Date */}
      <Text style={styles.date}>
        تاريخ التسجيل: {new Date().toLocaleDateString('ar-DZ')}
      </Text>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
        <View style={styles.row}>
          <Text style={styles.label}>الاسم الكامل:</Text>
          <Text style={styles.value}>{data.full_name || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>تاريخ الميلاد:</Text>
          <Text style={styles.value}>{data.date_of_birth || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>الجنسية:</Text>
          <Text style={styles.value}>{data.nationality || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>رقم الهاتف:</Text>
          <Text style={styles.value}>{data.phone || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>البريد الإلكتروني:</Text>
          <Text style={styles.value}>{data.email || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>العنوان:</Text>
          <Text style={styles.value}>{data.address || 'غير محدد'}</Text>
        </View>
      </View>

      {/* Parent Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات ولي الأمر</Text>
        <View style={styles.row}>
          <Text style={styles.label}>اسم ولي الأمر:</Text>
          <Text style={styles.value}>{data.parent_name || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>رقم الهاتف:</Text>
          <Text style={styles.value}>{data.parent_phone || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>البريد الإلكتروني:</Text>
          <Text style={styles.value}>{data.parent_email || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>رقم الهوية:</Text>
          <Text style={styles.value}>{data.parent_id_number || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>المهنة:</Text>
          <Text style={styles.value}>{data.parent_profession || 'غير محدد'}</Text>
        </View>
      </View>

      {/* Technical Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلومات التقنية</Text>
        <View style={styles.row}>
          <Text style={styles.label}>المركز المفضل:</Text>
          <Text style={styles.value}>{data.position ? translatePosition(data.position) : 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>القدم المفضلة:</Text>
          <Text style={styles.value}>{data.preferred_foot ? translateFoot(data.preferred_foot) : 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>البرنامج المفضل:</Text>
          <Text style={styles.value}>{data.program_preference ? translateProgram(data.program_preference) : 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>الخبرة السابقة:</Text>
          <Text style={styles.value}>{data.previous_experience || 'لا توجد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>الحالات الطبية:</Text>
          <Text style={styles.value}>{data.medical_conditions || 'لا توجد'}</Text>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات الطوارئ</Text>
        <View style={styles.row}>
          <Text style={styles.label}>اسم جهة الاتصال:</Text>
          <Text style={styles.value}>{data.emergency_contact_name || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>رقم الهاتف:</Text>
          <Text style={styles.value}>{data.emergency_contact_phone || 'غير محدد'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>علاقة القرابة:</Text>
          <Text style={styles.value}>{data.emergency_contact_relation || 'غير محدد'}</Text>
        </View>
      </View>

      {/* Additional Information */}
      {(data.how_did_you_hear || data.additional_notes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات إضافية</Text>
          {data.how_did_you_hear && (
            <View style={styles.row}>
              <Text style={styles.label}>كيف سمعت عنا:</Text>
              <Text style={styles.value}>{translateHowHeard(data.how_did_you_hear)}</Text>
            </View>
          )}
          {data.additional_notes && (
            <View style={styles.row}>
              <Text style={styles.label}>ملاحظات إضافية:</Text>
              <Text style={styles.value}>{data.additional_notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        أكاديمية تكنو لكرة القدم - الجزائر العاصمة{'\n'}
        +213 XXX XXX XXX | info@tecnofootball.dz{'\n'}
        © 2024 جميع الحقوق محفوظة
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