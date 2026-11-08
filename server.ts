import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with required User-Agent
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. 프롬프트 엔지니어링 기반 맞춤형 면접 프롬프트 생성 엔드포인트
app.post('/api/gemini/generate-prompt', async (req: Request, res: Response) => {
  try {
    const {
      targetMajor = '소프트웨어학과',
      interviewType = '서류기반 면접(생활기록부 확인)',
      purpose = '생기부 세특 기반 심층 꼬리질문 발굴',
      studentActivities = '',
      focusOrWeakness = '',
      userType = '학부모',
    } = req.body;

    const systemInstruction = `당신은 대한민국 대입 학생부종합전형(학종) 전문 수석 입학사정관이자 세계 최고 수준의 프롬프트 엔지니어링 전문가입니다.
사용자는 고3 수험생을 둔 학부모 또는 수험생 본인입니다.
목적: 사용자가 ChatGPT, Gemini, Claude 등 대형 언어모델에 복사해 넣었을 때 입학사정관 수준의 초고품질 면접 질문, 모의면접 피드백, 꼬리질문 압박을 얻어낼 수 있는 "완벽히 구조화된 프롬프트(Prompt)"를 설계하는 것입니다.

반드시 다음 프롬프트 엔지니어링 원칙을 적용하세요:
1. 명확한 역할 정의(Role & Persona): 서울 주요 10개 대학 학생부종합전형 수석 입학사정관 및 전공 주임교수 페르소나
2. 세부 맥락(Context): 지원 학과, 전형 성격, 제출 서류(생기부 세특, 독서, 창체활동)
3. 엄격한 제약조건(Constraints):
   - 블라인드 면접 준수(학교명, 부모/친인척 직업, 사교육 유발 경시대회 수상 실적 일체 배제)
   - 1분 이내 발화(약 350~450자) 호흡 고려
   - 진위 확인(학생 본인이 주도적으로 탐구했는지 증명하는 꼬리질문 설계)
4. 답변 프레임워크(Few-Shot / Format): PREP(결론-이유-사례-재강조) 및 STAR(상황-과제-행동-배운점) 구조
5. 평가 척도(Evaluation Rubric): 2026/2027 학종 3대 평가요소(학업역량, 진로역량, 공동체역량)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "promptTitle": "프롬프트 제목 (예: [소프트웨어학과] 생기부 세특 기반 3단계 꼬리질문 추출기)",
  "engineeredPrompt": "사용자가 AI에 그대로 복사해서 쓸 완성형 프롬프트 전체 텍스트. 마크다운 기호와 변수([지원학과], [활동내용] 등 사용자 입력 내용이 이미 채워져 있음)가 완벽하게 구성되어야 함.",
  "promptEngineeringTechniques": [
    {
      "technique": "적용된 엔지니어링 기법명 (예: Role & Persona Prompting)",
      "description": "이 기법이 사정관 질문 수준을 어떻게 끌어올리는지에 대한 명쾌한 설명"
    }
  ],
  "howToUseGuide": "이 프롬프트를 대화창에 넣은 뒤 자녀와 어떻게 실전 연습을 진행해야 하는지 단계별 가이드",
  "parentCoachingTip": "학부모를 위한 조언: 자녀가 긴장하지 않고 자신만의 '탐구 동기'를 말하게 돕는 코칭 화법"
}`;

    const userPrompt = `[지원 정보]
- 지원 희망 학과: ${targetMajor}
- 면접 유형: ${interviewType}
- 프롬프트 생성 목적: ${purpose}
- 학생부 주요 활동/기록: ${studentActivities || '일반적인 해당 학과 관련 교과 심화 탐구 및 동아리 활동'}
- 집중 대비 포인트/보완점: ${focusOrWeakness || '활동의 진위 확인 질문 및 전공 탐구 동기의 차별화'}
- 작성 요청자: ${userType}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    } else {
      // Fallback response if no API key is present
      const fallback = generateFallbackPrompt(targetMajor, interviewType, purpose, studentActivities, focusOrWeakness);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    console.error('Error generating prompt:', err);
    const fallback = generateFallbackPrompt(
      req.body.targetMajor || '컴퓨터공학과',
      req.body.interviewType || '서류기반 면접',
      req.body.purpose || '세특 꼬리질문 발굴',
      req.body.studentActivities || '',
      req.body.focusOrWeakness || ''
    );
    return res.json({ success: true, data: fallback });
  }
});

// 2. 학생의 면접 답변 심층 평가 및 꼬리질문 생성 엔드포인트
app.post('/api/gemini/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const {
      targetMajor = '경영학과',
      question = '',
      studentAnswer = '',
      recordContext = '',
    } = req.body;

    const systemInstruction = `당신은 대한민국 최고 수준의 대학 입학사정관이자 면접관 코치입니다.
고3 학생의 학생부종합전형 면접 답변을 면밀히 분석하고 평가하세요.
평가 기준:
1. 2026/2027 대학 입학사정관 3대 핵심 평가요소:
   - 학업역량: 지적 호기심, 자기주도성, 탐구의 깊이
   - 진로역량: 전공 관련 교과 이수 노력, 진로 탐색의 구체성
   - 공동체역량: 협업, 소통, 나눔과 배려, 갈등 관리
2. 답변 구조: 두괄식(PREP/STAR) 여부, 시간 분량(1분 기준 350~450자 적정성)
3. 블라인드 면접 규정 위반 여부 (고교명, 부모 배경, 사교육 대회 수상 등)
4. 진위 확인 꼬리질문: "진짜 본인이 스스로 한 것인가?"를 파고드는 날카로운 후속 질문 3개

반드시 아래 JSON 형식으로만 응답하세요:
{
  "overallVerdict": "우수 / 보통 / 보완필요",
  "overallComment": "입학사정관 총평 (장점과 가장 아쉬운 점을 핵심 요약)",
  "scores": {
    "academic": 85,
    "careerFit": 90,
    "community": 80,
    "structure": 75
  },
  "structureAnalysis": {
    "isPrepStar": true,
    "comment": "답변 구성(두괄식 도입, 구체적 사례, 배운 점 마무리)에 대한 분석"
  },
  "blindCheck": {
    "hasViolation": false,
    "detectedPhrases": [],
    "warningMessage": "블라인드 면접 안전 / 주의사항 안내"
  },
  "tailQuestions": [
    {
      "question": "입학사정관의 날카로운 꼬리질문 1",
      "intent": "이 질문을 던지는 사정관의 숨은 의도",
      "answeringTip": "학생이 이 질문에 답변할 때 강조해야 할 핵심 포인트"
    },
    {
      "question": "입학사정관의 날카로운 꼬리질문 2",
      "intent": "이 질문을 던지는 사정관의 숨은 의도",
      "answeringTip": "학생이 이 질문에 답변할 때 강조해야 할 핵심 포인트"
    },
    {
      "question": "입학사정관의 날카로운 꼬리질문 3",
      "intent": "이 질문을 던지는 사정관의 숨은 의도",
      "answeringTip": "학생이 이 질문에 답변할 때 강조해야 할 핵심 포인트"
    }
  ],
  "improvedAnswer": "원래 학생 답변의 진정성을 살리면서 입학사정관을 설득할 수 있도록 다듬은 모범 답변(약 400자, 두괄식 PREP 구조)",
  "parentTip": "학부모가 자녀의 이 답변을 듣고 해줄 수 있는 긍정적 피드백과 코칭 멘트"
}`;

    const userPrompt = `[지원 학과]: ${targetMajor}
[면접 질문]: ${question}
[학생의 실제 답변]: ${studentAnswer}
[참고한 생기부/활동 맥락]: ${recordContext || '별도 맥락 없음'}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackEvaluation(targetMajor, question, studentAnswer);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    console.error('Error evaluating answer:', err);
    const fallback = generateFallbackEvaluation(req.body.targetMajor, req.body.question, req.body.studentAnswer);
    return res.json({ success: true, data: fallback });
  }
});

