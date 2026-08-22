import type { Locale } from "./types";

export type TranslationKeys = {
  appName: string;
  taglineLine1: string;
  taglineLine2: string;
  heroDescription: string;
  problemLabel: string;
  problemPlaceholder: string;
  getHelp: string;
  understanding: string;
  trySample: string;
  language: string;
  pastCases: string;
  pastCasesEmpty: string;
  pastCasesLoading: string;
  clearAll: string;
  confirmClearAll: string;
  remove: string;
  newCase: string;
  continue: string;
  replyPlaceholder: string;
  yourAnswer: string;
  yourSituation: string;
  officialSourcesSay: string;
  whatYouCanDo: string;
  yourDetails: string;
  detailsHelp: string;
  generateDocument: string;
  generateComplaint: string;
  generateRti: string;
  generateForm: string;
  preparingDraft: string;
  downloadTxt: string;
  officialSources: string;
  statutorySource: string;
  officialSource: string;
  trustedSource: string;
  openSource: string;
  startNewCase: string;
  insufficientInfo: string;
  needMoreInfo: string;
  foundFromSources: string;
  checkingSources: string;
  placeholdersRemain: string;
  fieldRequired: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  documentDate: string;
  namePlaceholder: string;
  addressPlaceholder: string;
  cityPlaceholder: string;
  statePlaceholder: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
  unavailable: string;
  draftError: string;
  conversation: string;
  you: string;
  civicAI: string;
  thinking: string;
  conversationAria: string;
  caseLabel: string;
  loadingResponse: string;
  close: string;
  closeOverlay: string;
  datePlaceholder: string;
  timeoutError: string;
  connectionError: string;
  statusLabels: Record<string, string>;
  domainLabels: Record<string, string>;
  samples: Record<string, string>;
  sampleQueries: Record<string, string>;
};

const en: TranslationKeys = {
  appName: "CivicAI",
  taglineLine1: "Understand your rights.",
  taglineLine2: "Know what to do next.",
  heroDescription:
    "RTI drafting, rights guidance, scheme eligibility, form-filling, and plain-language bureaucracy help — grounded in official sources.",
  problemLabel: "What problem are you facing?",
  problemPlaceholder: "Describe your situation...",
  getHelp: "Get Help",
  understanding: "Understanding your situation...",
  trySample: "Try a sample workflow",
  language: "Language",
  pastCases: "My past cases",
  pastCasesEmpty: "Cases you open will appear here on this device.",
  pastCasesLoading: "Loading...",
  clearAll: "Clear all",
  confirmClearAll: "Remove all past cases from this browser?",
  remove: "Remove",
  newCase: "New case",
  continue: "Continue",
  replyPlaceholder: "Type your answer...",
  yourAnswer: "Your answer",
  yourSituation: "Your situation",
  officialSourcesSay: "What official sources say",
  whatYouCanDo: "What you can do",
  yourDetails: "Your details for the document",
  detailsHelp:
    "Fill in your information below. CivicAI will insert these details into the generated form or draft.",
  generateDocument: "Generate a document",
  generateComplaint: "Generate Complaint",
  generateRti: "Generate RTI Draft",
  generateForm: "Generate Pre-filled Form",
  preparingDraft: "Preparing draft...",
  downloadTxt: "Download .txt",
  officialSources: "Official sources",
  statutorySource: "Statutory source",
  officialSource: "Official source",
  trustedSource: "Trusted source",
  openSource: "Open official source",
  startNewCase: "Start New Case",
  insufficientInfo:
    "I couldn't find enough authoritative information to answer this reliably.",
  needMoreInfo: "CivicAI needs a little more information to understand your situation.",
  foundFromSources: "Here is what CivicAI found based on official sources.",
  checkingSources: "Checking official sources...",
  placeholdersRemain: "Some placeholders remain — update your details above and regenerate if needed:",
  fieldRequired: "This field is required.",
  fullName: "Full name",
  address: "Address",
  city: "City",
  state: "State",
  phone: "Phone",
  email: "Email",
  documentDate: "Date for the document",
  namePlaceholder: "Your full name",
  addressPlaceholder: "House no., street, area, PIN",
  cityPlaceholder: "e.g. Chennai",
  statePlaceholder: "e.g. Tamil Nadu",
  phonePlaceholder: "+91 ...",
  emailPlaceholder: "you@example.com",
  unavailable: "CivicAI is temporarily unavailable. Please try again.",
  draftError: "Could not generate draft.",
  conversation: "Conversation",
  you: "You",
  civicAI: "CivicAI",
  thinking: "CivicAI is thinking...",
  conversationAria: "Conversation history",
  caseLabel: "Case",
  loadingResponse: "Loading response",
  close: "Close",
  closeOverlay: "Close overlay",
  datePlaceholder: "YYYY-MM-DD",
  timeoutError: "The request timed out. Please try again.",
  connectionError: "Could not reach CivicAI. Please check your connection and try again.",
  statusLabels: {
    collecting: "In progress",
    ready: "Ready",
    researching: "Researching",
    error: "Error",
  },
  domainLabels: {
    rti: "RTI drafting",
    grievance: "Municipal service complaint",
    rights_navigator: "Rights navigator",
    scheme_eligibility: "Scheme eligibility",
    form_filler: "Conversational form-filler",
    bureaucracy: "Bureaucracy translator",
    other: "Civic case",
  },
  samples: {
    rti: "RTI drafting",
    tenant: "Rights — tenant",
    consumer: "Rights — consumer",
    workplace: "Rights — workplace",
    scheme: "Scheme eligibility",
    form: "Form-filler",
    bureaucracy: "Bureaucracy translator",
    grievance: "Municipal grievance",
  },
  sampleQueries: {
    rti: "I want to know how much the municipality spent repairing the road on my street last year.",
    tenant: "My landlord is refusing to return my security deposit after I moved out in Bangalore.",
    consumer: "I bought a defective phone and the shop is not giving a refund under warranty.",
    workplace: "My employer has not paid my salary for two months.",
    scheme: "Am I eligible for PM-KISAN if I own 2 acres of farmland in rural Tamil Nadu?",
    form: "Help me fill the RTI application form to ask about water supply complaints.",
    bureaucracy: "What does 'public authority under Section 2(h) of RTI Act' mean in simple words?",
    grievance: "My municipality hasn't fixed my drainage complaint.",
  },
};

