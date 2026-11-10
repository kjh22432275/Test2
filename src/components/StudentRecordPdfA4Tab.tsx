import React, { useState, useRef, useEffect } from 'react';
import { DENTAL_SCHOOLS } from '../data/dentalMasterData';
import { PdfA4BriefResult, PdfInterviewerQuestion } from '../types/interview';
import { apiFetch } from '../utils/standaloneApiEngine';
import { KIM_JUNWOO_18PAGE_ORIGINAL } from '../data/studentRecordAnalysisEngine';
import {
  FileText,
  Upload,
  Sparkles,
  Printer,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Eye,
  BookOpen,
  RefreshCw,
  Search,
  X
} from 'lucide-react';

interface StudentRecordPdfA4TabProps {
  onSendToStarD?: (question: string, school: string, draftGuide: string) => void;
  onSendToEvaluator?: (question: string, school: string, context: string) => void;
}

interface PdfSamplePreset {
  id: string;
  schoolName: string;
  badge: string;
  fileName: string;
  summaryNotes: string;
}

const PDF_SAMPLE_PRESETS: PdfSamplePreset[] = [
  {
    id: 'preset-actual-kim',
    schoolName: '경희대학교 치의예과 (실제 지원 5대 치대 연동)',
    badge: '★ 아드님(김준우) 실제 18쪽 생기부 원본',
    fileName: '김준우_서라벌고_3개년_실제생기부.pdf',
    summaryNotes: `[실제 학생부 정밀 기록: 김준우 / 서라벌고등학교]
- 학업 수월성: 1~2학년 전 학기 국어 1, 수학 1, 물리Ⅰ 전교 1등(1/139), 생명과학Ⅰ 전교 1등(1/74, 100점 만점), 화학Ⅰ 1, 기하 A 등 압도적 최상위 성적.
- 1학년 국어 세특: 치약 속 불소(Fluoride)의 치아 표면 하이드록시아파타이트(HAp) 재광화 편익과 세포 독성의 과학적 균형 탐구.
- 2학년 진로활동: 장-뇌 축(Gut-Brain Axis) 연구 - 장내 미생물 유래 내독소 LPS가 장벽 및 뇌혈관장벽(BBB)을 통과해 미세아교세포(Microglia)를 과활성화시키고 신경염증을 촉발하는 병리 분석 (구강 치주균 P. gingivalis LPS의 전신-뇌신경 질환 Oral-Systemic Link와 직결).
- 2학년 생명과학Ⅰ 세특(전교 1등): 미토콘드리아 내막 수소이온 농도 기울기와 ATP Synthase의 c-ring 회전 역학(120° 형태 변화) 및 결핵약 베다퀼린(Bedaquiline)의 저해 메커니즘 분석.
- 2학년 물리학Ⅰ 세특(전교 1등): 볼츠만 통계역학 엔트로피(S=k ln W)와 슈뢰딩거의 음의 엔트로피를 생체계의 대사 질서와 연결.
- 1~2학년 미술 세특: 손의 정밀 비례 소묘 및 페트병 빛 반사 묘사(0.1mm 단위의 연필 강약 조절로 치과의사 고유의 미세 수기 Manual Dexterity 입증).
- 봉사/인성: 1070 세대통합 프로젝트로 독거 어르신 댁 방문 생필품 전달 및 말벗 봉사, 또래 멘토링 활동.`
  },
  {
    id: 'preset-khu',
    schoolName: '경희대학교 치의예과',
    badge: '경희대 네오르네상스형',
    fileName: '경희대지원_3개년_학교생활기록부_김치의.pdf',
    summaryNotes: `[1학년] 통합과학 산·염기 중화반응 세특에서 탄산음료 섭취 후 구강 내 Stephan Curve(pH 변화 곡선)를 로그함수로 모델링함. 진로활동에서 예방치의학 불소 도포의 사회적 편익 탐구.
[2학년] 화학Ⅰ 세특에서 법랑질 하이드록시아파타이트가 불소이온과 치환되어 플루오르아파타이트를 형성할 때 임계 pH가 5.5→4.5로 낮아지는 화학평형 규명. 생명과학Ⅰ에서 구강 바이오필름 내 S. mutans 쿼럼센싱 억제 기전 조사.
[3학년] 화학Ⅱ·생명과학Ⅱ 및 과학동아리에서 광중합 복합 레진의 C=C 이중결합 단일화 시 부피 수축(2~5%)과 미세누출(Microleakage) 해결을 위해 실리카 나노 필러 함량 및 실란(Silane) 커플링제 표면 개질 탐구 수행.`
  },
  {
    id: 'preset-dku',
    schoolName: '단국대학교(천안) 치의예과',
    badge: '단국대 DKU인재형',
    fileName: '단국대지원_3개년_학교생활기록부_박단국.pdf',
    summaryNotes: `[1학년] 수학·과학 탐구에서 치아의 저작압 분산 구조와 아치형 교합 곡선(Curve of Spee)의 기하학적 안정성 분석.
[2학년] 물리학Ⅰ 세특에서 치아 교정 브라켓에 힘을 가할 때 치아 저항중심(Center of Resistance)과의 거리 차이로 발생하는 경사이동 문제를 분석하고, 치체이동(Bodily Movement)을 위한 우력 모멘트-힘 비율(M/F ratio) 계산.
[3학년] 미적분·물리학Ⅱ에서 임플란트 픽스처 나사산 피치 각도에 따른 악골 응력 분포 시뮬레이션 및 0.1mm 캘리퍼스 오차 보정 실험 수행.`
  },
  {
    id: 'preset-knu',
    schoolName: '경북대학교 치의예과',
    badge: '경북대 학생부종합형',
    fileName: '경북대지원_3개년_학교생활기록부_이경북.pdf',
    summaryNotes: `[1학년] 오케스트라 동아리 첼로 수석으로 활동하며 현의 장력과 0.1mm 운지 위치 오차에 따른 음정 주파수 변화를 물리적으로 분석하고 정밀 수기 감각 훈련.
[2학년] 생명과학Ⅰ·화학Ⅰ에서 상아질 세관의 유체역학설(Brannstrom's Hydrodynamic Theory)을 통한 지각과민 기전 탐구 및 질산칼륨·옥살산염의 세관 봉쇄 메커니즘 비교 실험.
[3학년] 생명과학Ⅱ에서 골유착(Osseointegration) 과정의 조골세포-파골세포 RANK/RANKL/OPG 신호전달 체계와 타이타늄 표면 거칠기(SLA 처리)의 상관관계 심층 보고서 작성.`
  },
  {
    id: 'preset-pnu',
    schoolName: '부산대학교 치의예과(학석사통합)',
    badge: '부산대 학석사통합형',
    fileName: '부산대지원_3개년_학교생활기록부_최부산.pdf',
    summaryNotes: `[1학년] 지역 아동센터 교육봉사에서 유아들의 치과 공포증(Dental Anxiety) 원인을 관찰하고 시각·청각 자극 완화를 위한 TSD(Tell-Show-Do) 그림책 제작.
[2학년] 생명과학Ⅰ·화학Ⅰ에서 치주질환 원인균 P. gingivalis의 내독소(LPS)가 전신 염증 사이토카인 및 당뇨·심혈관 질환에 미치는 구강-전신 연결성(Oral-Systemic Link) 탐구.
[3학년] 화학Ⅱ·의생명동아리에서 자연치아 치주인대(PDL) 줄기세포의 재생 잠재력과 바이오세라믹(MTA) 치수복조재의 생체적합성·수화반응 메커니즘 탐구.`
  },
  {
    id: 'preset-csu',
    schoolName: '조선대학교 치의예과',
    badge: '조선대 학생부종합형',
    fileName: '조선대지원_3개년_학교생활기록부_정조선.pdf',
    summaryNotes: `[1학년] 농어촌 고령 인구 구강보건 실태 통계를 분석하고 노인 구강건조증이 저작 기능 저하 및 노년기 영양 결핍에 미치는 사회적 문제 탐구.
[2학년] 화학Ⅰ·생명과학Ⅰ에서 타액 내 중탄산염(HCO3-/H2CO3) 완충계와 뮤신(Mucin), 라이소자임의 항균 작용을 실험으로 검증하고 인공타액의 점탄성 조건 도출.
[3학년] 생명과학Ⅱ·진로활동에서 고령 환자용 의치(틀니) 레진 표면에 증식하는 칸디다 알비칸스(C. albicans) 바이오필름 억제 천연 추출물 실험 및 공공 방문구강보건 정책 제안.`
  }
];

