-- Seed LFI content for the contentService
-- This script adds the LFI configuration as JSON content

INSERT INTO app_content_text (
  content_key,
  section,
  component,
  current_text,
  description,
  created_at,
  last_updated_at
) VALUES (
  'application.lfi.v1',
  'application',
  'lfi',
  '{
    "overview": {
      "intro": "The Local Focus Interview assesses your knowledge of the community, alignment with the service''s values, and readiness to handle real situations.",
      "bullets": [
        "Community awareness & partnerships",
        "Motivation and professionalism",
        "Ethical reasoning & decision-making"
      ]
    },
    "categories": [
      {
        "key": "community",
        "title": "Community Knowledge",
        "tips": [
          "Know recent local issues and crime trends.",
          "Mention community programs and partners.",
          "Use credible, current examples."
        ],
        "questions": [
          "What are the top public-safety challenges in your city right now?",
          "If assigned to a neighborhood with rising break-and-enters, how would you build rapport?",
          "Tell us about a community initiative you would like to support and why."
        ]
      },
      {
        "key": "service",
        "title": "Service Knowledge",
        "tips": [
          "Know the service''s values, mission, and priorities.",
          "Reference recent press releases or reports.",
          "Connect your experience to their expectations."
        ],
        "questions": [
          "Why do you want to work for this police service specifically?",
          "Which of our core values resonates most with you and why?",
          "How would you contribute to our community-first policing approach?"
        ]
      },
      {
        "key": "motivation",
        "title": "Personal Motivation",
        "tips": [
          "Link motivation to service and public impact.",
          "Show self-awareness, growth, and accountability.",
          "Use STAR examples (Situation, Task, Action, Result)."
        ],
        "questions": [
          "Walk us through a time you took ownership of a difficult situation.",
          "How have you prepared yourself for the realities of police work?",
          "Describe a setback and how you adapted and learned."
        ]
      },
      {
        "key": "situational",
        "title": "Situational / Ethics",
        "tips": [
          "Show judgment, legality, policy, and empathy.",
          "Explain your decision pathway and alternatives.",
          "Prioritize safety and communication."
        ],
        "questions": [
          "A colleague makes a questionable comment to a community member—what do you do?",
          "You arrive first to a volatile neighbor dispute—what are your first steps?",
          "You made an error in your notes discovered post-shift—how do you handle it?"
        ]
      }
    ]
  }',
  'LFI (Local Focus Interview) configuration with categories, tips, and practice questions',
  now(),
  now()
) ON CONFLICT (content_key) DO UPDATE SET
  current_text = EXCLUDED.current_text,
  description = EXCLUDED.description,
  last_updated_at = now();

