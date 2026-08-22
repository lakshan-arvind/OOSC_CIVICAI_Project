import type { Locale } from "../i18n/types";

const DISCLAIMERS: Record<Locale, string> = {
  en: "AI-generated draft — verify the details before submitting.",
  hi: "एआई-जनित ड्राफ्ट — जमा करने से पहले विवरण सत्यापित करें।",
  ta: "செயற்கை நுண்ணறிவு வரைவு — தாக்கல் செய்வதற்கு முன் விவரங்களை சரிபார்க்கவும்.",
};

function ph(value: unknown, placeholder: string): [string, boolean] {
  const text = value == null ? "" : String(value).trim();
  if (!text) return [placeholder, true];
  return [text, false];
}

function localeOf(language?: string): Locale {
  if (language === "hi" || language === "ta") return language;
  return "en";
}

export function generateGrievanceDraft(
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>,
  language?: string
) {
  const locale = localeOf(language);
  const placeholders: string[] = [];
  const [name, n1] = ph(facts.applicant_name, "[YOUR NAME]");
  if (n1) placeholders.push("[YOUR NAME]");
  const [address, n2] = ph(facts.applicant_address, "[YOUR ADDRESS]");
  if (n2) placeholders.push("[YOUR ADDRESS]");
  const city = jurisdiction.city || facts.city || "[CITY]";
  const state = jurisdiction.state || facts.state || "[STATE]";
  const issue = facts.issue_type || facts.issue_summary || "civic service issue";
  const authority =
    facts.authority || jurisdiction.local_authority || "[CONCERNED MUNICIPAL / LOCAL AUTHORITY]";

  if (locale === "hi") {
    const body = `प्रति
आयुक्त / समक्ष प्राधिकारी
${authority}
${city}, ${state}

विषय: अनसुलझा ${issue} — कार्रवाई का अनुरोध

आदरणीय महोदय/महोदया,

मैं, ${name}, ${address} का निवासी, ${city}, ${state} में अनसुलझे ${issue} के बारे में आपका ध्यान आकर्षित करना चाहता/चाहती हूँ।

मैं अनुरोध करता/करती हूँ कि संबंधित विभाग इस मामले की जाँच करे और लागू नगरपालिका / स्थानीय निकाय प्रक्रियाओं के अनुसार आवश्यक कार्रवाई करे, और मुझे स्थिति की जानकारी दे।

धन्यवाद।

भवदीय,
${name}
${address}`;
    return {
      doc_type: "grievance",
      title: "नगरपालिका शिकायत पत्र",
      body,
      disclaimer: DISCLAIMERS.hi,
      placeholders_used: placeholders,
    };
  }

  if (locale === "ta") {
    const body = `பெறுநர்
ஆணையர் / பொருந்திய அதிகாரி
${authority}
${city}, ${state}

பொருள்: தீர்க்கப்படாத ${issue} — நடவடிக்கை கோரிக்கை

மதிப்பிற்குரிய அதிகாரியே,

நான், ${name}, ${address} இல் வசிப்பவர், ${city}, ${state} இல் தீர்க்கப்படாத ${issue} பற்றி உங்கள் கவனத்தை ஈர்க்க விரும்புகிறேன்.

பொருத்தமான துறை இந்த விஷயத்தை ஆராய்ந்து, பொருந்தும் நகராட்சி / உள்ளூர் அதிகாரி நடைமுறைகளின்படி தேவையான நடவடிக்கை எடுத்து, நிலையை எனக்கு தெரிவிக்க வேண்டும் என்று கோருகிறேன்.

நன்றி.

உங்கள் உண்மையுள்ள,
${name}
${address}`;
    return {
      doc_type: "grievance",
      title: "நகராட்சி புகார் கடிதம்",
      body,
      disclaimer: DISCLAIMERS.ta,
      placeholders_used: placeholders,
    };
  }

  const body = `To
The Commissioner / Competent Authority
${authority}
${city}, ${state}

Subject: Unresolved ${issue} — request for action

Respected Sir/Madam,

I, ${name}, resident of ${address}, wish to bring to your notice an unresolved ${issue} in ${city}, ${state}.

I request that the concerned department examine the matter and take necessary action as per applicable municipal / local body procedures, and inform me of the status.

Thank you.

Yours sincerely,
${name}
${address}`;

  return {
    doc_type: "grievance",
    title: "Municipal grievance letter",
    body,
    disclaimer: DISCLAIMERS.en,
    placeholders_used: placeholders,
  };
}