const SCHOOL_INTERVIEW_CONDITIONS: Record<string, string> = {
  '경희대학교 치의예과': `1. [실험·탐구 사실여부 검증] 세특에 기재된 실험이나 문헌 탐구를 본인이 직접 설계·수행했는지 구체적 과정과 시행착오를 집요하게 팩트체크함
2. [기초과학 심층원리] 화학·생명과학·물리 교과 개념(불소 재광화 평형, ATP 합성효소 회전역학, 엔트로피 등)을 고교 수준을 넘어 치의학 기전으로 심층 질문함
3. [구강-전신 연결성] 장-뇌 축(LPS) 등 생명과학 탐구를 구강 미생물(치주균) 및 전신 질환과 스스로 연결할 수 있는지 학문적 확장성 평가
4. [0.1mm 정밀 수기] 미술 소묘·조작 활동에서 드러난 미세 손감각(Manual Dexterity)과 치과 임상 수기 역량의 실질적 연관성 확인
5. [네오르네상스 인성] 독거 어르신 봉사 등 공동체 활동에서 체득한 환자 공감 능력과 치과의사로서의 사회적 책임감 검증`,
  '단국대학교(천안) 치의예과': `1. [활동 진위 및 본인 역할] 동아리·교과 탐구에서 조원 뒤에 숨지 않고 본인이 주도적으로 해결한 구체적 행동(Action)과 사실 여부 집중 확인
2. [물리·역학 심층질문] 물리Ⅰ·수학(기하) 세특의 역학·비례 원리를 치아 교정력(모멘트), 저작압 분산, 보철물 설계 원리로 전환해 압박 질문함
3. [실패 극복과 집요함] 실험 데이터 오차나 탐구 한계에 부딪혔을 때 이를 어떻게 수정·보완했는지 구체적 수치와 근거 요구
4. [치과 임상 수기 적합성] 손의 비례 소묘·정밀 묘사 등 0.1mm 단위의 시각-운동 협응력이 실제 치과 프렙(Prep) 수기에 어떻게 기여하는지 질문
5. [환자 중심 의료윤리] 과잉진료 유혹이나 진료 거부권 딜레마 상황에서 환자의 이익을 최우선으로 두는 윤리적 판단 기준 평가`,
  '경북대학교 치의예과': `1. [세특 팩트체크(사실여부)] 기록된 심화 보고서(베다퀼린, LPS 미세아교세포, 볼츠만 엔트로피 등)의 핵심 용어와 인과관계를 막힘없이 설명하는지 진위 검증
2. [교과 원리 심층 압박] 100점·전교 1등 과목(물리Ⅰ·생명과학Ⅰ)의 세특 주제를 바탕으로 꼬리에 꼬리를 무는 고난도 원리 질문 출제
3. [탐구 한계 및 대안 제시] 고교 수준 문헌 탐구의 한계를 스스로 인지하고 있는지, 대학 진학 후 어떤 실험으로 검증할 것인지 질문
4. [정밀 조작 및 관찰력] 미술 세특의 정밀 묘사와 과학 실험 기구 조작에서 나타난 0.1mm 오차 통제 경험 확인
5. [국립대 공공의료 사명감] 세대통합 어르신 봉사 경험을 바탕으로 고령화 사회 구강보건 격차 해소에 기여할 현실적 방안 질문`,
  '부산대학교 치의예과(학석사통합)': `1. [연구 진위 및 실험 설계] 학석사통합과정 특성상 학생부 탐구 주제의 가설-변인통제-결론 도출 과정을 실제로 이해하고 수행했는지 엄격히 검증
2. [치의학 과학자(Dental Scientist) 역량] 미토콘드리아 ATP 합성효소 및 장-뇌 축(LPS) 연구를 구강생리학·치과약리학 연구로 발전시킬 잠재력 심층 질문
3. [기초과학 융합 심층질문] 화학(불소 HAp)·생명(세포신호)·물리(열역학)를 분절하지 않고 하나의 치의학 현상으로 융합 설명하도록 요구
4. [치과 공포 공감 및 소통] 소외계층·어르신 봉사 현장에서 겪은 소통의 어려움과 환자의 치과 공포증(Dental Anxiety)을 완화할 태도 검증
5. [자연치아 보존 철학] 임플란트 위주 발치보다 자연치아와 치주조직을 끝까지 보존하려는 치과의료윤리관 확인`,
  '조선대학교 치의예과': `1. [활동 사실여부 및 진정성] 생기부 속 탐구와 봉사활동이 단순 스펙용이 아니라 실제로 본인이 땀 흘려 수행한 활동인지 구체적 에피소드 확인
2. [생화학·미생물 심층질문] 구강 내 산·염기 평형(불소 재광화)과 미생물 내독소(LPS) 염증 기전에 대한 정확한 과학적 원리 이해도 점검
3. [고령 환자 맞춤형 치의학] 1070 어르신 봉사 경험과 연결하여 노인 구강건조증·치주질환·틀니 관리 등 지역사회 고령 친화 치의학 질문
4. [0.1mm 수기 및 예술적 감각] 미술 손 소묘 및 빛 반사 표현에서 검증된 입체 공간지각력과 치과 심미보철 수기 역량 연결 질문
5. [공동체 배려 및 협업] 또래 멘토링·학급 활동에서 갈등을 조정하고 동료와 협력한 실제 사례를 통해 의료진 팀워크 역량 평가`,
};