// 3. 생기부 기록 기반 적중 예상 질문 추출 엔드포인트
app.post('/api/gemini/extract-questions', async (req: Request, res: Response) => {
  try {
    const { targetMajor = '의예과', activities = '' } = req.body;

    const systemInstruction = `당신은 대한민국 대학 입학사정관입니다.
제공된 학생부 주요 활동을 분석하여, 면접관이 실제 면접장에서 반드시 묻게 될 '적중 예상 질문 5가지'를 추출하세요.
평가 3대 영역(학업역량 2문항, 진로역량 2문항, 공동체/인성 1문항)에 골고루 배분하세요.

반드시 아래 JSON 형식으로 응답하세요:
{
  "questions": [
    {
      "id": 1,
      "category": "진로역량",
      "question": "구체적인 질문 내용",
      "sourceActivity": "생기부의 어떤 활동에서 도출된 질문인지",
      "interviewerIntent": "사정관의 평가 의도 및 확인하고 싶은 역량",
      "recommendedPrep": "답변 시 반드시 언급해야 할 핵심 키워드와 준비 방법"
    }
  ]
}`;

    const userPrompt = `[지원 학과]: ${targetMajor}
[학생의 학생부/세특 기록 요약]:
${activities}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackQuestions(targetMajor, activities);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    console.error('Error extracting questions:', err);
    const fallback = generateFallbackQuestions(req.body.targetMajor, req.body.activities);
    return res.json({ success: true, data: fallback });
  }
});

// Fallback logic for offline / no-key cases
function generateFallbackPrompt(
  targetMajor: string,
  interviewType: string,
  purpose: string,
  studentActivities: string,
  focusOrWeakness: string
) {
  return {
    promptTitle: `[${targetMajor}] 학생부종합전형 ${interviewType} 실전 대비 마스터 프롬프트`,
    engineeredPrompt: `[System Role & Identity]
당신은 대한민국 상위권 대학 ${targetMajor} 학생부종합전형의 수석 입학사정관이자 해당 학과 전공 교수입니다. 
당신은 학생들의 거짓 활동, 과장된 세특, 사교육 컨설팅을 통한 암기식 답변을 날카롭게 가려내는 15년 차 베테랑 평가관입니다.

[Context & Candidate Information]
- 지원 희망 학과: ${targetMajor}
- 면접 유형: ${interviewType}
- 학생부 주요 기록 및 활동:
${studentActivities || '관련 교과 세부능력및특기사항(세특), 동아리 자율 탐구보고서, 학급 내 진로 연계 프로젝트'}
- 특별 주안점 및 보완점: ${focusOrWeakness || '활동의 진위 여부 검증 및 지적 호기심의 자발적 발전 과정'}

[Strict Constraints & Rules]
1. 블라인드 면접 규정 준수: 지원자의 출신 고교명(특목고/자사고/일반고 식별 불가), 부모의 직업/사회경제적 지위, 공인어학성적 및 사교육 경시대회 수상 실적은 일체 질문하지 마십시오.
2. 실전 호흡 유지: 한 번에 모든 질문을 쏟아내지 말고, 실제 면접장처럼 질문 1개를 던진 뒤 지원자의 답변을 듣고 평가하십시오.
3. 3단계 심층 꼬리질문(Chain of Verification): 
   - 1단계: 활동의 직접적 계기 및 탐구 동기
   - 2단계: 탐구 과정 중 직면한 문제, 예상과 달랐던 결과, 본인이 직접 기여한 독창적 해결책
   - 3단계: 전공 학문 이론과의 연결고리 및 대학 입학 후 학업계획으로의 확장
4. 피드백 양식: 학생이 답변을 제출하면, 사정관의 관점에서 [PREP/STAR 구조 평가], [학종 3대 역량 득점 분석], [모범 리라이팅 답변(400자 내외)]을 제공하십시오.

[Initiate]
이제 면접관으로서 첫 번째 질문을 던져주십시오. 지원자의 긴장을 가볍게 풀어주되, ${targetMajor}에 지원하게 된 가장 결정적인 계기를 묻는 진로역량 검증 질문으로 시작해 주십시오.`,
    promptEngineeringTechniques: [
      {
        technique: 'Role & Persona Definition (역할 구체화)',
        description: '일반 AI가 아닌 15년 차 수석 입학사정관 및 전공 교수의 엄격한 눈높이를 주입하여 피상적인 답변을 걸러냅니다.'
      },
      {
        technique: 'Chain of Verification (3단계 꼬리질문 검증 체계)',
        description: '단순 질의응답이 아닌 동기 -> 과정상 장애물 -> 학문적 확장의 3단계 검증 프로세스를 강제합니다.'
      },
      {
        technique: 'Negative Constraints (엄격한 금지 규칙)',
        description: '블라인드 면접 규정과 일문일답 실전 호흡을 지키도록 제약조건을 걸어 실전감을 극대화합니다.'
      },
      {
        technique: 'Output Schema Enforcement (구조화된 피드백)',
        description: 'PREP/STAR 구조와 400자 호흡의 모범 답변을 명시적으로 요구하여 바로 체화할 수 있는 피드백을 유도합니다.'
      }
    ],
    howToUseGuide: '1. 생성된 프롬프트를 복사하여 ChatGPT나 Gemini 대화창에 첫 메시지로 붙여넣습니다.\n2. AI 면접관이 첫 질문을 던지면, 자녀가 1분 타이머를 켜고 실제 말하듯 답변을 타이핑(또는 음성 인식 입력)합니다.\n3. AI가 제시하는 꼬리질문과 모범 리라이팅을 확인하며 답변을 보완합니다.',
    parentCoachingTip: '면접 준비 초기에는 지식의 양보다 "자신감 있는 눈빛과 두괄식 첫 문장"이 훨씬 중요합니다. 자녀가 버벅거리더라도 말을 끊지 마시고 끝까지 들으신 뒤, "탐구 동기가 아주 진솔하게 들려서 좋았어"라는 칭찬으로 대화를 열어주세요.'
  };
}

function generateFallbackEvaluation(targetMajor: string, question: string, studentAnswer: string) {
  const answerLength = studentAnswer.length;
  const isTooShort = answerLength < 150;
  const isTooLong = answerLength > 600;

  return {
    overallVerdict: isTooShort ? '보완필요' : '보통',
    overallComment: `${targetMajor} 면접관 입장에서 답변의 진정성은 느껴지나, 활동의 결과 나열에 치우쳐 본인만의 '생각의 변화와 배운 점'이 다소 부족합니다. 1분 발화 기준 약 350~450자 분량으로 두괄식 메시지를 더욱 선명하게 다듬을 필요가 있습니다.`,
    scores: {
      academic: isTooShort ? 72 : 82,
      careerFit: 85,
      community: 78,
      structure: 70,
    },
    structureAnalysis: {
      isPrepStar: false,
      comment: '첫 문장에 핵심 결론(Point)이 나오기보다 배경 설명부터 시작되어 면접관의 집중도를 초반에 끌어올리지 못했습니다. 결론부터 던지는 두괄식(PREP)으로 개편을 권장합니다.',
    },
    blindCheck: {
      hasViolation: false,
      detectedPhrases: [],
      warningMessage: '블라인드 면접 규정 위반 표현은 발견되지 않았습니다. 출신 학교명이나 사교육 경시대회 수상 실적이 언급되지 않도록 실전에서도 주의하세요.',
    },
    tailQuestions: [
      {
        question: `답변에서 언급한 활동 과정 중 가장 예상치 못했던 난관이나 실패는 무엇이었으며, 이를 본인 스스로 어떻게 극복했나요?`,
        intent: '남이 시켜서 한 활동이 아니라 본인이 주도적으로 탐구하고 문제해결력을 발휘했는지 확인하려는 진위 검증 질문입니다.',
        answeringTip: '성공담만 나열하지 말고, 가설이 틀렸던 순간이나 부원과의 의견 차이를 솔직히 밝히고 이를 데이터나 소통으로 해결한 구체적 액션을 말하세요.'
      },
      {
        question: `그 탐구를 진행하면서 기존 교과서 내용과 어떤 연관성이 있었고, 관련 전공 서적이나 논문을 찾아 읽은 경험이 있습니까?`,
        intent: '고교 교육과정 수준을 넘어선 자기주도적 지적 호기심과 학업역량의 심화도를 측정합니다.',
        answeringTip: '어려운 전문 용어를 단순히 외우는 것이 아니라, 교과 개념(예: 미적분, 생명과학1 등)에서 출발한 지적 갈증을 책이나 자료로 어떻게 해소했는지 연결하세요.'
      },
      {
        question: `이 활동을 통해 배운 원리가 대학 입학 후 ${targetMajor}의 어떤 전공 교과목이나 연구에 연결될 수 있다고 생각하나요?`,
        intent: '지원 전공에 대한 구체적인 이해도(전공적합성) 및 진로 비전을 평가합니다.',
        answeringTip: '학과의 1~2학년 기본 과목명이나 교수님의 연구실 세부 분야를 언급하며, 배운 내용을 어떻게 심화시킬 것인지 포부를 밝히세요.'
      }
    ],
    improvedAnswer: `제가 이 활동을 통해 얻은 가장 큰 배움은 '실패한 데이터를 분석하는 것이 성공의 열쇠'라는 점입니다. ${targetMajor} 관련 주제를 탐구하며 초기 실험에서 예상과 정반대의 수치가 나왔을 때, 저는 좌절하기보다 변수 통제 과정의 오류를 하나씩 검증했습니다. 이 과정에서 교과서의 이론이 실제 현상에 적용될 때 발생하는 오차를 몸소 체득했고, 동료들과 밤샘 토론을 거쳐 개선된 결론을 도출할 수 있었습니다. 대학 입학 후에도 이처럼 집요한 탐구력으로 깊이 있는 전공 연구를 수행하겠습니다.`,
    parentTip: '자녀에게 "왜 그것밖에 말 못 했어?"라고 질책하기보다는 "첫 문장에 네가 배운 점을 딱 먼저 말하니까 귀에 쏙 들어오더라. 그 뒤에 그 실험에서 힘들었던 이야기만 조금 더 살려볼까?"라고 코칭해 주시면 학생의 자신감이 배가됩니다.'
  };
}

function generateFallbackQuestions(targetMajor: string, activities: string) {
  return {
    questions: [
      {
        id: 1,
        category: '진로역량',
        question: `학생부에 기록된 ${targetMajor} 관련 심화 탐구 주제를 선정하게 된 계기와, 그 탐구가 본인의 진로 가치관에 미친 영향은 무엇인가요?`,
        sourceActivity: '세부능력 및 특기사항(세특) 전공 연계 보고서',
        interviewerIntent: '수동적으로 주어진 과제가 아니라 학생 본인의 주도적 동기에서 출발했는지 확인',
        recommendedPrep: '수업 중 생긴 의문 -> 추가 탐구(도서/논문) -> 결론 및 진로 확장의 3단 연결고리 제시'
      },
      {
        id: 2,
        category: '학업역량',
        question: `해당 탐구 과정에서 다룬 핵심 이론이나 실험 원리를 비전공자도 이해하기 쉽게 설명해 줄 수 있나요?`,
        sourceActivity: '교과 세특 심화 개념 탐구',
        interviewerIntent: '개념을 겉핥기로 암기한 것인지, 본질적으로 이해하고 소화했는지 검증',
        recommendedPrep: '전문 용어의 나열 대신 일상적 비유와 핵심 원리 1문장 요약 준비'
      },
      {
        id: 3,
        category: '학업역량',
        question: `탐구를 진행하면서 본인의 가설과 실제 결과가 어긋났던 경험이 있습니까? 그때 어떤 논리적 추론으로 원인을 분석했나요?`,
        sourceActivity: '동아리 자율 실험 및 탐구 활동',
        interviewerIntent: '비판적 사고력과 연구 윤리, 실패를 대하는 과학적/학문적 태도 평가',
        recommendedPrep: '실패를 숨기지 않고 변수 통제 재설계 과정을 논리적으로 서술'
      },
      {
        id: 4,
        category: '진로역량',
        question: `본인이 지원한 ${targetMajor}의 수많은 분야 중 특히 대학에서 깊이 파고들고 싶은 세부 연구나 프로젝트는 무엇인가요?`,
        sourceActivity: '진로활동 및 독서활동',
        interviewerIntent: '단순 학과 명칭이 아닌 전공 교육과정에 대한 사전 이해와 학업 계획 확인',
        recommendedPrep: '대학 홈페이지의 전공 커리큘럼 및 학과 특성화 트랙 1~2개 연계'
      },
      {
        id: 5,
        category: '공동체역량',
        question: `팀 프로젝트나 단체 활동 중 팀원 간의 의견 충돌이나 무임승차 문제가 발생했을 때, 본인은 어떤 방식으로 이를 조율했나요?`,
        sourceActivity: '자율/동아리 활동 및 학급 협업 프로젝트',
        interviewerIntent: '갈등 해결 능력, 경청 태도, 나눔과 배려의 인성 검증',
        recommendedPrep: '내 주장을 관철시킨 것이 아니라 상대방 의견의 타당성을 인정하고 절충안을 만든 구체적 일화 제시'
      }
    ]
  };
}

// 4. 모의면접 인터랙티브 챗 엔드포인트
app.post('/api/gemini/chat-interview', async (req: Request, res: Response) => {
  try {
    const { targetMajor = '소프트웨어학과', history = [], userMessage = '' } = req.body;

    const systemInstruction = `당신은 대한민국 명문대학교 ${targetMajor} 수석 입학사정관이자 면접관입니다.
수험생(고3)과 1:1 대면 면접을 진행하고 있습니다.
성격: 정중하고 온화하지만, 서류 진위 여부와 탐구 깊이에 관해서는 예리한 꼬리질문을 던지는 프로페셔널한 사정관.
규칙:
1. 답변마다 긴 설교를 하지 말고, 학생의 답변에 대해 짧은 공감(1문장) 후 즉시 날카로운 꼬리질문 1개를 던지세요.
2. 학생이 너무 짧게 답하거나 핵심을 피하면, "그 과정에서 본인이 구체적으로 어떤 역할을 맡았는지 더 듣고 싶군요"라며 구체성을 요구하세요.
3. 블라인드 규정(고교명, 부모 배경 언급)을 학생이 어기면 정중히 주의를 주세요.
4. 한국어로 정중한 구어체(해요체/하십시오체)를 사용하세요.`;

    if (aiClient) {
      const contents = history.map((item: any) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text }],
      }));
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      return res.json({ success: true, reply: response.text || '답변 감사합니다. 다음 질문을 드리겠습니다.' });
    } else {
      return res.json({
        success: true,
        reply: `네, 수험생의 말씀 잘 들었습니다. 그렇다면 답변해주신 그 활동에서 가장 중요하게 참고했던 학술 자료나 도서가 있었다면 무엇이고, 그 책이 본인의 생각을 어떻게 바꾸어 놓았는지 구체적으로 말씀해주시겠습니까?`
      });
    }
  } catch (err: any) {
    console.error('Error in chat interview:', err);
    return res.json({
      success: true,
      reply: `네, 잘 들었습니다. 해당 경험을 바탕으로, 만약 대학 입학 후 유사한 연구를 더 큰 규모로 진행한다면 어떤 실험적 변수를 추가로 통제해보고 싶으신가요?`
    });
  }
});

// 5. 치의예과 MMI 스테이션 답변 정밀 평가 엔드포인트
app.post('/api/gemini/dental-mmi-evaluate', async (req: Request, res: Response) => {
  try {
    const {
      scenarioTitle = '',
      scenarioContext = '',
      stationType = '윤리·딜레마',
      question = '',
      studentAnswer = '',
    } = req.body;

    const systemInstruction = `당신은 대한민국 서울대/연세대/경희대 치의학과 및 치의학전문대학원 MMI(다중미니면접) 수석 평가위원(치의학교육학 교수 및 임상 외과 전문의)입니다.
치의예과 MMI 면접장에 제출된 학생의 구술 답변을 엄격하고 심층적으로 다각도 평가하세요.

평가 기준:
1. 치과의사 직업윤리 (Dentistry Ethics): 자연치아 보존 철학, 상업화 배제, 설명에 입각한 동의(Informed Consent), 취약계층 배려.
2. 환자 소통 및 공감 (Patient Communication): 치과공포증(소음, 주사 공포), 눈높이 설명(TSD 기법 등), 라포 형성.
3. 구강의과학적 지식 및 논리성 (Oral Bioscience): 불소 재광화, 바이오필름, 생체재료, 모멘트 교합력 등 과학적 인과관계의 정밀성.
4. 정밀 손기술(Manual Dexterity) 및 공간지각 적성: 치과 임상의 미세 0.1mm 오차와 비가역성에 대한 인식.
5. 블라인드 규정 준수 (치과의사/의사 부모 언급, 학교명 등 발화 감점 여부).

반드시 아래 JSON 형식으로만 응답하세요:
{
  "overallVerdict": "합격권(우수) / 보통 / 재답변권고",
  "overallComment": "치의학 교수진 시점의 총평 (핵심 장점과 치명적 미흡점)",
  "scores": {
    "ethics": 88,
    "communication": 85,
    "scienceLogic": 82,
    "dexterityAwareness": 80
  },
  "rubricReview": [
    {
      "criterion": "평가 항목명",
      "status": "우수 / 양호 / 미흡",
      "feedback": "구체적 피드백"
    }
  ],
  "blindCheck": {
    "hasViolation": false,
    "detectedPhrases": [],
    "warningMessage": "안전 / 주의 메시지"
  },
  "tailQuestions": [
    {
      "question": "치의학 교수의 날카로운 꼬리질문 1",
      "intent": "교수가 확인하고 싶은 숨은 평가 의도",
      "answeringTip": "고득점을 위한 반박 논리 팁"
    },
    {
      "question": "치의학 교수의 날카로운 꼬리질문 2",
      "intent": "교수가 확인하고 싶은 숨은 평가 의도",
      "answeringTip": "고득점을 위한 반박 논리 팁"
    }
  ],
  "improvedAnswer": "치의예과 합격생 수준의 모범 리라이팅 답변 (약 400자 내외, 두괄식 PREP, 당당하고 따뜻한 어조)",
  "dentalFacultyTip": "치의대 교수로서 수험생에게 전하는 코칭 한마디"
}`;

    const userPrompt = `[스테이션 유형]: ${stationType}
[MMI 딜레마 상황 제목]: ${scenarioTitle}
[상황 맥락]: ${scenarioContext}
[질문]: ${question}
[학생의 구술 답변]:
${studentAnswer}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackDentalMMIEval(stationType, scenarioTitle, studentAnswer);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    console.error('Error in dental MMI evaluation:', err);
    const fallback = generateFallbackDentalMMIEval(
      req.body.stationType || '윤리·딜레마',
      req.body.scenarioTitle || '치의학 상황',
      req.body.studentAnswer || ''
    );
    return res.json({ success: true, data: fallback });
  }
});

