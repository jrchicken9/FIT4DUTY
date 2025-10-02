export type AgeGroup = '20-29' | '30-34' | '35-39' | '40-49' | '50-59' | '60+';
export type RunAgeGroup = '20-29' | '30-34' | '35-39' | '40-49' | '50+';
export type PushupAgeGroup = '20-29' | '30-39' | '40-49' | '50-59' | '60+';
export type CoreAgeGroup = '20-29' | '30-39' | '40-49' | '50-59' | '60+';
export type SitReachAgeGroup = '20-29' | '30-39' | '40-49' | '50-59' | '60+';
export type Gender = 'male' | 'female';

export interface RunScore {
  score: number;
  max_time: string;
}

export interface PushupScore {
  score: number;
  exact_reps: number;
}

export interface CoreEnduranceScore {
  score: number;
  min_time_sec?: number;
  min_time_sec_range?: [number, number];
  max_time_sec?: number;
}

export interface SitReachScore {
  score: number;
  min_distance_cm: number;
}

export const PIN_TEST_SCORING = {
  run: {
    male: {
      '20-29': [
        {score: 50, max_time: '9:00'},
        {score: 47.5, max_time: '9:30'},
        {score: 45, max_time: '10:00'},
        {score: 42.5, max_time: '10:30'},
        {score: 40, max_time: '10:56'},
        {score: 37.5, max_time: '11:22'},
        {score: 35, max_time: '11:46'},
        {score: 30, max_time: '12:10'},
        {score: 25, max_time: '12:35'},
        {score: 20, max_time: '12:59'},
        {score: 15, max_time: '13:30'},
        {score: 10, max_time: '14:00'},
        {score: 5, max_time: '14:30'}
      ] as RunScore[],
      '30-34': [
        {score: 50, max_time: '9:20'},
        {score: 47.5, max_time: '9:50'},
        {score: 45, max_time: '10:20'},
        {score: 42.5, max_time: '10:50'},
        {score: 40, max_time: '11:20'},
        {score: 37.5, max_time: '11:50'},
        {score: 35, max_time: '12:20'},
        {score: 30, max_time: '12:50'},
        {score: 25, max_time: '13:20'},
        {score: 20, max_time: '13:50'},
        {score: 15, max_time: '14:20'},
        {score: 10, max_time: '14:50'},
        {score: 5, max_time: '15:20'}
      ] as RunScore[],
      '35-39': [
        {score: 50, max_time: '10:06'},
        {score: 47.5, max_time: '10:37'},
        {score: 45, max_time: '11:10'},
        {score: 42.5, max_time: '11:42'},
        {score: 40, max_time: '12:14'},
        {score: 37.5, max_time: '12:47'},
        {score: 35, max_time: '13:19'},
        {score: 30, max_time: '13:52'},
        {score: 25, max_time: '14:24'},
        {score: 20, max_time: '14:56'},
        {score: 15, max_time: '15:29'},
        {score: 10, max_time: '16:01'},
        {score: 5, max_time: '16:34'}
      ] as RunScore[],
      '40-49': [
        {score: 50, max_time: '10:54'},
        {score: 47.5, max_time: '11:41'},
        {score: 45, max_time: '12:17'},
        {score: 42.5, max_time: '12:52'},
        {score: 40, max_time: '13:28'},
        {score: 37.5, max_time: '14:04'},
        {score: 35, max_time: '14:39'},
        {score: 30, max_time: '15:15'},
        {score: 25, max_time: '15:50'},
        {score: 20, max_time: '16:26'},
        {score: 15, max_time: '17:02'},
        {score: 10, max_time: '17:37'},
        {score: 5, max_time: '18:13'}
      ] as RunScore[],
      '50+': [
        {score: 50, max_time: '11:59'},
        {score: 47.5, max_time: '12:51'},
        {score: 45, max_time: '13:31'},
        {score: 42.5, max_time: '14:07'},
        {score: 40, max_time: '14:49'},
        {score: 37.5, max_time: '15:28'},
        {score: 35, max_time: '16:07'},
        {score: 30, max_time: '16:47'},
        {score: 25, max_time: '17:25'},
        {score: 20, max_time: '18:05'},
        {score: 15, max_time: '18:44'},
        {score: 10, max_time: '19:23'},
        {score: 5, max_time: '20:02'}
      ] as RunScore[]
    },
    female: {
      '20-29': [
        {score: 50, max_time: '10:35'},
        {score: 47.5, max_time: '11:10'},
        {score: 45, max_time: '11:52'},
        {score: 42.5, max_time: '12:34'},
        {score: 40, max_time: '13:00'},
        {score: 37.5, max_time: '13:26'},
        {score: 35, max_time: '13:42'},
        {score: 30, max_time: '13:57'},
        {score: 25, max_time: '14:12'},
        {score: 20, max_time: '14:27'},
        {score: 15, max_time: '14:42'},
        {score: 10, max_time: '14:57'},
        {score: 5, max_time: '15:12'}
      ] as RunScore[],
      '30-34': [
        {score: 50, max_time: '11:00'},
        {score: 47.5, max_time: '11:35'},
        {score: 45, max_time: '12:10'},
        {score: 42.5, max_time: '12:45'},
        {score: 40, max_time: '13:20'},
        {score: 37.5, max_time: '13:55'},
        {score: 35, max_time: '14:30'},
        {score: 30, max_time: '15:05'},
        {score: 25, max_time: '15:40'},
        {score: 20, max_time: '16:15'},
        {score: 15, max_time: '16:50'},
        {score: 10, max_time: '17:25'},
        {score: 5, max_time: '18:00'}
      ] as RunScore[],
      '35-39': [
        {score: 50, max_time: '11:53'},
        {score: 47.5, max_time: '12:31'},
        {score: 45, max_time: '13:08'},
        {score: 42.5, max_time: '13:46'},
        {score: 40, max_time: '14:24'},
        {score: 37.5, max_time: '15:02'},
        {score: 35, max_time: '15:40'},
        {score: 30, max_time: '16:17'},
        {score: 25, max_time: '16:55'},
        {score: 20, max_time: '17:33'},
        {score: 15, max_time: '18:11'},
        {score: 10, max_time: '18:49'},
        {score: 5, max_time: '19:26'}
      ] as RunScore[],
      '40-49': [
        {score: 50, max_time: '13:04'},
        {score: 47.5, max_time: '13:46'},
        {score: 45, max_time: '14:27'},
        {score: 42.5, max_time: '15:08'},
        {score: 40, max_time: '15:50'},
        {score: 37.5, max_time: '16:32'},
        {score: 35, max_time: '17:14'},
        {score: 30, max_time: '17:55'},
        {score: 25, max_time: '18:21'},
        {score: 20, max_time: '19:18'},
        {score: 15, max_time: '20:06'},
        {score: 10, max_time: '20:41'},
        {score: 5, max_time: '21:22'}
      ] as RunScore[],
      '50+': [
        {score: 50, max_time: '14:22'},
        {score: 47.5, max_time: '15:08'},
        {score: 45, max_time: '15:53'},
        {score: 42.5, max_time: '16:38'},
        {score: 40, max_time: '17:25'},
        {score: 37.5, max_time: '18:11'},
        {score: 35, max_time: '18:57'},
        {score: 30, max_time: '19:42'},
        {score: 25, max_time: '20:11'},
        {score: 20, max_time: '21:14'},
        {score: 15, max_time: '22:00'},
        {score: 10, max_time: '22:45'},
        {score: 5, max_time: '23:30'}
      ] as RunScore[]
    }
  },
  pushups: {
    male: {
      '20-29': [
        {score: 20, exact_reps: 49},
        {score: 19, exact_reps: 48},
        {score: 18, exact_reps: 36},
        {score: 17, exact_reps: 32},
        {score: 16, exact_reps: 29},
        {score: 15, exact_reps: 27},
        {score: 14, exact_reps: 25},
        {score: 12, exact_reps: 24},
        {score: 10, exact_reps: 21},
        {score: 8, exact_reps: 18},
        {score: 6, exact_reps: 16},
        {score: 4, exact_reps: 11},
        {score: 2, exact_reps: 10}
      ] as PushupScore[],
      '30-39': [
        {score: 20, exact_reps: 37},
        {score: 19, exact_reps: 36},
        {score: 18, exact_reps: 30},
        {score: 17, exact_reps: 25},
        {score: 16, exact_reps: 22},
        {score: 15, exact_reps: 21},
        {score: 14, exact_reps: 20},
        {score: 12, exact_reps: 19},
        {score: 10, exact_reps: 16},
        {score: 8, exact_reps: 14},
        {score: 6, exact_reps: 11},
        {score: 4, exact_reps: 8},
        {score: 2, exact_reps: 7}
      ] as PushupScore[],
      '40-49': [
        {score: 20, exact_reps: 31},
        {score: 19, exact_reps: 30},
        {score: 18, exact_reps: 22},
        {score: 17, exact_reps: 20},
        {score: 16, exact_reps: 17},
        {score: 15, exact_reps: 16},
        {score: 14, exact_reps: 15},
        {score: 12, exact_reps: 13},
        {score: 10, exact_reps: 12},
        {score: 8, exact_reps: 10},
        {score: 6, exact_reps: 8},
        {score: 4, exact_reps: 5},
        {score: 2, exact_reps: 4}
      ] as PushupScore[],
      '50-59': [
        {score: 20, exact_reps: 29},
        {score: 19, exact_reps: 28},
        {score: 18, exact_reps: 21},
        {score: 17, exact_reps: 15},
        {score: 16, exact_reps: 13},
        {score: 15, exact_reps: 12},
        {score: 14, exact_reps: 11},
        {score: 12, exact_reps: 10},
        {score: 10, exact_reps: 9},
        {score: 8, exact_reps: 7},
        {score: 6, exact_reps: 5},
        {score: 4, exact_reps: 4},
        {score: 2, exact_reps: 3}
      ] as PushupScore[],
      '60+': [
        {score: 20, exact_reps: 28},
        {score: 19, exact_reps: 25},
        {score: 18, exact_reps: 18},
        {score: 17, exact_reps: 13},
        {score: 16, exact_reps: 12},
        {score: 15, exact_reps: 11},
        {score: 14, exact_reps: 10},
        {score: 12, exact_reps: 9},
        {score: 10, exact_reps: 7},
        {score: 8, exact_reps: 6},
        {score: 6, exact_reps: 4},
        {score: 4, exact_reps: 2},
        {score: 2, exact_reps: 1}
      ] as PushupScore[]
    },
    female: {
      '20-29': [
        {score: 20, exact_reps: 38},
        {score: 19, exact_reps: 37},
        {score: 18, exact_reps: 30},
        {score: 17, exact_reps: 24},
        {score: 16, exact_reps: 21},
        {score: 15, exact_reps: 20},
        {score: 14, exact_reps: 18},
        {score: 12, exact_reps: 16},
        {score: 10, exact_reps: 14},
        {score: 8, exact_reps: 11},
        {score: 6, exact_reps: 9},
        {score: 4, exact_reps: 5},
        {score: 2, exact_reps: 4}
      ] as PushupScore[],
      '30-39': [
        {score: 20, exact_reps: 37},
        {score: 19, exact_reps: 36},
        {score: 18, exact_reps: 27},
        {score: 17, exact_reps: 22},
        {score: 16, exact_reps: 20},
        {score: 15, exact_reps: 17},
        {score: 14, exact_reps: 16},
        {score: 12, exact_reps: 14},
        {score: 10, exact_reps: 12},
        {score: 8, exact_reps: 10},
        {score: 6, exact_reps: 7},
        {score: 4, exact_reps: 4},
        {score: 2, exact_reps: 3}
      ] as PushupScore[],
      '40-49': [
        {score: 20, exact_reps: 33},
        {score: 19, exact_reps: 32},
        {score: 18, exact_reps: 24},
        {score: 17, exact_reps: 20},
        {score: 16, exact_reps: 15},
        {score: 15, exact_reps: 14},
        {score: 14, exact_reps: 13},
        {score: 12, exact_reps: 12},
        {score: 10, exact_reps: 10},
        {score: 8, exact_reps: 7},
        {score: 6, exact_reps: 4},
        {score: 4, exact_reps: 2},
        {score: 2, exact_reps: 1}
      ] as PushupScore[],
      '50-59': [
        {score: 20, exact_reps: 31},
        {score: 19, exact_reps: 30},
        {score: 18, exact_reps: 21},
        {score: 17, exact_reps: 15},
        {score: 16, exact_reps: 12},
        {score: 15, exact_reps: 11},
        {score: 14, exact_reps: 10},
        {score: 12, exact_reps: 9},
        {score: 10, exact_reps: 5},
        {score: 8, exact_reps: 3},
        {score: 6, exact_reps: 1}
      ] as PushupScore[],
      '60+': [
        {score: 20, exact_reps: 31},
        {score: 19, exact_reps: 30},
        {score: 18, exact_reps: 17},
        {score: 17, exact_reps: 13},
        {score: 16, exact_reps: 12},
        {score: 15, exact_reps: 10},
        {score: 14, exact_reps: 9},
        {score: 12, exact_reps: 6},
        {score: 10, exact_reps: 4},
        {score: 8, exact_reps: 2}
      ] as PushupScore[]
    }
  },
  core_endurance: {
    male: {
      '20-29': [
        {score: 20, min_time_sec: 180},
        {score: 19, min_time_sec_range: [170, 179]},
        {score: 18, min_time_sec_range: [160, 169]},
        {score: 17, min_time_sec_range: [151, 159]},
        {score: 16, min_time_sec_range: [141, 150]},
        {score: 15, min_time_sec_range: [132, 140]},
        {score: 14, min_time_sec_range: [120, 131]},
        {score: 12, min_time_sec_range: [110, 119]},
        {score: 10, min_time_sec_range: [99, 109]},
        {score: 8, min_time_sec_range: [95, 98]},
        {score: 6, min_time_sec_range: [90, 94]},
        {score: 4, min_time_sec_range: [86, 89]},
        {score: 2, max_time_sec: 85}
      ] as CoreEnduranceScore[],
      '30-39': [
        {score: 20, min_time_sec: 180},
        {score: 19, min_time_sec_range: [163, 179]},
        {score: 18, min_time_sec_range: [147, 162]},
        {score: 17, min_time_sec_range: [133, 146]},
        {score: 16, min_time_sec_range: [121, 132]},
        {score: 15, min_time_sec_range: [108, 120]},
        {score: 14, min_time_sec_range: [102, 107]},
        {score: 12, min_time_sec_range: [96, 101]},
        {score: 10, min_time_sec_range: [91, 95]},
        {score: 8, min_time_sec_range: [79, 90]},
        {score: 6, min_time_sec_range: [75, 78]},
        {score: 4, min_time_sec_range: [66, 74]},
        {score: 2, max_time_sec: 65}
      ] as CoreEnduranceScore[],
      '40-49': [
        {score: 20, min_time_sec_range: [165, 180]},
        {score: 19, min_time_sec_range: [150, 164]},
        {score: 18, min_time_sec_range: [130, 149]},
        {score: 17, min_time_sec_range: [110, 129]},
        {score: 16, min_time_sec_range: [100, 109]},
        {score: 15, min_time_sec_range: [95, 99]},
        {score: 14, min_time_sec_range: [85, 94]},
        {score: 12, min_time_sec_range: [70, 84]},
        {score: 10, min_time_sec_range: [60, 69]},
        {score: 8, min_time_sec_range: [50, 59]},
        {score: 6, min_time_sec_range: [40, 49]},
        {score: 4, min_time_sec_range: [30, 39]},
        {score: 2, max_time_sec: 29}
      ] as CoreEnduranceScore[],
      '50-59': [
        {score: 20, min_time_sec_range: [120, 180]},
        {score: 19, min_time_sec_range: [90, 119]},
        {score: 18, min_time_sec_range: [80, 89]},
        {score: 17, min_time_sec_range: [70, 79]},
        {score: 16, min_time_sec_range: [60, 69]},
        {score: 15, min_time_sec_range: [50, 59]},
        {score: 14, min_time_sec_range: [40, 49]},
        {score: 12, min_time_sec_range: [30, 39]},
        {score: 10, min_time_sec_range: [20, 29]},
        {score: 8, min_time_sec_range: [15, 19]},
        {score: 6, min_time_sec_range: [10, 14]},
        {score: 4, min_time_sec_range: [5, 9]},
        {score: 2, max_time_sec: 4}
      ] as CoreEnduranceScore[],
      '60+': [
        {score: 20, min_time_sec_range: [120, 180]},
        {score: 19, min_time_sec_range: [110, 119]},
        {score: 18, min_time_sec_range: [100, 109]},
        {score: 17, min_time_sec_range: [90, 99]},
        {score: 16, min_time_sec_range: [80, 89]},
        {score: 15, min_time_sec_range: [70, 79]},
        {score: 14, min_time_sec_range: [60, 69]},
        {score: 12, min_time_sec_range: [50, 59]},
        {score: 10, min_time_sec_range: [40, 49]},
        {score: 8, min_time_sec_range: [30, 39]},
        {score: 6, min_time_sec_range: [20, 29]},
        {score: 4, min_time_sec_range: [10, 19]},
        {score: 2, max_time_sec: 9}
      ] as CoreEnduranceScore[]
    },
    female: {
      '20-29': [
        {score: 20, min_time_sec: 180},
        {score: 19, min_time_sec_range: [171, 179]},
        {score: 18, min_time_sec_range: [161, 170]},
        {score: 17, min_time_sec_range: [152, 160]},
        {score: 16, min_time_sec_range: [144, 151]},
        {score: 15, min_time_sec_range: [135, 143]},
        {score: 14, min_time_sec_range: [124, 134]},
        {score: 12, min_time_sec_range: [113, 123]},
        {score: 10, min_time_sec_range: [102, 112]},
        {score: 8, min_time_sec_range: [90, 101]},
        {score: 6, min_time_sec_range: [78, 89]},
        {score: 4, min_time_sec_range: [64, 77]},
        {score: 2, max_time_sec: 63}
      ] as CoreEnduranceScore[],
      '30-39': [
        {score: 20, min_time_sec: 180},
        {score: 19, min_time_sec_range: [171, 179]},
        {score: 18, min_time_sec_range: [163, 170]},
        {score: 17, min_time_sec_range: [147, 162]},
        {score: 16, min_time_sec_range: [131, 146]},
        {score: 15, min_time_sec_range: [118, 130]},
        {score: 14, min_time_sec_range: [111, 117]},
        {score: 12, min_time_sec_range: [102, 110]},
        {score: 10, min_time_sec_range: [94, 101]},
        {score: 8, min_time_sec_range: [78, 93]},
        {score: 6, min_time_sec_range: [68, 77]},
        {score: 4, min_time_sec_range: [57, 67]},
        {score: 2, max_time_sec: 56}
      ] as CoreEnduranceScore[],
      '40-49': [
        {score: 20, min_time_sec_range: [158, 180]},
        {score: 19, min_time_sec_range: [146, 157]},
        {score: 18, min_time_sec_range: [136, 145]},
        {score: 17, min_time_sec_range: [126, 135]},
        {score: 16, min_time_sec_range: [115, 125]},
        {score: 15, min_time_sec_range: [108, 114]},
        {score: 14, min_time_sec_range: [98, 107]},
        {score: 12, min_time_sec_range: [86, 97]},
        {score: 10, min_time_sec_range: [74, 85]},
        {score: 8, min_time_sec_range: [61, 73]},
        {score: 6, min_time_sec_range: [48, 60]},
        {score: 4, min_time_sec_range: [35, 47]},
        {score: 2, max_time_sec: 34}
      ] as CoreEnduranceScore[],
      '50-59': [
        {score: 20, min_time_sec_range: [156, 180]},
        {score: 19, min_time_sec_range: [140, 155]},
        {score: 18, min_time_sec_range: [124, 139]},
        {score: 17, min_time_sec_range: [108, 123]},
        {score: 16, min_time_sec_range: [92, 107]},
        {score: 15, min_time_sec_range: [75, 91]},
        {score: 14, min_time_sec_range: [59, 74]},
        {score: 12, min_time_sec_range: [43, 58]},
        {score: 10, min_time_sec_range: [27, 42]},
        {score: 8, min_time_sec_range: [11, 26]},
        {score: 6, min_time_sec_range: [6, 10]},
        {score: 4, min_time_sec_range: [1, 5]},
        {score: 2, max_time_sec: 0}
      ] as CoreEnduranceScore[],
      '60+': [
        {score: 20, min_time_sec_range: [149, 180]},
        {score: 19, min_time_sec_range: [130, 148]},
        {score: 18, min_time_sec_range: [111, 129]},
        {score: 17, min_time_sec_range: [92, 110]},
        {score: 16, min_time_sec_range: [73, 91]},
        {score: 15, min_time_sec_range: [54, 72]},
        {score: 14, min_time_sec_range: [35, 53]},
        {score: 12, min_time_sec_range: [16, 34]},
        {score: 10, min_time_sec_range: [8, 15]},
        {score: 8, min_time_sec_range: [4, 7]},
        {score: 6, min_time_sec_range: [1, 3]},
        {score: 4, min_time_sec_range: [0, 0]},
        {score: 2, max_time_sec: 0}
      ] as CoreEnduranceScore[]
    }
  },
  sit_and_reach: {
    male: {
      '20-29': [
        {score: 10, min_distance_cm: 39},
        {score: 9, min_distance_cm: 38},
        {score: 8, min_distance_cm: 36},
        {score: 7, min_distance_cm: 35},
        {score: 6, min_distance_cm: 33},
        {score: 5, min_distance_cm: 31},
        {score: 4, min_distance_cm: 29},
        {score: 3, min_distance_cm: 26},
        {score: 2, min_distance_cm: 24},
        {score: 1, min_distance_cm: 22}
      ] as SitReachScore[],
      '30-39': [
        {score: 10, min_distance_cm: 38},
        {score: 9, min_distance_cm: 37},
        {score: 8, min_distance_cm: 35},
        {score: 7, min_distance_cm: 34},
        {score: 6, min_distance_cm: 32},
        {score: 5, min_distance_cm: 30},
        {score: 4, min_distance_cm: 28},
        {score: 3, min_distance_cm: 25},
        {score: 2, min_distance_cm: 23},
        {score: 1, min_distance_cm: 21}
      ] as SitReachScore[],
      '40-49': [
        {score: 10, min_distance_cm: 37},
        {score: 9, min_distance_cm: 36},
        {score: 8, min_distance_cm: 34},
        {score: 7, min_distance_cm: 33},
        {score: 6, min_distance_cm: 31},
        {score: 5, min_distance_cm: 29},
        {score: 4, min_distance_cm: 27},
        {score: 3, min_distance_cm: 24},
        {score: 2, min_distance_cm: 22},
        {score: 1, min_distance_cm: 20}
      ] as SitReachScore[],
      '50-59': [
        {score: 10, min_distance_cm: 36},
        {score: 9, min_distance_cm: 35},
        {score: 8, min_distance_cm: 33},
        {score: 7, min_distance_cm: 32},
        {score: 6, min_distance_cm: 30},
        {score: 5, min_distance_cm: 28},
        {score: 4, min_distance_cm: 26},
        {score: 3, min_distance_cm: 23},
        {score: 2, min_distance_cm: 21},
        {score: 1, min_distance_cm: 19}
      ] as SitReachScore[],
      '60+': [
        {score: 10, min_distance_cm: 35},
        {score: 9, min_distance_cm: 34},
        {score: 8, min_distance_cm: 32},
        {score: 7, min_distance_cm: 31},
        {score: 6, min_distance_cm: 29},
        {score: 5, min_distance_cm: 27},
        {score: 4, min_distance_cm: 25},
        {score: 3, min_distance_cm: 22},
        {score: 2, min_distance_cm: 20},
        {score: 1, min_distance_cm: 18}
      ] as SitReachScore[]
    },
    female: {
      '20-29': [
        {score: 10, min_distance_cm: 39},
        {score: 9, min_distance_cm: 38},
        {score: 8, min_distance_cm: 36},
        {score: 7, min_distance_cm: 35},
        {score: 6, min_distance_cm: 33},
        {score: 5, min_distance_cm: 31},
        {score: 4, min_distance_cm: 29},
        {score: 3, min_distance_cm: 26},
        {score: 2, min_distance_cm: 24},
        {score: 1, min_distance_cm: 22}
      ] as SitReachScore[],
      '30-39': [
        {score: 10, min_distance_cm: 38},
        {score: 9, min_distance_cm: 37},
        {score: 8, min_distance_cm: 35},
        {score: 7, min_distance_cm: 34},
        {score: 6, min_distance_cm: 32},
        {score: 5, min_distance_cm: 30},
        {score: 4, min_distance_cm: 28},
        {score: 3, min_distance_cm: 25},
        {score: 2, min_distance_cm: 23},
        {score: 1, min_distance_cm: 21}
      ] as SitReachScore[],
      '40-49': [
        {score: 10, min_distance_cm: 37},
        {score: 9, min_distance_cm: 36},
        {score: 8, min_distance_cm: 34},
        {score: 7, min_distance_cm: 33},
        {score: 6, min_distance_cm: 31},
        {score: 5, min_distance_cm: 29},
        {score: 4, min_distance_cm: 27},
        {score: 3, min_distance_cm: 24},
        {score: 2, min_distance_cm: 22},
        {score: 1, min_distance_cm: 20}
      ] as SitReachScore[],
      '50-59': [
        {score: 10, min_distance_cm: 36},
        {score: 9, min_distance_cm: 35},
        {score: 8, min_distance_cm: 33},
        {score: 7, min_distance_cm: 32},
        {score: 6, min_distance_cm: 30},
        {score: 5, min_distance_cm: 28},
        {score: 4, min_distance_cm: 26},
        {score: 3, min_distance_cm: 23},
        {score: 2, min_distance_cm: 21},
        {score: 1, min_distance_cm: 19}
      ] as SitReachScore[],
      '60+': [
        {score: 10, min_distance_cm: 35},
        {score: 9, min_distance_cm: 34},
        {score: 8, min_distance_cm: 32},
        {score: 7, min_distance_cm: 31},
        {score: 6, min_distance_cm: 29},
        {score: 5, min_distance_cm: 27},
        {score: 4, min_distance_cm: 25},
        {score: 3, min_distance_cm: 22},
        {score: 2, min_distance_cm: 20},
        {score: 1, min_distance_cm: 18}
      ] as SitReachScore[]
    }
  }
};