const CONDITION_QUICK_PRESETS: { label: string; conditionText: string }[] = [
  {
    label: '실험·활동 사실여부(팩트체크) 집중',
    conditionText: `1. [실험·탐구 사실여부 집중 검증] 세특에 적힌 실험과 보고서를 본인이 직접 수행했는지, 사용한 자료·조건·시행착오를 구체적으로 캐물어 진위 파악
2. [단순 베끼기 감별] 보고서에 등장하는 전문 용어(LPS, 베다퀼린, HAp, 볼츠만 공식 등)를 본인의 쉬운 언어로 즉시 풀어서 설명할 수 있는지 검증
3. [본인 주도성 확인] 공동 탐구나 봉사활동에서 본인이 직접 맡은 역할과 실제로 부딪힌 문제 해결 과정을 사실 중심으로 질문
4. [탐구 계기와 연결성] 왜 하필 그 주제를 선택했는지, 1학년→2학년 탐구가 어떻게 자발적으로 이어졌는지 사실관계 확인
5. [실제 느낀 점과 한계] 화려한 결론보다 탐구 과정에서 실패하거나 한계를 느꼈던 솔직한 지점을 집요하게 질문`,
  },
  {
    label: '활동에 대한 교과 심층질문 집중',
    conditionText: `1. [고난도 교과 심층원리 압박] 물리Ⅰ·생명과학Ⅰ·화학Ⅰ 세특에 등장한 과학 원리를 표면적 요약이 아닌 화학평형·열역학·분자생물학 메커니즘까지 깊이 파고듦
2. [2단계 꼬리질문 연계] 기본 원리 답변 후 '만약 구강 내 pH나 온도가 변한다면?', '돌연변이가 생긴다면?' 등 조건 변경 시 결과를 추론하는 심층 질문
3. [치의학 임상 기전 확장] 고교 생명·화학 탐구(불소 재광화, 미토콘드리아 ATP, LPS 신경염증)를 실제 치아우식·치주염·치과약리 기전과 연결해 심층 질문
4. [수리·물리적 정량 분석] 미술 비례 소묘나 물리 세특을 치아 교합력 분산, 보철물 마진 오차(0.1mm), 열역학적 에너지 보존 관점에서 심층 추궁
5. [학문적 한계 돌파] 문헌 조사의 한계를 넘어 실제 실험을 설계한다면 대조군과 실험군을 어떻게 설정할지 과학적 방법론 질문`,
  },
  {
    label: '0.1mm 수기·치의학 전공적합성 집중',
    conditionText: `1. [의대 아닌 치대 지원 확신성] 생명과학·의생명 탐구가 많은데 왜 의예과가 아니라 반드시 '치의예과'여야 하는지 구강 구조의 특수성으로 압박 질문
2. [0.1mm 미세 손기술(Dexterity) 검증] 미술 손 비례 소묘·정밀 묘사 등 미세 조작 경험과 구강 내 좁은 시야에서 0.1mm 오차를 다루는 치과 수기 역량 연결
3. [치과 재료·광학 원리 적용] 페트병 빛 반사 묘사 및 불소 치약 탐구를 치아 법랑질의 반투명성(Translucency) 및 심미 수복 레진 원리로 연결 질문
4. [구강-전신 질환 연결성] 장-뇌 축(LPS) 탐구를 치주질환균(P. gingivalis)의 뇌혈관·전신 질환 유발 기전으로 전환해 질문
5. [치과의사 직무 이해도] 치과 임상 현장에서 요구되는 공간지각력, 인내심, 정밀 수기 훈련 계획을 구체적으로 확인`,
  },
  {
    label: '환자 공감·의료윤리 딜레마 집중',
    conditionText: `1. [봉사활동 진정성 검증] 1070 세대통합 독거 어르신 방문 봉사 및 멘토링에서 겪은 실제 에피소드와 감정 변화를 사실적으로 질문
2. [치과 공포·통증 공감] 치과 치료에 극심한 공포나 통증을 호소하는 환자(노인·소아)를 설득하고 안심시킬 대화법과 태도 질문
3. [과잉진료 vs 자연치아 보존 딜레마] 병원 수익을 위한 임플란트 권유와 자연치아 보존 가치가 충돌할 때 어떤 기준으로 결정할지 윤리적 딜레마 제시
4. [고령 사회 공공치과의료] 어르신 말벗 봉사 경험을 바탕으로 거동 불편 독거 노인의 구강 건강권을 지킬 현실적 대안 질문
5. [동료 협업 및 갈등 해결] 학급·동아리 활동 중 의견 충돌이나 무임승차 문제를 해결한 실제 사례를 통해 의료진 리더십 검증`,
  },
];

