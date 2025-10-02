// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "npm:openai";

function cors(res: Response) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(res.body, { status: res.status, headers: h });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
  if (req.method !== "POST") return cors(new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 }));

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return cors(new Response(JSON.stringify({ error: "OPENAI_API_KEY is not set in Supabase secrets" }), { status: 500 }));
    }

    const openai = new OpenAI({ apiKey });
    const body = await req.json();
    const { type, profile, options } = body as {
      type: "resume" | "cover_letter";
      profile: any;
      options?: {
        targetService?: string;
        tone?: "professional" | "warm" | "direct";
        length?: "short" | "standard";
        includeSections?: string[];
      };
    };

    if (!type || !profile) {
      return cors(new Response(JSON.stringify({ error: "Missing type or profile" }), { status: 400 }));
    }

    const cfg = {
      targetService: options?.targetService || profile?.department_interest || "Ontario Police Service",
      tone: options?.tone || "professional",
      length: options?.length || "standard",
      includeSections: options?.includeSections || ["summary","skills","experience","volunteer","education","certifications"],
    } as const;

    const prompt = buildPrompt(type, profile, cfg);

    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "You are a professional police recruiting document writer. Output well-structured, ATS-friendly HTML. No images, no external CSS." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
      });

      const html = completion.choices?.[0]?.message?.content?.trim();
      if (!html) throw new Error("No HTML returned from model");

      return cors(new Response(JSON.stringify({ html }), { headers: { "Content-Type": "application/json" } }));
    } catch (apiErr) {
      const err: any = apiErr;
      const status = err?.status || err?.response?.status || 500;
      const message = err?.message || String(err);

      // Graceful fallback on quota/rate limits
      const isQuota = status === 429 || /quota|rate limit|billing/i.test(message || "");
      if (isQuota) {
        const fallbackHtml = generateFallbackHtml(type, profile, cfg);
        return cors(new Response(JSON.stringify({ html: fallbackHtml, note: "fallback" }), { headers: { "Content-Type": "application/json" } }));
      }

      // Return meaningful error status
      return cors(new Response(JSON.stringify({ error: message }), { status }));
    }
  } catch (e) {
    const err = e as any;
    console.error("ai-docs error:", err?.message || err, err?.stack || "");
    return cors(new Response(JSON.stringify({ error: String(err?.message || err), stack: err?.stack || undefined }), { status: 500 }));
  }
});