export function generateRtiDraft(
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>,
  language?: string
) {
  const locale = localeOf(language);
  const [name, n1] = ph(facts.applicant_name, "[YOUR NAME]");
  const placeholders: string[] = n1 ? ["[YOUR NAME]"] : [];
  const [address, n2] = ph(facts.applicant_address, "[YOUR ADDRESS]");
  if (n2) placeholders.push("[YOUR ADDRESS]");
  const city = jurisdiction.city || facts.city || "[CITY]";
  const state = jurisdiction.state || facts.state || "[STATE]";
  const info = facts.rti_objective || facts.user_goal || facts.issue_summary || "[DESCRIBE RECORDS SOUGHT]";

  if (locale === "hi") {
    const body = `प्रति
लोक सूचना अधिकारी
[सार्वजनिक प्राधिकारी का नाम]
${city}, ${state}

विषय: सूचना का अधिकार अधिनियम, 2005 के तहत आवेदन

आदरणीय महोदय/महोदया,

मैं, ${name}, ${address} का निवासी, सूचना का अधिकार अधिनियम, 2005 के तहत निम्नलिखित जानकारी माँगता/माँगती हूँ:

${info}

मैं अनुरोध करता/करती हूँ कि धारा 7 के अनुसार जानकारी प्रदान की जाए।

धन्यवाद।

भवदीय,
${name}
${address}`;
    return {
      doc_type: "rti",
      title: "आरटीआई आवेदन ड्राफ्ट",
      body,
      disclaimer: DISCLAIMERS.hi,
      placeholders_used: placeholders,
    };
  }

  if (locale === "ta") {
    const body = `பெறுநர்
பொது தகவல் அதிகாரி
[பொது அதிகாரியின் பெயர்]
${city}, ${state}

பொருள்: தகவல் அறியும் உரிமைச் சட்டம், 2005 இன் கீழ் விண்ணப்பம்

மதிப்பிற்குரிய அதிகாரியே,

நான், ${name}, ${address} இல் வசிப்பவர், தகவல் அறியும் உரிமைச் சட்டம், 2005 இன் கீழ் பின்வரும் தகவலைக் கோருகிறேன்:

${info}

பிரிவு 7 இன் அடிப்படையில் தகவல் வழங்கப்பட வேண்டும் என்று கோருகிறேன்.

நன்றி.

உங்கள் உண்மையுள்ள,
${name}
${address}`;
    return {
      doc_type: "rti",
      title: "ஆர்டிஐ விண்ணப்ப வரைவு",
      body,
      disclaimer: DISCLAIMERS.ta,
      placeholders_used: placeholders,
    };
  }

  const body = `To
The Public Information Officer
[NAME OF PUBLIC AUTHORITY]
${city}, ${state}

Subject: Application under Right to Information Act, 2005

Respected Sir/Madam,

I, ${name}, resident of ${address}, seek the following information under the RTI Act, 2005:

${info}

I request that the information be provided in accordance with Section 7 of the RTI Act.

Thank you.

Yours faithfully,
${name}
${address}`;

  return {
    doc_type: "rti",
    title: "RTI application draft",
    body,
    disclaimer: DISCLAIMERS.en,
    placeholders_used: placeholders,
  };
}

export function generateFormDraft(
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>,
  language?: string
) {
  const locale = localeOf(language);
  const formType = facts.form_type || "Official application form";

  if (locale === "hi") {
    const body = `आवेदक विवरण
-----------------
पूरा नाम: ${facts.applicant_name || "[YOUR NAME]"}
पता: ${facts.applicant_address || "[YOUR ADDRESS]"}
शहर/राज्य: ${jurisdiction.city || "[CITY]"}, ${jurisdiction.state || "[STATE]"}
फ़ोन: ${facts.phone || "[YOUR PHONE]"}
ईमेल: ${facts.email || "[YOUR EMAIL]"}

फॉर्म प्रकार: ${formType}

उद्देश्य / अनुरोध विवरण:
${facts.issue_summary || facts.user_goal || "[DESCRIBE YOUR REQUEST]"}

(जमा करने से पहले सरकारी पोर्टल पर वर्तमान आधिकारिक फॉर्म संस्करण और जमा पता सत्यापित करें।)`;
    return {
      doc_type: "form",
      title: `${formType} — भरा हुआ ड्राफ्ट`,
      body,
      disclaimer: DISCLAIMERS.hi,
      placeholders_used: ["[YOUR NAME]", "[YOUR ADDRESS]"],
    };
  }

  if (locale === "ta") {
    const body = `விண்ணப்பதாரர் விவரங்கள்
-----------------
முழு பெயர்: ${facts.applicant_name || "[YOUR NAME]"}
முகவரி: ${facts.applicant_address || "[YOUR ADDRESS]"}
நகரம்/மாநிலம்: ${jurisdiction.city || "[CITY]"}, ${jurisdiction.state || "[STATE]"}
தொலைபேசி: ${facts.phone || "[YOUR PHONE]"}
மின்னஞ்சல்: ${facts.email || "[YOUR EMAIL]"}

படிவ வகை: ${formType}

நோக்கம் / கோரிக்கை விவரங்கள்:
${facts.issue_summary || facts.user_goal || "[DESCRIBE YOUR REQUEST]"}

(தாக்கல் செய்வதற்கு முன் அரசு தளத்தில் தற்போதைய அதிகாரப்பூர்வ படிவ பதிப்பு மற்றும் தாக்கல் முகவரியை சரிபார்க்கவும்.)`;
    return {
      doc_type: "form",
      title: `${formType} — நிரப்பப்பட்ட வரைவு`,
      body,
      disclaimer: DISCLAIMERS.ta,
      placeholders_used: ["[YOUR NAME]", "[YOUR ADDRESS]"],
    };
  }

  const body = `APPLICANT DETAILS
-----------------
Full name: ${facts.applicant_name || "[YOUR NAME]"}
Address: ${facts.applicant_address || "[YOUR ADDRESS]"}
City/State: ${jurisdiction.city || "[CITY]"}, ${jurisdiction.state || "[STATE]"}
Phone: ${facts.phone || "[YOUR PHONE]"}
Email: ${facts.email || "[YOUR EMAIL]"}

Form type: ${formType}

Purpose / request details:
${facts.issue_summary || facts.user_goal || "[DESCRIBE YOUR REQUEST]"}

(Verify the current official form version and submission address on the government portal before submitting.)`;

  return {
    doc_type: "form",
    title: `${formType} — filled draft`,
    body,
    disclaimer: DISCLAIMERS.en,
    placeholders_used: ["[YOUR NAME]", "[YOUR ADDRESS]"],
  };
}
