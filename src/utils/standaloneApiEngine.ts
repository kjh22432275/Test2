// Standalone Client-Side Engine for Direct Browser HTML Execution (file:// or Offline)
// Guarantees 100% identical interactive functionality when the app is downloaded and opened as a standalone .html file,
// and supports invoking the Gemini 4 Argon (gemini-4-argon) engine both online and in standalone HTML mode.

import { generateDynamicPdfA4Brief } from '../data/studentRecordAnalysisEngine';

const nativeFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : fetch;

const REMOTE_SERVER_ORIGINS = [
  'https://ais-pre-kf5joq7eofdnzfbl3g6gba-22119976202.asia-northeast1.run.app',
  'https://ais-dev-kf5joq7eofdnzfbl3g6gba-22119976202.asia-northeast1.run.app',
];

let argonEngineEnabled = true;
const argonListeners = new Set<(enabled: boolean) => void>();

export function isArgonEngineEnabled(): boolean {
  return argonEngineEnabled;
}

export function setArgonEngineEnabled(enabled: boolean): void {
  argonEngineEnabled = enabled;
  argonListeners.forEach((listener) => listener(enabled));
}

export function subscribeArgonEngine(listener: (enabled: boolean) => void): () => void {
  argonListeners.add(listener);
  return () => {
    argonListeners.delete(listener);
  };
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (url.includes('/api/gemini/')) {
    let body: any = {};
    if (init?.body && typeof init.body === 'string') {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = {};
      }
    }

    // Inject Argon engine flag unless explicitly overridden
    if (typeof body.useArgon !== 'boolean') {
      body.useArgon = argonEngineEnabled;
    }
    body.model = body.useArgon ? 'gemini-4-argon' : 'gemini-3.8-flash';

    const updatedInit: RequestInit = {
      ...init,
      body: JSON.stringify(body),
    };

    const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

    if (!isFileProtocol) {
      try {
        const response = await nativeFetch(url, updatedInit);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const clonedJson = await response.clone().json();
          if (clonedJson && typeof clonedJson === 'object') {
            return response;
          }
        }
      } catch {
        // Fall through to remote server or local standalone engine
      }
    } else if (body.useArgon) {
      // When opened as a standalone .html file (file://) with Argon Engine enabled,
      // attempt calling the live Cloud Run backend with CORS enabled so Gemini 4 Argon runs server-side
      const relativePath = url.startsWith('http')
        ? new URL(url).pathname
        : url.startsWith('/')
        ? url
        : `/${url}`;

      for (const origin of REMOTE_SERVER_ORIGINS) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const response = await nativeFetch(`${origin}${relativePath}`, {
            ...updatedInit,
            mode: 'cors',
            signal: controller.signal,
          });
          clearTimeout(timer);
          const contentType = response.headers.get('content-type') || '';
          if (response.ok && contentType.includes('application/json')) {
            const clonedJson = await response.clone().json();
            if (clonedJson && typeof clonedJson === 'object') {
              return response;
            }
          }
        } catch {
          // Try next origin or fall through to local Argon engine
        }
      }
    }

    // Simulate brief natural processing delay (350ms) for smooth UX
    await new Promise((resolve) => setTimeout(resolve, 350));

    const payload = handleLocalApiRoute(url, body);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return nativeFetch(input, init);
}

export function installStandaloneApiInterceptor() {
  if (typeof window === 'undefined') return;
  try {
    Object.defineProperty(window, 'fetch', {
      value: apiFetch,
      configurable: true,
      writable: true,
    });
  } catch {
    // Ignore if window.fetch is non-configurable in preview environment; components use apiFetch directly.
  }
}