function buildPrompt(
  type: "resume" | "cover_letter",
  p: any,
  cfg: { targetService: string; tone: string; length: string; includeSections: string[] }
) {
  const name = p?.name || p?.full_name || "Candidate";
  const email = p?.email || p?.contact_email || "";
  const phone = p?.phone || "";
  const location = p?.location || "Ontario";
  const goal = p?.goal || "Join as a Police Constable";
  const expLevel = p?.experience_level || p?.experienceLevel || "beginner";
  const motivation = p?.motivation || "";
  const skills = p?.skills || ["Communication","Teamwork","Problem Solving","Integrity","Community Engagement"];
  const certifications = p?.certifications || filterTruthy([
    p?.first_aid ? "First Aid/CPR" : "",
    p?.otherCerts,
  ]);
  const education = p?.education || [{ institution: "High School", credential: "OSSD or equivalent" }];
  const experience = p?.experience || [];
  const volunteerItems = p?.volunteer_items || (p?.volunteer ? [{ org: "Community Organization", role: "Volunteer", bullets: [String(p.volunteer)] }] : []);

  const baseStyle = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif; color:#0f172a; line-height:1.45; }
    .doc { max-width: 820px; margin: 0 auto; padding: 28px; }
    h1,h2,h3 { margin: 0 0 8px; }
    h1 { font-size: 22px; letter-spacing: 0.2px; }
    h2 { font-size: 15px; text-transform: uppercase; color:#334155; margin-top: 18px; border-bottom:1px solid #e2e8f0; padding-bottom:6px; }
    p, li { font-size: 13px; }
    .row { display:flex; justify-content: space-between; gap: 12px; }
    .muted { color:#475569; }
    ul { margin: 8px 0 0 18px; }
    .chips span { display:inline-block; border:1px solid #e2e8f0; border-radius:8px; padding:4px 8px; margin:4px 6px 0 0; font-size:12px; }
    .header { display:flex; justify-content: space-between; align-items: baseline; }
  </style>`;

  if (type === "resume") {
    return `Create an ATS-friendly single-page resume in clean semantic HTML with inline CSS. Use <div class="doc"> as outer wrapper. Adopt a ${cfg.tone} tone and concise bullet points. Header must contain name, location, email, phone. Include sections as available: summary, skills, experience, volunteer, education, certifications. Avoid images and tables.

DATA:
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}
Target Service: ${cfg.targetService}
Goal: ${goal}
Experience Level: ${expLevel}
Motivation: ${motivation}
Skills: ${Array.isArray(skills) ? skills.join(", ") : String(skills)}
Certifications: ${Array.isArray(certifications) ? certifications.join(", ") : String(certifications)}
Education: ${JSON.stringify(education)}
Experience: ${JSON.stringify(experience)}
Volunteer: ${JSON.stringify(volunteerItems)}

Return ONLY valid HTML. Start with ${baseStyle} and then <div class="doc">...`;
  }

  return `Write a one-page police applicant cover letter in HTML addressed to ${cfg.targetService}. Use a ${cfg.tone} tone. Structure: header (name, contact), greeting, intro (motivation + fit), body (skills & relevant experience), brief highlight of community/volunteer, closing with call to action and availability. Avoid images and tables. Use inline CSS from the style block provided.

DATA:
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}
Target Service: ${cfg.targetService}
Goal: ${goal}
Experience Level: ${expLevel}
Motivation: ${motivation}
Key Skills: ${Array.isArray(skills) ? skills.join(", ") : String(skills)}
Certifications: ${Array.isArray(certifications) ? certifications.join(", ") : String(certifications)}
Relevant Experience: ${JSON.stringify(experience)}
Volunteer: ${JSON.stringify(volunteerItems)}

Return ONLY valid HTML. Start with ${baseStyle} and then <div class="doc">...`;
}

function filterTruthy(arr: any[]) { return arr.filter(Boolean); }

function generateFallbackHtml(
  type: "resume" | "cover_letter",
  p: any,
  cfg: { targetService: string; tone: string; length: string; includeSections: string[] }
) {
  const name = p?.name || p?.full_name || "Candidate";
  const email = p?.email || p?.contact_email || "";
  const phone = p?.phone || "";
  const location = p?.location || "Ontario";
  const goal = p?.goal || "Join as a Police Constable";
  const expLevel = p?.experience_level || p?.experienceLevel || "beginner";
  const skills = p?.skills || ["Communication","Teamwork","Problem Solving","Integrity","Community Engagement"];
  const certifications = p?.certifications || filterTruthy([ p?.first_aid ? "First Aid/CPR" : "" ]);
  const education = p?.education || [{ institution: "High School", credential: "OSSD or equivalent" }];
  const experience = Array.isArray(p?.experience) ? p.experience : [];
  const volunteerItems = p?.volunteer_items || (p?.volunteer ? [{ org: "Community Organization", role: "Volunteer", bullets: [String(p.volunteer)] }] : []);

  const style = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif; color:#0f172a; line-height:1.45; }
    .doc { max-width: 820px; margin: 0 auto; padding: 28px; }
    h1,h2,h3 { margin: 0 0 8px; }
    h1 { font-size: 22px; letter-spacing: 0.2px; }
    h2 { font-size: 15px; text-transform: uppercase; color:#334155; margin-top: 18px; border-bottom:1px solid #e2e8f0; padding-bottom:6px; }
    p, li { font-size: 13px; }
    .row { display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .muted { color:#475569; }
    ul { margin: 8px 0 0 18px; }
    .chips span { display:inline-block; border:1px solid #e2e8f0; border-radius:8px; padding:4px 8px; margin:4px 6px 0 0; font-size:12px; }
    .header { display:flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; }
  </style>`;

  if (type === "resume") {
    const skillsChips = (Array.isArray(skills) ? skills : [String(skills)]).map((s: string) => `<span>${s}</span>`).join("");
    const certsChips = (Array.isArray(certifications) ? certifications : [String(certifications)]).map((s: string) => `<span>${s}</span>`).join("");
    const expBlocks = experience.map((e: any) => `
      <div>
        <strong>${e?.role || "Role"}</strong> — <span class="muted">${e?.org || e?.company || "Organization"}</span>
        <ul>${(e?.bullets || []).map((b: string) => `<li>${b}</li>`).join("")}</ul>
      </div>
    `).join("");
    const volBlocks = volunteerItems.map((v: any) => `
      <div>
        <strong>${v?.role || "Volunteer"}</strong> — <span class="muted">${v?.org || "Community"}</span>
        <ul>${(v?.bullets || []).map((b: string) => `<li>${b}</li>`).join("")}</ul>
      </div>
    `).join("");

    return `${style}
    <div class="doc">
      <div class="header">
        <h1>${name}</h1>
        <div class="muted">${location} • ${email}${phone ? ` • ${phone}` : ""}</div>
      </div>
      <h2>Summary</h2>
      <p>Motivated ${expLevel} candidate targeting ${cfg.targetService}. ${goal}.</p>
      <h2>Skills</h2>
      <div class="chips">${skillsChips}</div>
      ${certsChips ? `<h2>Certifications</h2><div class="chips">${certsChips}</div>` : ""}
      <h2>Experience</h2>
      ${expBlocks || `<p class="muted">No formal experience listed.</p>`}
      <h2>Volunteer</h2>
      ${volBlocks || `<p class="muted">Add any volunteer or community service.</p>`}
      <h2>Education</h2>
      <ul>${education.map((ed: any) => `<li>${ed?.credential || "Credential"} — ${ed?.institution || "Institution"}</li>`).join("")}</ul>
    </div>`;
  }

  // cover letter
  return `${style}
  <div class="doc">
    <div class="header">
      <h1>${name}</h1>
      <div class="muted">${location} • ${email}${phone ? ` • ${phone}` : ""}</div>
    </div>
    <p>To Hiring Team at ${cfg.targetService},</p>
    <p>I am writing to express my interest in the police constable role. My background, commitment to community, and ${expLevel} experience align with the standards of your service.</p>
    <p>Key strengths include ${Array.isArray(skills) ? skills.slice(0,5).join(', ') : String(skills)}. ${certifications?.length ? `I also hold ${certifications.join(', ')}.` : ''}</p>
    <p>${volunteerItems?.length ? 'I have contributed to the community through volunteer engagements noted in my resume.' : 'I am committed to community service and continuous development.'}</p>
    <p>Thank you for your time and consideration. I welcome the opportunity to discuss my candidacy further.</p>
    <p>Sincerely,<br/>${name}</p>
  </div>`;
}


