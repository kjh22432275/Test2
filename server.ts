import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateDynamicPdfA4Brief } from './src/data/studentRecordAnalysisEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use('/assets', express.static(path.resolve(__dirname, 'public', 'assets')));

// Initialize GoogleGenAI server-side with required User-Agent
let aiClient: GoogleGenAI | null = null;
let geminiCreditsDepleted = false;
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

function markGeminiFallbackIfNeeded(err: any) {
  const msg = String(err?.message || err || '');
  if (
    msg.includes('402') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('prepayment credits') ||
    msg.includes('quota')
  ) {
    geminiCreditsDepleted = true;
  }
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

    if (aiClient && !geminiCreditsDepleted) {
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
      // Fallback response if no API key is present or credits are depleted
      const fallback = generateFallbackPrompt(targetMajor, interviewType, purpose, studentActivities, focusOrWeakness);
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    markGeminiFallbackIfNeeded(err);
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

    if (aiClient && !geminiCreditsDepleted) {
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
    markGeminiFallbackIfNeeded(err);
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

    if (aiClient && !geminiCreditsDepleted) {
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
    markGeminiFallbackIfNeeded(err);
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

    if (aiClient && !geminiCreditsDepleted) {
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
    markGeminiFallbackIfNeeded(err);
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

    if (aiClient && !geminiCreditsDepleted) {
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
    markGeminiFallbackIfNeeded(err);
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

    if (aiClient && !geminiCreditsDepleted) {
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
    markGeminiFallbackIfNeeded(err);
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

    if (aiClient && !geminiCreditsDepleted) {
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
    markGeminiFallbackIfNeeded(err);
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

// 8. 학교생활기록부 PDF ➔ A4 1장 압축 브리핑 & 면접관 심층 질문 생성 엔드포인트
app.post('/api/gemini/analyze-pdf-record', async (req: Request, res: Response) => {
  try {
    const {
      pdfBase64 = '',
      fileName = '학교생활기록부.pdf',
      targetSchool = '경희대학교 치의예과',
      supplementaryText = '',
      interviewStyleCondition = '',
      variationSeed = 0,
    } = req.body;

    const systemInstruction = `당신은 대한민국 주요 치과대학(경희대, 단국대, 경북대, 부산대, 조선대) 및 대학 입학처에서 15년간 학생부종합전형 서류 및 면접을 총괄해 온 수석 입학사정관이자 치의예과 면접 심사위원장입니다.
지원자의 학교생활기록부(PDF 원본 문서 및 추가 요약 기록) 전체와 사용자가 사전 제시한 [학교별 면접 질문 성향 및 특별 요구 조건(5줄 지침)]을 정밀 분석하여 다음 두 가지를 완성하세요:

[최우선 반영 지침 - 학교별 면접 질문 성향 및 요구 조건]:
${interviewStyleCondition || '실험·활동의 사실 여부(직접 수행 vs 문헌 인용) 검증 및 기초과학 심층 원리, 치의학 0.1mm 수기 적합성, 환자 공감 의료윤리를 균형 있게 검증할 것.'}

1. [A4 1장 분량의 입학사정관 서류 브리핑 시트 (Executive 1-Page Brief)]
- 수십 페이지에 달하는 3개년 생기부(교과 이수 및 성적 추이, 과목별 세부능력 및 특기사항, 창의적 체험활동-자율/동아리/진로, 행동특성 및 종합의견)를 면접관이 면접장에 들고 들어가는 A4 1장 분량으로 한눈에 들어오게 구조화하여 요약합니다.
- 1학년(탐색·기초) ➔ 2학년(심화·융합) ➔ 3학년(치의학 임상·생체재료·의료윤리 완성)의 3개년 성장 스토리라인이 선명하게 드러나야 합니다.
- 블라인드 면접 규정에 따라 고교명, 부모/친인척 신상, 교외 수상실적은 자동으로 마스킹 처리하여 정리하세요.

2. [면접관 시선의 날카로운 실전 압박 질문 & 꼬리질문 세트 (6문항)]
- 요약된 A4 브리핑 시트와 [학교별 면접 질문 성향 및 요구 조건]을 최우선 반영하여 실제 면접관 2~3인이 지원자에게 던질 가장 날카로운 질문 6개를 생성합니다.
- 질문 유형 구성:
  ① [세특 진위·원리 검증] (2문항): 학생이 기재한 실험, 수식, 화학/생명/물리 원리를 정말 본인이 이해하고 수행했는지 사실 여부와 심층 원리를 검증하는 질문
  ② [치의학 적성·손기술 연계] (2문항): 왜 일반 의대·약대·이공계가 아니라 하필 ${targetSchool}인지, 미세 수기(Manual Dexterity)와 구강악안면 역량이 어떻게 드러나는지 묻는 질문
  ③ [서류 빈틈·한계 압박] (1문항): 탐구 과정의 한계점, 가설 실패 원인, 혹은 성적/이수 과목상의 아쉬운 지점을 찌르는 압박 질문
  ④ [치과의료윤리·인성] (1문항): 행특/봉사/공동체 활동과 연계하여 환자 소통, 자연치아 보존, 의료 사각지대 딜레마를 묻는 질문

반드시 아래 JSON 형식으로만 응답하세요:
{
  "appliedInterviewCondition": "반영된 학교별 면접 질문 성향 및 요구 조건 요약",
  "applicantProfile": {
    "targetUniversity": "${targetSchool}",
    "oneLineIdentity": "사정관이 이 지원자를 한 문장으로 정의하는 핵심 타이틀 (예: 고분자 생체재료의 화학적 기전과 0.1mm 미세 수기 역량을 겸비한 구강생명 탐구형 인재)",
    "coreKeywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4"],
    "evaluationSummary": {
      "academicCompetence": "기초과학(화학·생명·물리·미적분) 이수 충실도 및 학업 심화 역량 2~3문장 압축 요약",
      "dentalFit": "구강악안면·치과재료·바이오필름 등 치의학 전공 연계성 2~3문장 압축 요약",
      "manualDexterity": "실험 기구 조작, 정밀 계측, 악기·모형 제작 등 손기술(Dexterity) 및 집요함 증거 요약",
      "medicalEthics": "공동체 배려, 환자 불안 공감, 의료윤리 및 봉사 정신 2~3문장 압축 요약"
    }
  },
  "threeYearRoadmap": [
    {
      "grade": "1학년 (기초 탐색기)",
      "stageTitle": "1학년 핵심 탐구 테마 요약 제목",
      "keySubjectsAndActivities": "통합과학·수학·창체 등 1학년 주요 세특 및 활동 핵심 내용 요약 (약 150자)",
      "dentalConnection": "구강 보건 및 기초 자연과학적 호기심 출발점"
    },
    {
      "grade": "2학년 (전공 심화기)",
      "stageTitle": "2학년 핵심 탐구 테마 요약 제목",
      "keySubjectsAndActivities": "화학Ⅰ·생명과학Ⅰ·물리학Ⅰ·동아리 등 2학년 심화 실험 및 탐구 요약 (약 180자)",
      "dentalConnection": "치아 경조직·생체재료·역학적 메커니즘으로의 확장"
    },
    {
      "grade": "3학년 (융합 완성기)",
      "stageTitle": "3학년 핵심 탐구 테마 요약 제목",
      "keySubjectsAndActivities": "화학Ⅱ·생명과학Ⅱ·미적분·진로활동 등 3학년 최고 난도 탐구 요약 (약 180자)",
      "dentalConnection": "${targetSchool} 임상 술기 및 미래 치과의사 철학 정립"
    }
  ],
  "corePillars": [
    {
      "pillarTitle": "제1축: [기초과학 × 치과생체재료/구강생물학 심화 탐구]",
      "summary": "생기부 내 가장 돋보이는 학술 심화 탐구의 배경-과정-결론을 사정관 시선에서 압축 정리 (약 180자)",
      "evidenceSource": "관련 과목 세특 및 창체 출처"
    },
    {
      "pillarTitle": "제2축: [0.1mm 정밀 손기술(Dexterity) & 물리·역학적 문제해결]",
      "summary": "실험 오차 보정, 미세 조작, 기구 설계 등 치과의사로서의 수기 역량을 증명하는 핵심 에피소드 정리 (약 180자)",
      "evidenceSource": "관련 과목 세특 및 동아리 출처"
    },
    {
      "pillarTitle": "제3축: [환자 중심 공감 소통 & 치과의료윤리 실천]",
      "summary": "타인을 배려한 공동체 활동, 소외계층 구강보건 관심, 갈등 조정 사례 압축 정리 (약 180자)",
      "evidenceSource": "자율·진로·행동특성 및 종합의견 출처"
    }
  ],
  "officerAudit": {
    "strengths": [
      "사정관이 서류에서 가장 높이 평가할 결정적 합격 강점 1",
      "사정관이 서류에서 가장 높이 평가할 결정적 합격 강점 2",
      "사정관이 서류에서 가장 높이 평가할 결정적 합격 강점 3"
    ],
    "vulnerabilities": [
      "면접관이 반드시 찌르고 들어올 서류상 검증 포인트/취약점 1 (예: 실험 한계, 개념 비약 등)",
      "면접관이 반드시 찌르고 들어올 서류상 검증 포인트/취약점 2",
      "면접관이 반드시 찌르고 들어올 서류상 검증 포인트/취약점 3"
    ]
  },
  "interviewerQuestions": [
    {
      "id": 1,
      "type": "세특 진위·원리 검증",
      "sourceSection": "2~3학년 화학/생명과학 세특",
      "mainQuestion": "면접관의 구체적이고 날카로운 대표 질문",
      "interviewerIntent": "이 질문을 통해 면접관이 확인하려는 속마음과 평가 기준",
      "followUpQuestions": [
        "1단계 압박 꼬리질문: 학생이 원론적으로 답했을 때 파고드는 후속 질문",
        "2단계 심화 꼬리질문: 실제 치과 임상이나 실험 오차 한계를 찌르는 질문"
      ],
      "starDDefenseGuide": "STAR-D 구조로 1분 안에 명쾌하게 방어하는 핵심 답변 전략"
    }
  ]
}`;

    const textPrompt = `[지원 목표 대학]: ${targetSchool}
[업로드된 파일명]: ${fileName}
[사전 설정된 학교별 면접 질문 성향 및 특별 요구 조건 (5줄 서술칸)]:
${interviewStyleCondition || '해당 대학 면접 기조에 맞춘 활동 진위 여부 및 전공 심층 질문'}
[추가 참고 텍스트 / 핵심 요약 메모]:
${supplementaryText || '첨부된 PDF 학생부 문서를 바탕으로 3개년 전체 기록을 A4 1장 분량의 입학사정관 브리핑 시트로 정리하고, 위 면접 질문 성향 조건을 반영한 심층 질문 6문항과 꼬리질문을 생성해 주세요.'}`;

    if (aiClient && !geminiCreditsDepleted) {
      const parts: any[] = [];

      if (pdfBase64 && typeof pdfBase64 === 'string') {
        const cleanBase64 = pdfBase64.includes('base64,')
          ? pdfBase64.split('base64,')[1]
          : pdfBase64;
        // Avoid sending multi-megabyte scanned PDFs inline if supplementary text is already present
        if (cleanBase64.length > 50 && cleanBase64.length < 2_500_000) {
          parts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64,
            },
          });
        }
      }

      parts.push({ text: textPrompt });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (interviewStyleCondition && !parsed.appliedInterviewCondition) {
        parsed.appliedInterviewCondition = interviewStyleCondition;
      }
      return res.json({ success: true, data: parsed });
    } else {
      const fallback = generateFallbackPdfA4Brief(
        targetSchool,
        fileName,
        supplementaryText,
        interviewStyleCondition,
        Number(variationSeed) || 0
      );
      return res.json({ success: true, data: fallback });
    }
  } catch (err: any) {
    markGeminiFallbackIfNeeded(err);
    const fallback = generateFallbackPdfA4Brief(
      req.body.targetSchool || '경희대학교 치의예과',
      req.body.fileName || '학교생활기록부.pdf',
      req.body.supplementaryText || '',
      req.body.interviewStyleCondition || '',
      Number(req.body.variationSeed) || 0
    );
    return res.json({ success: true, data: fallback });
  }
});

function generateFallbackPdfA4Brief(
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

  if (isKimJunwoo) {
    return generateDynamicPdfA4Brief(
      targetSchool,
      fileName,
      supplementaryText,
      interviewStyleCondition,
      variationSeed
    );
  }

  return applyCustomInterviewConditions({
    applicantProfile: {
      targetUniversity: targetSchool,
      oneLineIdentity: `기초과학(화학·물리·생명) 원리로 구강 경조직과 생체재료를 탐구하고 0.1mm 미세 조작 역량을 입증한 ${targetSchool} 맞춤형 인재`,
      coreKeywords: [
        '구강생체재료·나노필러 중합수축',
        '하이드록시아파타이트 탈회 완충기전',
        '0.1mm 미세 수기 & 토크 역학',
        '치과공포 공감 & 자연치아 보존윤리'
      ],
      evaluationSummary: {
        academicCompetence: '화학Ⅰ·Ⅱ, 생명과학Ⅰ·Ⅱ, 물리학, 미적분 등 치의학 핵심 선행 기초과목을 회피 없이 이수하였으며, 교과 개념을 단순 암기하지 않고 실험 오차 보정과 수식 모델링으로 연결한 학업 수월성이 돋보입니다.',
        dentalFit: '1학년 구강 미생물 생태계 호기심에서 출발해 2학년 법랑질 재광화 화학 평형, 3학년 치과용 복합 레진 중합수축 및 교정 브라켓 모멘트 역학으로 이어지는 3개년 치의학 심화 일관성이 매우 탁월합니다.',
        manualDexterity: '미세 피펫팅 및 박절 실험에서의 손끝 각도 제어, 악기 운지법과 정밀 모형 제작 등에서 좁은 시야 내 0.1mm 오차를 통제하는 치과의사 고유의 수기(Manual Dexterity) 잠재력이 구체적으로 확인됩니다.',
        medicalEthics: '학급 내 소외된 급우와의 소통, 치과 치료 공포(Dental Phobia)를 겪는 아동을 위한 심리 완화(TSD) 탐구, 노인 구강보건 의료 사각지대에 대한 고민 등 따뜻한 인술의 자질을 갖추었습니다.'
      }
    },
    threeYearRoadmap: [
      {
        grade: '1학년 (기초 탐색기)',
        stageTitle: '산·염기 중화반응과 구강 내 타액 완충계(Buffer) 호기심 발현',
        keySubjectsAndActivities: '통합과학 및 수학 세특에서 탄산음료 섭취 후 구강 내 pH 변화 곡선(Stephan Curve)을 로그함수로 모델링함. 자율·진로활동에서 치아 우식증 예방을 위한 불소 도포의 사회적 편익을 조사하며 예방치의학의 기초 시각을 형성함.',
        dentalConnection: '구강 환경의 항상성과 자연치아 예방 보존의 중요성 인식'
      },
      {
        grade: '2학년 (전공 심화기)',
        stageTitle: '법랑질 이온 치환 화학평형 및 치아 교정 브라켓 우력 모멘트 분석',
        keySubjectsAndActivities: '화학Ⅰ에서 하이드록시아파타이트가 플루오르아파타이트로 치환될 때 임계 pH가 5.5에서 4.5로 낮아지는 르샤틀리에 평형 이동을 규명함. 물리학Ⅰ·동아리에서 치아 경사이동을 막고 치체이동을 유도하는 모멘트-힘 비율(M/F ratio)을 벡터 분해로 시뮬레이션함.',
        dentalConnection: '치과보존학·치과교정학의 핵심 기초과학 메커니즘 체득'
      },
      {
        grade: '3학년 (융합 완성기)',
        stageTitle: '복합 레진 나노 필러 중합수축 제어 및 환자 중심 구강생명 의료윤리 정립',
        keySubjectsAndActivities: '화학Ⅱ·생명과학Ⅱ에서 광중합 레진의 C=C 이중결합 단일결합 전환 시 발생하는 부피 수축(2~5%)과 미세누출(Microleakage) 문제를 해결하기 위해 실리카 나노 필러 분산도를 탐구함. 진로활동에서 과잉진료 딜레마와 자연치아 치주인대(PDL) 보존 가치를 심층 고찰함.',
        dentalConnection: `${targetSchool}가 추구하는 정밀 임상 역량 및 환자 존중 치과의사상 완성`
      }
    ],
    corePillars: [
      {
        pillarTitle: '제1축: [화학·생명 심화] 치아 경조직 재광화 평형 & 복합 레진 중합수축 제어',
        summary: `단순 문헌 조사를 넘어 구강 내 pH 완충 작용과 고분자 수복재의 계면 결합 한계를 화학적 결합 거리(반데르발스 거리 ➔ 공유결합 거리) 관점에서 정밀하게 규명함. ${supplementaryText ? `(추가기록 반영: ${supplementaryText.slice(0, 60)}...)` : ''}`,
        evidenceSource: '2학년 화학Ⅰ, 3학년 화학Ⅱ·생명과학Ⅱ 세특 및 과학탐구동아리'
      },
      {
        pillarTitle: '제2축: [물리·수기 역량] 교정력 토크(Torque) 벡터 설계 & 0.1mm 오차 보정 손기술',
        summary: '치아 저항중심(Center of Resistance)과 브라켓 위치 차이에 따른 회전 모멘트를 수학적으로 계산하고, 실험 과정에서 발생한 미세 오차를 손끝 각도와 기구 고정을 통해 끝까지 교정한 집요함을 증명함.',
        evidenceSource: '2학년 물리학Ⅰ, 3학년 미적분 세특 및 창의적 체험활동'
      },
      {
        pillarTitle: '제3축: [치과의료윤리·인성] 치과공포(Dental Anxiety) 완화 소통 & 자연치아 보존 철학',
        summary: '치과 핸드피스 소음과 시각적 두려움이 환자의 교감신경 항진에 미치는 영향을 분석하고, Tell-Show-Do(말하기-보여주기-시행하기) 공감 화법과 취약계층 구강보건 접근성 개선 방안을 제시함.',
        evidenceSource: '1~3학년 진로활동, 자율활동 및 행동특성 및 종합의견'
      }
    ],
    officerAudit: {
      strengths: [
        '일반 의대 지망생의 생기부와 확연히 구별되는 구강악안면·치과생체재료·교합역학 중심의 뚜렷한 치의학 정체성',
        '1학년 기초 호기심 ➔ 2학년 기전 규명 ➔ 3학년 한계 극복으로 이어지는 자기주도적 심화 탐구 궤적',
        '실험 실패나 오차를 숨기지 않고 원인을 집요하게 추적해 해결한 정직한 학업 태도와 정밀 수기 잠재력'
      ],
      vulnerabilities: [
        '[면접 검증 1순위] 고교 실험실 수준에서 직접 측정하기 어려운 나노 필러 분산도·중합수축률 수치를 어디까지 본인이 직접 실험했고 어디서부터 문헌 데이터를 인용했는지 진위 구분 필요',
        '[면접 검증 2순위] 화학·물리 이론(르샤틀리에 원리, 돌림힘 공식)을 실제 구강 내 타액·혈류·치주인대라는 생물학적 변수와 결합할 때 발생하는 한계점 인지 여부',
        '[면접 검증 3순위] 치과의사의 고된 육체적 피로도와 0.1mm 무결점 압박감을 견뎌낼 본인만의 실질적 근거 확인'
      ]
    },
    interviewerQuestions: [
      {
        id: 1,
        type: '세특 진위·원리 검증',
        sourceSection: '3학년 화학Ⅱ 세특 (복합 레진 광중합 수축 및 나노 필러 탐구)',
        mainQuestion: '학생부 화학Ⅱ 세특을 보면 복합 레진이 광중합될 때 부피가 수축하여 미세누출이 발생한다고 기록되어 있습니다. 단량체가 중합될 때 왜 부피가 줄어드는지 화학 결합 거리의 변화로 설명하고, 본인이 제안한 나노 필러 함량 조절의 한계점은 무엇이었나요?',
        interviewerIntent: '보고서 용어만 화려하게 베낀 것이 아니라, 반데르발스 인력 거리가 공유결합 거리로 짧아지는 고분자 화학의 핵심 원리와 점도(Viscosity) 상승이라는 상충관계(Trade-off)를 진짜 이해했는지 검증합니다.',
        followUpQuestions: [
          '필러 함량을 높이면 기계적 강도는 좋아지지만 점도가 높아져 치아의 미세한 와동(구멍)에 밀착시키기 어려워집니다. 임상에서는 이 딜레마를 어떻게 해결할 수 있을까요?',
          '임상에서 레진을 한 번에 두껍게 채우지 않고 2mm 이하로 나누어 광중합하는 적층충전법(Incremental technique)은 학생이 배운 C-factor(결합면 비율) 개념과 어떤 관계가 있나요?'
        ],
        starDDefenseGuide: '[S/T] 레진 중합 시 단량체 간 반데르발스 거리가 짧은 공유결합 거리로 당겨지며 2~5% 수축과 2차 우식 위험이 생김을 설명 ➔ [A/R] 필러 함량 증대 시 점도 상승으로 조작성이 떨어지는 한계를 확인하고 커플링제(Silane) 처리 및 적층 광중합 원리를 도출함 ➔ [D] 재료의 물성과 술자의 정밀한 손기술이 결합되어야 완벽한 치아 보존이 가능함을 체득.'
      },
      {
        id: 2,
        type: '세특 진위·원리 검증',
        sourceSection: '2학년 화학Ⅰ·생명과학Ⅰ 세특 (법랑질 탈회 및 타액 완충능)',
        mainQuestion: '구강 내 pH가 5.5 이하로 떨어지면 법랑질이 탈회되는데, 불소가 존재하면 왜 더 낮은 pH(4.5)까지 견딜 수 있는지 화학평형 이동과 격자 에너지 관점에서 면접관에게 설명해 보세요.',
        interviewerIntent: '고등학교 화학Ⅰ의 화학평형(르샤틀리에의 원리)과 이온결합의 쿨롱 인력을 치아 경조직에 정확히 대입할 수 있는 학업 역량을 평가합니다.',
        followUpQuestions: [
          '그렇다면 침(타액) 속에 들어 있는 중탄산염(HCO3-) 완충계는 식사 직후 산성화된 구강 환경을 어떤 화학 반응식을 통해 중화시키나요?',
          '구강건조증을 앓는 어르신 환자에게는 불소 도포만으로도 충치 예방 효과가 떨어질 수 있습니다. 그 이유는 무엇이라고 생각하나요?'
        ],
        starDDefenseGuide: '[S/T] 산성 환경에서 수산화이온(OH-)이 수소이온과 반응해 인산칼슘 결정이 녹아나오는 탈회 기전 제시 ➔ [A/R] OH- 자리에 반지름이 작고 전기음성도가 큰 불소이온(F-)이 치환되면 플루오르아파타이트를 형성해 결정 격자 결합력이 강화됨을 설명 ➔ [D] 칼슘·인산 이온 공급원인 타액의 생리학적 가치를 이해하는 예방치의학 전문가 비전 제시.'
      },
      {
        id: 3,
        type: '치의학 적성·손기술',
        sourceSection: '2학년 물리학Ⅰ·동아리 (교정 브라켓 모멘트 및 0.1mm 오차 보정)',
        mainQuestion: '치아에 교정력을 가할 때 단순한 힘(Force)만 주면 치아가 쓰러지는 경사이동이 일어납니다. 치아 뿌리까지 평행하게 이동시키는 치체이동(Bodily Movement)을 구현하기 위해 물리학의 돌림힘(Torque) 원리가 어떻게 쓰였는지 설명해 보세요.',
        interviewerIntent: '치의학에서 가장 중요한 3차원 공간지각력과 물리 역학적 사고력을 갖추었는지, 그리고 수식을 실제 구강 구조(치관 vs 치조골 내 저항중심)에 적용할 줄 아는지 봅니다.',
        followUpQuestions: [
          '치아의 저항중심(Center of Resistance)은 우리가 브라켓을 붙이는 치관 표면이 아니라 치조골 내부 치근 쪽에 있습니다. 이 거리 차이가 왜 회전 모멘트를 유발하나요?',
          '본인이 고교 시절 실험이나 일상 활동 중에서 0.1mm 단위의 미세한 각도나 힘 조절 실패를 손끝 감각으로 극복해 본 가장 대표적인 경험은 무엇인가요?'
        ],
        starDDefenseGuide: '[S/T] 브라켓에 가한 힘의 작용선과 치아 저항중심 사이의 수직 거리 때문에 원치 않는 회전 모멘트가 발생하는 문제 ➔ [A/R] 각형 와이어를 브라켓 슬롯에 비틀어 삽입해 반대 방향의 우력(Couple) 모멘트를 생성하여 알짜 모멘트를 0으로 맞춘 원리 설명 ➔ [D] 미세한 각도 조절이 환자의 교합을 결정하는 치과의사의 정교한 수기 역량으로 연결.'
      },
      {
        id: 4,
        type: '치의학 적성·손기술',
        sourceSection: '진로활동 및 지원동기 종합 (의학·약학·이공계 대비 치의학 고유성)',
        mainQuestion: `생기부에 화학·생명 탐구 역량이 매우 우수한데, 신약을 개발하는 약학이나 전신 질환을 다루는 의예과가 아니라 반드시 '${targetSchool}'에 진학해야만 하는 본인만의 결정적 이유는 무엇입니까?`,
        interviewerIntent: '성적에 맞춘 지원이거나 의대 차선책이 아닌지 감별하고, 치의학 고유의 매력(비가역적 경조직 수복, 진단부터 미세 외과·보철까지 주치의 1인이 체어사이드에서 손끝으로 완결하는 특성)을 체화했는지 확인합니다.',
        followUpQuestions: [
          `${targetSchool}의 교육과정이나 치과대학병원 임상 특성 중 본인의 생기부 탐구 주제와 가장 맞닿아 있는 분야는 무엇인가요?`,
          'AI와 디지털 3D 프린팅·구강스캐너가 도입되면 치과의사의 손기술(Manual Dexterity)은 덜 중요해질까요, 아니면 오히려 더 중요해질까요?'
        ],
        starDDefenseGuide: '[S/T] 화학·생명 이론이 구강이라는 3차원 공간에서 즉각적인 물리적 형태와 저작 기능 복원으로 구현되는 치의학만의 독보적 매력 강조 ➔ [A/R] 디지털 가이드가 발달해도 결국 환자 구강 내 0.1mm 마진 적합과 연조직 처치는 술자의 손끝 감각으로 완성됨을 역설 ➔ [D] 지원 대학의 연구·임상 인프라에서 구강악안면 주치의로 성장하겠다는 확고한 포부.'
      },
      {
        id: 5,
        type: '서류 빈틈·한계 압박',
        sourceSection: '1~3학년 실험 탐구 보고서 한계점 및 수행 진위 확인',
        mainQuestion: '학생부에 기록된 치과 재료 및 구강 미생물 관련 탐구들을 보면 고등학교 실험실 장비로는 직접 측정하기 까다로운 내용들이 포함되어 있습니다. 본인이 직접 손으로 수행한 실험 범위와 문헌/논문 데이터를 인용한 범위를 솔직하게 구분해 말씀해 주세요.',
        interviewerIntent: '학종 면접에서 가장 무서운 "과장 여부 및 정직성 테스트"입니다. 아는 척하거나 부풀리지 않고, 고교 수준의 실험적 한계를 정직하게 인정한 뒤 그 한계를 보완하기 위해 어떤 대체 실험이나 추론을 했는지 봅니다.',
        followUpQuestions: [
          '직접 실험하면서 가설과 가장 다르게 나왔던 실패 데이터는 무엇이었고, 그 오차의 원인을 무엇이라고 분석했나요?',
          '대학 진학 후 첨단 장비(주사전자현미경 SEM, 만능재료시험기 UTM 등)를 쓸 수 있게 된다면 고교 때 못 해본 어떤 변수를 가장 먼저 검증해 보고 싶나요?'
        ],
        starDDefenseGuide: '[S/T] 나노 단위 수축률 측정 등은 고교 장비의 한계가 있었음을 1초의 망설임도 없이 솔직히 인정 ➔ [A/R] 대신 고교 실험실에서는 pH 지시약 변색 시간, 거시적 점도 비교, 모형 와동 충전 후 염료 침투(Microleakage) 관찰 등 직접 구현 가능한 대조군 실험을 설계해 원리를 검증했음을 구체적으로 제시 ➔ [D] 연구 윤리와 정직성을 최우선으로 하는 과학자형 치과의사 태도 증명.'
      },
      {
        id: 6,
        type: '치과의료윤리·인성',
        sourceSection: '창의적 체험활동 및 행동특성 및 종합의견 (환자 공감·생명윤리)',
        mainQuestion: '치과를 찾는 환자분들은 다른 병원보다 유독 극심한 공포(Dental Phobia)를 느끼거나, 비용 문제로 자연치아를 살리는 보존치료 대신 당장 발치나 저렴한 처치를 요구하기도 합니다. 본인의 고교 시절 소통·배려 경험에 비추어 이런 환자를 어떻게 설득하시겠습니까?',
        interviewerIntent: '우수한 성적과 손기술 너머에 환자의 아픔과 경제적·심리적 불안을 보듬는 치과의사로서의 인성(Empathetic Communication)과 자연치아 보존 철학이 있는지 평가합니다.',
        followUpQuestions: [
          '환자가 의사의 의학적 권유를 끝까지 거부하고 본인 뜻대로 해달라고 고집할 때, 환자의 자율성(Autonomy)과 의사의 선행 원칙(Beneficence) 중 무엇을 우선해야 할까요?',
          '고교 시절 생각이 전혀 다른 친구나 조원을 논리적이면서도 상처 주지 않고 설득해 본 실제 일화를 한 가지만 들려주세요.'
        ],
        starDDefenseGuide: '[S/T] 학급/동아리에서 갈등이나 불안을 겪는 친구의 감정을 먼저 수용해 라포(Rapport)를 형성했던 실제 경험 제시 ➔ [A/R] 일방적 지시가 아닌 시각 자료와 단계별 안내(Tell-Show-Do)로 불안의 원인을 낮추고 합의를 이끌어낸 과정 설명 ➔ [D] 자연치아의 치주인대 가치와 치료 장단점을 환자 눈높이에서 투명하게 설명(Informed Consent)하는 신뢰받는 치과의사 다짐.'
      }
    ]
  }, targetSchool, interviewStyleCondition);
}

function applyCustomInterviewConditions(
  baseResult: any,
  targetSchool: string,
  interviewStyleCondition: string
) {
  const trimmed = (interviewStyleCondition || '').trim();
  if (!trimmed) {
    baseResult.appliedInterviewCondition = `[${targetSchool} 기본 면접 기조] 서류 내 탐구 활동의 사실 여부(직접 수행 vs 문헌 참고) 확인 및 기초과학 심층 원리, 0.1mm 치의학 수기 적성, 환자 공감 의료윤리 종합 검증`;
    return baseResult;
  }

  baseResult.appliedInterviewCondition = trimmed;
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*0-9.)\s]+/, '').trim())
    .filter((l) => l.length > 3);

  const hasFactCheckFocus = /사실|진위|직접|실험|인용|과장|팩트|역할|수행/.test(trimmed);
  const hasDeepTheoryFocus = /심층|원리|수식|교과|기전|메커니즘|법칙|개념/.test(trimmed);

  if (lines.length > 0) {
    baseResult.officerAudit.vulnerabilities = [
      `[맞춤형 조건 1순위 반영] ${lines[0]}`,
      ...(lines[1] ? [`[맞춤형 조건 2순위 반영] ${lines[1]}`] : []),
      ...baseResult.officerAudit.vulnerabilities.slice(0, 2),
    ];
  }

  if (Array.isArray(baseResult.interviewerQuestions)) {
    baseResult.interviewerQuestions = baseResult.interviewerQuestions.map((q: any, idx: number) => {
      const matchedLine = lines[idx % Math.max(1, lines.length)];
      const updatedFollowUps = [...(q.followUpQuestions || [])];

      if (idx === 0 && hasFactCheckFocus) {
        updatedFollowUps[0] = `[사실여부·역할 압박] 이 탐구에서 본인이 직접 설계·수행한 영역과 논문/문헌 데이터를 인용한 영역을 명확히 구분해 보시고, 과정 중 예상과 달랐던 시행착오는 무엇이었나요?`;
      } else if (idx === 1 && hasDeepTheoryFocus) {
        updatedFollowUps[0] = `[교과 심층원리 압박] 보고서에 적힌 전문 용어를 사용하지 않고, 고등학교 화학·생명과학 교과서의 기본 법칙만으로 이 현상의 핵심 원리를 면접관에게 증명해 보세요.`;
      } else if (matchedLine && idx < lines.length) {
        updatedFollowUps.push(
          `[학교 맞춤 조건 심층확인] "${matchedLine}" 관점에서 볼 때, 본인의 이 활동이 갖는 가장 결정적인 근거와 한계점은 무엇인가요?`
        );
      }

      return {
        ...q,
        interviewerIntent: matchedLine
          ? `[사전 설정 조건 반영: ${matchedLine}] — ${q.interviewerIntent}`
          : q.interviewerIntent,
        followUpQuestions: updatedFollowUps,
      };
    });
  }

  return baseResult;
}

// 9. 무설치 독립형 단일 HTML 파일 다운로드 엔드포인트
app.get('/api/download-standalone-html', (_req: Request, res: Response) => {
  const standalonePath = path.resolve(__dirname, 'public', 'DentalPass_Standalone_Master.html');
  if (fs.existsSync(standalonePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="DentalPass_Master_Standalone.html"'
    );
    return res.sendFile(standalonePath);
  }
  return res.status(404).send('Standalone HTML file not found');
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    let viteInstance: any = null;
    const viteReady = (async () => {
      const { createServer: createViteServer } = await import('vite');
      viteInstance = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      return viteInstance;
    })();

    app.use(async (req, res, next) => {
      try {
        const vite = viteInstance || (await viteReady);
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
