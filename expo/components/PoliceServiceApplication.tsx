import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { 
  MapPin, 
  ExternalLink, 
  Users, 
  Calendar, 
  Award,
  Star,
  CheckCircle,
  Building,
  Phone,
  Globe,
  Mail,
  Clock,
  TrendingUp,
  Shield,
  Car,
  GraduationCap,
  FileText,
  Download,
  Info,
  AlertCircle,
  Settings
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';

interface PoliceService {
  id: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  applicationUrl: string;
  phone: string;
  website: string;
  email: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: {
    starting: string;
    max: string;
  };
  hiringStatus: 'Active' | 'Limited' | 'Closed';
  nextHiringDate?: string;
  specializations: string[];
  applicationDeadline?: string;
}

interface PoliceServiceApplicationProps {
  serviceId: string;
  onServiceChange?: () => void;
}

const PoliceServiceApplication: React.FC<PoliceServiceApplicationProps> = ({ serviceId, onServiceChange }) => {
  const [selectedService, setSelectedService] = useState<PoliceService | null>(null);

  const policeServices: PoliceService[] = [
    {
      id: 'toronto',
      name: 'Toronto Police Service',
      shortName: 'TPS',
      city: 'Toronto',
      region: 'Greater Toronto Area',
      coordinates: { latitude: 43.6532, longitude: -79.3832 },
      applicationUrl: 'https://www.torontopolice.on.ca/careers/',
      phone: '416-808-2222',
      website: 'https://www.torontopolice.on.ca/',
      email: 'recruiting@torontopolice.on.ca',
      description: 'The largest municipal police service in Canada, serving over 2.9 million residents across 140 neighborhoods in Toronto. Established in 1834, TPS operates 17 divisions and specialized units including the Emergency Task Force, Marine Unit, and Mounted Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'References (minimum 3)',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $65,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Diverse career paths and specializations',
        'Work-life balance programs',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$65,000',
        max: '$100,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Traffic Services', 'Homicide Squad', 'Cyber Crime Unit', 'Community Response Unit', 'Emergency Task Force', 'Marine Unit', 'Mounted Unit', 'K9 Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'opp',
      name: 'Ontario Provincial Police',
      shortName: 'OPP',
      city: 'Orillia',
      region: 'Province-wide',
      coordinates: { latitude: 44.6084, longitude: -79.4201 },
      applicationUrl: 'https://www.opp.ca/index.php?id=115',
      phone: '1-888-310-1122',
      website: 'https://www.opp.ca/',
      email: 'recruiting@opp.ca',
      description: 'The provincial police service providing law enforcement across Ontario\'s 1.1 million square kilometers. Established in 1909, the OPP serves over 300 municipalities and patrols 17,000 km of provincial highways. The service operates specialized units including the Highway Safety Division, Organized Crime Enforcement Bureau, and Provincial Emergency Response Team.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'References (minimum 3)',
        'CPR/First Aid certification',
        'Educational transcripts',
        'Professional references'
      ],
      benefits: [
        'Province-wide deployment opportunities',
        'Competitive salary and benefits',
        'Pension plan',
        'Professional development and training',
        'Diverse policing environments',
        'Career advancement opportunities'
      ],
      salary: {
        starting: '$62,000',
        max: '$95,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Highway Safety Division', 'Rural Policing', 'Marine Unit', 'Aviation Services', 'Provincial Emergency Response Team', 'Organized Crime Enforcement', 'Cyber Crime Unit', 'K9 Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'peel',
      name: 'Peel Regional Police',
      shortName: 'PRP',
      city: 'Mississauga',
      region: 'Peel Region',
      coordinates: { latitude: 43.5890, longitude: -79.6441 },
      applicationUrl: 'https://www.peelpolice.ca/en/contact-us/careers.aspx',
      phone: '905-453-3311',
      website: 'https://www.peelpolice.ca/',
      email: 'recruiting@peelpolice.ca',
      description: 'Serving the diverse communities of Mississauga and Brampton, the fastest-growing region in Canada. Peel Regional Police serves over 1.4 million residents across 1,200 square kilometers. Established in 1974, the service operates 12 divisions and specialized units including the Tactical Support Unit, Cyber Crime Bureau, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification',
        'Additional certifications (if applicable)'
      ],
      benefits: [
        'Starting salary: $63,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Community-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$63,000',
        max: '$98,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Youth Services', 'Cyber Crime Bureau', 'Tactical Support Unit', 'K9 Unit', 'Marine Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'york',
      name: 'York Regional Police',
      shortName: 'YRP',
      city: 'Aurora',
      region: 'York Region',
      coordinates: { latitude: 44.0001, longitude: -79.4663 },
      applicationUrl: 'https://www.yrp.ca/en/careers/',
      phone: '1-866-876-5423',
      website: 'https://www.yrp.ca/',
      email: 'recruiting@yrp.ca',
      description: 'Serving the communities of York Region including Vaughan, Richmond Hill, Markham, and Newmarket. York Regional Police serves over 1.2 million residents across 1,762 square kilometers. Established in 1971, the service operates 5 divisions and specialized units including the Emergency Response Unit, Organized Crime Bureau, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification',
        'Additional certifications (if applicable)'
      ],
      benefits: [
        'Starting salary: $64,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Community-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$64,000',
        max: '$99,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Youth Services', 'Cyber Crime Bureau', 'Emergency Response Unit', 'K9 Unit', 'Marine Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'durham',
      name: 'Durham Regional Police',
      shortName: 'DRPS',
      city: 'Whitby',
      region: 'Durham Region',
      coordinates: { latitude: 43.8975, longitude: -78.9428 },
      applicationUrl: 'https://www.drps.ca/careers/',
      phone: '1-888-579-1520',
      website: 'https://www.drps.ca/',
      email: 'recruiting@drps.ca',
      description: 'Serving the communities of Durham Region including Oshawa, Whitby, Ajax, and Pickering. Durham Regional Police serves over 700,000 residents across 2,523 square kilometers. Established in 1974, the service operates 5 divisions and specialized units including the Tactical Support Unit, Organized Crime Enforcement Bureau, and Community Safety and Well-Being Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification',
        'Additional certifications (if applicable)'
      ],
      benefits: [
        'Starting salary: $61,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Community-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$61,000',
        max: '$96,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Youth Services', 'Cyber Crime Bureau', 'Tactical Support Unit', 'K9 Unit', 'Marine Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'hamilton',
      name: 'Hamilton Police Service',
      shortName: 'HPS',
      city: 'Hamilton',
      region: 'Hamilton',
      coordinates: { latitude: 43.2557, longitude: -79.8711 },
      applicationUrl: 'https://www.hamiltonpolice.on.ca/careers/',
      phone: '905-546-4925',
      website: 'https://www.hamiltonpolice.on.ca/',
      email: 'recruiting@hamiltonpolice.on.ca',
      description: 'Serving the City of Hamilton, a major port city and industrial center in Southern Ontario. Hamilton Police Service serves over 580,000 residents across 1,138 square kilometers. Established in 1833, the service operates 3 divisions and specialized units including the Emergency Response Unit, Organized Crime Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification',
        'Additional certifications (if applicable)'
      ],
      benefits: [
        'Starting salary: $60,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Community-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$60,000',
        max: '$94,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Youth Services', 'Cyber Crime Bureau', 'Emergency Response Unit', 'K9 Unit', 'Marine Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'niagara',
      name: 'Niagara Regional Police',
      shortName: 'NRPS',
      city: 'Niagara Falls',
      region: 'Niagara Region',
      coordinates: { latitude: 43.0962, longitude: -79.0377 },
      applicationUrl: 'https://www.niagarapolice.ca/careers/',
      phone: '905-688-4111',
      website: 'https://www.niagarapolice.ca/',
      email: 'recruiting@niagarapolice.ca',
      description: 'Serving the Niagara Region including Niagara Falls, St. Catharines, and Welland. Niagara Regional Police serves over 450,000 residents across 1,852 square kilometers. The service operates specialized units including the Emergency Response Unit, Marine Unit, and Tourism Policing Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $59,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Tourism-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$59,000',
        max: '$93,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Tourism Policing', 'Marine Unit', 'Emergency Response Unit', 'K9 Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'waterloo',
      name: 'Waterloo Regional Police',
      shortName: 'WRPS',
      city: 'Kitchener',
      region: 'Waterloo Region',
      coordinates: { latitude: 43.4516, longitude: -80.4925 },
      applicationUrl: 'https://www.wrps.on.ca/careers/',
      phone: '519-570-9777',
      website: 'https://www.wrps.on.ca/',
      email: 'recruiting@wrps.on.ca',
      description: 'Serving the Waterloo Region including Kitchener, Waterloo, and Cambridge. Waterloo Regional Police serves over 600,000 residents across 1,369 square kilometers. The service operates specialized units including the Emergency Response Unit, Cyber Crime Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $62,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Technology-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$62,000',
        max: '$97,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Cyber Crime Unit', 'Emergency Response Unit', 'K9 Unit', 'Youth Services'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'london',
      name: 'London Police Service',
      shortName: 'LPS',
      city: 'London',
      region: 'London',
      coordinates: { latitude: 42.9849, longitude: -81.2453 },
      applicationUrl: 'https://www.londonpolice.ca/careers/',
      phone: '519-661-5670',
      website: 'https://www.londonpolice.ca/',
      email: 'recruiting@londonpolice.ca',
      description: 'Serving the City of London, a major educational and healthcare center in Southwestern Ontario. London Police Service serves over 400,000 residents across 420 square kilometers. The service operates specialized units including the Emergency Response Unit, Cyber Crime Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $61,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Community-focused policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$61,000',
        max: '$95,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Cyber Crime Unit', 'Emergency Response Unit', 'K9 Unit', 'Youth Services'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'windsor',
      name: 'Windsor Police Service',
      shortName: 'WPS',
      city: 'Windsor',
      region: 'Windsor',
      coordinates: { latitude: 42.3149, longitude: -83.0364 },
      applicationUrl: 'https://www.windsorpolice.ca/careers/',
      phone: '519-255-6700',
      website: 'https://www.windsorpolice.ca/',
      email: 'recruiting@windsorpolice.ca',
      description: 'Serving the City of Windsor, a major border city and automotive center in Southwestern Ontario. Windsor Police Service serves over 230,000 residents across 146 square kilometers. The service operates specialized units including the Emergency Response Unit, Border Policing Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $60,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Border policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$60,000',
        max: '$94,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Border Policing', 'Emergency Response Unit', 'K9 Unit', 'Marine Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'ottawa',
      name: 'Ottawa Police Service',
      shortName: 'OPS',
      city: 'Ottawa',
      region: 'Ottawa',
      coordinates: { latitude: 45.4215, longitude: -75.6972 },
      applicationUrl: 'https://www.ottawapolice.ca/careers/',
      phone: '613-236-1222',
      website: 'https://www.ottawapolice.ca/',
      email: 'recruiting@ottawapolice.ca',
      description: 'Serving the City of Ottawa, Canada\'s capital city. Ottawa Police Service serves over 1 million residents across 2,790 square kilometers. The service operates specialized units including the Emergency Response Unit, Parliamentary Protective Service, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification',
        'Security clearance (for certain positions)'
      ],
      benefits: [
        'Starting salary: $63,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Capital policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$63,000',
        max: '$98,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Parliamentary Protection', 'Emergency Response Unit', 'K9 Unit', 'Cyber Crime Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'kingston',
      name: 'Kingston Police',
      shortName: 'KP',
      city: 'Kingston',
      region: 'Kingston',
      coordinates: { latitude: 44.2312, longitude: -76.4860 },
      applicationUrl: 'https://www.kingstonpolice.ca/careers/',
      phone: '613-549-4660',
      website: 'https://www.kingstonpolice.ca/',
      email: 'recruiting@kingstonpolice.ca',
      description: 'Serving the City of Kingston, a historic university city and military center in Eastern Ontario. Kingston Police serves over 130,000 residents across 450 square kilometers. The service operates specialized units including the Emergency Response Unit, Marine Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $58,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'University town policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$58,000',
        max: '$92,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'University Policing', 'Emergency Response Unit', 'K9 Unit', 'Marine Unit'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'sudbury',
      name: 'Greater Sudbury Police Service',
      shortName: 'GSPS',
      city: 'Sudbury',
      region: 'Greater Sudbury',
      coordinates: { latitude: 46.4917, longitude: -80.9930 },
      applicationUrl: 'https://www.gsps.ca/careers/',
      phone: '705-675-9171',
      website: 'https://www.gsps.ca/',
      email: 'recruiting@gsps.ca',
      description: 'Serving the City of Greater Sudbury, a major mining and educational center in Northern Ontario. Greater Sudbury Police Service serves over 160,000 residents across 3,627 square kilometers. The service operates specialized units including the Emergency Response Unit, Mining Security Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $59,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Northern Ontario policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$59,000',
        max: '$93,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Mining Security', 'Emergency Response Unit', 'K9 Unit', 'Rural Policing'],
      applicationDeadline: 'Rolling applications'
    },
    {
      id: 'thunder-bay',
      name: 'Thunder Bay Police Service',
      shortName: 'TBPS',
      city: 'Thunder Bay',
      region: 'Thunder Bay',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      applicationUrl: 'https://www.thunderbaypolice.ca/careers/',
      phone: '807-684-1200',
      website: 'https://www.thunderbaypolice.ca/',
      email: 'recruiting@thunderbaypolice.ca',
      description: 'Serving the City of Thunder Bay, a major port city and transportation hub in Northwestern Ontario. Thunder Bay Police Service serves over 110,000 residents across 328 square kilometers. The service operates specialized units including the Emergency Response Unit, Port Security Unit, and Community Mobilization Unit.',
      requirements: [
        'OACP Certificate required',
        'Minimum 18 years of age',
        'Canadian citizen or permanent resident',
        'Valid driver\'s license',
        'High school diploma or equivalent',
        'Clean criminal record',
        'Physical fitness standards met',
        'Birth certificate or passport',
        'Educational transcripts',
        'Criminal record check',
        'Driver\'s abstract',
        'Resume and cover letter',
        'Professional references',
        'CPR/First Aid certification'
      ],
      benefits: [
        'Starting salary: $57,000 with annual increases',
        'Comprehensive health and dental benefits',
        'OMERS pension plan',
        'Professional development and training programs',
        'Northwestern Ontario policing opportunities',
        'Diverse work environment with growth potential',
        'Wellness and mental health support programs'
      ],
      salary: {
        starting: '$57,000',
        max: '$91,000+'
      },
      hiringStatus: 'Active',
      nextHiringDate: 'Ongoing',
      specializations: ['Community Policing', 'Traffic Services', 'Major Crime Bureau', 'Port Security', 'Emergency Response Unit', 'K9 Unit', 'Rural Policing'],
      applicationDeadline: 'Rolling applications'
    }
  ];

  useEffect(() => {
    if (serviceId) {
      const service = policeServices.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      } else {
        Alert.alert('Error', 'Police service not found');
        router.back();
      }
    }
  }, [serviceId]);

  const handleApplyNow = async () => {
    if (!selectedService) return;
    
    try {
      await Linking.openURL(selectedService.applicationUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open application page. Please visit the website manually.');
    }
  };

  const handleContact = (type: 'phone' | 'email' | 'website') => {
    if (!selectedService) return;
    
    let url = '';
    switch (type) {
      case 'phone':
        url = `tel:${selectedService.phone}`;
        break;
      case 'email':
        url = `mailto:${selectedService.email}`;
        break;
      case 'website':
        url = selectedService.website;
        break;
    }
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link. Please try again.');
    });
  };

  const getHiringStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return Colors.success;
      case 'Limited': return Colors.warning;
      case 'Closed': return Colors.error;
      default: return Colors.gray[400];
    }
  };

  if (!selectedService) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading service information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{selectedService.name}</Text>
            <Text style={styles.serviceLocation}>
              <MapPin size={16} color={Colors.textSecondary} />
              {selectedService.city}, {selectedService.region}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <View style={[styles.hiringStatus, { backgroundColor: getHiringStatusColor(selectedService.hiringStatus) + '20' }]}>
              <Text style={[styles.hiringStatusText, { color: getHiringStatusColor(selectedService.hiringStatus) }]}>
                {selectedService.hiringStatus}
              </Text>
            </View>
            {onServiceChange && (
              <TouchableOpacity 
                style={styles.changeServiceButton} 
                onPress={() => {
                  Alert.alert(
                    'Change Police Service',
                    'Are you sure you want to change your selected police service? This will update your application preferences.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Change', onPress: onServiceChange }
                    ]
                  );
                }}
              >
                <Settings size={14} color={Colors.textSecondary} />
                <Text style={styles.changeServiceButtonText}>Change Service</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyNow}>
          <ExternalLink size={20} color={Colors.white} />
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
        
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContact('phone')}>
            <Phone size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContact('email')}>
            <Mail size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContact('website')}>
            <Globe size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Overview</Text>
        <Text style={styles.description}>{selectedService.description}</Text>
        
        <View style={styles.overviewStats}>
          <View style={styles.statItem}>
            <Award size={20} color={Colors.primary} />
            <Text style={styles.statNumber}>{selectedService.salary.starting}</Text>
            <Text style={styles.statLabel}>Starting Salary</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.warning} />
            <Text style={styles.statNumber}>{selectedService.requirements.length}</Text>
            <Text style={styles.statLabel}>Requirements</Text>
          </View>
          <View style={styles.statItem}>
            <Shield size={20} color={Colors.success} />
            <Text style={styles.statNumber}>{selectedService.specializations.length}</Text>
            <Text style={styles.statLabel}>Specializations</Text>
          </View>
        </View>
      </View>



      {/* Requirements & Documents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements & Documents</Text>
        {selectedService.requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <CheckCircle size={16} color={Colors.success} />
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>

      {/* Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        {selectedService.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Star size={16} color={Colors.warning} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Specializations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations</Text>
        <View style={styles.specializationsContainer}>
          {selectedService.specializations.map((spec, index) => (
            <View key={index} style={styles.specializationChip}>
              <Shield size={12} color={Colors.primary} />
              <Text style={styles.specializationText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Important Notice */}
      <View style={styles.noticeContainer}>
        <AlertCircle size={20} color={Colors.warning} />
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Important Notice</Text>
          <Text style={styles.noticeText}>
            Application deadlines and processes may change. Always verify current requirements on the official police service website before applying.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceLocation: {
    fontSize: 16,
    color: Colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  hiringStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hiringStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    gap: 4,
  },
  changeServiceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 16,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  section: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },


  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specializationText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '10',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default PoliceServiceApplication;
