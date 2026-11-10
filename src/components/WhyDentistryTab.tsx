import React, { useState } from 'react';
import { WHY_DENTAL_DEFENSES, WhyDentalDefense } from '../data/dentalMasterData';
import { apiFetch } from '../utils/standaloneApiEngine';
import { 
  Target, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';

export const WhyDentistryTab: React.FC = () => {
  const [selectedDefense, setSelectedDefense] = useState<WhyDentalDefense>(WHY_DENTAL_DEFENSES[0]);
  const [studentPitch, setStudentPitch] = useState(WHY_DENTAL_DEFENSES[0].samplePitch);
  const [desiredFocus, setDesiredFocus] = useState(WHY_DENTAL_DEFENSES[0].coreKeyword);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSelectDefense = (item: WhyDentalDefense) => {
    setSelectedDefense(item);
    setStudentPitch(item.samplePitch);
    setDesiredFocus(item.coreKeyword);
    setResult(null);
  };

  const handleEvaluate = async () => {
    if (!studentPitch.trim() || loading) return;
    setLoading(true);
    try {
      const response = await apiFetch('/api/gemini/why-dentistry-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer: studentPitch,
          desiredFocus,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-cyan-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide border border-cyan-500/30">
            <Target className="w-3.5 h-3.5" />
            11개 치대 면접 100% 빈출 킬러 질문 집중 훈련실
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            "왜 의대가 아니라 꼭 치의예과인가?"
          </h1>
          <p className="text-sm text-cyan-100/80 leading-relaxed">
            사정관이 가장 혐오하는 답변은 <em>"의대 갈 성적이 부족해서"</em>라는 뉘앙스가 풍기거나, 
            의과와 전혀 구별되지 않는 <em>"아픈 사람을 돕고 싶어서"</em> 식의 일반론입니다.
            구강악안면 고유의 가치, 손끝의 완결적 인술, 비가역적 경조직의 예방 철학으로 사정관의 고개를 끄덕이게 만드세요.
          </p>
        </div>

        {/* 5 Strategies Navigator */}
        <div className="mt-6 pt-5 border-t border-cyan-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {WHY_DENTAL_DEFENSES.map((item, idx) => {
            const isSelected = selectedDefense.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectDefense(item)}
                className={`p-3 rounded-xl text-left text-xs transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-900/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-[11px] font-bold text-cyan-400 mb-0.5">전략 0{idx + 1}</div>
                <div className="font-semibold line-clamp-2">{item.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Logic Breakdown & Student Pitch Input */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Selected Strategy Deep Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              선택된 논리 프레임워크
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedDefense.title}
            </h2>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>핵심 논리:</strong> {selectedDefense.logicSummary}
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/40 text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed">
              <strong>의과와의 차별화 방패:</strong> {selectedDefense.whyNotMedicine}
            </div>

            {/* Trap alert */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-xs space-y-1">
              <div className="font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                면접관이 던질 기습 역공 함정
              </div>
              <p className="text-rose-800 dark:text-rose-300/90 leading-relaxed">
                {selectedDefense.professorsTrap}
              </p>
              <p className="text-teal-800 dark:text-teal-400 font-medium pt-1">
                <strong>방어 핵심:</strong> {selectedDefense.defenseKey}
              </p>
            </div>
          </div>

          {/* Student Pitch Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                수험생 지원동기 답변 (1분 분량 / 약 350~430자)
              </label>
              <span className="text-xs text-slate-500 tabular-nums">
                {studentPitch.length}자
              </span>
            </div>

            <textarea
              rows={8}
              value={studentPitch}
              onChange={(e) => setStudentPitch(e.target.value)}
              placeholder="지원동기를 적어보세요. 왜 다른 의학계열이 아닌 '치의학'이어야만 하는지 본인의 진솔한 경험이나 철학을 담아보세요."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 leading-relaxed"
            />

            <button
              type="button"
              disabled={loading || !studentPitch.trim()}
              onClick={handleEvaluate}
              className="w-full py-3.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  사정관의 시선으로 지원동기 해부 중...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  "왜 치대인가?" 설득력 진단 & 킬러 꼬리질문 받기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Evaluation or Guidance */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-slate-500">지원동기 설득력 판정</div>
                  <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {result.verdict}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">전공 차별화 지수</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {result.differentiatorScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Analysis points */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <strong className="text-slate-900 dark:text-slate-200">진정성 분석:</strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {result.analysis.authenticityComment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs space-y-1">
                  <strong className="text-cyan-900 dark:text-cyan-200">함정 회피 여부:</strong>
                  <p className="text-cyan-800 dark:text-cyan-300 leading-relaxed">
                    {result.analysis.trapAvoided}
                  </p>
                </div>

                {result.analysis.coreStrength && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                    <strong className="text-emerald-900 dark:text-emerald-200">가장 호감을 준 핵심 문장:</strong>
                    <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed italic">
                      "{result.analysis.coreStrength}"
                    </p>
                  </div>
                )}
              </div>

              {/* Killer Follow up questions */}
              {result.killerTailQuestions && result.killerTailQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    교수가 이어서 던질 킬러 압박 질문 (실전 대비)
                  </div>
                  <div className="space-y-2">
                    {result.killerTailQuestions.map((q: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                        <strong>Q{i + 1}.</strong> {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved pitch */}
              {result.improvedPitch && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    사정관의 만점을 부르는 1분 황금 지원동기 대본
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {result.improvedPitch}
                  </div>
                </div>
              )}

              {/* Advice */}
              {result.professorAdvice && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-xs space-y-1 text-indigo-900 dark:text-indigo-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    치의학 주임교수의 합격 조언
                  </div>
                  <p className="leading-relaxed">{result.professorAdvice}</p>
                </div>
              )}
            </div>
          ) : (
            /* Guide when no evaluation yet */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-600" />
                "왜 의대가 아닌 치대인가?" 3대 감점 공식 & 합격 공식
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 space-y-1">
                  <div className="font-bold text-rose-900 dark:text-rose-300">
                    ❌ 사정관이 즉시 거르는 3대 오답 패턴
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-rose-800 dark:text-rose-300/90 leading-relaxed">
                    <li>"어릴 적 치과 치료가 무서웠는데 친절한 치과의사 선생님을 보고..." ➔ <em>초등학생 수준의 진부한 감성팔이</em></li>
                    <li>"의사는 생명을 살리지만 치과의사는 사람들을 편하게 해줍니다" ➔ <em>의사와 치과의사 둘 다 깎아내리는 모호한 발언</em></li>
                    <li>"손재주가 좋아서 치대가 적성에 맞을 것 같았습니다" ➔ <em>그럼 외과의사나 조각가를 하지 왜 치대인가라는 역공 직격탄</em></li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">
                    ⭕ 사정관을 전율케 하는 합격 공식 3요소
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                    <li><strong>비가역적 경조직의 예방적 가치:</strong> 피부나 간과 달리 한 번 파괴되면 재생되지 않는 법랑질을 지키는 숭고함.</li>
                    <li><strong>삶의 질(QoL)과 인간 존엄:</strong> 씹는 즐거움(저작)과 타인 앞에서의 환한 미소를 되찾아주는 즉각적 치료 효능.</li>
                    <li><strong>1:1 체어사이드 완결성:</strong> 진단부터 미세 외과적 처치, 교합 형성까지 의사가 처음부터 끝까지 집도하는 수공예적 인술.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