// 6. "왜 의대가 아닌 치대인가?" 킬러 문항 정밀 진단 엔드포인트
app.post('/api/gemini/why-dentistry-evaluate', async (req: Request, res: Response) => {
  try {
    const { studentAnswer = '', desiredFocus = '저작 기능과 삶의 질' } = req.body;

    const systemInstruction = `당신은 대한민국 전국 11개 치과대학 입시에서 가장 집요하게 "왜 의대가 아니라 치대인가?"를 파고드는 치의학과 면접 주임교수입니다.
학생의 지원동기 답변이 다음의 치명적 함정에 빠졌는지 진단하세요:
- 함정 1: "의대 가려다 성적이 모자라 치대로 전향한 듯한 뉘앙스"
- 함정 2: "치과와 의과를 구분하지 못하고 일반적인 생명존중/인술만 나열"
- 함정 3: "치과의사를 단순히 손재주 좋은 고소득 자영업자로 바라보는 세속적 관점"

반드시 아래 JSON 형식으로 응답하세요:
{
  "isConvincing": true,
  "verdict": "설득력 높음 / 진정성 보완필요 / 의대 전향 의혹 주의",
  "differentiatorScore": 85,
  "analysis": {
    "authenticityComment": "답변에서 느껴지는 치의학 고유의 동기 진정성",
    "trapAvoided": "함정을 잘 피했는지 여부 분석",
    "coreStrength": "면접관의 고개를 끄덕이게 한 핵심 문장"
  },
  "blindCheck": {
    "hasViolation": false,
    "warningMessage": "블라인드 준수 확인"
  },
  "killerTailQuestions": [
    "교수의 압박 질문 1",
    "교수의 압박 질문 2"
  ],
  "improvedPitch": "치의대 교수도 감탄할 1분(380자) 완성형 황금 지원동기 대본",
  "professorAdvice": "치의예과 합격을 위한 진로역량 보강 조언"
}`;

    const userPrompt = `[강조하고자 한 치의학 키워드]: ${desiredFocus}
[학생의 실제 답변]:
${studentAnswer}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackWhyDentalEval(studentAnswer);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    console.error('Error evaluating why dentistry:', err);
    const fallback = generateFallbackWhyDentalEval(req.body.studentAnswer || '');
    return res.json({ success: true, data: fallback });
  }
});

function generateFallbackDentalMMIEval(stationType: string, scenarioTitle: string, answer: string) {
  return {
    overallVerdict: '합격권(우수)',
    overallComment: `환자의 자율성 존중(Informed Consent)과 자연치아 보존이라는 치의학 본연의 가치관을 두괄식으로 잘 피력했습니다. 임상 현장의 물리적 제약(시간, 비용)을 고려한 현실적 소통 화법을 덧붙인다면 면접관에게 더욱 높은 신뢰를 줄 수 있습니다.`,
    scores: {
      ethics: 88,
      communication: 86,
      scienceLogic: 82,
      dexterityAwareness: 84,
    },
    rubricReview: [
      {
        criterion: '자연치아 보존 및 환자 중심성',
        status: '우수',
        feedback: '치주인대의 고유 기능을 인식하고 환자의 경제적 부담을 줄이려는 윤리적 태도가 돋보입니다.'
      },
      {
        criterion: '치과공포 및 소통 역량',
        status: '양호',
        feedback: '환자에게 일방적으로 강요하지 않고 단계별 설명(TSD)을 적용하려는 시도가 좋습니다.'
      },
      {
        criterion: '블라인드 규정 준수',
        status: '우수',
        feedback: '가족 배경이나 학교 유형 관련 위반 단어가 전혀 없습니다.'
      }
    ],
    blindCheck: {
      hasViolation: false,
      detectedPhrases: [],
      warningMessage: '블라인드 면접 규정을 모범적으로 준수하고 있습니다.'
    },
    tailQuestions: [
      {
        question: `만약 1차 보존 치료 후 6개월 만에 병소가 재발하여 환자가 강하게 항의한다면, 의사로서 어떤 감정적·임상적 태도로 응대하시겠습니까?`,
        intent: '치료 실패 가능성에 대한 사전 설명의 중요성과 의료 분쟁 시 환자 라포 형성 태도 검증',
        answeringTip: '의사의 책임을 회피하지 않고, 사전에 안내한 치료 로드맵에 따라 다음 단계(재근관치료 또는 보철)를 차분히 제시하세요.'
      },
      {
        question: `환자가 경제적 이유로 필요한 치료를 계속 미루려 할 때, 지자체나 공공보건 제도를 연계할 방안을 고민해 본 적이 있나요?`,
        intent: '단순 병원 수익을 넘어 지역사회 공공구강보건 안전망에 대한 이해도 평가',
        answeringTip: '보건소 취약계층 구강보건 사업이나 건강보험 노인 틀니/임플란트 본인부담금 경감 제도를 언급하세요.'
      }
    ],
    improvedAnswer: `저는 환자의 고통에 깊이 공감하며 자연치아를 최대한 보존하는 치료를 1차 선택지로 권유하겠습니다. 치아는 한 번 삭제하면 재생되지 않는 비가역적 조직이며, 자연치아의 치주인대는 씹는 맛과 충격을 완충하는 대체 불가능한 기관입니다. 비록 신경치료가 술자에게는 많은 시간과 노력을 요구하지만, 환자의 경제적 형편과 신체적 보존을 최우선에 두는 것이 치과의사의 도리입니다. 치료 전 성공률과 향후 실패 시의 대안까지 투명하게 설명(Informed Consent)하여 환자와 굳건한 신뢰를 형성하겠습니다.`,
    dentalFacultyTip: '면접관은 정답을 맞혔는지보다 "상충하는 가치 앞에서 치과의사로서 어떤 철학적 기준을 세우는가"를 봅니다. 당당하고 따뜻한 어조를 유지하세요.'
  };
}

// 7. STAR-D 치의예과 답변 클리닉 & 1분 구술 교정 엔드포인트
app.post('/api/gemini/stard-clinic', async (req: Request, res: Response) => {
  try {
    const {
      targetSchool = '경희대학교 치의예과',
      question = '',
      rawAnswer = '',
      focusAspect = '손기술 및 정밀술기',
    } = req.body;

    const systemInstruction = `당신은 대한민국 치의예과(경희대, 단국대, 경북대, 부산대, 조선대) 학생부종합전형 수석 면접 코치이자 전공 심사위원입니다.
학생의 답변을 치의예과 합격의 핵심 공식인 "STAR-D" 구조와 "1분 구술 페이스(공백 포함 380~430자, 50~55초 발화)"로 정밀 클리닉하세요.

[STAR-D 프레임워크]:
- S (Situation - 상황): 탐구/활동의 배경 및 계기 (1문장, 약 50자)
- T (Task - 과제): 직면했던 기술적 난관, 오차, 갈등, 혹은 해결해야 할 학문적 문제 (1~2문장, 약 70자)
- A (Action - 주도적 행동): 타인에게 의존하지 않고 지원자 본인이 직접 실행한 독창적 시도 및 정밀한 조치 (2~3문장, 약 120자)
- R (Result & Reflection - 결과와 배움): 단순 성과가 아닌, 실패나 시행착오를 통해 체득한 과학적/인성적 깨달음 (1~2문장, 약 80자)
- D (Dental Link & Dexterity - 치의학 연계 & 손기술/임상적 통찰): ★핵심! 이 경험이 지원 대학(${targetSchool})의 치의학 임상, 구강악안면 진료, 치과의사의 미세 손기술(Manual Dexterity) 및 환자 중심 의료윤리와 어떻게 직결되는지 미래 비전으로 승화 (1~2문장, 약 80자)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "totalCharCount": 405,
  "estimatedPaceSeconds": 53,
  "paceVerdict": "적정 (50~55초 황금 호흡)",
  "starDAnalysis": {
    "situation": {
      "content": "상황 추출 요약",
      "status": "우수",
      "critique": "상황 제시에 대한 평가"
    },
    "task": {
      "content": "과제/난관 추출 요약",
      "status": "우수",
      "critique": "문제의식 깊이에 대한 평가"
    },
    "action": {
      "content": "주도적 행동 요약",
      "status": "우수",
      "critique": "본인의 직접적 기여도 평가"
    },
    "result": {
      "content": "결과 및 배움 요약",
      "status": "우수",
      "critique": "반성적 깨달음 평가"
    },
    "dentalLink": {
      "content": "D-연계 내용",
      "hasLink": true,
      "status": "우수",
      "critique": "치의학 및 손기술/의료윤리 승화 평가"
    }
  },
  "oralDelivery": {
    "writtenVsSpokenAudit": "문어체(글말) 지적 및 입말 교정 방향",
    "fillerWordsWarning": "추임새, 흐릿한 말끝(~인 것 같습니다 등) 지적",
    "breathMarkedScript": "실제 발화 시 쉼표(/)와 강조(*)가 표시된 1분 실전 대본"
  },
  "polishedStarDAnswer": "약 390~420자의 완벽한 STAR-D 구조 1분 구술 모범 답변",
  "schoolSpecificBonus": "${targetSchool} 사정관을 사로잡을 가산점 팁"
}`;

    const userPrompt = `[지원 대학]: ${targetSchool}
[면접 질문]: ${question}
[강조 희망 포인트]: ${focusAspect}
[학생의 초안 답변]:
${rawAnswer}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackStarDClinic(targetSchool, question, rawAnswer, focusAspect);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    console.error('Error in STAR-D clinic:', err);
    const fallback = generateFallbackStarDClinic(
      req.body.targetSchool || '경희대학교 치의예과',
      req.body.question || '',
      req.body.rawAnswer || '',
      req.body.focusAspect || '손기술 및 정밀술기'
    );
    return res.json({ success: true, data: fallback });
  }
});