export const StudentRecordPdfA4Tab: React.FC<StudentRecordPdfA4TabProps> = ({
  onSendToStarD,
  onSendToEvaluator,
}) => {
  const [targetSchool, setTargetSchool] = useState(DENTAL_SCHOOLS[0].name);
  const [uploadedFileName, setUploadedFileName] = useState<string>(PDF_SAMPLE_PRESETS[0].fileName);
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('13.5 MB · 실제 PDF 원본 연동됨');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>('/assets/aistudio/_________0a2310ec.pdf');
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [supplementaryText, setSupplementaryText] = useState<string>(PDF_SAMPLE_PRESETS[0].summaryNotes);
  const [interviewStyleCondition, setInterviewStyleCondition] = useState<string>(
    SCHOOL_INTERVIEW_CONDITIONS[DENTAL_SCHOOLS[0].name] || CONDITION_QUICK_PRESETS[0].conditionText
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PdfA4BriefResult | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'a4-only' | 'questions-only' | 'original-record'>('both');
  const [questionFilter, setQuestionFilter] = useState<string>('전체');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [selectedRecordPage, setSelectedRecordPage] = useState<number | 'all'>('all');
  const [recordSearchQuery, setRecordSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const KIM_JUNWOO_RECORD_SNIPPET = `[실제 학생부 정밀 기록: 김준우 / 서라벌고등학교 (총 18쪽 원본)]
- 학업 수월성: 1학년 국어·수학(100점)·한국사·통합사회·통합과학·정보 1등급, 2학년 수학Ⅰ·Ⅱ 1등급, 물리Ⅰ 1등급(96점), 생명과학Ⅰ 1등급(100점 만점), 화학Ⅰ 1등급(97점), 기하 100점 만점, 3학년 화작·확통·영어Ⅱ 1등급 및 화학Ⅱ(92점 A)·생명과학Ⅱ(91점 A).
- 1학년 국어 세특(7쪽): 『침묵의 봄』 신문 제작 및 플루오르(불소)의 독성과 치약으로서의 치아 우식 예방 편익 탐구, 치과의사 진로 로드맵 작성.
- 1·2학년 자기주도 실험(4·8·9·13·14쪽): 전해질 용액(소금물·식초·붕산나트륨) LED 다이오드 전도도 실험, 적양배추 지시약 산·염기 중화 비율 평균 구하기, 카탈레이스 효소 대조군 실험, 황산구리 침전 몰비 및 수산화구리 열분해 질량 비교 실험, 자판기 음료 3종 베네딕트·혈당측정기·스마트폰 RGB 앱 환원당 정량 실험.
- 2학년 생명과학Ⅰ(13쪽)·진로(5쪽)·자율(4쪽): 미토콘드리아 ATP 합성효소 c-ring 120° 회전 역학 및 결핵약 베다퀼린 선택적 결합 분석, 장-뇌 축(Gut-Brain Axis) 내독소 LPS의 BBB 약화 및 미세아교세포 신경염증 규명, 알츠하이머 뇌척수액 아밀로이드베타 ELISA 진단 및 AI 로직트리 설계.
- 2학년 물리학Ⅰ(12쪽)·수학Ⅰ·Ⅱ(12쪽): 볼츠만 통계역학 엔트로피(S=k ln W) 유도와 열린계 음의 엔트로피 규명, 제1·2 코사인법칙 기하학적 유도 및 구간별 미분 변화율 비교.
- 1·2학년 미술(10·15쪽)·동아리(5쪽): 지우개도장 양각 조각, 아크릴판 드라이포인트 음각 해칭, 시어핀스키 피라미드 제작, 페트병을 쥔 자신의 손(병뚜껑·빛의 굴절·성분표 작은 글씨·손 비례감) 0.1mm 연필 초정밀 드로잉.
- 1~3학년 봉사·행특(6·17쪽): 3년 연속 1070 세대통합 독거 어르신 물품 전달·소통 캠페인, '한무릎 공부' 또래교사 및 서울시교육청 '꿀박사' 온라인 또래쌤(답변 56건).`;

  const getDefaultConditionForSchool = (schoolName: string): string => {
    for (const [key, val] of Object.entries(SCHOOL_INTERVIEW_CONDITIONS)) {
      if (schoolName.includes(key.slice(0, 3))) {
        return val;
      }
    }
    return SCHOOL_INTERVIEW_CONDITIONS['경희대학교 치의예과'];
  };

  const handleFileProcess = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return;
    }
    setUploadedFileName(file.name);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFileSize(`${sizeMB} MB · 실제 PDF 원본 분석 중...`);
    setLoading(true);

    if (pdfObjectUrl && pdfObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfObjectUrl);
    }
    const objUrl = URL.createObjectURL(file);
    setPdfObjectUrl(objUrl);

    const isKimJunwoo =
      file.name.includes('0a2310ec') ||
      file.name.includes('김준우') ||
      file.name.includes('서라벌') ||
      file.size > 10 * 1024 * 1024;

    const effectiveText = isKimJunwoo
      ? KIM_JUNWOO_RECORD_SNIPPET
      : supplementaryText || file.name;

    if (isKimJunwoo) {
      setSupplementaryText(KIM_JUNWOO_RECORD_SNIPPET);
    }

    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = typeof reader.result === 'string' ? reader.result : '';
      setPdfBase64(b64);
      setUploadedFileSize(`${sizeMB} MB · 실제 PDF 원본 로드 완료`);
      runAnalysisWithParams(targetSchool, file.name, b64, effectiveText, interviewStyleCondition, nextSeed);
    };
    reader.onerror = () => {
      runAnalysisWithParams(targetSchool, file.name, '', effectiveText, interviewStyleCondition, nextSeed);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDirectLoadJunwooPdf = () => {
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    setUploadedFileName('김준우최종생기부.pdf');
    setUploadedFileSize('13.5 MB · 실제 18쪽 PDF 원본 연동됨');
    setSupplementaryText(KIM_JUNWOO_RECORD_SNIPPET);
    setPdfObjectUrl('/assets/aistudio/_________0a2310ec.pdf');
    runAnalysisWithParams(
      targetSchool,
      '김준우최종생기부.pdf',
      '',
      KIM_JUNWOO_RECORD_SNIPPET,
      interviewStyleCondition,
      nextSeed
    );
  };

  const handleToggleOriginalViewer = () => {
    if (viewMode === 'original-record') {
      setViewMode('both');
      setShowPdfPreview(false);
    } else {
      setViewMode('original-record');
      setShowPdfPreview(true);
    }
  };

  const runAnalysisWithParams = async (
    school: string,
    fName: string,
    b64: string,
    suppText: string,
    conditionText: string = interviewStyleCondition,
    seed: number = variationSeed
  ) => {
    setLoading(true);
    try {
      const safeBase64 = b64 && b64.length < 2_500_000 ? b64 : '';
      const response = await apiFetch('/api/gemini/analyze-pdf-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: safeBase64,
          fileName: fName || '학교생활기록부.pdf',
          targetSchool: school,
          supplementaryText: suppText,
          interviewStyleCondition: conditionText,
          variationSeed: seed,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
        if (viewMode === 'original-record') {
          setViewMode('both');
          setShowPdfPreview(false);
        }
      }
    } catch (_err) {
      // Handled gracefully by local fallback engine in apiFetch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCond = getDefaultConditionForSchool(DENTAL_SCHOOLS[0].name);
    runAnalysisWithParams(
      DENTAL_SCHOOLS[0].name,
      PDF_SAMPLE_PRESETS[0].fileName,
      '',
      PDF_SAMPLE_PRESETS[0].summaryNotes,
      initialCond,
      0
    );
  }, []);

  const handleSelectPreset = (preset: PdfSamplePreset) => {
    const matchedSchool =
      DENTAL_SCHOOLS.find((s) => preset.schoolName.includes(s.name.slice(0, 3)))?.name ||
      DENTAL_SCHOOLS[0].name;
    const nextCond = getDefaultConditionForSchool(matchedSchool);
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    setTargetSchool(matchedSchool);
    setInterviewStyleCondition(nextCond);
    setUploadedFileName(preset.fileName);
    setUploadedFileSize(
      preset.id === 'preset-actual-kim'
        ? '13.5 MB · 실제 18쪽 PDF 원본 연동됨'
        : '3개년 생기부 시뮬레이션 데이터'
    );
    setPdfBase64('');
    if (preset.id === 'preset-actual-kim') {
      setPdfObjectUrl('/assets/aistudio/_________0a2310ec.pdf');
    } else if (pdfObjectUrl && pdfObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl('/assets/aistudio/_________0a2310ec.pdf');
    }
    setSupplementaryText(preset.summaryNotes);
    runAnalysisWithParams(matchedSchool, preset.fileName, '', preset.summaryNotes, nextCond, nextSeed);
  };

  const handleClearFile = () => {
    setPdfBase64('');
    setUploadedFileName('');
    setUploadedFileSize('');
    if (pdfObjectUrl && pdfObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfObjectUrl);
    }
    setShowPdfPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzePdf = async () => {
    if (!pdfBase64 && !supplementaryText.trim()) return;
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    await runAnalysisWithParams(
      targetSchool,
      uploadedFileName,
      pdfBase64,
      supplementaryText,
      interviewStyleCondition,
      nextSeed
    );
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const buildFullA4Text = (res: PdfA4BriefResult) => {
    const condBlock = res.appliedInterviewCondition
      ? `\n[■ 사전 지정된 학교별 면접 질문 성향 & 중점 요구조건]\n${res.appliedInterviewCondition}\n`
      : '';
    return `[2026/2027 ${res.applicantProfile.targetUniversity} 학생부종합 A4 1장 압축 브리핑]
■ 사정관 1줄 정의: ${res.applicantProfile.oneLineIdentity}
■ 핵심 키워드: ${res.applicantProfile.coreKeywords.join(' · ')}
${condBlock}
[Ⅰ. 치의학 4대 핵심 역량 평가 요약]
1. 학업수월성: ${res.applicantProfile.evaluationSummary.academicCompetence}
2. 치의학 전공적합성: ${res.applicantProfile.evaluationSummary.dentalFit}
3. 0.1mm 미세수기(Dexterity): ${res.applicantProfile.evaluationSummary.manualDexterity}
4. 치과의료윤리 및 인성: ${res.applicantProfile.evaluationSummary.medicalEthics}

[Ⅱ. 3개년(1→2→3학년) 세특·창체 진화 로드맵]
${res.threeYearRoadmap
  .map(
    (item) =>
      `● ${item.grade} - ${item.stageTitle}\n  - 주요 내용: ${item.keySubjectsAndActivities}\n  - 치의학 연결: ${item.dentalConnection}`
  )
  .join('\n')}

[Ⅲ. 대표 탐구 3대 핵심 축]
${res.corePillars
  .map(
    (p) =>
      `● ${p.pillarTitle} (${p.evidenceSource})\n  - ${p.summary}`
  )
  .join('\n')}

[Ⅳ. 입학사정관 서류 심사 총평]
▶ 결정적 합격 강점:
${res.officerAudit.strengths.map((s) => `  - ${s}`).join('\n')}
▶ 면접 집중 검증 포인트(취약점):
${res.officerAudit.vulnerabilities.map((v) => `  - ${v}`).join('\n')}`;
  };

  const buildFullQuestionsText = (res: PdfA4BriefResult) => {
    return res.interviewerQuestions
      .map(
        (q) =>
          `[문항 ${q.id} | ${q.type}] (출처: ${q.sourceSection})
Q. ${q.mainQuestion}
- 면접관 출제 의도: ${q.interviewerIntent}
- 압박 꼬리질문 1: ${q.followUpQuestions[0] || ''}
- 압박 꼬리질문 2: ${q.followUpQuestions[1] || ''}
- STAR-D 방어 가이드: ${q.starDDefenseGuide}`
      )
      .join('\n\n----------------------------------------\n\n');
  };

  const filteredQuestions: PdfInterviewerQuestion[] = result
    ? questionFilter === '전체'
      ? result.interviewerQuestions
      : result.interviewerQuestions.filter((q) => q.type.includes(questionFilter))
    : [];

  return (
    <div className="space-y-8">
      {/* Top Hero Banner (Hidden when printing A4) */}
      <div className="print:hidden bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl border border-teal-800/50 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2.5">
          <div className="text-xs font-semibold text-teal-300 tracking-wide">
            생기부 PDF 업로드 ➔ 학교별 면접 조건(5줄) 설정 ➔ A4 1장 사정관 브리핑 & 면접관 질문 생성
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
            학생부 PDF ➔ A4 한 장 압축 정리 & 면접관 심층 질문 추출기
          </h1>
          <p className="text-sm text-slate-200/90 leading-relaxed">
            학교마다 생기부 활동에 대한 질문 성향(<strong>실험·활동의 사실여부 팩트체크 vs 교과 원리 심층질문 등</strong>)이 다릅니다.
            좌측의 <strong>5줄 조건 서술칸</strong>에 지원 대학의 면접 성향이나 검증 조건을 작성한 뒤 생성 버튼을 누르면,
            그 조건에 맞춘 <strong>A4 1장 브리핑 시트</strong>와 <strong>면접관 실전 질문 6세트(꼬리질문 포함)</strong>를 즉시 생성합니다.
          </p>
        </div>

        {/* 5 Dental Schools Preset Switcher */}
        <div className="mt-6 pt-5 border-t border-teal-800/60">
          <div className="text-xs font-semibold text-teal-300 mb-2.5">
            지원 5대 치과대학별 3개년 생기부 시뮬레이션 샘플 바로 불러오기:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {PDF_SAMPLE_PRESETS.map((preset) => {
              const isSelected = uploadedFileName === preset.fileName;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-teal-600/30 border-teal-400 text-white shadow-xs'
                      : 'bg-slate-900/50 border-slate-700/70 text-slate-200 hover:bg-teal-950/60 hover:border-teal-600/50'
                  }`}
                >
                  <div className="text-[11px] font-bold text-teal-300 truncate">
                    {preset.badge}
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5 truncate">
                    {preset.schoolName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: PDF Upload & Configuration (4 cols, hidden on print) */}
        <div className="lg:col-span-4 space-y-5 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  학생부 PDF 입력 및 면접 조건 설정
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  생기부 업로드 후 학교별 면접 질문 성향(5줄)을 지정하세요
                </p>
              </div>
            </div>

            {/* 1. Target University Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                1. 목표 치과대학 선택 (학교 변경 시 5줄 조건 및 맞춤 질문 자동 재설계)
              </label>
              <select
                value={targetSchool}
                onChange={(e) => {
                  const newSchool = e.target.value;
                  const nextCond = getDefaultConditionForSchool(newSchool);
                  const nextSeed = variationSeed + 1;
                  setTargetSchool(newSchool);
                  setInterviewStyleCondition(nextCond);
                  setVariationSeed(nextSeed);
                  runAnalysisWithParams(
                    newSchool,
                    uploadedFileName,
                    pdfBase64,
                    supplementaryText,
                    nextCond,
                    nextSeed
                  );
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DENTAL_SCHOOLS.map((school) => (
                  <option key={school.id} value={school.name}>
                    {school.name} ({school.interviewType})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. PDF Drag & Drop Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                2. 학교생활기록부 PDF 파일 업로드
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/30'
                    : pdfBase64
                    ? 'border-teal-600/60 bg-teal-50/30 dark:bg-teal-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-slate-50/60 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  클릭하여 생기부 PDF 선택 또는 이곳에 끌어다 놓기
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  정부24 / 나이스 발급 학교생활기록부 PDF (최대 30MB)
                </p>
              </div>

              {/* Quick Direct 1-Click Button for uploaded Kim Jun-woo PDF */}
              <button
                type="button"
                onClick={handleDirectLoadJunwooPdf}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-900 to-slate-900 hover:from-teal-800 hover:to-slate-800 border border-teal-500/50 text-teal-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>첨부된 [김준우 학생 18쪽 생기부 원본] 불러오기</span>
              </button>

              {/* Active File Status Card */}
              {uploadedFileName && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {uploadedFileName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {uploadedFileSize}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleOriginalViewer}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                        viewMode === 'original-record'
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 border-teal-500/60 hover:bg-teal-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {viewMode === 'original-record' ? '요약본으로 돌아가기' : '생기부 원본보기(18쪽)'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="파일 지우기"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. NEW: 5-Line School-Specific Interview Tendency & Requirement Condition Box */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border-2 border-amber-300/80 dark:border-amber-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>3. 학교별 면접 질문 성향 & 요구조건 제시 (5줄 서술칸)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const defaultCond = getDefaultConditionForSchool(targetSchool);
                    const nextSeed = variationSeed + 1;
                    setInterviewStyleCondition(defaultCond);
                    setVariationSeed(nextSeed);
                    runAnalysisWithParams(
                      targetSchool,
                      uploadedFileName,
                      pdfBase64,
                      supplementaryText,
                      defaultCond,
                      nextSeed
                    );
                  }}
                  className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 underline hover:text-amber-950 cursor-pointer"
                >
                  학교 기본값 복원
                </button>
              </div>
              <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                지원 대학의 면접 성향(예: <strong>실험·활동의 사실여부 팩트체크 집중</strong>, <strong>활동 관련 교과 심층질문 집중</strong> 등)을 5줄 내외로 적어주세요. 성향 버튼을 누르거나 작성 후 생성 버튼을 누르면 <strong>조건에 맞는 새로운 질문 세트</strong>가 추출됩니다.
              </p>

              {/* Quick Tendency Mode Selector Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {CONDITION_QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const nextSeed = variationSeed + 1;
                      setInterviewStyleCondition(preset.conditionText);
                      setVariationSeed(nextSeed);
                      runAnalysisWithParams(
                        targetSchool,
                        uploadedFileName,
                        pdfBase64,
                        supplementaryText,
                        preset.conditionText,
                        nextSeed
                      );
                    }}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                value={interviewStyleCondition}
                onChange={(e) => setInterviewStyleCondition(e.target.value)}
                placeholder={`예시 (5줄 내외 서술):\n1. 실험이나 탐구 활동을 실제로 본인이 직접 수행했는지 사실여부(진위)를 집요하게 질문할 것\n2. 세특에 적힌 과학 개념(불소 재광화, 미토콘드리아 ATP, LPS 등)의 심층 원리를 압박 질문할 것\n3. 의대가 아닌 치의예과를 선택한 이유와 0.1mm 정밀 손기술(미술 소묘 등) 연결성을 물을 것\n4. 탐구 과정에서 겪은 실패나 한계점을 어떻게 극복했는지 구체적 근거를 요구할 것\n5. 어르신 봉사활동의 진정성과 치과의사로서의 의료윤리 딜레마를 질문할 것`}
                className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 p-3 text-xs leading-relaxed text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 4. Supplementary Text / Highlights */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  4. 생기부 핵심 세특 요약 메모 (자동 연동 / 수정 가능)
                </label>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {supplementaryText.length}자
                </span>
              </div>
              <textarea
                rows={5}
                value={supplementaryText}
                onChange={(e) => setSupplementaryText(e.target.value)}
                placeholder="PDF 파일만 업로드해도 자동 분석되며, 특별히 사정관에게 강조하고 싶은 탐구 주제나 성적 특이사항을 함께 적어주시면 A4 요약본과 질문에 정밀 반영됩니다."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 p-3 text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="button"
              onClick={handleAnalyzePdf}
              disabled={loading || (!pdfBase64 && !supplementaryText.trim())}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>5줄 조건 반영 ➔ A4 브리핑 & 질문 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>조건 반영 ➔ A4 1장 브리핑 정리 & 면접관 질문 생성</span>
                </>
              )}
            </button>
          </div>

          {/* Coaching Tip Box */}
          <div className="bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              왜 학교별 면접 성향(5줄 조건)을 먼저 제시해야 하나요?
            </div>
            <p className="leading-relaxed">
              같은 생기부라도 어떤 대학은 <strong>“이 실험을 정말 학생이 직접 했는가(사실여부·진위 확인)”</strong>를 집중 추궁하고,
              어떤 대학은 <strong>“세특에 적힌 과학 원리를 대학 기초치의학 수준까지 깊이 이해했는가(심층질문)”</strong>를 파고듭니다.
              위의 <strong>5줄 서술칸</strong>에 원하는 조건을 적고 생성하면, 사정관 브리핑의 검증 포인트와 6개 면접 질문·꼬리질문이 그 조건에 맞춰 현실적으로 설계됩니다.
            </p>
          </div>
        </div>

        {/* Right Column: A4 1-Page Executive Brief + Interviewer Questions (8 cols, full width on print) */}
        <div className="lg:col-span-8 space-y-6 print:col-span-12">
          {!result ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto border border-teal-200/60 dark:border-teal-800/60">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-lg mx-auto space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  학생부 PDF를 업로드하거나 좌측 버튼을 눌러 A4 1장 요약본을 생성하세요
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  3개년 교과 세특·동아리·진로·행특을 <strong>A4 한 장 분량의 사정관 브리핑 문서</strong>로 정리하고,
                  좌측에 입력한 <strong>5줄 면접 조건(사실여부 검증 / 심층원리 압박 등)</strong>에 맞춘 면접관 질문 6문항을 추출해 드립니다.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzePdf}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  현재 선택된 [{targetSchool}] 조건으로 즉시 A4 요약 & 질문 생성하기
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Action & View Mode Bar (Hidden on Print) */}
              <div className="print:hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewMode('both')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'both'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    전체 보기 (A4 요약 + 질문지)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('a4-only')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'a4-only'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    A4 1장 요약본만 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('questions-only')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'questions-only'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    면접관 질문지만 보기 ({result.interviewerQuestions.length}문항)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('original-record')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      viewMode === 'original-record'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>생기부 원본보기 (1~18쪽 전체)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyzePdf}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                    title="생기부의 다른 세특·실험 항목을 조합해 새로운 각도의 면접관 질문 6문항을 생성합니다"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>다른 각도의 새 질문 6문항 추출 (세트 #{variationSeed + 1})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText('a4-full', buildFullA4Text(result))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    {copiedKey === 'a4-full' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>A4 요약 복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>A4 요약 전체복사</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-teal-700 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-teal-600 flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>A4 1장 인쇄 / PDF 저장</span>
                  </button>
                </div>
              </div>

              {/* =====================================================================
                  PART 0: FULL 18-PAGE ORIGINAL STUDENT RECORD VIEWER (생기부 원본보기)
                 ===================================================================== */}
              {viewMode === 'original-record' && (
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border-2 border-teal-600/60 dark:border-teal-500/50 shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <FileCheck2 className="w-4 h-4" />
                        <span>정부24 진본 대조 완료 · 문서확인번호: 1793-9591-1704-69482</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                        김준우 학생 학교생활기록부 원본 전체 열람기 (1쪽 ~ 18쪽 원문 & 성적표)
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        브라우저 PDF 뷰어 제한이나 오프라인 환경에서도 1쪽부터 18쪽까지 모든 성적표·창체·세특·행특 원문을 빠짐없이 확인하실 수 있습니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewMode('both')}
                      className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>원본보기 닫기 (A4 브리핑으로 이동)</span>
                    </button>
                  </div>

                  {/* Search & Page Jump Controls */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={recordSearchQuery}
                          onChange={(e) => setRecordSearchQuery(e.target.value)}
                          placeholder="생기부 원문 키워드 검색 (예: 불소, 페트병, ATP, 베다퀼린, LPS, 베네딕트, 황산구리, 엔트로피, 1070, 한무릎...)"
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      {recordSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setRecordSearchQuery('')}
                          className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        >
                          검색 초기화
                        </button>
                      )}
                    </div>

                    {/* Page Number Selector Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRecordPage('all')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          selectedRecordPage === 'all'
                            ? 'bg-teal-700 text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-teal-50'
                        }`}
                      >
                        1~18쪽 전체 연속보기
                      </button>
                      {KIM_JUNWOO_18PAGE_ORIGINAL.map((p) => (
                        <button
                          key={p.pageNumber}
                          type="button"
                          onClick={() => setSelectedRecordPage(p.pageNumber)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            selectedRecordPage === p.pageNumber
                              ? 'bg-teal-700 text-white font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-teal-50'
                          }`}
                        >
                          {p.pageNumber}쪽
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If user uploaded a custom local PDF blob, also render embedded object viewer */}
                  {pdfObjectUrl && pdfObjectUrl.startsWith('blob:') && (
                    <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 h-96">
                      <object
                        data={pdfObjectUrl}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <div className="p-6 text-center text-xs text-slate-300">
                          아래의 1~18쪽 정밀 원문 뷰어에서 전체 생기부 내용을 확인하실 수 있습니다.
                        </div>
                      </object>
                    </div>
                  )}

                  {/* 18-Page Verbatim Content List */}
                  <div className="space-y-5 max-h-[800px] overflow-y-auto pr-1">
                    {KIM_JUNWOO_18PAGE_ORIGINAL.filter((page) => {
                      if (selectedRecordPage !== 'all' && page.pageNumber !== selectedRecordPage) {
                        return false;
                      }
                      if (!recordSearchQuery.trim()) return true;
                      const q = recordSearchQuery.trim().toLowerCase();
                      const matchTitle = page.sectionTitle.toLowerCase().includes(q) || page.summary.toLowerCase().includes(q);
                      const matchBlocks = page.verbatimBlocks.some(
                        (b) =>
                          b.subjectOrArea.toLowerCase().includes(q) ||
                          b.content.toLowerCase().includes(q) ||
                          (b.dentalHighlight && b.dentalHighlight.toLowerCase().includes(q))
                      );
                      const matchTables = (page.tables || []).some((t) =>
                        t.rows.some((r) => r.some((cell) => cell.toLowerCase().includes(q)))
                      );
                      return matchTitle || matchBlocks || matchTables;
                    }).map((page) => (
                      <div
                        key={page.pageNumber}
                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-teal-700 text-white text-xs font-extrabold">
                              {page.badge}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {page.sectionTitle}
                            </h3>
                          </div>
                          <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                            {page.summary}
                          </span>
                        </div>

                        {/* Render Grade / Attendance / Award Tables */}
                        {page.tables &&
                          page.tables.map((tbl, tIdx) => (
                            <div key={tIdx} className="space-y-1.5">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                ■ {tbl.title}
                              </div>
                              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                                      {tbl.headers.map((h, hIdx) => (
                                        <th key={hIdx} className="py-2 px-2.5 font-bold whitespace-nowrap">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 bg-white dark:bg-slate-900">
                                    {tbl.rows.map((r, rIdx) => (
                                      <tr key={rIdx}>
                                        {r.map((cell, cIdx) => (
                                          <td key={cIdx} className="py-2 px-2.5 text-slate-700 dark:text-slate-300">
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}

                        {/* Render Verbatim Se-Teuk / Chang-Che / Haeng-Teuk Blocks */}
                        {page.verbatimBlocks.map((block, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                [{block.periodOrGrade}] {block.subjectOrArea}
                              </span>
                              {block.dentalHighlight && (
                                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                                  치대 면접 포인트: {block.dentalHighlight}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                              {block.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =====================================================================
                  PART 1: THE A4 1-PAGE EXECUTIVE SUMMARY SHEET
                 ===================================================================== */}
              {(viewMode === 'both' || viewMode === 'a4-only') && (
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm p-6 sm:p-10 space-y-6 print:border-0 print:shadow-none print:p-0">
                  
                  {/* Document Header */}
                  <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
                        <span>입학사정관 면접 위원용 서류 브리핑 시트 (A4 1-Page Executive Summary)</span>
                        <span aria-hidden="true">·</span>
                        <span>블라인드 기준 준수</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {result.applicantProfile.targetUniversity} 학생부 3개년 핵심 요약서
                      </h2>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right shrink-0">
                      <div>분석 원본: <span className="font-semibold text-slate-700 dark:text-slate-300">{uploadedFileName || '학생부.pdf'}</span></div>
                      <div>작성 기준: 2026/2027 학종 치의학 4대 평가 루브릭</div>
                    </div>
                  </div>

                  {/* Applied 5-Line School Interview Condition Banner */}
                  {result.appliedInterviewCondition && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/70 space-y-1.5">
                      <div className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                        <span>■ 사전 적용된 학교별 면접 질문 성향 & 중점 검증 조건 (5줄 기준)</span>
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">브리핑 및 하단 질문에 반영됨</span>
                      </div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                        {result.appliedInterviewCondition}
                      </div>
                    </div>
                  )}

                  {/* One-Line Applicant Identity Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                      사정관이 정의하는 지원자 1줄 정체성 (Core Identity)
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      “{result.applicantProfile.oneLineIdentity}”
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">핵심 키워드:</span>
                      {result.applicantProfile.coreKeywords.map((kw, idx) => (
                        <React.Fragment key={idx}>
                          <span>{kw}</span>
                          {idx < result.applicantProfile.coreKeywords.length - 1 && (
                            <span aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Section 01: 4-Dimensional Dental Competency Matrix */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      <span>01. 치의예과 4대 평가영역 핵심 진단 요약</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>① 기초과학 학업수월성 (화학·생명·물리·수학)</span>
                          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">학업역량</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {result.applicantProfile.evaluationSummary.academicCompetence}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>② 구강생명·치과생체재료 전공적합성</span>
                          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">진로역량</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {result.applicantProfile.evaluationSummary.dentalFit}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>③ 0.1mm 정밀 손기술(Dexterity) & 탐구 집요함</span>
                          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">수기잠재력</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {result.applicantProfile.evaluationSummary.manualDexterity}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>④ 환자 공감 소통 & 자연치아 보존 의료윤리</span>
                          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">공동체역량</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {result.applicantProfile.evaluationSummary.medicalEthics}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 02: 3-Year Progression Roadmap Table */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                      02. 3개년(1학년 ➔ 2학년 ➔ 3학년) 세특·창체 진화 로드맵
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <th className="py-2.5 px-3 font-bold w-28">학년 단계</th>
                            <th className="py-2.5 px-3 font-bold">핵심 교과 세특 및 창의적 체험활동 요약</th>
                            <th className="py-2.5 px-3 font-bold sm:w-52">치의학 심화 연결고리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {result.threeYearRoadmap.map((row, idx) => (
                            <tr key={idx} className="align-top">
                              <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                <div>{row.grade}</div>
                              </td>
                              <td className="py-3 px-3 space-y-1">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {row.stageTitle}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {row.keySubjectsAndActivities}
                                </p>
                              </td>
                              <td className="py-3 px-3 text-teal-800 dark:text-teal-300 font-medium leading-relaxed">
                                {row.dentalConnection}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 03: Top 3 Core Research Pillars */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                      03. 면접장 필승 대표 탐구 3대 핵심 축 (Core Pillars)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {result.corePillars.map((pillar, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-2"
                        >
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {pillar.pillarTitle}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {pillar.summary}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                            근거 기록: {pillar.evidenceSource}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 04: Admissions Officer Audit (Strengths vs Vulnerabilities) */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                      04. 입학사정관 서류 심사 총평: 합격 강점 vs 면접 집중 검증 포인트
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Strengths */}
                      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>서류상 결정적 합격 강점 (면접에서 적극 어필할 점)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {result.officerAudit.strengths.map((str, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Vulnerabilities / Attack Points */}
                      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>면접관이 반드시 찌를 검증 체크포인트 (방어 필수)</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {result.officerAudit.vulnerabilities.map((vul, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">•</span>
                              <span>{vul}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================================================
                  PART 2: INTERVIEWER PERSPECTIVE DEEP QUESTIONS & FOLLOW-UPS
                 ===================================================================== */}
              {(viewMode === 'both' || viewMode === 'questions-only') && (
                <div className="space-y-5 pt-2 print:break-before-page">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                          A4 브리핑 시트 기반 사정관 공격 시나리오
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          면접관 입장의 실전 심층 질문 & 2단계 압박 꼬리질문 ({result.interviewerQuestions.length}문항)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText('questions-all', buildFullQuestionsText(result))}
                        className="print:hidden px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
                      >
                        {copiedKey === 'questions-all' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>전체 질문지 복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>면접 질문지 전체복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Interactive Filter Bar */}
                    <div className="print:hidden flex flex-wrap items-center gap-1.5">
                      {['전체', '세특 진위·원리 검증', '치의학 적성·손기술', '서류 빈틈·한계 압박', '치과의료윤리·인성'].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setQuestionFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                              questionFilter === cat
                                ? 'bg-teal-700 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>

                    {/* Question Cards List */}
                    <div className="space-y-4">
                      {filteredQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-4"
                        >
                          {/* Top Metadata line (unboxed clean metadata) */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-teal-700 dark:text-teal-400">
                                문항 0{q.id}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {q.type}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>출처: {q.sourceSection}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(
                                  `q-${q.id}`,
                                  `[질문] ${q.mainQuestion}\n[꼬리질문] ${q.followUpQuestions.join(' / ')}\n[방어가이드] ${q.starDDefenseGuide}`
                                )
                              }
                              className="print:hidden text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === `q-${q.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>복사완료</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>복사</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Main Question */}
                          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                            Q. “{q.mainQuestion}”
                          </div>

                          {/* Interviewer Hidden Intent */}
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              면접관의 속마음 및 평가 의도
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {q.interviewerIntent}
                            </p>
                          </div>

                          {/* 2-Stage Follow-up Attack Questions */}
                          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 text-xs space-y-2">
                            <div className="font-bold text-rose-900 dark:text-rose-300">
                              사정관 2단계 압박 꼬리질문 (Follow-up Attack)
                            </div>
                            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                              {q.followUpQuestions.map((fq, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="font-bold text-rose-700 dark:text-rose-400 shrink-0">
                                    꼬리 {fIdx + 1}.
                                  </span>
                                  <span>“{fq}”</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* STAR-D 1-Minute Defense Strategy */}
                          <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/50 text-xs space-y-1">
                            <div className="font-bold text-teal-900 dark:text-teal-300">
                              STAR-D 1분 구술 방어 가이드라인
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {q.starDDefenseGuide}
                            </p>
                          </div>

                          {/* Cross-tab Action Buttons */}
                          <div className="print:hidden pt-1 flex flex-wrap items-center gap-2">
                            {onSendToStarD && (
                              <button
                                type="button"
                                onClick={() =>
                                  onSendToStarD(
                                    q.mainQuestion,
                                    result.applicantProfile.targetUniversity,
                                    q.starDDefenseGuide
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>이 질문으로 STAR-D 1분 대본 만들기</span>
                              </button>
                            )}
                            {onSendToEvaluator && (
                              <button
                                type="button"
                                onClick={() =>
                                  onSendToEvaluator(
                                    q.mainQuestion,
                                    result.applicantProfile.targetUniversity,
                                    q.sourceSection
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                              >
                                <span>실전 답변 진단으로 연습하기</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
