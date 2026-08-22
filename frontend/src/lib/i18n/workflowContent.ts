import type { Locale } from "../i18n/types";
import { getTranslations } from "../i18n/translations";

export function clarificationQuestion(
  domain: string,
  missing: string[],
  locale: Locale
): string {
  const needsCity = missing.includes("city");
  const needsState = missing.includes("state");

  if (domain === "form_filler") {
    if (missing.includes("form_type")) {
      return locale === "hi"
        ? "आपको किस आधिकारिक फॉर्म में मदद चाहिए? (जैसे आरटीआई आवेदन, शिकायत फॉर्म)"
        : locale === "ta"
          ? "எந்த அதிகாரப்பூர்வ படிவத்தில் உதவி வேண்டும்? (எ.கா. ஆர்டிஐ விண்ணப்பம், புகார் படிவம்)"
          : "Which official form do you need help with? (e.g. RTI application, grievance form)";
    }
    return locale === "hi"
      ? "यह फॉर्म किस शहर और राज्य में दाखिल करना है? (उदाहरण: जयपुर, राजस्थान या कोच्चि, केरल)"
      : locale === "ta"
        ? "இந்த படிவம் எந்த நகரம் மற்றும் மாநிலத்தில் தாக்கல் செய்ய வேண்டும்? (எ.கா. ஜெய்ப்பூர், ராஜஸ்தான் அல்லது கொச்சி, கேரளா)"
        : "Which city and state should this form be filed in? (e.g. Jaipur, Rajasthan or Kochi, Kerala)";
  }

  if (needsCity && needsState) {
    return locale === "hi"
      ? "कृपया अपना शहर और राज्य बताएं — भारत का कोई भी शहर लिख सकते हैं। (उदाहरण: लखनऊ, उत्तर प्रदेश)"
      : locale === "ta"
        ? "உங்கள் நகரம் மற்றும் மாநிலத்தைச் சொல்லுங்கள் — இந்தியாவின் எந்த நகரமும் சரி. (எ.கா. லக்னோ, உத்தரப் பிரதேசம்)"
        : "Please tell us your city and state — any city in India works. (e.g. Lucknow, Uttar Pradesh or Jaipur, Rajasthan)";
  }

  if (needsState) {
    return locale === "hi"
      ? "यह किस राज्य से संबंधित है? (उदाहरण: केरल, महाराष्ट्र, राजस्थान)"
      : locale === "ta"
        ? "இது எந்த மாநிலத்தைப் பற்றியது? (எ.கா. கேரளா, மகாராஷ்டிரா, ராஜஸ்தான்)"
        : "Which state is this about? (e.g. Kerala, Maharashtra, Rajasthan)";
  }

  return locale === "hi"
    ? "कृपया अपना शहर और राज्य बताएं। (उदाहरण: भोपाल, मध्य प्रदेश)"
    : locale === "ta"
      ? "உங்கள் நகரம் மற்றும் மாநிலத்தைச் சொல்லுங்கள். (எ.கா. போபால், மத்திய பிரதேசம்)"
      : "Please tell us your city and state. (e.g. Bhopal, Madhya Pradesh)";
}

