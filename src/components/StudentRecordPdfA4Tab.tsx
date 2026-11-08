import React, { useState, useRef } from 'react';
import { DENTAL_SCHOOLS } from '../data/dentalMasterData';
import { PdfA4BriefResult, PdfInterviewerQuestion } from '../types/interview';
import {
  FileText,
  Upload,
  Sparkles,
  Printer,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Microscope,
  GraduationCap,
  FileCheck2,
  Eye,
  BookOpen
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

export const StudentRecordPdfA4Tab: React.FC<StudentRecordPdfA4TabProps> = ({
  onSendToStarD,
  onSendToEvaluator,
}) => {
  const [targetSchool, setTargetSchool] = useState(DENTAL_SCHOOLS[0].name);
  const [uploadedFileName, setUploadedFileName] = useState<string>(PDF_SAMPLE_PRESETS[0].fileName);
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('샘플 데이터 로드됨');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [supplementaryText, setSupplementaryText] = useState<string>(PDF_SAMPLE_PRESETS[0].summaryNotes);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PdfA4BriefResult | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'a4-only' | 'questions-only'>('both');
  const [questionFilter, setQuestionFilter] = useState<string>('전체');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return;
    }
    setUploadedFileName(file.name);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFileSize(`${sizeMB} MB · 실제 PDF 원본 업로드됨`);

    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
    }
    const objUrl = URL.createObjectURL(file);
    setPdfObjectUrl(objUrl);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPdfBase64(reader.result);
      }
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

  const handleSelectPreset = (preset: PdfSamplePreset) => {
    setTargetSchool(preset.schoolName);
    setUploadedFileName(preset.fileName);
    setUploadedFileSize('3개년 생기부 시뮬레이션 데이터');
    setPdfBase64('');
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl(null);
    }
    setShowPdfPreview(false);
    setSupplementaryText(preset.summaryNotes);
  };

  const handleClearFile = () => {
    setPdfBase64('');
    setUploadedFileName('');
    setUploadedFileSize('');
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl(null);
    }
    setShowPdfPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzePdf = async () => {
    if (!pdfBase64 && !supplementaryText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/analyze-pdf-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          fileName: uploadedFileName || '학교생활기록부.pdf',
          targetSchool,
          supplementaryText,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error('Error analyzing PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const buildFullA4Text = (res: PdfA4BriefResult) => {
    return `[2026/2027 ${res.applicantProfile.targetUniversity} 학생부종합 A4 1장 압축 브리핑]
■ 사정관 1줄 정의: ${res.applicantProfile.oneLineIdentity}
■ 핵심 키워드: ${res.applicantProfile.coreKeywords.join(' · ')}

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
            생기부 PDF 업로드 ➔ A4 1장 사정관 요약 브리핑 & 면접관 압박 질문 생성
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
            학생부 PDF ➔ A4 한 장 압축 정리 & 면접관 심층 질문 추출기
          </h1>
          <p className="text-sm text-slate-200/90 leading-relaxed">
            나이스(NEIS)나 정부24에서 발급받은 <strong>학교생활기록부 PDF 파일</strong>을 그대로 업로드하세요.
            20~30페이지에 달하는 3개년 세특·창체·행특 기록을 <strong>면접관이 면접장에 들고 들어가는 A4 1장 분량의 브리핑 시트</strong>로 압축 정리하고,
            서류의 강점과 빈틈을 파고드는 <strong>면접관 입장의 실전 질문 6세트(꼬리질문 포함)</strong>를 즉시 생성합니다.
          </p>
        </div>

        {/* 5 Dental Schools Preset Switcher */}
        <div className="mt-6 pt-5 border-t border-teal-800/60">
          <div className="text-xs font-semibold text-teal-300 mb-2.5">
            지원 5대 치과대학별 3개년 생기부 시뮬레이션 샘플 바로 불러오기:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
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
                  학생부 PDF 입력 및 설정
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  PDF 원본 업로드 또는 주요 세특 텍스트 보충 가능
                </p>
              </div>
            </div>

            {/* 1. Target University Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                1. 목표 치과대학 선택 (5개교 집중)
              </label>
              <select
                value={targetSchool}
                onChange={(e) => setTargetSchool(e.target.value)}
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
                className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
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
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto mb-2.5">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  클릭하여 생기부 PDF 선택 또는 이곳에 끌어다 놓기
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  정부24 / 나이스 발급 학교생활기록부 PDF (최대 30MB)
                </p>
              </div>

              {/* Active File Status Card */}
              {uploadedFileName && (
                <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
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
                    {pdfObjectUrl && (
                      <button
                        type="button"
                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {showPdfPreview ? '미리보기 닫기' : '원본 보기'}
                      </button>
                    )}
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

              {/* Embedded PDF Preview if user uploaded a real PDF */}
              {showPdfPreview && pdfObjectUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 h-72">
                  <iframe
                    src={pdfObjectUrl}
                    title="Uploaded Student Record PDF Preview"
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* 3. Supplementary Text / Highlights */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. 핵심 세특 요약 메모 / 강조 희망 사항 (선택)
                </label>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {supplementaryText.length}자
                </span>
              </div>
              <textarea
                rows={7}
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
                  <span>생기부 A4 1장 압축 및 면접관 질문 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>A4 1장 브리핑 정리 & 면접관 질문 생성</span>
                </>
              )}
            </button>
          </div>

          {/* Coaching Tip Box */}
          <div className="bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              왜 생기부를 'A4 1장'으로 압축해야 하나요?
            </div>
            <p className="leading-relaxed">
              실제 면접장에서 면접관 교수님들은 지원자 1명당 25페이지가 넘는 생기부를 일일이 다 넘겨보지 못합니다.
              입학사정관이 사전 심사 단계에서 추려놓은 <strong>A4 1장 분량의 핵심 요약표(1~3학년 심화 흐름 + 검증 필요 체크포인트)</strong>를 보고 질문을 던집니다.
              아드님이 본인 생기부의 <strong>A4 1장 조감도</strong>를 머릿속에 넣고 들어가면 어떤 기습 질문에도 흔들리지 않습니다.
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
                  면접관이 서류를 보며 형광펜을 칠 <strong>진위 검증·치의학 손기술·서류 약점 압박 질문 6문항</strong>을 추출해 드립니다.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzePdf}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  현재 선택된 [{targetSchool}] 샘플로 즉시 A4 요약 & 질문 체험하기
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Action & View Mode Bar (Hidden on Print) */}
              <div className="print:hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewMode('both')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
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
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
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
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      viewMode === 'questions-only'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    면접관 질문지만 보기 ({result.interviewerQuestions.length}문항)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText('a4-full', buildFullA4Text(result))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap"
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
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-teal-700 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-teal-600 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>A4 1장 인쇄 / PDF 저장</span>
                  </button>
                </div>
              </div>

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