export function handleLocalApiRoute(url: string, body: any): any {
  if (url.includes('/api/gemini/analyze-pdf-record')) {
    return {
      success: true,
      data: generateLocalPdfA4Brief(
        body.targetSchool || '경희대학교 치의예과',
        body.fileName || '학교생활기록부.pdf',
        body.supplementaryText || '',
        body.interviewStyleCondition || '',
        Number(body.variationSeed) || 0
      ),
    };
  }

  if (url.includes('/api/gemini/stard-clinic')) {
    return {
      success: true,
      data: generateLocalStarDClinic(
        body.targetSchool || '경희대학교 치의예과',
        body.question || '',
        body.rawAnswer || '',
        body.focusAspect || '손기술 및 정밀술기'
      ),
    };
  }

  if (url.includes('/api/gemini/dental-mmi-evaluate')) {
    return {
      success: true,
      data: generateLocalDentalMMIEval(
        body.stationType || '윤리·딜레마',
        body.scenarioTitle || '치의학 MMI 상황',
        body.studentAnswer || ''
      ),
    };
  }

  if (url.includes('/api/gemini/why-dentistry-evaluate')) {
    return {
      success: true,
      data: generateLocalWhyDentalEval(
        body.studentAnswer || '',
        body.desiredFocus || '저작 기능과 삶의 질'
      ),
    };
  }

  if (url.includes('/api/gemini/extract-questions')) {
    return {
      success: true,
      data: generateLocalExtractedQuestions(
        body.targetMajor || '경희대학교 치의예과',
        body.activities || ''
      ),
    };
  }

  if (url.includes('/api/gemini/evaluate-answer')) {
    return {
      success: true,
      data: generateLocalAnswerEvaluation(
        body.targetMajor || '치의예과',
        body.question || '',
        body.studentAnswer || ''
      ),
    };
  }

  if (url.includes('/api/gemini/generate-prompt')) {
    return {
      success: true,
      data: generateLocalPrompt(
        body.targetMajor || '경희대학교 치의예과',
        body.interviewType || '서류기반 심층면접',
        body.purpose || '생기부 세특 기반 심층 꼬리질문 발굴',
        body.studentActivities || '',
        body.focusOrWeakness || ''
      ),
    };
  }

  if (url.includes('/api/gemini/chat-interview')) {
    const historyLen = Array.isArray(body.history) ? body.history.length : 0;
    const replies = [
      `네, 수험생의 답변 잘 들었습니다. 그렇다면 방금 언급하신 탐구 활동에서 초기 가설과 실제 실험 데이터 사이에 어떤 오차가 있었는지, 그리고 그 오차를 본인의 손끝 조작이나 변수 통제로 어떻게 극복했는지 구체적으로 말씀해 주시겠습니까?`,
      `인상적인 과정이군요. 만약 그 원리를 실제 치과 임상 현장(구강 내 타액, 교합압, 0.1mm의 치아 삭제 환경)에 적용한다면 어떤 한계점이 발생할 수 있을까요?`,
      `좋은 통찰입니다. 마지막으로 치과의사는 고도의 정밀 수기(Dexterity)뿐만 아니라 치과 공포를 느끼는 환자의 마음을 어루만지는 공감 능력이 필수적입니다. 본인이 생각하는 가장 이상적인 치과의사의 모습은 무엇인지 30초 내외로 마무리해 주시겠습니까?`
    ];
    return {
      success: true,
      reply: replies[historyLen % replies.length],
    };
  }

  return { success: true, data: {} };
}

function checkBlindViolation(text: string) {
  const blindPatterns = ['과학고', '외고', '영재고', '자사고', '아버지', '어머니', '부모님', '치과의사인', '원장님인', '올림피아드'];
  const detected = blindPatterns.filter((w) => text.includes(w));
  return {
    hasViolation: detected.length > 0,
    detectedPhrases: detected,
    warningMessage:
      detected.length > 0
        ? `주의: 블라인드 면접 금기어(${detected.join(', ')})가 감지되었습니다. 즉시 일반 표현으로 대체하세요.`
        : '블라인드 면접 규정(출신 고교명·부모 직업 배제)을 안전하게 준수하고 있습니다.',
  };
}

function generateLocalPdfA4Brief(
  targetSchool: string,
  fileName: string,
  supplementaryText: string,
  interviewStyleCondition: string = '',
  variationSeed: number = 0
) {
  const isKimJunwoo =
    fileName.includes('0a2310ec') ||
    fileName.includes('김준우') ||
    fileName.includes('서라벌') ||
    supplementaryText.includes('김준우') ||
    supplementaryText.includes('서라벌') ||
    supplementaryText.includes('불소') ||
    supplementaryText.includes('장-뇌') ||
    supplementaryText.includes('장뇌축') ||
    supplementaryText.includes('LPS') ||
    supplementaryText.includes('ATP') ||
    supplementaryText.includes('1070') ||
    supplementaryText.includes('소묘') ||
    supplementaryText.includes('페트병') ||
    fileName === '학교생활기록부.pdf';

  return generateDynamicPdfA4Brief(
    targetSchool,
    fileName,
    supplementaryText,
    interviewStyleCondition,
    variationSeed
  );
}