export function localizedClaims(
  domain: string,
  area: string,
  city: string | undefined,
  locale: Locale
): string[] {
  if (domain === "rti") {
    if (locale === "hi")
      return [
        "नागरिक सूचना का अधिकार अधिनियम, 2005 के तहत सार्वजनिक प्राधिकारियों से रिकॉर्डित जानकारी माँग सकते हैं।",
        "आरटीआई अनुरोध में माँगी गई जानकारी और संबंधित सार्वजनिक प्राधिकारी स्पष्ट होना चाहिए।",
        "धारा 7 के तहत अनुरोध आमतौर पर तीस दिनों के भीतर निपटाए जाते हैं।",
      ];
    if (locale === "ta")
      return [
        "குடிமக்கள் தகவல் அறியும் உரிமைச் சட்டம், 2005 இன் கீழ் பொது அதிகாரிகளிடம் பதிவு செய்யப்பட்ட தகவலைக் கோரலாம்.",
        "ஆர்டிஐ கோரிக்கையில் கோரப்பட்ட தகவல் மற்றும் தொடர்புடைய பொது அதிகாரி தெளிவாக இருக்க வேண்டும்.",
        "பிரிவு 7 இன் கீழ் கோரிக்கைகள் பொதுவாக முப்பது நாட்களுக்குள் தீர்க்கப்படும்.",
      ];
    return [
      "Citizens can request recorded information from public authorities under the Right to Information Act, 2005.",
      "An RTI request should specify the particulars of the information sought and the relevant public authority.",
      "Under Section 7 of the RTI Act, requests are generally disposed of within thirty days of receipt.",
    ];
  }

  if (domain === "rights_navigator") {
    if (area === "tenant") {
      if (locale === "hi")
        return [
          "कई राज्यों में किरायेदारी और सुरक्षा जमा विवाद राज्य किराया कानूनों द्वारा शासित होते हैं।",
          "किरायेदार किराया अनुबंध, नोटिस अवधि और जमा भुगतान का प्रमाण रखें।",
          "कार्रवाई से पहले राज्य के आधिकारिक निवारण चैनल सत्यापित करें।",
        ];
      if (locale === "ta")
        return [
          "பல மாநிலங்களில் வாடகை மற்றும் பாதுகாப்பு வைப்புத்தொகை வழக்குகள் மாநில வாடகை சட்டங்களால் நிர்வகிக்கப்படுகின்றன.",
          "வாடகை ஒப்பந்தம், அறிவிப்பு காலம் மற்றும் வைப்புத்தொகை சான்றுகளை வைத்திருங்கள்.",
          "நடவடிக்கை எடுப்பதற்கு முன் மாநில அதிகாரப்பூர்வ தீர்வு சேனல்களை சரிபார்க்கவும்.",
        ];
      return [
        "State rent control and tenancy laws govern landlord-tenant disputes including security deposits in many States.",
        "Tenants may document the tenancy, notice period, and deposit payment before approaching the relevant authority.",
        "Citizens should verify applicable State tenancy rules and official dispute resolution channels.",
      ];
    }
    if (area === "consumer") {
      if (locale === "hi")
        return [
          "उपभोक्ता संरक्षण अधिनियम, 2019 दोषपूर्ण वस्तुओं और सेवाओं के लिए उपाय प्रदान करता है।",
          "पहले विक्रेता को लिखित शिकायत करें और बिल/वारंटी संरक्षित रखें।",
          "अनसुलझे मामले में उपभोक्ता आयोग से संपर्क करें।",
        ];
      if (locale === "ta")
        return [
          "நுகர்வோர் பாதுகாப்புச் சட்டம், 2019 குறைபாடுள்ள பொருட்கள் மற்றும் சேவைகளுக்கு தீர்வுகளை வழங்குகிறது.",
          "முதலில் விற்பனையாளரிடம் எழுத்துப்பூர்வ புகார் செய்து பில்கள்/உத்தரவாதம் வைத்திருங்கள்.",
          "தீர்க்கப்படாவிட்டால் நுகர்வோர் ஆணையத்தை அணுகவும்.",
        ];
      return [
        "The Consumer Protection Act, 2019 provides remedies for defective goods and deficient services.",
        "Consumers may first raise a written complaint with the seller and preserve invoices and warranty documents.",
        "If unresolved, consumers may approach the appropriate consumer commission.",
      ];
    }
    if (area === "workplace") {
      if (locale === "hi")
        return [
          "अवैतनिक वेतन और श्रम विवाद श्रम विभाग के माध्यम से संबोधित किए जा सकते हैं।",
          "रोजगार रिकॉर्ड, वेतन पर्ची और लिखित संचार रखें।",
          "राज्य स्तर पर श्रम आयुक्त चैनल उपलब्ध हैं।",
        ];
      if (locale === "ta")
        return [
          "சம்பளம் செலுத்தப்படாதது மற்றும் தொழிலாளர் வழக்குகள் தொழில் துறை வழிமுறைகள் மூலம் தீர்க்கப்படலாம்.",
          "வேலைவாய்ப்பு பதிவுகள், சம்பள சீட்டுகள் மற்றும் எழுத்துப்பூர்வ தகவல்தொடர்புகளை வைத்திருங்கள்.",
          "மாநில அளவில் தொழிலாளர் ஆணையர் சேனல்கள் உள்ளன.",
        ];
      return [
        "Unpaid wages and employment disputes may be addressed through labour department mechanisms.",
        "Workers should keep employment records, pay slips, and written communications as evidence.",
        "Official labour commissioner channels exist at State level for wage-related complaints.",
      ];
    }
  }

  if (domain === "scheme_eligibility") {
    if (locale === "hi")
      return [
        "सरकारी योजनाओं की पात्रता आधिकारिक मंत्रालय या राज्य पोर्टल पर प्रकाशित होती है।",
        "पात्रता अक्सर भूमि, आय, आयु और निवास पर निर्भर करती है — आधिकारिक पोर्टल पर सत्यापित करें।",
        "केवल आधिकारिक सरकारी चैनलों के माध्यम से आवेदन करें।",
      ];
    if (locale === "ta")
      return [
        "அரசு திட்டங்களின் தகுதி அதிகாரப்பூர்வ அமைச்சக அல்லது மாநில தளங்களில் வெளியிடப்படுகிறது.",
        "தகுதி பெரும்பாலும் நிலம், வருமானம், வயது மற்றும் வசிப்பிடத்தைப் பொறுத்தது — அதிகாரப்பூர்வ தளத்தில் சரிபார்க்கவும்.",
        "அதிகாரப்பூர்வ அரசு சேனல்கள் வழியாக மட்டுமே விண்ணப்பிக்கவும்.",
      ];
    return [
      "Government schemes publish eligibility criteria on official ministry or State portals.",
      "Eligibility often depends on landholding, income, age, and residence — verify on the official portal.",
      "Apply only through official government channels.",
    ];
  }

  if (domain === "form_filler") {
    if (locale === "hi")
      return [
        "आधिकारिक आवेदन फॉर्म सटीक व्यक्तिगत विवरणों से भरें।",
        "आरटीआई आवेदन में रिकॉर्डित जानकारी और सार्वजनिक प्राधिकारी स्पष्ट करें।",
        "जमा करने से पहले आधिकारिक पोर्टल से फॉर्म संस्करण सत्यापित करें।",
      ];
    if (locale === "ta")
      return [
        "அதிகாரப்பூர்வ விண்ணப்ப படிவங்களை துல்லியமான தனிப்பட்ட விவரங்களுடன் நிரப்பவும்.",
        "ஆர்டிஐ விண்ணப்பத்தில் பதிவு செய்யப்பட்ட தகவல் மற்றும் பொது அதிகாரியை தெளிவுபடுத்தவும்.",
        "தாக்கல் செய்வதற்கு முன் அதிகாரப்பூர்வ தளத்தில் படிவ பதிப்பை சரிபார்க்கவும்.",
      ];
    return [
      "Official application forms should be filled using accurate personal details.",
      "For RTI applications, applicants must seek recorded information and identify the public authority.",
      "Verify the current form format from the official portal before submitting.",
    ];
  }

  if (domain === "bureaucracy") {
    if (locale === "hi")
      return [
        "आरटीआई अधिनियम के तहत 'सार्वजनिक प्राधिकारी' का अर्थ संविधान, कानून या सरकारी अधिसूचना से स्थापित संस्था है।",
        "धारा 2(h) यह परिभाषित करती है कि आरटीआई कहाँ दाखिल करें।",
      ];
    if (locale === "ta")
      return [
        "ஆர்டிஐச் சட்டத்தின் கீழ் 'பொது அதிகாரி' என்பது அரசியலமைப்பு, சட்டம் அல்லது அரசாங்க அறிவிப்பால் நிறுவப்பட்ட அமைப்பு.",
        "பிரிவு 2(h) ஆர்டிஐ எங்கு தாக்கல் செய்வது என்பதை வரையறுக்கிறது.",
      ];
    return [
      "Under the RTI Act, a 'public authority' means any authority established under the Constitution, law, or government notification.",
      "Section 2(h) of the RTI Act defines public authority and is key to knowing where an RTI application can be filed.",
    ];
  }

  const grievance =
    locale === "hi"
      ? [
          "नगर निकाय स्थानीय नागरिक सेवाओं के लिए जिम्मेदार होते हैं।",
          "आधिकारिक नगरपालिका चैनलों से शिकायत दर्ज करें और संदर्भ संख्या रखें।",
          "अनसुलझी शिकायतों के लिए उचित शिकायत तंत्र का उपयोग करें।",
        ]
      : locale === "ta"
        ? [
            "நகராட்சிகள் உள்ளூர் குடிமை சேவைகளுக்கு பொறுப்பு.",
            "அதிகாரப்பூர்வ நகராட்சி சேனல்கள் வழியாக புகார் பதிவு செய்து குறிப்பு எண் வைத்திருங்கள்.",
            "தீர்க்கப்படாத புகார்களுக்கு பொருத்தமான புகார் வழிமுறைகளைப் பயன்படுத்தவும்.",
          ]
        : [
            "Urban local bodies are generally responsible for local civic services within their jurisdiction.",
            "Citizens should lodge municipal complaints through official channels and keep the complaint reference number.",
            "If unresolved, citizens may follow up using applicable grievance mechanisms.",
          ];

  if (city) {
    const cityNote =
      locale === "hi"
        ? `${city} में, अपनी नगरपालिका / स्थानीय निकाय के आधिकारिक नागरिक सेवा चैनलों से शिकायत दर्ज करें और ट्रैक करें।`
        : locale === "ta"
          ? `${city} இல், உங்கள் நகராட்சி / உள்ளூர் அதிகாரியின் அதிகாரப்பூர்வ குடிமை சேவை சேனல்களைப் பயன்படுத்தி புகார் பதிவு செய்து கண்காணிக்கவும்.`
          : `In ${city}, lodge and track complaints through your municipal / local body's official citizen service channels.`;
    return [grievance[0], cityNote, grievance[1], grievance[2]];
  }
  return grievance;
}

