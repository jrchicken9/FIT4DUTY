import { PRI155Data } from '@/types/pri155';

export const pri155Data: PRI155Data = {
  "meta": {
    "instrument": "Psychological Readiness Inventory (PRI-155)",
    "version": "1.0",
    "format": "True/False",
    "purpose": "Practice-only self-assessment inspired by occupational personality inventories used in policing. Not diagnostic.",
    "disclaimer": "This is a practice self-assessment for personal insight. It is not a psychological test or diagnostic tool.",
    "scoring_policy": "Each item has an adaptive_key indicating which response (T or F) earns 1 adaptive point.\nDomain scores are the sum of adaptive points for items in that domain, then scaled to 0–100 if desired.\nHigher scores indicate greater readiness in that domain.\nSuggested interpretation bands (per domain): 0–39 Needs Focus, 40–69 Developing, 70–100 Strong.\n"
  },
  "domains": [
    {
      "code": "EMO",
      "name": "Emotional Stability & Stress Tolerance"
    },
    {
      "code": "INT",
      "name": "Integrity & Rule Adherence"
    },
    {
      "code": "SOC",
      "name": "Interpersonal & Social Functioning"
    },
    {
      "code": "IMP",
      "name": "Impulse Control & Discipline"
    },
    {
      "code": "AUT",
      "name": "Attitude Toward Authority & Responsibility"
    },
    {
      "code": "RES",
      "name": "Resilience & Self-Perception"
    },
    {
      "code": "RTP",
      "name": "Reality Testing & Perception"
    },
    {
      "code": "WRK",
      "name": "Work Habits & Motivation"
    }
  ],
  "items": [
    {
      "id": 1,
      "text": "I can stay calm even when someone is yelling at me.",
      "domain": "EMO",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 2,
      "text": "I sometimes lose my temper over small issues.",
      "domain": "EMO",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 3,
      "text": "I find it hard to stop thinking about mistakes I've made.",
      "domain": "EMO",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 4,
      "text": "I rarely feel anxious in stressful situations.",
      "domain": "EMO",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 5,
      "text": "I often feel tense without knowing why.",
      "domain": "EMO",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 6,
      "text": "When I'm under pressure, I still make clear decisions.",
      "domain": "EMO",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 7,
      "text": "I get upset easily when things don't go my way.",
      "domain": "EMO",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 8,
      "text": "I have no trouble sleeping after a stressful day.",
      "domain": "EMO",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 9,
      "text": "I tend to bottle up my emotions instead of showing them.",
      "domain": "EMO",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 10,
      "text": "I sometimes feel like I'm constantly \"on edge.\"",
      "domain": "EMO",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 11,
      "text": "I believe following the rules is always important, even when no one is watching.",
      "domain": "INT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 12,
      "text": "I sometimes cut corners if I know I won't get caught.",
      "domain": "INT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 13,
      "text": "I feel guilty if I do something dishonest, even slightly.",
      "domain": "INT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 14,
      "text": "I have lied to protect myself from getting in trouble.",
      "domain": "INT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 15,
      "text": "I think people exaggerate how important honesty is.",
      "domain": "INT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 16,
      "text": "I have never stolen anything, even something small.",
      "domain": "INT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 17,
      "text": "I believe integrity is more important than popularity.",
      "domain": "INT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 18,
      "text": "I sometimes ignore small rules if they seem unnecessary.",
      "domain": "INT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 19,
      "text": "I would report a coworker if I saw them doing something unethical.",
      "domain": "INT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 20,
      "text": "I believe that once trust is broken, it can rarely be repaired.",
      "domain": "INT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 21,
      "text": "I enjoy being around people more than being alone.",
      "domain": "SOC",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 22,
      "text": "I find it difficult to approach strangers.",
      "domain": "SOC",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 23,
      "text": "I prefer to observe rather than participate in group discussions.",
      "domain": "SOC",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 24,
      "text": "I easily make friends wherever I go.",
      "domain": "SOC",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 25,
      "text": "I sometimes feel uncomfortable in large social gatherings.",
      "domain": "SOC",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 26,
      "text": "I often take the lead in group situations.",
      "domain": "SOC",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 27,
      "text": "I find it easy to get along with people who have different opinions.",
      "domain": "SOC",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 28,
      "text": "I sometimes say things I regret when arguing.",
      "domain": "SOC",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 29,
      "text": "I usually let others speak first in conversations.",
      "domain": "SOC",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 30,
      "text": "I enjoy working in teams more than working alone.",
      "domain": "SOC",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 31,
      "text": "I make decisions after thinking them through carefully.",
      "domain": "IMP",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 32,
      "text": "I sometimes act without thinking about the consequences.",
      "domain": "IMP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 33,
      "text": "I can stay focused on boring or repetitive tasks.",
      "domain": "IMP",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 34,
      "text": "I often change my mind suddenly about what I want to do.",
      "domain": "IMP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 35,
      "text": "I finish what I start, even if it becomes difficult.",
      "domain": "IMP",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 36,
      "text": "I occasionally say things impulsively and regret them later.",
      "domain": "IMP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 37,
      "text": "I find it hard to control my emotions when provoked.",
      "domain": "IMP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 38,
      "text": "I prefer a structured daily routine over spontaneity.",
      "domain": "IMP",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 39,
      "text": "I sometimes spend money impulsively.",
      "domain": "IMP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 40,
      "text": "I can stay patient even when progress is slow.",
      "domain": "IMP",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 41,
      "text": "I believe respect for authority is essential in any workplace.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 42,
      "text": "I sometimes question authority if I think they are wrong.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 43,
      "text": "I find it easy to follow orders even when I disagree.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 44,
      "text": "I prefer to make my own rules rather than follow others'.",
      "domain": "AUT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 45,
      "text": "I think it's important to challenge unfair leadership.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 46,
      "text": "I respect people who enforce rules fairly and consistently.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 47,
      "text": "I sometimes feel irritated when someone tells me what to do.",
      "domain": "AUT",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 48,
      "text": "I believe discipline is necessary for success.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 49,
      "text": "I would never lie to a superior, even to protect a friend.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 50,
      "text": "I accept constructive criticism without taking it personally.",
      "domain": "AUT",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 51,
      "text": "I recover quickly after stressful situations.",
      "domain": "RES",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 52,
      "text": "I often doubt my ability to handle difficult tasks.",
      "domain": "RES",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 53,
      "text": "I believe I handle pressure better than most people.",
      "domain": "RES",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 54,
      "text": "I sometimes feel emotionally drained for no reason.",
      "domain": "RES",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 55,
      "text": "I find it easy to motivate myself after setbacks.",
      "domain": "RES",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 56,
      "text": "I tend to focus on problems rather than solutions.",
      "domain": "RES",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 57,
      "text": "I adapt well to sudden changes.",
      "domain": "RES",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 58,
      "text": "I sometimes feel that life is unfair to me.",
      "domain": "RES",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 59,
      "text": "I remain calm when others panic.",
      "domain": "RES",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 60,
      "text": "I often worry about things that might go wrong.",
      "domain": "RES",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 61,
      "text": "I sometimes hear my name when no one is around.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 62,
      "text": "I believe some people have special powers others don't.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 63,
      "text": "I've felt that strangers were watching me in public places.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 64,
      "text": "I've seen things others said they could not see.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 65,
      "text": "I sometimes feel disconnected from reality, like in a dream.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 66,
      "text": "I believe my thoughts can influence events around me.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 67,
      "text": "I occasionally have difficulty knowing what is real and what isn't.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 68,
      "text": "I often feel people talk about me behind my back.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 69,
      "text": "I believe coincidences often carry special meaning.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 70,
      "text": "I've had experiences that I can't fully explain to anyone.",
      "domain": "RTP",
      "adaptive_key": "F",
      "type": "true_false"
    },
    {
      "id": 71,
      "text": "I take pride in doing my work perfectly.",
      "domain": "WRK",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 72,
      "text": "I would rather complete a task late than rush it poorly.",
      "domain": "WRK",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 73,
      "text": "I feel comfortable working long hours when needed.",
      "domain": "WRK",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 74,
      "text": "I like to set personal goals and track my progress.",
      "domain": "WRK",
      "adaptive_key": "T",
      "type": "true_false"
    },
    {
      "id": 75,
      "text": "I believe commitment and perseverance matter more than natural talent.",
      "domain": "WRK",
      "adaptive_key": "T",
      "type": "true_false"
    },
    // Additional Likert Scale Questions
    // Emotional Stability & Stress Tolerance (EMO) - Likert Questions
    {
      "id": 76,
      "text": "I feel confident in my ability to handle unexpected challenges.",
      "domain": "EMO",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 77,
      "text": "I often feel overwhelmed by daily responsibilities.",
      "domain": "EMO",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 78,
      "text": "I am comfortable making decisions under pressure.",
      "domain": "EMO",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 79,
      "text": "I find it difficult to relax after a stressful day.",
      "domain": "EMO",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 80,
      "text": "I remain calm when others around me are panicking.",
      "domain": "EMO",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 81,
      "text": "I often worry about things that might go wrong.",
      "domain": "EMO",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 82,
      "text": "I can maintain my composure in emotionally charged situations.",
      "domain": "EMO",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 83,
      "text": "I feel anxious when facing new challenges.",
      "domain": "EMO",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 84,
      "text": "I handle criticism from others very well.",
      "domain": "EMO",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 85,
      "text": "I often feel emotionally drained by the end of the day.",
      "domain": "EMO",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    // Integrity & Rule Adherence (INT) - Likert Questions
    {
      "id": 86,
      "text": "I always follow rules, even when no one is watching.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 87,
      "text": "I believe honesty is the most important quality in a person.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 88,
      "text": "I would never compromise my values for personal gain.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 89,
      "text": "I think it's okay to bend rules in certain situations.",
      "domain": "INT",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 90,
      "text": "I feel guilty when I make even small mistakes.",
      "domain": "INT",
      "adaptive_key": "agree",
      "type": "likert"
    },
    {
      "id": 91,
      "text": "I believe in treating everyone with fairness and respect.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 92,
      "text": "I would report unethical behavior even if it affected a friend.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 93,
      "text": "I think some rules are meant to be broken.",
      "domain": "INT",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 94,
      "text": "I value integrity over popularity.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 95,
      "text": "I believe trust must be earned and maintained.",
      "domain": "INT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    // Interpersonal & Social Functioning (SOC) - Likert Questions
    {
      "id": 96,
      "text": "I enjoy working with people from diverse backgrounds.",
      "domain": "SOC",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 97,
      "text": "I find it easy to build rapport with new people.",
      "domain": "SOC",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 98,
      "text": "I prefer working alone rather than in teams.",
      "domain": "SOC",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 99,
      "text": "I am comfortable speaking in front of large groups.",
      "domain": "SOC",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 100,
      "text": "I often take the lead in group discussions.",
      "domain": "SOC",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 101,
      "text": "I find it difficult to approach strangers.",
      "domain": "SOC",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 102,
      "text": "I enjoy helping others solve their problems.",
      "domain": "SOC",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 103,
      "text": "I prefer to listen rather than speak in conversations.",
      "domain": "SOC",
      "adaptive_key": "disagree",
      "type": "likert"
    },
    {
      "id": 104,
      "text": "I am skilled at resolving conflicts between others.",
      "domain": "SOC",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 105,
      "text": "I feel uncomfortable in social situations with many people.",
      "domain": "SOC",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    // Impulse Control & Discipline (IMP) - Likert Questions
    {
      "id": 106,
      "text": "I always think before I act.",
      "domain": "IMP",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 107,
      "text": "I have difficulty controlling my impulses.",
      "domain": "IMP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 108,
      "text": "I can stay focused on tasks for long periods.",
      "domain": "IMP",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 109,
      "text": "I often act on my first impulse.",
      "domain": "IMP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 110,
      "text": "I prefer structured routines over spontaneous activities.",
      "domain": "IMP",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 111,
      "text": "I have trouble finishing tasks I start.",
      "domain": "IMP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 112,
      "text": "I can delay gratification to achieve long-term goals.",
      "domain": "IMP",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 113,
      "text": "I often make decisions without considering consequences.",
      "domain": "IMP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 114,
      "text": "I am patient when progress is slow.",
      "domain": "IMP",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 115,
      "text": "I frequently change my mind about important decisions.",
      "domain": "IMP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    // Attitude Toward Authority & Responsibility (AUT) - Likert Questions
    {
      "id": 116,
      "text": "I respect authority figures and their decisions.",
      "domain": "AUT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 117,
      "text": "I believe questioning authority is sometimes necessary.",
      "domain": "AUT",
      "adaptive_key": "agree",
      "type": "likert"
    },
    {
      "id": 118,
      "text": "I find it easy to follow orders from superiors.",
      "domain": "AUT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 119,
      "text": "I prefer to make my own decisions rather than follow others.",
      "domain": "AUT",
      "adaptive_key": "disagree",
      "type": "likert"
    },
    {
      "id": 120,
      "text": "I believe discipline is essential for success.",
      "domain": "AUT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 121,
      "text": "I often challenge rules that seem unfair.",
      "domain": "AUT",
      "adaptive_key": "agree",
      "type": "likert"
    },
    {
      "id": 122,
      "text": "I accept constructive criticism without taking it personally.",
      "domain": "AUT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 123,
      "text": "I feel irritated when someone tells me what to do.",
      "domain": "AUT",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 124,
      "text": "I believe in the chain of command and its importance.",
      "domain": "AUT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 125,
      "text": "I would never lie to protect a friend from authority.",
      "domain": "AUT",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    // Resilience & Self-Perception (RES) - Likert Questions
    {
      "id": 126,
      "text": "I bounce back quickly from setbacks and failures.",
      "domain": "RES",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 127,
      "text": "I often doubt my abilities when facing challenges.",
      "domain": "RES",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 128,
      "text": "I believe I can overcome any obstacle with enough effort.",
      "domain": "RES",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 129,
      "text": "I feel defeated when things don't go my way.",
      "domain": "RES",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 130,
      "text": "I adapt well to unexpected changes in my life.",
      "domain": "RES",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 131,
      "text": "I focus more on problems than solutions.",
      "domain": "RES",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 132,
      "text": "I maintain a positive attitude even during difficult times.",
      "domain": "RES",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 133,
      "text": "I often feel that life is unfair to me.",
      "domain": "RES",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 134,
      "text": "I learn valuable lessons from my mistakes.",
      "domain": "RES",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 135,
      "text": "I give up easily when faced with obstacles.",
      "domain": "RES",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    // Reality Testing & Perception (RTP) - Likert Questions
    {
      "id": 136,
      "text": "I have a clear understanding of what is real and what isn't.",
      "domain": "RTP",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 137,
      "text": "I sometimes hear voices when no one is around.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 138,
      "text": "I believe in supernatural powers and abilities.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 139,
      "text": "I often feel like people are watching or following me.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 140,
      "text": "I have seen things that others cannot see.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 141,
      "text": "I sometimes feel disconnected from reality.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 142,
      "text": "I believe my thoughts can influence external events.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 143,
      "text": "I have difficulty distinguishing between dreams and reality.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 144,
      "text": "I often feel that people are talking about me behind my back.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 145,
      "text": "I believe coincidences have special meanings.",
      "domain": "RTP",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    // Work Habits & Motivation (WRK) - Likert Questions
    {
      "id": 146,
      "text": "I take great pride in producing high-quality work.",
      "domain": "WRK",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 147,
      "text": "I prefer to rush through tasks to get them done quickly.",
      "domain": "WRK",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 148,
      "text": "I am willing to work long hours to achieve my goals.",
      "domain": "WRK",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 149,
      "text": "I set clear goals for myself and track my progress.",
      "domain": "WRK",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 150,
      "text": "I believe hard work is more important than natural talent.",
      "domain": "WRK",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 151,
      "text": "I often procrastinate on important tasks.",
      "domain": "WRK",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 152,
      "text": "I am motivated by the opportunity to help others.",
      "domain": "WRK",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 153,
      "text": "I prefer easy tasks over challenging ones.",
      "domain": "WRK",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    },
    {
      "id": 154,
      "text": "I am committed to continuous learning and improvement.",
      "domain": "WRK",
      "adaptive_key": "strongly_agree",
      "type": "likert"
    },
    {
      "id": 155,
      "text": "I give up easily when tasks become difficult.",
      "domain": "WRK",
      "adaptive_key": "strongly_disagree",
      "type": "likert"
    }
  ],
  "scoring": {
    "method": "sum_adaptive_points_per_domain",
    "scale": "0-100 optional scaling",
    "domains": {
      "EMO": {
        "items": [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, // True/False items
          76, 77, 78, 79, 80, 81, 82, 83, 84, 85 // Likert items
        ]
      },
      "INT": {
        "items": [
          11, 12, 13, 14, 15, 16, 17, 18, 19, 20, // True/False items
          86, 87, 88, 89, 90, 91, 92, 93, 94, 95 // Likert items
        ]
      },
      "SOC": {
        "items": [
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30, // True/False items
          96, 97, 98, 99, 100, 101, 102, 103, 104, 105 // Likert items
        ]
      },
      "IMP": {
        "items": [
          31, 32, 33, 34, 35, 36, 37, 38, 39, 40, // True/False items
          106, 107, 108, 109, 110, 111, 112, 113, 114, 115 // Likert items
        ]
      },
      "AUT": {
        "items": [
          41, 42, 43, 44, 45, 46, 47, 48, 49, 50, // True/False items
          116, 117, 118, 119, 120, 121, 122, 123, 124, 125 // Likert items
        ]
      },
      "RES": {
        "items": [
          51, 52, 53, 54, 55, 56, 57, 58, 59, 60, // True/False items
          126, 127, 128, 129, 130, 131, 132, 133, 134, 135 // Likert items
        ]
      },
      "RTP": {
        "items": [
          61, 62, 63, 64, 65, 66, 67, 68, 69, 70, // True/False items
          136, 137, 138, 139, 140, 141, 142, 143, 144, 145 // Likert items
        ]
      },
      "WRK": {
        "items": [
          71, 72, 73, 74, 75, // True/False items
          146, 147, 148, 149, 150, 151, 152, 153, 154, 155 // Likert items
        ]
      }
    },
    "scaling_formula": "percent = round(100 * (domain_score / domain_item_count), 0)",
    "bands": [
      {
        "label": "Needs Focus",
        "min": 0,
        "max": 39
      },
      {
        "label": "Developing",
        "min": 40,
        "max": 69
      },
      {
        "label": "Strong",
        "min": 70,
        "max": 100
      }
    ]
  }
};
