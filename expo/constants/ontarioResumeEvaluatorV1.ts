export const ONTARIO_RESUME_EVAL_V1 = {
  version: '2025-08-20',
  categories: [
    {
      key: 'work',
      maxPoints: 25,
      rules: [
        { id: 'work.relevant_3y', type: 'add', points: 18, expr: { var: 'work.policeRelatedYears', op: '>=', value: 3 } },
        { id: 'work.relevant_1to2y', type: 'add', points: 12, expr: { all: [ { var: 'work.policeRelatedYears', op: '>=', value: 1 }, { var: 'work.policeRelatedYears', op: '<', value: 3 } ] } },
        { id: 'work.ft_stability_24m', type: 'add', points: 5, expr: { var: 'work.fullTimeYears', op: '>=', value: 2 } },
        { id: 'work.leadership', type: 'add', points: 3, expr: { var: 'softskills.hasLeadershipEvidence', op: '==', value: true } },
        { id: 'work.reports', type: 'add', points: 2, expr: { var: 'work.reportsPerMonth', op: '>=', value: 4 } },
        { id: 'work.customer_facing', type: 'add', points: 2, expr: { var: 'work.customerFacingHistory', op: '==', value: true } },
        { id: 'work.shift_exposure', type: 'add', points: 1, expr: { var: 'work.shiftExposure', op: '==', value: true } },
      ],
    },
    {
      key: 'fitness',
      maxPoints: 20,
      rules: [
        { id: 'fitness.prep_6m', type: 'add', points: 20, expr: { var: 'fitness.prepVerifiedMonthsAgo', op: '<=', value: 6 } },
        { id: 'fitness.prep_12m', type: 'add', points: 15, expr: { all: [ { var: 'fitness.prepVerifiedMonthsAgo', op: '>', value: 6 }, { var: 'fitness.prepVerifiedMonthsAgo', op: '<=', value: 12 } ] } },
        { id: 'fitness.strong_indicators', type: 'add', points: 10, expr: { var: 'fitness.meetsIndicators', op: '==', value: true } },
        { id: 'fitness.digital_practice', type: 'bonus', points: 3, expr: { var: 'fitness.digitalAttempts', op: '>=', value: 3 } },
      ],
    },
    {
      key: 'volunteer',
      maxPoints: 12,
      rules: [
        { id: 'vol.last12m_75', type: 'add', points: 8, expr: { var: 'volunteer.last12MonthsHours', op: '>=', value: 75 } },
        { id: 'vol.life_150', type: 'add', points: 6, expr: { var: 'volunteer.lifetimeHours', op: '>=', value: 150 } },
        { id: 'vol.vss_role', type: 'add', points: 2, expr: { var: 'volunteer.vssRole', op: '==', value: true } },
        { id: 'vol.leadership', type: 'add', points: 2, expr: { var: 'volunteer.leadership', op: '==', value: true } },
      ],
    },
    {
      key: 'education',
      maxPoints: 12,
      rules: [
        { id: 'edu.degree_relevant', type: 'add', points: 12, expr: { var: 'education.highestCredential', op: 'includes', value: 'degree_relevant' } },
        { id: 'edu.diploma_relevant', type: 'add', points: 10, expr: { var: 'education.highestCredential', op: 'includes', value: 'diploma_relevant' } },
        { id: 'edu.any_post_secondary', type: 'add', points: 7, expr: { var: 'education.highestCredential', op: 'includes', value: 'post_secondary' } },
        { id: 'edu.recent_5y', type: 'bonus', points: 1, expr: { var: 'education.recentYears', op: '<=', value: 5 } },
        { id: 'edu.extra_count_ge1', type: 'add', points: 2, expr: { var: 'education.extraPostSecondaryCount', op: '>=', value: 1 } },
        { id: 'edu.extra_count_ge2', type: 'add', points: 2, expr: { var: 'education.extraPostSecondaryCount', op: '>=', value: 2 } },
      ],
    },
    {
      key: 'certs',
      maxPoints: 10,
      rules: [
        { id: 'certs.cpr_c', type: 'add', points: 3, expr: { var: 'certs.tags', op: 'includes', value: 'cpr_c' } },
        { id: 'certs.mhfa', type: 'add', points: 3, expr: { var: 'certs.tags', op: 'includes', value: 'mhfa' } },
        { id: 'certs.deescalation', type: 'add', points: 2, expr: { var: 'certs.tags', op: 'includes', value: 'deescalation' } },
        { id: 'certs.naloxone', type: 'bonus', points: 1, expr: { var: 'certs.tags', op: 'includes', value: 'naloxone' } },
        { id: 'certs.recent_24m', type: 'bonus', points: 1, expr: { var: 'certs.hasRecent24m', op: '==', value: true } },
      ],
    },
    {
      key: 'driving',
      maxPoints: 8,
      rules: [
        { id: 'drv.full_clean_24m', type: 'add', points: 8, expr: { all: [ { any: [ { var: 'driving.licenceClass', op: '==', value: 'G' }, { var: 'driving.licenceClass', op: '==', value: 'G2' } ] }, { var: 'driving.cleanAbstract24m', op: '==', value: true } ] } },
        { id: 'drv.minor_1', type: 'add', points: 4, expr: { all: [ { any: [ { var: 'driving.licenceClass', op: '==', value: 'G' }, { var: 'driving.licenceClass', op: '==', value: 'G2' } ] }, { var: 'driving.minorTickets24m', op: '<=', value: 1 } ] } },
        { id: 'drv.defensive_course', type: 'bonus', points: 1, expr: { var: 'driving.defensiveCourse', op: '==', value: true } },
      ],
    },
    {
      key: 'background',
      maxPoints: 8,
      rules: [
        { id: 'bg.clean', type: 'add', points: 8, expr: { var: 'background.ok', op: '==', value: true } },
        { id: 'bg.minor_credit', type: 'add', points: 4, expr: { var: 'background.minorCreditManaged', op: '==', value: true } },
        { id: 'bg.social_ok', type: 'bonus', points: 1, expr: { var: 'background.socialMediaOk', op: '==', value: true } },
      ],
    },
    {
      key: 'softskills',
      maxPoints: 3,
      rules: [
        { id: 'ss.second_lang', type: 'add', points: 2, expr: { var: 'softskills.secondLanguageProficient', op: '==', value: true } },
        { id: 'ss.comm_written_public', type: 'add', points: 1, expr: { var: 'softskills.evidenceWrittenOrPublicSpeaking', op: '==', value: true } },
      ],
    },
    {
      key: 'references',
      maxPoints: 2,
      rules: [
        { id: 'ref.strong_set', type: 'add', points: 2, expr: { all: [ { var: 'references.count', op: '>=', value: 3 }, { var: 'references.twoKnow2y', op: '>=', value: 2 }, { var: 'references.supervisorRecent', op: '==', value: true } ] } },
      ],
    }
  ],
  thresholds: [
    { level: 'COMPETITIVE', min: 60 },
    { level: 'EFFECTIVE', min: 40 },
    { level: 'DEVELOPING', min: 20 },
    { level: 'NEEDS_WORK', min: 0 }
  ],
  disqualifiers: [
    { id: 'criminal_open', type: 'disqualifier', expr: { var: 'background.openCharge', op: '==', value: true } },
    { id: 'driving_major_recent', type: 'disqualifier', expr: { var: 'driving.recentMajorOffence24m', op: '==', value: true } },
    { id: 'integrity_dishonesty', type: 'disqualifier', expr: { var: 'background.dishonesty', op: '==', value: true } }
  ]
};