export function getAgeGroup(dateOfBirth: string): AgeGroup {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age;

  // Use lowest age bracket (20-29) for anyone under 20
  if (actualAge < 20) return '20-29';
  if (actualAge >= 20 && actualAge <= 29) return '20-29';
  if (actualAge >= 30 && actualAge <= 34) return '30-34';
  if (actualAge >= 35 && actualAge <= 39) return '35-39';
  if (actualAge >= 40 && actualAge <= 49) return '40-49';
  if (actualAge >= 50 && actualAge <= 59) return '50-59';
  if (actualAge >= 60) return '60+';
  
  // Fallback to 20-29 (should not reach here)
  return '20-29';
}

export function timeStringToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}

function mapToRunAgeGroup(ageGroup: AgeGroup): RunAgeGroup {
  // Ensure users under minimum age use the lowest bracket
  if (ageGroup === '20-29') return '20-29';
  if (ageGroup === '30-34') return '30-34';
  if (ageGroup === '35-39') return '35-39';
  if (ageGroup === '40-49') return '40-49';
  if (ageGroup === '50-59' || ageGroup === '60+') {
    return '50+';
  }
  // Fallback to lowest bracket
  return '20-29';
}

export function calculateRunScore(
  minutes: number,
  seconds: number,
  gender: Gender,
  ageGroup: AgeGroup
): number {
  const totalSeconds = minutes * 60 + seconds;
  const runAgeGroup = mapToRunAgeGroup(ageGroup);
  const scores = PIN_TEST_SCORING.run[gender][runAgeGroup] || [];
  
  for (const scoreData of scores) {
    const maxTimeSeconds = timeStringToSeconds(scoreData.max_time);
    if (totalSeconds <= maxTimeSeconds) {
      return Math.floor(scoreData.score); // Round down as per requirements
    }
  }
  
  return 0; // Below minimum score
}