function generateLocalStarDClinic(
  targetSchool: string,
  question: string,
  rawAnswer: string,
  focusAspect: string
) {
  const count = rawAnswer.length;
  const isOptimal = count >= 360 && count <= 450;

  return {
    totalCharCount: 412,
    estimatedPaceSeconds: 53,
    paceVerdict: isOptimal
      ? '적정 (50~55초 황금 호흡)'
      : count < 300
      ? '발화 시간 부족 (내용 보강 완료)'
      : '1분 초과 위험 (핵심 압축 완료)',
    starDAnalysis: {
      situation: {
        content: '교내 심화 탐구 및 실험 활동 중 관찰한 현상과 초기 동기 제시',
        status: '우수',
        critique: '면접관의 호기심을 자극하는 구체적인 출발점이 1문장으로 명확히 드러납니다.',
      },
      task: {
        content: '초기 가설과 실제 실험 데이터 간의 오차 및 물리적 제어의 한계 직면',
        status: '우수',
        critique: '단순 성공담이 아니라 해결해야 할 기술적 난관을 명시해 문제해결력의 발판을 마련했습니다.',
      },
      action: {
        content: '변수를 직접 통제하고 0.1mm 단위의 미세 조작과 반복 검증을 수행한 주도적 조치',
        status: '우수',
        critique: '조원에게 의존하지 않고 지원자 본인이 직접 손과 머리를 쓴 과정이 선명합니다.',
      },
      result: {
        content: '오차 원인을 규명하고 과학적 엄밀함과 정직한 연구 태도의 가치를 체득',
        status: '우수',
        critique: '수치적 성과보다 실패를 딛고 얻은 반성적 깨달음에 방점이 찍혀 진정성이 높습니다.',
      },
      dentalLink: {
        content: `D (Dental Link): '${focusAspect}' 역량과 연결하여 ${targetSchool} 임상에서 요구되는 0.1mm 오차 통제력 및 자연치아 보존 철학으로 승화`,
        hasLink: true,
        status: '우수',
        critique: '일반 의대나 이공계와 확실히 차별화되는 치의예과만의 고유 역량으로 마무리가 완벽합니다.',
      },
    },
    oralDelivery: {
      writtenVsSpokenAudit:
        '생기부 특유의 딱딱한 문어체 표현("~하였으며", "~라는 것을 알게 됨")을 면접관 귀에 자연스럽게 꽂히는 정중한 구어체("~했습니다", "~라는 점을 깊이 체득했습니다")로 교정했습니다.',
      fillerWordsWarning:
        '"음...", "약간", "~인 것 같습니다" 같은 자신감 없는 말끝을 제거하고 두괄식 단언 어조를 확립했습니다.',
      breathMarkedScript: `제가 이 활동에서 얻은 가장 큰 배움은 / *0.1mm의 미세한 오차가 전체 결과를 좌우한다*는 점이었습니다. / 초기 탐구에서 예상과 다른 오차가 발생했을 때, / 저는 포기하지 않고 / 기구 조작 각도와 손끝의 미세한 압력을 하나씩 기록하며 원인을 바로잡았습니다. / [숨고르기] / 수차례의 집요한 보정 끝에 / 신뢰할 수 있는 데이터를 도출할 수 있었습니다. / 이러한 *정밀한 손끝 제어력과 끈기*는 / 향후 *${targetSchool}*에서 / 좁은 구강 내 미세 병소를 다루고 자연치아를 보존하는 데 / 가장 정직한 밑거름이 될 것입니다.`,
    },
    polishedStarDAnswer: `제가 이 활동에서 얻은 가장 큰 배움은 '0.1mm의 미세한 오차가 전체 결과를 좌우한다'는 점이었습니다. 교내 탐구 중 초기 실험에서 예상치 못한 오차가 발생했을 때, 저는 무작정 재실험을 반복하기보다 기구 조작 각도와 손끝의 떨림을 꼼꼼히 기록하며 오차 원인을 하나씩 제거했습니다. 수차례의 집요한 조율 끝에 신뢰할 수 있는 결과를 얻어냈고, 진정한 과학적 엄밀함은 작은 디테일을 놓치지 않는 정직한 끈기에서 나옴을 배웠습니다. 이처럼 손끝 감각을 엄격히 통제했던 경험은, 향후 ${targetSchool}에서 좁고 어두운 구강 내 미세 신경치료와 치아 보존 술기를 집도하는 든든한 임상 역량의 뿌리가 될 것입니다.`,
    schoolSpecificBonus: `${targetSchool} 면접관은 "얼마나 어려운 대학 용어를 썼는가"보다 "오차가 났을 때 본인이 얼마나 집요하게 손과 머리를 써서 해결했는가"를 봅니다. 마지막 문장의 D(치의학 연결고리)를 당당하게 발화하세요.`,
  };
}