export function localizedActions(
  domain: string,
  area: string,
  authority: string,
  locale: Locale
): { actions: string[]; documents: string[] } {
  if (domain === "rti") {
    if (locale === "hi")
      return {
        actions: [
          "वह सार्वजनिक प्राधिकारी पहचानें जिसके पास रिकॉर्ड हों।",
          "रिकॉर्डित जानकारी के लिए स्पष्ट अनुरोध लिखें।",
          "आधिकारिक आरटीआई पृष्ठ से पता और शुल्क सत्यापित करें।",
          "आवेदन और जमा प्रमाण की प्रति रखें।",
        ],
        documents: ["पूरा नाम और पता", "माँगी गई जानकारी का विवरण", "संबंधित अवधि", "संदर्भ संख्या"],
      };
    if (locale === "ta")
      return {
        actions: [
          "பதிவுகள் உள்ள பொது அதிகாரியை அடையாளம் காணவும்.",
          "பதிவு செய்யப்பட்ட தகவலுக்கான தெளிவான கோரிக்கை எழுதவும்.",
          "அதிகாரப்பூர்வ ஆர்டிஐ பக்கத்தில் முகவரி மற்றும் கட்டணம் சரிபார்க்கவும்.",
          "விண்ணப்பம் மற்றும் சமர்ப்பிப்பு சான்றின் நகல் வைத்திருங்கள்.",
        ],
        documents: ["முழு பெயர் மற்றும் முகவரி", "கோரப்பட்ட தகவல் விவரம்", "தொடர்புடைய காலம்", "குறிப்பு எண்"],
      };
    return {
      actions: [
        "Identify the public authority that is likely to hold the records you need.",
        "Write clear requests for recorded information (not opinions).",
        "Verify the PIO address and applicable fee from the official RTI page.",
        "Keep a copy of your application and proof of submission.",
      ],
      documents: ["Full name and address", "Description of records sought", "Relevant period", "Reference numbers"],
    };
  }

  if (domain === "rights_navigator" && area === "tenant") {
    if (locale === "hi")
      return {
        actions: [
          "किराया अनुबंध, जमा रसीद और बाहर निकलने का प्रमाण इकट्ठा करें।",
          "मकान मालिक को जमा वापसी के लिए लिखित अनुरोध भेजें।",
          "राज्य के किराया नियम आधिकारिक पोर्टल पर देखें।",
          "अनसुलझे मामले में किराया प्राधिकारी या उपभोक्ता फोरम से संपर्क करें।",
        ],
        documents: ["किराया अनुबंध", "जमा भुगतान प्रमाण", "बाहर निकलने के फोटो/संदेश", "पहचान प्रमाण"],
      };
    if (locale === "ta")
      return {
        actions: [
          "வாடகை ஒப்பந்தம், வைப்புத்தொகை ரசீது மற்றும் வெளியேற்ற சான்றுகளை சேகரிக்கவும்.",
          "வீட்டு உரிமையாளரிடம் வைப்புத்தொகை திரும்பப் பெற எழுத்துப்பூர்வ கோரிக்கை அனுப்பவும்.",
          "மாநில வாடகை விதிகளை அதிகாரப்பூர்வ தளத்தில் சரிபார்க்கவும்.",
          "தீர்க்கப்படாவிட்டால் வாடகை அதிகாரி அல்லது நுகர்வோர் ஆணையத்தை அணுகவும்.",
        ],
        documents: ["வாடகை ஒப்பந்தம்", "வைப்புத்தொகை சான்று", "வெளியேற்ற புகைப்படங்கள்", "அடையாள சான்று"],
      };
    return {
      actions: [
        "Collect your rent agreement, deposit receipt, and move-out evidence.",
        "Send a written request to the landlord for deposit return.",
        "Check your State's tenancy rules on the official portal.",
        "If unresolved, approach the rent authority or consumer forum.",
      ],
      documents: ["Rent agreement", "Deposit proof", "Move-out photos/messages", "Identity proof"],
    };
  }

  if (domain === "rights_navigator" && area === "consumer") {
    if (locale === "hi")
      return {
        actions: [
          "बिल, वारंटी कार्ड और संचार संरक्षित रखें।",
          "विक्रेता को मरम्मत/प्रतिस्थापन/धनवापसी के लिए लिखित शिकायत करें।",
          "राष्ट्रीय उपभोक्ता हेल्पलाइन का उपयोग करें।",
          "अनसुलझे मामले में उपभोक्ता आयोग में दायर करें।",
        ],
        documents: ["बिल", "वारंटी कार्ड", "उत्पाद फोटो", "शिकायत ईमेल/संदेश"],
      };
    if (locale === "ta")
      return {
        actions: [
          "பில், உத்தரவாத அட்டை மற்றும் தகவல்தொடர்புகளை வைத்திருங்கள்.",
          "விற்பனையாளரிடம் பழுதுபார்ப்பு/மாற்று/பணத்திரும்ப எழுத்துப்பூர்வ புகார் செய்யவும்.",
          "தேசிய நுகர்வோர் உதவி எண்ணைப் பயன்படுத்தவும்.",
          "தீர்க்கப்படாவிட்டால் நுகர்வோர் ஆணையத்தில் தாக்கல் செய்யவும்.",
        ],
        documents: ["பில்", "உத்தரவாத அட்டை", "தயாரிப்பு புகைப்படங்கள்", "புகார் செய்திகள்"],
      };
    return {
      actions: [
        "Keep the invoice, warranty card, and all communication with the seller.",
        "Send a written complaint asking for repair, replacement, or refund.",
        "Use the National Consumer Helpline or official consumer portal.",
        "If unresolved, file before the appropriate Consumer Commission.",
      ],
      documents: ["Invoice / bill", "Warranty card", "Product photos", "Complaint messages"],
    };
  }

  if (domain === "rights_navigator" && area === "workplace") {
    if (locale === "hi")
      return {
        actions: [
          "अवैतनिक अवधि के वेतन पर्ची और बैंक रिकॉर्ड दस्तावेज़ करें।",
          "नियोक्ता को लिखित शिकायत करें।",
          "राज्य श्रम विभाग / श्रम आयुक्त से संपर्क करें।",
          "सभी शिकायतों की प्रति रखें।",
        ],
        documents: ["रोजगार प्रमाण", "वेतन पर्ची", "लिखित शिकायत", "नियुक्ति पत्र"],
      };
    if (locale === "ta")
      return {
        actions: [
          "சம்பளம் செலுத்தப்படாத காலத்தின் சம்பள சீட்டுகள் மற்றும் வங்கி பதிவுகளை ஆவணப்படுத்தவும்.",
          "முதலாளிக்கு எழுத்துப்பூர்வ புகார் செய்யவும்.",
          "மாநில தொழில் துறை / தொழிலாளர் ஆணையரை அணுகவும்.",
          "அனைத்து புகார்களின் நகல்களையும் வைத்திருங்கள்.",
        ],
        documents: ["வேலைவாய்ப்பு சான்று", "சம்பள சீட்டுகள்", "எழுத்துப்பூர்வ புகார்", "நியமன கடிதம்"],
      };
    return {
      actions: [
        "Document unpaid salary periods with payslips and bank records.",
        "Raise a written complaint to your employer requesting payment.",
        "Approach the State labour department / labour commissioner.",
        "Keep copies of all complaints.",
      ],
      documents: ["Employment proof", "Payslips", "Written complaint", "Appointment letter"],
    };
  }

  if (domain === "scheme_eligibility") {
    if (locale === "hi")
      return {
        actions: [
          "आधिकारिक योजना पोर्टल पर पात्रता मानदंड देखें।",
          "पोर्टल पर सूचीबद्ध दस्तावेज़ इकट्ठा करें।",
          "केवल आधिकारिक वेबसाइट या सीएससी से आवेदन करें।",
          "आधिकारिक संदर्भ संख्या से स्थिति ट्रैक करें।",
        ],
        documents: ["आधार / पहचान", "भूमि या आय रिकॉर्ड", "बैंक खाता विवरण", "निवास प्रमाण"],
      };
    if (locale === "ta")
      return {
        actions: [
          "அதிகாரப்பூர்வ திட்ட தளத்தில் தகுதி விதிமுறைகளை சரிபார்க்கவும்.",
          "தளத்தில் பட்டியலிடப்பட்ட ஆவணங்களை சேகரிக்கவும்.",
          "அதிகாரப்பூர்வ வலைத்தளம் அல்லது CSC வழியாக மட்டுமே விண்ணப்பிக்கவும்.",
          "அதிகாரப்பூர்வ குறிப்பு எண்ணால் நிலையை கண்காணிக்கவும்.",
        ],
        documents: ["ஆதார் / அடையாளம்", "நிலம் அல்லது வருமான பதிவுகள்", "வங்கி கணக்கு விவரங்கள்", "வசிப்பிட சான்று"],
      };
    return {
      actions: [
        "Check the official scheme portal for eligibility criteria applicable in your State.",
        "Gather documents listed on the official portal.",
        "Apply only through the official government website or Common Service Centre.",
        "Track application status using the official reference number.",
      ],
      documents: ["Aadhaar / identity proof", "Land or income records", "Bank account details", "Residence proof"],
    };
  }

  if (domain === "form_filler") {
    if (locale === "hi")
      return {
        actions: [
          "CivicAI के प्रश्नों के उत्तर दें ताकि प्रत्येक फ़ील्ड सही भर सके।",
          "जमा करने से पहले प्रत्येक फ़ील्ड की समीक्षा करें।",
          "आधिकारिक पोर्टल से फॉर्म संस्करण सत्यापित करें।",
          "आधिकारिक निर्देशानुसार सहायक दस्तावेज़ संलग्न करें।",
        ],
        documents: ["पूरा नाम और पता", "फ़ोन / ईमेल", "अनुरोध का विवरण", "सहायक दस्तावेज़"],
      };
    if (locale === "ta")
      return {
        actions: [
          "ஒவ்வொரு புலமும் சரியாக நிரப்ப CivicAI கேள்விகளுக்கு பதிலளிக்கவும்.",
          "தாக்கல் செய்வதற்கு முன் ஒவ்வொரு புலத்தையும் மதிப்பாய்வு செய்யவும்.",
          "அதிகாரப்பூர்வ தளத்தில் படிவ பதிப்பை சரிபார்க்கவும்.",
          "அதிகாரப்பூர்வ வழிகாட்டுதலின்படி ஆதரவு ஆவணங்களை இணைக்கவும்.",
        ],
        documents: ["முழு பெயர் மற்றும் முகவரி", "தொலைபேசி / மின்னஞ்சல்", "கோரிக்கை விவரம்", "ஆதரவு ஆவணங்கள்"],
      };
    return {
      actions: [
        "Answer CivicAI's questions so each form field can be filled accurately.",
        "Review every field before submitting.",
        "Verify the official form version on the government portal.",
        "Attach supporting documents listed on the official form instructions.",
      ],
      documents: ["Full name and address", "Contact phone / email", "Details of your request", "Supporting documents"],
    };
  }

  if (domain === "bureaucracy") {
    if (locale === "hi")
      return {
        actions: [
          "नीचे दिए आधिकारिक स्रोत के साथ सरल व्याख्या का उपयोग करें।",
          "रिकॉर्ड चाहिए तो सार्वजनिक प्राधिकारी नामित करके आरटीआई तैयार करें।",
          "आधिकारिक पोर्टल पर शुल्क और समयसीमा सत्यापित करें।",
        ],
        documents: ["आधिकारिक स्रोत या धारा", "आपका प्रश्न सरल शब्दों में"],
      };
    if (locale === "ta")
      return {
        actions: [
          "கீழே உள்ள அதிகாரப்பூர்வ ஆதாரத்துடன் எளிய விளக்கத்தைப் பயன்படுத்தவும்.",
          "பதிவுகள் தேவைப்பட்டால் பொது அதிகாரியைக் குறிப்பிட்டு ஆர்டிஐ தயாரிக்கவும்.",
          "அதிகாரப்பூர்வ தளத்தில் கட்டணம் மற்றும் காலக்கெடுவை சரிபார்க்கவும்.",
        ],
        documents: ["அதிகாரப்பூர்வ ஆதாரம் அல்லது பிரிவு", "உங்கள் கேள்வி எளிய வார்த்தைகளில்"],
      };
    return {
      actions: [
        "Use the plain-language explanation alongside the official source linked below.",
        "If you need records, prepare an RTI request naming the public authority clearly.",
        "Verify any fee, address, or timeline on the official portal.",
      ],
      documents: ["Official source or statute section", "Your specific question in simple words"],
    };
  }

  const grievanceActions =
    locale === "hi"
      ? [
          `${authority} के साथ मौजूदा शिकायत की स्थिति जाँचें।`,
          "शिकायत संख्या, तारीख और स्क्रीनशॉट इकट्ठा करें।",
          "आधिकारिक शिकायत प्रक्रिया के माध्यम से दर्ज या बढ़ाएँ।",
          "यदि उपयुक्त हो तो आरटीआई आवेदन तैयार करें।",
        ]
      : locale === "ta"
        ? [
            `${authority} உடன் இருக்கும் புகாரின் நிலையை சரிபார்க்கவும்.`,
            "புகார் எண், தேதி மற்றும் ஸ்கிரீன்ஷாட்களை சேகரிக்கவும்.",
            "அதிகாரப்பூர்வ புகார் செயல்முறை வழியாக தாக்கல் அல்லது உயர்த்தவும்.",
            "பொருத்தமானால் ஆர்டிஐ விண்ணப்பம் தயாரிக்கவும்.",
          ]
        : [
            `Check the status of your existing complaint with ${authority}, if you filed one.`,
            "Collect your complaint/reference number, date, and acknowledgements.",
            "Submit or escalate through the official grievance process.",
            "If appropriate, prepare an RTI application for records about action taken.",
          ];

  const grievanceDocs =
    locale === "hi"
      ? ["शिकायत संख्या", "मूल शिकायत की तारीख", "पावती की प्रति", "समस्या का स्थान", "संपर्क विवरण"]
      : locale === "ta"
        ? ["புகார் எண்", "அசல் புகார் தேதி", "ஒப்புதல் நகல்", "பிரச்சினை இடம்", "தொடர்பு விவரங்கள்"]
        : [
            "Complaint/reference number",
            "Date of original complaint",
            "Copy of acknowledgement",
            "Exact location of the issue",
            "Your contact details",
          ];

  return { actions: grievanceActions, documents: grievanceDocs };
}