function mapToPushupAgeGroup(ageGroup: AgeGroup): PushupAgeGroup {
  // Ensure users under minimum age use the lowest bracket
  if (ageGroup === '20-29') return '20-29';
  if (ageGroup === '30-34' || ageGroup === '35-39') {
    return '30-39';
  }
  if (ageGroup === '40-49') return '40-49';
  if (ageGroup === '50-59') return '50-59';
  if (ageGroup === '60+') return '60+';
  // Fallback to lowest bracket
  return '20-29';
}

export function calculatePushupScore(
  reps: number,
  gender: Gender,
  ageGroup: AgeGroup
): number {
  const pushupAgeGroup = mapToPushupAgeGroup(ageGroup);
  const scores = PIN_TEST_SCORING.pushups[gender][pushupAgeGroup] || [];
  
  // Find the highest score the user qualifies for
  // Scores are ordered from highest to lowest, so check from the beginning
  for (const scoreData of scores) {
    if (reps >= scoreData.exact_reps) {
      return Math.floor(scoreData.score); // Round down as per requirements
    }
  }
  
  return 0; // Below minimum score
}

function mapToCoreAgeGroup(ageGroup: AgeGroup): CoreAgeGroup {
  // Ensure users under minimum age use the lowest bracket
  if (ageGroup === '20-29') return '20-29';
  if (ageGroup === '30-34' || ageGroup === '35-39') {
    return '30-39';
  }
  if (ageGroup === '40-49') return '40-49';
  if (ageGroup === '50-59') return '50-59';
  if (ageGroup === '60+') return '60+';
  // Fallback to lowest bracket
  return '20-29';
}