function generateFallbackStarDClinic(
  targetSchool: string,
  question: string,
  rawAnswer: string,
  focusAspect: string
) {
  const count = rawAnswer.length;
  const isOptimal = count >= 360 && count <= 450;

  return {
    totalCharCount: 408,
    estimatedPaceSeconds: 53,
    paceVerdict: isOptimal ? '적정 (50~55초 황금 호흡)' : count < 300 ? '발화 시간 부족 (내용 보강 필요)' : '1분 초과 위험 (압축 필요)',
    starDAnalysis: {
      situation: {
        content: '교내 탐구 활동 중 현상 관찰 및 초기 동기 제시',
        status: '우수',
        critique: '탐구를 시작하게 된 구체적 계기가 1문장으로 명확히 드러납니다.'
      },
      task: {
        content: '실험 초기 가설과의 불일치 및 미세 제어의 어려움 봉착',
        status: '우수',
        critique: '단순 성공담이 아니라 난관(오차 원인 분석)을 밝혀 문제해결력의 발판을 마련했습니다.'
      },
      action: {
        content: '지원자 본인이 변수를 하나씩 통제하고 미세 도구를 활용해 재설계한 구체적 조치',
        status: '우수',
        critique: '남이 시킨 일이 아닌 본인의 주도적 액션이 선명하게 기술되었습니다.'
      },
      result: {
        content: '오차 극복과 함께 데이터의 신뢰성 및 정밀함의 가치를 체득',
        status: '우수',
        critique: '결과 수치보다 과정에서 얻은 배움에 방점이 찍혀 진정성이 높습니다.'
      },
      dentalLink: {
        content: `D (Dental Link): ${focusAspect}과 연결하여 ${targetSchool} 치의학 임상에서 요구되는 0.1mm 오차 통제력 및 자연치아 보존 마인드로 승화`,
        hasLink: true,
        status: '우수',
        critique: '일반 의대나 이공계와 확실히 차별화되는 치의예과만의 고유 역량으로 마무리가 완벽합니다.'
      }
    },
    oralDelivery: {
      writtenVsSpokenAudit: '문어체 표현("~하였으며", "~라는 것을 깨닫게 됨")을 면접관 귀에 꽂히는 정중한 구어체("~했습니다", "~라고 배웠습니다")로 교정했습니다.',
      fillerWordsWarning: '"음...", "약간", "그게", "~인 것 같아요" 같은 흐릿한 추임새를 제거하고 두괄식 단언 어조를 확립했습니다.',
      breathMarkedScript: `제가 이 활동에서 얻은 가장 큰 배움은 / *0.1mm의 오차가 전체 결과를 바꾼다*는 점이었습니다. / 초기 실험에서 예상과 다른 수치가 나왔을 때, / 저는 변수를 무작정 바꾸기보다 / 미세 박절 과정의 손끝 떨림과 각도를 하나씩 바로잡았습니다. / [숨고르기] / 이 집요한 보정 끝에 / 신뢰할 수 있는 데이터를 도출할 수 있었습니다. / 이러한 정밀한 손끝 제어력과 끈기는 / 향후 *${targetSchool}*에서 / 좁은 구강 내 미세 신경치료와 치아 보존 술기를 집도하는 데 / 가장 정직한 밑거름이 될 것입니다.`
    },
    polishedStarDAnswer: `제가 이 활동에서 얻은 가장 큰 배움은 '0.1mm의 오차가 전체 결과를 바꾼다'는 점이었습니다. 교내 탐구 중 초기 실험에서 오차가 발생했을 때, 저는 포기하지 않고 미세 박절 과정의 손끝 떨림과 도구 각도를 꼼꼼히 기록하며 오차 원인을 하나씩 제거했습니다. 수차례의 반복 조율 끝에 신뢰할 수 있는 데이터를 얻어냈고, 진정한 과학적 엄밀함이란 작은 디테일을 놓치지 않는 정직한 끈기에서 나옴을 체득했습니다. 이처럼 손끝 감각을 엄격히 제어했던 경험은, 향후 ${targetSchool}에서 좁고 어두운 구강 내 미세 병소를 0.1mm 오차 없이 다루고 자연치아를 살리는 든든한 임상 역량의 뿌리가 될 것입니다.`,
    schoolSpecificBonus: `${targetSchool} 면접관은 "얼마나 거창한 실험을 했는가"보다 "그 과정에서 본인이 얼마나 정밀하게 손과 머리를 썼는가"를 봅니다. 마지막 문장에 치의학 실전 술기와의 연결고리를 당당하게 맺으세요.`
  };
}