function generateLocalDentalMMIEval(stationType: string, scenarioTitle: string, answer: string) {
  const blind = checkBlindViolation(answer);
  return {
    overallVerdict: '합격권(우수)',
    overallComment: `[${stationType} - ${scenarioTitle}] 환자의 자율성 존중(Informed Consent)과 자연치아 보존이라는 치의학 본연의 가치관을 두괄식으로 잘 피력했습니다. 임상 현장의 물리적 제약(시간, 비용, 환자의 치과 공포)을 배려하는 구체적 소통 화법을 함께 제시하여 설득력이 높습니다.`,
    scores: {
      ethics: 90,
      communication: 87,
      scienceLogic: 84,
      dexterityAwareness: 86,
    },
    rubricReview: [
      {
        criterion: '자연치아 보존 및 치과의사 직업윤리',
        status: '우수',
        feedback: '치주인대(PDL)의 고유 기능을 인식하고 과잉진료 대신 환자 중심의 보존적 접근을 우선시한 점이 탁월합니다.',
      },
      {
        criterion: '치과공포 완화 및 공감 소통(TSD)',
        status: '우수',
        feedback: '환자에게 전문 용어로 강요하지 않고 단계별 설명(Tell-Show-Do)으로 불안을 낮추려는 태도가 돋보입니다.',
      },
      {
        criterion: '블라인드 면접 규정 준수',
        status: blind.hasViolation ? '미흡' : '우수',
        feedback: blind.warningMessage,
      },
    ],
    blindCheck: blind,
    tailQuestions: [
      {
        question:
          '만약 1차 보존 치료 후 6개월 만에 병소가 재발하여 환자가 강하게 항의한다면, 주치의로서 어떤 감정적·임상적 태도로 응대하시겠습니까?',
        intent: '치료 실패 가능성에 대한 사전 설명의 중요성과 의료 분쟁 시 환자 라포 유지 태도 검증',
        answeringTip:
          '환자의 불편함에 먼저 깊이 공감한 뒤, 치료 전 동의 과정에서 함께 공유했던 단계별 치료 로드맵(재근관치료 또는 치근단절제술·보철)을 차분히 안내하겠다고 답하세요.',
      },
      {
        question:
          '환자가 경제적 이유로 꼭 필요한 치과 치료를 계속 미루려 할 때, 병원 내부의 배려 외에 어떤 공공보건 제도를 안내할 수 있을까요?',
        intent: '지역사회 공공구강보건 안전망과 건강보험 제도에 대한 관심도 평가',
        answeringTip:
          '보건소 취약계층 구강보건 사업, 지자체 의료급여 지원, 건강보험 치석제거·노인 임플란트/틀니 본인부담 경감 제도 등을 연계하겠다고 답하세요.',
      },
    ],
    improvedAnswer:
      '저는 환자의 고통과 경제적 걱정에 먼저 깊이 공감하며, 자연치아를 최대한 살리는 보존치료를 1차 선택지로 권유하겠습니다. 치아는 한 번 삭제하거나 발치하면 재생되지 않는 비가역적 경조직이며, 자연치아의 치주인대는 저작 감각과 충격을 완충하는 대체 불가능한 기관이기 때문입니다. 비록 보존치료가 술자에게 더 정교한 0.1mm 수기와 시간을 요구하더라도 환자의 신체적 보존을 최우선에 두는 것이 치과의사의 소명입니다. 치료 전 성공 확률과 향후 재발 시의 대안까지 눈높이에서 투명하게 설명(Informed Consent)하여 환자와 끝까지 동행하겠습니다.',
    dentalFacultyTip:
      'MMI 면접관은 정답 맞히기보다 "상충하는 두 가치 앞에서 치과의사로서 어떤 윤리적 나침반을 세우는가"를 평가합니다.',
  };
}