export function calculateCoreEnduranceScore(
  minutes: number,
  seconds: number,
  gender: Gender,
  ageGroup: AgeGroup
): number {
  const totalSeconds = minutes * 60 + seconds;
  const coreAgeGroup = mapToCoreAgeGroup(ageGroup);
  const scores = PIN_TEST_SCORING.core_endurance[gender][coreAgeGroup] || [];
  
  for (const scoreData of scores) {
    if (scoreData.min_time_sec && totalSeconds >= scoreData.min_time_sec) {
      return Math.floor(scoreData.score); // Round down as per requirements
    }
    if (scoreData.min_time_sec_range && 
        totalSeconds >= scoreData.min_time_sec_range[0] && 
        totalSeconds <= scoreData.min_time_sec_range[1]) {
      return Math.floor(scoreData.score); // Round down as per requirements
    }
    if (scoreData.max_time_sec && totalSeconds <= scoreData.max_time_sec) {
      return Math.floor(scoreData.score); // Round down as per requirements
    }
  }
  
  return 0; // Below minimum score
}

function mapToSitReachAgeGroup(ageGroup: AgeGroup): SitReachAgeGroup {
  // Ensure users under minimum age use the lowest bracket
  if (ageGroup === '20-29') return '20-29';
  if (ageGroup === '30-34' || ageGroup === '35-39') {
    return '30-39';
  }
  if (ageGroup === '40-49') return '40-49';
  if (ageGroup === '50-59') return '50-59';
  if (ageGroup === '60+') return '60+';
  // Fallback to lowest bracket
  return '20-29';
}