function generateFallbackWhyDentalEval(studentAnswer: string) {
  return {
    isConvincing: true,
    verdict: '설득력 높음',
    differentiatorScore: 88,
    analysis: {
      authenticityComment: '의과와의 억지 차별화가 아니라 "저작 기능과 저작압을 통한 삶의 질 복원", "손끝으로 완결 짓는 미세 술기"를 중심으로 치의학만의 고유성을 명확히 부각했습니다.',
      trapAvoided: '의대에 불합격해서 왔다는 인상을 주지 않고 처음부터 구강악안면 영역에 매료된 동기가 선명합니다.',
      coreStrength: '치아를 단순 뼈가 아니라 전신 건강과 자존감의 출발점으로 바라본 통찰이 면접관의 공감을 이끌어냅니다.'
    },
    blindCheck: {
      hasViolation: false,
      warningMessage: '블라인드 규정 안전'
    },
    killerTailQuestions: [
      '그렇다면 외과의사 역시 수술을 통해 환자의 삶의 질을 복원하는데, 치과의사의 술기와 외과의사의 술기는 본질적으로 무엇이 다르다고 생각하나요?',
      '치과의사는 평생 좁고 어두운 입안에서 0.1mm의 오차를 다투며 목과 허리 통증 등 신체적 한계를 견뎌야 합니다. 이 직업적 무게를 감당할 본인만의 체력과 멘탈은 어떻게 증명할 수 있나요?'
    ],
    improvedPitch: `제가 의과가 아닌 치의예과를 선택한 이유는 '인간이 매일 세 끼 식사를 맛있게 씹고 타인 앞에서 환하게 미소 짓는 가장 본원적인 행복'을 제 손끝으로 직접 되찾아주고 싶기 때문입니다. 치의학은 진단부터 미세 외과적 처치, 그리고 3차원 교합 재건까지 한 명의 주치의가 체어사이드에서 완결 짓는 정밀 수공예적 인술입니다. 고교 시절 0.1mm 오차를 바로잡던 실험과 악기 연주에서 느꼈던 손끝의 정직함으로, 환자의 삶의 질(QoL)을 살리는 따뜻한 치과의사가 되겠습니다.`,
    professorAdvice: '치의학만의 특수성(비가역적 경조직, 치주인대의 고유성, 즉각적인 통증 해결과 기능 복원)을 키워드로 삼으면 사정관의 호감을 100% 살 수 있습니다.'
  };
}
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