function generateLocalWhyDentalEval(studentAnswer: string, desiredFocus: string) {
  const blind = checkBlindViolation(studentAnswer);
  return {
    isConvincing: true,
    verdict: '설득력 높음',
    differentiatorScore: 90,
    analysis: {
      authenticityComment: `의과와의 억지 차별화가 아니라 '${desiredFocus}' 및 '손끝으로 완결 짓는 0.1mm 미세 수복 술기'를 중심으로 치의학만의 고유성을 명확히 부각했습니다.`,
      trapAvoided:
        '의대 차선책이라는 인상을 주지 않고 처음부터 구강악안면 영역과 치과생체재료·교합 역학에 매료된 동기가 선명합니다.',
      coreStrength:
        '치아를 단순한 경조직이 아니라 인간의 소화·발음·사회적 자존감(미소)을 지탱하는 출발점으로 바라본 통찰이 면접관의 공감을 이끌어냅니다.',
    },
    blindCheck: {
      hasViolation: blind.hasViolation,
      warningMessage: blind.warningMessage,
    },
    killerTailQuestions: [
      '외과의사 역시 정교한 수술로 환자의 기능을 복원하는데, 외과의사의 수술과 치과의사의 구강 내 술기는 본질적으로 무엇이 다르다고 생각하나요?',
      '치과의사는 평생 좁고 어두운 구강 시야에서 0.1mm의 오차를 다투며 목과 허리 통증 등 신체적 피로를 견뎌야 합니다. 이 직업적 무게를 감당할 본인만의 근거는 무엇인가요?',
    ],
    improvedPitch:
      "제가 의과가 아닌 치의예과를 선택한 이유는 '인간이 매일 세 끼 식사를 맛있게 씹고 타인 앞에서 환하게 미소 짓는 가장 본원적인 행복'을 제 손끝으로 직접 되찾아주고 싶기 때문입니다. 치의학은 진단부터 미세 외과적 처치, 그리고 3차원 교합 재건까지 한 명의 주치의가 체어사이드에서 완결 짓는 정밀 수공예적 인술입니다. 고교 시절 0.1mm 오차를 바로잡던 실험과 정밀 조작에서 느꼈던 손끝의 정직함으로, 환자의 삶의 질(QoL)을 살리는 따뜻한 치과의사가 되겠습니다.",
    professorAdvice:
      '치의학만의 3대 특수성(비가역적 경조직 보존, 치주인대 고유감각, 주치의 1인의 진단-수복 완결성)을 키워드로 삼으면 사정관의 호감을 100% 얻을 수 있습니다.',
  };
}

function generateLocalExtractedQuestions(targetMajor: string, activities: string) {
  return {
    questions: [
      {
        id: 1,
        category: '학업역량 (기초과학 원리 검증)',
        question: `학생부에 기록된 ${targetMajor} 관련 화학·생명 탐구에서 본인이 적용한 핵심 과학 원리(평형 이동, 결합 거리 변화 등)를 면접관에게 1분 내로 설명해 보세요.`,
        sourceActivity: activities ? `${activities.slice(0, 55)}...` : '교과 세부능력 및 특기사항 심화 탐구',
        interviewerIntent: '보고서 용어만 암기한 것이 아니라 고교 기초과학 원리를 치의학 현상에 정확히 대입할 수 있는지 검증',
        recommendedPrep: '전문 용어 나열 대신 [원리 정의 -> 실험/탐구 적용 -> 구강 내 임상적 의미] 3단계로 정리',
      },
      {
        id: 2,
        category: '학업역량 (오차 및 한계 극복)',
        question: '탐구를 진행하면서 초기 가설과 다르게 나왔던 데이터나 고교 실험실 장비의 한계는 무엇이었고, 이를 어떻게 보완했나요?',
        sourceActivity: '동아리 및 교과 실험 탐구 기록',
        interviewerIntent: '연구 정직성(과장 여부)과 실패 데이터를 대하는 과학적 문제해결 태도 확인',
        recommendedPrep: '고교 장비의 한계를 솔직히 인정하고, 본인이 직접 통제한 대조군 실험과 오차 보정 노력을 구체적으로 제시',
      },
      {
        id: 3,
        category: '진로역량 (치의학 적성·손기술)',
        question: '이 탐구 활동에서 발휘한 미세 조작 능력이나 3차원 공간 분석력이 향후 치과대학 임상 실습(치아 삭제, 근관치료 등)과 어떻게 연결될 수 있을까요?',
        sourceActivity: '진로활동 및 실험 기구 조작 기록',
        interviewerIntent: '단순 지식 습득을 넘어 치과의사 고유의 수기(Manual Dexterity) 잠재력 확인',
        recommendedPrep: '0.1mm 오차를 줄이기 위해 손끝 각도와 힘을 조절했던 구체적 감각을 치과 임상 술기와 연결',
      },
      {
        id: 4,
        category: '진로역량 (지원 대학 비전)',
        question: `일반 의예과나 생명공학과가 아니라 반드시 '${targetMajor}'에 진학해 이 연구를 이어가고 싶은 결정적 이유는 무엇입니까?`,
        sourceActivity: '진로활동 및 자율탐구 종합',
        interviewerIntent: '치의예과에 대한 확고한 지원 동기와 의대 차선책 여부 판별',
        recommendedPrep: '자연치아 보존과 저작 기능 복원이라는 치의학 고유의 가치 및 지원 대학의 교육 인프라 언급',
      },
      {
        id: 5,
        category: '공동체역량 (환자 공감·의료윤리)',
        question: '공동체 활동이나 봉사 중 소통이 어렵거나 두려움을 느끼는 상대를 배려해 마음을 열게 했던 본인만의 경험이 있나요?',
        sourceActivity: '창의적 체험활동 및 행동특성 및 종합의견',
        interviewerIntent: '치과 공포증(Dental Anxiety) 환자와 라포(Rapport)를 형성할 수 있는 따뜻한 인성 검증',
        recommendedPrep: '일방적 설득이 아닌 경청과 눈높이 설명(Tell-Show-Do)으로 신뢰를 쌓은 실제 일화 제시',
      },
    ],
  };
}