const hi: TranslationKeys = {
  appName: "CivicAI",
  taglineLine1: "अपने अधिकार समझें।",
  taglineLine2: "आगे क्या करें, जानें।",
  heroDescription:
    "आरटीआई ड्राफ्टिंग, अधिकार मार्गदर्शन, योजना पात्रता, फॉर्म भरना और सरल भाषा में सरकारी प्रक्रिया की मदद — आधिकारिक स्रोतों पर आधारित।",
  problemLabel: "आपको किस समस्या का सामना करना पड़ रहा है?",
  problemPlaceholder: "अपनी स्थिति बताएं...",
  getHelp: "मदद लें",
  understanding: "आपकी स्थिति समझी जा रही है...",
  trySample: "नमूना वर्कफ़्लो आज़माएं",
  language: "भाषा",
  pastCases: "मेरे पिछले मामले",
  pastCasesEmpty: "आप जो मामले खोलेंगे, वे इस डिवाइस पर यहाँ दिखेंगे।",
  pastCasesLoading: "लोड हो रहा है...",
  clearAll: "सभी हटाएं",
  confirmClearAll: "इस ब्राउज़र से सभी पिछले मामले हटाएं?",
  remove: "हटाएं",
  newCase: "नया मामला",
  continue: "जारी रखें",
  replyPlaceholder: "अपना उत्तर लिखें...",
  yourAnswer: "आपका उत्तर",
  yourSituation: "आपकी स्थिति",
  officialSourcesSay: "आधिकारिक स्रोत क्या कहते हैं",
  whatYouCanDo: "आप क्या कर सकते हैं",
  yourDetails: "दस्तावेज़ के लिए आपका विवरण",
  detailsHelp:
    "नीचे अपनी जानकारी भरें। CivicAI इसे जनरेट किए गए फॉर्म या ड्राफ्ट में डालेगा।",
  generateDocument: "दस्तावेज़ बनाएं",
  generateComplaint: "शिकायत पत्र बनाएं",
  generateRti: "आरटीआई ड्राफ्ट बनाएं",
  generateForm: "पूर्व-भरा फॉर्म बनाएं",
  preparingDraft: "ड्राफ्ट तैयार हो रहा है...",
  downloadTxt: ".txt डाउनलोड करें",
  officialSources: "आधिकारिक स्रोत",
  statutorySource: "वैधानिक स्रोत",
  officialSource: "आधिकारिक स्रोत",
  trustedSource: "विश्वसनीय स्रोत",
  openSource: "आधिकारिक स्रोत खोलें",
  startNewCase: "नया मामला शुरू करें",
  insufficientInfo:
    "विश्वसनीय जानकारी पर्याप्त नहीं मिली। कृपया और विवरण दें या पुनः प्रयास करें।",
  needMoreInfo: "CivicAI को आपकी स्थिति समझने के लिए थोड़ी और जानकारी चाहिए।",
  foundFromSources: "आधिकारिक स्रोतों के आधार पर CivicAI ने यह पाया।",
  checkingSources: "आधिकारिक स्रोत जाँचे जा रहे हैं...",
  placeholdersRemain:
    "कुछ स्थान खाली हैं — ऊपर विवरण अपडेट करें और पुनः जनरेट करें:",
  fieldRequired: "यह फ़ील्ड आवश्यक है।",
  fullName: "पूरा नाम",
  address: "पता",
  city: "शहर",
  state: "राज्य",
  phone: "फ़ोन",
  email: "ईमेल",
  documentDate: "दस्तावेज़ की तारीख",
  namePlaceholder: "आपका पूरा नाम",
  addressPlaceholder: "मकान नं., गली, क्षेत्र, पिन",
  cityPlaceholder: "जैसे चेन्नई",
  statePlaceholder: "जैसे तमिलनाडु",
  phonePlaceholder: "+91 ...",
  emailPlaceholder: "you@example.com",
  unavailable: "CivicAI अस्थायी रूप से उपलब्ध नहीं है। कृपया पुनः प्रयास करें।",
  draftError: "ड्राफ्ट नहीं बन सका।",
  conversation: "संवाद",
  you: "आप",
  civicAI: "CivicAI",
  thinking: "CivicAI सोच रहा है...",
  conversationAria: "संवाद इतिहास",
  caseLabel: "मामला",
  loadingResponse: "प्रतिक्रिया लोड हो रही है",
  close: "बंद करें",
  closeOverlay: "ओवरले बंद करें",
  datePlaceholder: "YYYY-MM-DD",
  timeoutError: "अनुरोध समय समाप्त हो गया। कृपया पुनः प्रयास करें।",
  connectionError: "CivicAI से कनेक्ट नहीं हो सका। कृपया कनेक्शन जाँचें और पुनः प्रयास करें।",
  statusLabels: {
    collecting: "प्रगति में",
    ready: "तैयार",
    researching: "खोज जारी",
    error: "त्रुटि",
  },
  domainLabels: {
    rti: "आरटीआई ड्राफ्टिंग",
    grievance: "नगरपालिका शिकायत",
    rights_navigator: "अधिकार मार्गदर्शक",
    scheme_eligibility: "योजना पात्रता",
    form_filler: "संवादात्मक फॉर्म भरना",
    bureaucracy: "सरकारी भाषा अनुवादक",
    other: "नागरिक मामला",
  },
  samples: {
    rti: "आरटीआई ड्राफ्टिंग",
    tenant: "अधिकार — किरायेदार",
    consumer: "अधिकार — उपभोक्ता",
    workplace: "अधिकार — कार्यस्थल",
    scheme: "योजना पात्रता",
    form: "फॉर्म भरना",
    bureaucracy: "सरकारी भाषा अनुवाद",
    grievance: "नगरपालिका शिकायत",
  },
  sampleQueries: {
    rti: "मैं जानना चाहता/चाहती हूँ कि नगरपालिका ने मेरी गली की सड़क की मरम्मत पर पिछले वर्ष कितना खर्च किया।",
    tenant: "मेरा मकान मालिक बेंगलुरु में बाहर निकलने के बाद मेरी सुरक्षा जमा वापस नहीं कर रहा।",
    consumer: "मैंने एक दोषपूर्ण फोन खरीदा और दुकान वारंटी के तहत रिफंड नहीं दे रही।",
    workplace: "मेरा नियोक्ता दो महीने से मेरा वेतन नहीं दे रहा।",
    scheme: "क्या मैं ग्रामीण तमिलनाडु में 2 एकड़ खेत रखने पर PM-KISAN के लिए पात्र हूँ?",
    form: "जल आपूर्ति शिकायतों के बारे में पूछने के लिए आरटीआई आवेदन फॉर्म भरने में मदद करें।",
    bureaucracy: "आरटीआई अधिनियम की धारा 2(h) के तहत 'सार्वजनिक प्राधिकारी' का सरल भाषा में क्या अर्थ है?",
    grievance: "मेरी नगरपालिका मेरी जल निकासी शिकायत ठीक नहीं कर रही।",
  },
};