export function calculateSitReachScore(
  distance: number,
  gender: Gender,
  ageGroup: AgeGroup
): number {
  const sitReachAgeGroup = mapToSitReachAgeGroup(ageGroup);
  const scores = PIN_TEST_SCORING.sit_and_reach[gender][sitReachAgeGroup] || [];
  
  // Find the highest score the user qualifies for
  // Scores are ordered from highest to lowest, so check from the beginning
  for (const scoreData of scores) {
    if (distance >= scoreData.min_distance_cm) {
      return Math.floor(scoreData.score); // Round down as per requirements
    }
  }
  
  return 0; // Below minimum score
}

export interface ComponentScore {
  component: string;
  score: number;
  maxScore: number;
}

export interface PinTestScoreResult {
  componentScores: ComponentScore[];
  totalScore: number;
  maxTotalScore: number;
  passStatus: boolean;
  passingScore: number;
}

export function calculatePinTestScore(
  mileRunMinutes: number | null,
  mileRunSeconds: number | null,
  pushupsCount: number | null,
  coreEnduranceMinutes: number | null,
  coreEnduranceSeconds: number | null,
  sitReachDistance: number | null,
  gender: Gender,
  ageGroup: AgeGroup
): PinTestScoreResult {
  const componentScores: ComponentScore[] = [];
  let totalScore = 0;
  
  // Calculate 1.5 Mile Run Score (max 50 points)
  if (mileRunMinutes !== null && mileRunSeconds !== null) {
    const runScore = calculateRunScore(mileRunMinutes, mileRunSeconds, gender, ageGroup);
    componentScores.push({
      component: '1.5 Mile Run',
      score: runScore,
      maxScore: 50
    });
    totalScore += runScore;
  }
  
  // Calculate Push-ups Score (max 20 points)
  if (pushupsCount !== null) {
    const pushupScore = calculatePushupScore(pushupsCount, gender, ageGroup);
    componentScores.push({
      component: 'Push-ups',
      score: pushupScore,
      maxScore: 20
    });
    totalScore += pushupScore;
  }
  
  // Calculate Core Endurance Score (max 20 points)
  if (coreEnduranceMinutes !== null && coreEnduranceSeconds !== null) {
    const coreScore = calculateCoreEnduranceScore(coreEnduranceMinutes, coreEnduranceSeconds, gender, ageGroup);
    componentScores.push({
      component: 'Core Endurance',
      score: coreScore,
      maxScore: 20
    });
    totalScore += coreScore;
  }
  
  // Calculate Sit and Reach Score (max 10 points)
  if (sitReachDistance !== null) {
    const sitReachScore = calculateSitReachScore(sitReachDistance, gender, ageGroup);
    componentScores.push({
      component: 'Sit and Reach',
      score: sitReachScore,
      maxScore: 10
    });
    totalScore += sitReachScore;
  }
  
  const maxTotalScore = 100;
  const passingScore = 80; // Official passing score is 80/100
  const passStatus = totalScore >= passingScore;
  
  return {
    componentScores,
    totalScore,
    maxTotalScore,
    passStatus,
    passingScore
  };
}