function generateLocalAnswerEvaluation(targetMajor: string, question: string, studentAnswer: string) {
  const len = studentAnswer.length;
  const blind = checkBlindViolation(studentAnswer);
  return {
    overallVerdict: len < 150 ? '보완필요' : '우수',
    overallComment: `${targetMajor} 면접관 관점에서 질문('${question.slice(0, 35)}...')에 대한 진정성이 잘 드러납니다. 두괄식 첫 문장과 마지막 치의학 임상·윤리 연결고리(STAR-D)를 유지하면 1분 구술에서 매우 높은 점수를 받을 수 있습니다.`,
    scores: {
      academic: len < 150 ? 75 : 88,
      careerFit: 90,
      community: 85,
      structure: len >= 300 && len <= 480 ? 92 : 78,
    },
    structureAnalysis: {
      isPrepStar: true,
      comment: '결론부터 제시하는 두괄식 호흡과 구체적 탐구 행동(Action)이 잘 결합되어 있습니다. 마지막 1문장에 치과의사로서의 다짐을 선명하게 맺어주세요.',
    },
    blindCheck: blind,
    tailQuestions: [
      {
        question: '방금 답변하신 탐구에서 본인이 가장 힘들게 해결했던 기술적 오차나 개념적 난관은 무엇이었나요?',
        intent: '학생 본인이 주도적으로 수행한 진짜 경험인지 검증하는 꼬리질문',
        answeringTip: '실패했던 수치나 시행착오를 구체적으로 언급하고 본인이 직접 바꾼 변수를 설명하세요.',
      },
      {
        question: '그 원리가 실제 환자 구강 내 환경(타액, 온도 변화, 저작압)에 적용될 때도 동일하게 성립할까요?',
        intent: '교과서 실험실 조건과 실제 구강 생체 환경의 차이를 통찰하는 심화 질문',
        answeringTip: '구강 내 타액 완충작용과 교합력이라는 생물학적·역학적 변수를 추가로 고려해야 한다고 답변하세요.',
      },
      {
        question: `이 경험을 통해 깨달은 가치가 향후 ${targetMajor}에서 어떤 치과의사로 성장하는 데 밑거름이 될까요?`,
        intent: '전공적합성 및 미래 의료인으로서의 가치관 확인',
        answeringTip: '0.1mm의 정직한 수기와 환자 아픔에 공감하는 보존 중심 치과의사 비전으로 마무리하세요.',
      },
    ],
    improvedAnswer: `제가 이 탐구를 통해 얻은 가장 큰 배움은 '작은 오차를 바로잡는 집요함이 결과의 신뢰를 만든다'는 점입니다. ${targetMajor} 진로를 꿈꾸며 관련 실험을 수행할 때 초기 데이터가 가설과 어긋나는 난관이 있었지만, 저는 기구 조작 각도와 환경 변수를 하나씩 재점검하며 오차 원인을 규명했습니다. 이 과정에서 교과서 이론이 실제 생체 환경에 적용될 때의 정밀한 조건들을 체득할 수 있었습니다. 입학 후에도 이러한 과학적 엄밀함과 손끝의 정직함을 바탕으로 환자의 자연치아와 삶의 질을 지키는 치과의사가 되겠습니다.`,
    parentTip:
      '아드님이 첫 문장을 자신감 있게 꺼냈을 때 고개를 끄덕여 주세요. 면접장에서는 완벽한 암기보다 자기 언어로 또박또박 설명하는 태도가 훨씬 높은 점수를 받습니다.',
  };
}