export function localizedSummary(
  domain: string,
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>,
  locale: Locale
): string {
  const city = (jurisdiction.city as string) || (locale === "hi" ? "आपका क्षेत्र" : locale === "ta" ? "உங்கள் பகுதி" : "your area");
  const state = (jurisdiction.state as string) || (locale === "hi" ? "आपका राज्य" : locale === "ta" ? "உங்கள் மாநிலம்" : "your state");
  const area = (facts.rights_area as string) || "general";

  if (domain === "rti") {
    const obj = facts.rti_objective || facts.issue_summary || "recorded information";
    if (locale === "hi") return `आप रिकॉर्डित जानकारी माँगना चाहते हैं: ${obj} (${city}, ${state})।`;
    if (locale === "ta") return `நீங்கள் பதிவு செய்யப்பட்ட தகவலைக் கோர விரும்புகிறீர்கள்: ${obj} (${city}, ${state}).`;
    return `You want to request recorded information about: ${obj} (${city}, ${state}).`;
  }
  if (domain === "rights_navigator") {
    const labels =
      locale === "hi"
        ? { tenant: "किरायेदार/मकान मालिक", consumer: "उपभोक्ता", workplace: "कार्यस्थल", general: "अधिकार" }
        : locale === "ta"
          ? { tenant: "வாடகைதாரர்/வீட்டு உரிமையாளர்", consumer: "நுகர்வோர்", workplace: "பணியிடம்", general: "உரிமை" }
          : { tenant: "tenant/landlord", consumer: "consumer", workplace: "workplace", general: "rights" };
    const label = labels[area as keyof typeof labels] || labels.general;
    if (locale === "hi") return `आपने ${state} में ${label} विवाद के बारे में पूछा।`;
    if (locale === "ta") return `${state} இல் ${label} வழக்கு பற்றி நீங்கள் கேட்டீர்கள்.`;
    return `You asked what you can do about a ${label} dispute in ${state}.`;
  }
  if (domain === "scheme_eligibility") {
    const scheme = facts.scheme_name || "a government scheme";
    if (locale === "hi") return `आपने ${state} में ${scheme} के लिए पात्रता के बारे में पूछा।`;
    if (locale === "ta") return `${state} இல் ${scheme} க்கான தகுதி பற்றி நீங்கள் கேட்டீர்கள்.`;
    return `You asked whether you are eligible for ${scheme} in ${state}.`;
  }
  if (domain === "form_filler") {
    const form = facts.form_type || "an official form";
    if (locale === "hi") return `आपको ${city}, ${state} के लिए ${form} भरने में मदद चाहिए।`;
    if (locale === "ta") return `${city}, ${state} க்கான ${form} நிரப்ப உதவி வேண்டும்.`;
    return `You need help filling ${form} for ${city}, ${state}.`;
  }
  if (domain === "bureaucracy") {
    const term = (facts.term_to_explain as string) || "a government term";
    if (locale === "hi") return `आपने सरल भाषा में व्याख्या माँगी: ${term.slice(0, 120)}`;
    if (locale === "ta") return `எளிய மொழியில் விளக்கம் கேட்டீர்கள்: ${term.slice(0, 120)}`;
    return `You asked for a plain-language explanation of: ${term.slice(0, 120)}`;
  }
  const issue = facts.issue_type || "civic issue";
  if (locale === "hi")
    return `आपने ${city}, ${state} में ${issue} की शिकायत दर्ज की।`;
  if (locale === "ta")
    return `${city}, ${state} இல் ${issue} புகார் பற்றி தெரிவித்தீர்கள்.`;
  return `You reported a ${issue} complaint in ${city}, ${state}.`;
}

export function localizedMessages(locale: Locale) {
  const t = getTranslations(locale);
  return {
    needMoreInfo: t.needMoreInfo,
    foundFromSources: t.foundFromSources,
    insufficientInfo: t.insufficientInfo,
    domainLabel: (domain: string) =>
      t.domainLabels[domain as keyof typeof t.domainLabels] || t.domainLabels.other,
  };
}