const ta: TranslationKeys = {
  appName: "CivicAI",
  taglineLine1: "உங்கள் உரிமைகளைப் புரிந்துகொள்ளுங்கள்.",
  taglineLine2: "அடுத்து என்ன செய்வது என்று அறியுங்கள்.",
  heroDescription:
    "ஆர்டிஐ வரைவு, உரிமை வழிகாட்டுதல், திட்டத் தகுதி, படிவம் நிரப்புதல் மற்றும் எளிய மொழியில் அரசாங்க செயல்முறை உதவி — அதிகாரப்பூர்வ ஆதாரங்களின் அடிப்படையில்.",
  problemLabel: "நீங்கள் எந்த பிரச்சினையை எதிர்கொள்கிறீர்கள்?",
  problemPlaceholder: "உங்கள் சூழ்நிலையை விவரிக்கவும்...",
  getHelp: "உதவி பெறுங்கள்",
  understanding: "உங்கள் சூழ்நிலை புரிந்து கொள்ளப்படுகிறது...",
  trySample: "மாதிரி பணிப்பாய்வை முயற்சிக்கவும்",
  language: "மொழி",
  pastCases: "எனது முந்தைய வழக்குகள்",
  pastCasesEmpty: "நீங்கள் திறக்கும் வழக்குகள் இந்த சாதனத்தில் இங்கே தோன்றும்.",
  pastCasesLoading: "ஏற்றுகிறது...",
  clearAll: "அனைத்தையும் அகற்று",
  confirmClearAll: "இந்த சாதனத்திலிருந்து அனைத்து முந்தைய வழக்குகளையும் அகற்றவா?",
  remove: "அகற்று",
  newCase: "புதிய வழக்கு",
  continue: "தொடரவும்",
  replyPlaceholder: "உங்கள் பதிலை தட்டச்சு செய்யவும்...",
  yourAnswer: "உங்கள் பதில்",
  yourSituation: "உங்கள் சூழ்நிலை",
  officialSourcesSay: "அதிகாரப்பூர்வ ஆதாரங்கள் என்ன சொல்கின்றன",
  whatYouCanDo: "நீங்கள் என்ன செய்யலாம்",
  yourDetails: "ஆவணத்திற்கான உங்கள் விவரங்கள்",
  detailsHelp:
    "கீழே உங்கள் தகவல்களை நிரப்பவும். CivicAI இதை உருவாக்கப்பட்ட படிவம் அல்லது வரைவில் சேர்க்கும்.",
  generateDocument: "ஆவணம் உருவாக்கு",
  generateComplaint: "புகார் கடிதம் உருவாக்கு",
  generateRti: "ஆர்டிஐ வரைவு உருவாக்கு",
  generateForm: "முன்னரே நிரப்பப்பட்ட படிவம் உருவாக்கு",
  preparingDraft: "வரைவு தயாராகிறது...",
  downloadTxt: ".txt பதிவிறக்கு",
  officialSources: "அதிகாரப்பூர்வ ஆதாரங்கள்",
  statutorySource: "சட்ட ஆதாரம்",
  officialSource: "அதிகாரப்பூர்வ ஆதாரம்",
  trustedSource: "நம்பகமான ஆதாரம்",
  openSource: "அதிகாரப்பூர்வ ஆதாரத்தைத் திற",
  startNewCase: "புதிய வழக்கைத் தொடங்கு",
  insufficientInfo:
    "நம்பகமான தகவல் போதுமானதாக கிடைக்கவில்லை. மேலும் விவரங்களைப் பகிரவும் அல்லது மீண்டும் முயற்சிக்கவும்.",
  needMoreInfo: "CivicAI உங்கள் சூழ்நிலையைப் புரிந்துகொள்ள கொஞ்சம் கூடுதல் தகவல் வேண்டும்.",
  foundFromSources: "அதிகாரப்பூர்வ ஆதாரங்களின் அடிப்படையில் CivicAI இதைக் கண்டறிந்தது.",
  checkingSources: "அதிகாரப்பூர்வ ஆதாரங்கள் சரிபார்க்கப்படுகின்றன...",
  placeholdersRemain:
    "சில இடங்கள் காலியாக உள்ளன — மேலே விவரங்களைப் புதுப்பித்து மீண்டும் உருவாக்கவும்:",
  fieldRequired: "இந்த புலம் அவசியம்.",
  fullName: "முழு பெயர்",
  address: "முகவரி",
  city: "நகரம்",
  state: "மாநிலம்",
  phone: "தொலைபேசி",
  email: "மின்னஞ்சல்",
  documentDate: "ஆவண தேதி",
  namePlaceholder: "உங்கள் முழு பெயர்",
  addressPlaceholder: "வீட்டு எண், தெரு, பகுதி, பின்",
  cityPlaceholder: "எ.கா. சென்னை",
  statePlaceholder: "எ.கா. தமிழ்நாடு",
  phonePlaceholder: "+91 ...",
  emailPlaceholder: "you@example.com",
  unavailable: "CivicAI தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.",
  draftError: "வரைவை உருவாக்க முடியவில்லை.",
  conversation: "உரையாடல்",
  you: "நீங்கள்",
  civicAI: "CivicAI",
  thinking: "CivicAI சிந்திக்கிறது...",
  conversationAria: "உரையாடல் வரலாறு",
  caseLabel: "வழக்கு",
  loadingResponse: "பதில் ஏற்றுகிறது",
  close: "மூடு",
  closeOverlay: "மேலோட்டை மூடு",
  datePlaceholder: "YYYY-MM-DD",
  timeoutError: "கோரிக்கை நேரம் முடிந்தது. மீண்டும் முயற்சிக்கவும்.",
  connectionError: "CivicAI இணைக்க முடியவில்லை. இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  statusLabels: {
    collecting: "நடந்து கொண்டிருக்கிறது",
    ready: "தயார்",
    researching: "ஆராய்ச்சி",
    error: "பிழை",
  },
  domainLabels: {
    rti: "ஆர்டிஐ வரைவு",
    grievance: "நகராட்சி புகார்",
    rights_navigator: "உரிமை வழிகாட்டி",
    scheme_eligibility: "திட்டத் தகுதி",
    form_filler: "உரையாடல் படிவ நிரப்புதல்",
    bureaucracy: "அரசாங்க மொழி மொழிபெயர்ப்பாளர்",
    other: "குடிமை வழக்கு",
  },
  samples: {
    rti: "ஆர்டிஐ வரைவு",
    tenant: "உரிமை — வாடகைதாரர்",
    consumer: "உரிமை — நுகர்வோர்",
    workplace: "உரிமை — பணியிடம்",
    scheme: "திட்டத் தகுதி",
    form: "படிவ நிரப்புதல்",
    bureaucracy: "அரசாங்க மொழி மொழிபெயர்ப்பு",
    grievance: "நகராட்சி புகார்",
  },
  sampleQueries: {
    rti: "என் தெருவில் சாலை பழுதுபார்ப்புக்கு நகராட்சி கடந்த ஆண்டு எவ்வளவு செலவு செய்தது என்று அறிய விரும்புகிறேன்.",
    tenant: "நான் பெங்களூரில் வெளியேறிய பிறகு என் வீட்டு உரிமையாளர் பாதுகாப்பு வைப்புத்தொகை திரும்பப் பெற மறுக்கிறார்.",
    consumer: "நான் குறைபாடுள்ள தொலைபேசி வாங்கினேன்; கடை உத்தரவாதத்தின் கீழ் பணத்திரும்ப வழங்கவில்லை.",
    workplace: "என் முதலாளி இரண்டு மாதங்களாக என் சம்பளம் செலுத்தவில்லை.",
    scheme: "தமிழ்நாட்டின் கிராமப்புறத்தில் 2 ஏக்கர் விவசாய நிலம் வைத்திருந்தால் PM-KISAN திட்டத்திற்கு தகுதியானவரா?",
    form: "குடிநீர் விநியோக புகார்களைக் கேட்க ஆர்டிஐ விண்ணப்ப படிவம் நிரப்ப உதவி வேண்டும்.",
    bureaucracy: "ஆர்டிஐச் சட்டத்தின் பிரிவு 2(h) இன் கீழ் 'பொது அதிகாரி' எளிய வார்த்தைகளில் என்ன அர்த்தம்?",
    grievance: "என் நகராட்சி என் வடிகால் புகாரை சரி செய்யவில்லை.",
  },
};

const MAP: Record<Locale, TranslationKeys> = { en, hi, ta };

export function getTranslations(locale: Locale): TranslationKeys {
  return MAP[locale] || en;
}