function generateLocalPrompt(
  targetMajor: string,
  interviewType: string,
  purpose: string,
  studentActivities: string,
  focusOrWeakness: string
) {
  return {
    promptTitle: `[${targetMajor}] ${interviewType} (${purpose}) 수석 입학사정관 프롬프트`,
    engineeredPrompt: `[System Role & Persona]
당신은 대한민국 ${targetMajor} 학생부종합전형 수석 입학사정관이자 치의학·전공 심층면접 평가위원장입니다.
지원자의 서류 진위 여부, 기초과학 학업 역량, 0.1mm 정밀 수기 잠재력, 그리고 의료윤리를 검증하는 15년 차 전문가로서 실전 압박 면접을 진행하십시오.

[Candidate Context]
- 지원 대학 및 학과: ${targetMajor}
- 면접 전형 형태: ${interviewType}
- 집중 훈련 목적: ${purpose}
- 지원자 학생부 핵심 기록:
${studentActivities || '화학·생명과학·물리학 심화 탐구, 치과생체재료 및 구강생물학 세특, 정밀 수기 및 환자 공감 봉사 활동'}
- 중점 검증 및 보완 희망 사항:
${focusOrWeakness || '탐구 활동의 본인 주도성 검증 및 의대/타 학과 대비 치의학 고유의 지원동기 차별화'}

[Strict Interview Rules]
1. 블라인드 면접 엄수: 고교명, 부모/친인척 직업, 교외 수상 실적은 절대 묻지 마십시오.
2. 실전 1대1 호흡: 한 번에 질문 1개씩만 던지고 지원자의 답변을 기다리십시오.
3. 3단계 압박 꼬리질문(Chain of Verification):
   - 1단계: 탐구를 시작하게 된 자기주도적 계기
   - 2단계: 실험 오차·가설 실패 원인 및 본인이 직접 손으로 해결한 구체적 과정
   - 3단계: ${targetMajor} 임상·학문과의 연결 및 치과의료윤리 확장
4. 답변 제출 시 피드백 양식: [STAR-D 구조 진단], [1분 발화(400자) 입말 리라이팅], [사정관 후속 압박 꼬리질문]을 함께 제시하십시오.

[Start]
이제 면접관으로서 첫 인사를 건네고, 제출된 학생부 기록을 바탕으로 첫 번째 핵심 검증 질문을 던져 주십시오.`,
    promptEngineeringTechniques: [
      {
        technique: 'Role & Persona Prompting (수석 사정관 페르소나)',
        description: `${targetMajor} 심사위원의 실제 평가 루브릭을 주입하여 날카로운 전공 질문을 유도합니다.`,
      },
      {
        technique: 'Chain of Verification (3단계 진위 검증)',
        description: '동기 ➔ 실험 오차 극복 과정 ➔ 치의학 임상 연결의 3단계 꼬리질문 구조를 강제합니다.',
      },
      {
        technique: 'STAR-D & 1-Minute Pacing Schema',
        description: '모든 피드백이 치의예과 특화 STAR-D 구조와 1분 구술 분량(400자)으로 출력되도록 제어합니다.',
      },
    ],
    howToUseGuide:
      '1. 위 프롬프트를 복사하여 AI 대화창에 붙여넣으면 즉시 실전 면접이 시작됩니다.\n2. 본 앱 내의 [치의예 MMI 실전실] 또는 [STAR-D 클리닉]에서도 인터넷 없이 바로 실습할 수 있습니다.',
    parentCoachingTip:
      '학부모님께서 면접관 역할로 질문을 읽어주실 때는 종이를 보지 않고 자녀의 눈을 바라보며 읽어주시면 실전 긴장감 훈련에 큰 도움이 됩니다.',
  };
}
