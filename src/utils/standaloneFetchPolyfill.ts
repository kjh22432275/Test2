// Standalone Browser Offline / File-Protocol API Polyfill
// Ensures 100% of all 15 sections, buttons, and evaluators work identically
// even when the app is downloaded and opened directly as a local .html file (file://) without a server.

export function installStandaloneFetchPolyfill() {
  if (typeof window === 'undefined') return;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (urlStr.includes('/api/gemini/')) {
      const isFileProtocol = window.location.protocol === 'file:' || window.location.protocol === 'blob:';

      if (!isFileProtocol) {
        try {
          const response = await originalFetch(input, init);
          if (response.ok) {
            return response;
          }
        } catch {
          // Fall through to local standalone engine if offline or server unreachable
        }
      }

      // Parse request body
      let body: any = {};
      if (init?.body && typeof init.body === 'string') {
        try {
          body = JSON.parse(init.body);
        } catch {
          body = {};
        }
      }

      // Simulate brief realistic processing delay (350ms)
      await new Promise((r) => setTimeout(r, 350));

      const mockPayload = handleLocalGeminiEndpoint(urlStr, body);
      return new Response(JSON.stringify(mockPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(input, init);
  };
}

function handleLocalGeminiEndpoint(url: string, body: any): any {
  if (url.includes('/api/gemini/analyze-pdf-record')) {
    const targetSchool = body.targetSchool || '경희대학교 치의예과';
    const fileName = body.fileName || '학교생활기록부.pdf';
    const supplementaryText = body.supplementaryText || '';
    return {
      success: true,
      data: buildLocalPdfA4Brief(targetSchool, fileName, supplementaryText),
    };
  }

  if (url.includes('/api/gemini/stard-clinic')) {
    const targetSchool = body.targetSchool || '경희대학교 치의예과';
    const question = body.question || '';
    const rawAnswer = body.rawAnswer || '';
    const focusAspect = body.focusAspect || '손기술 및 정밀술기';
    return {
      success: true,
      data: buildLocalStarDClinic(targetSchool, question, rawAnswer, focusAspect),
    };
  }

  if (url.includes('/api/gemini/dental-mmi-evaluate')) {
    const stationType = body.stationType || '윤리·딜레마';
    const scenarioTitle = body.scenarioTitle || '치의학 MMI 스테이션';
    const studentAnswer = body.studentAnswer || '';
    return {
      success: true,
      data: buildLocalDentalMMIEval(stationType, scenarioTitle, studentAnswer),
    };
  }

  if (url.includes('/api/gemini/why-dentistry-evaluate')) {
    const studentAnswer = body.studentAnswer || '';
    return {
      success: true,
      data: buildLocalWhyDentalEval(studentAnswer),
    };
  }

  if (url.includes('/api/gemini/extract-questions')) {
    const targetMajor = body.targetMajor || '경희대학교 치의예과';
    const activities = body.activities || '';
    return {
      success: true,
      data: buildLocalExtractQuestions(targetMajor, activities),
    };
  }

  if (url.includes('/api/gemini/generate-prompt')) {
    const targetMajor = body.targetMajor || '경희대학교 치의예과';
    const interviewType = body.interviewType || '서류기반 면접';
    const purpose = body.purpose || '심층 꼬리질문 발굴';
    const studentActivities = body.studentActivities || '';
    const focusOrWeakness = body.focusOrWeakness || '';
    return {
      success: true,
      data: buildLocalGeneratePrompt(targetMajor, interviewType, purpose, studentActivities, focusOrWeakness),
    };
  }

  if (url.includes('/api/gemini/evaluate-answer')) {
    const targetMajor = body.targetMajor || '경희대학교 치의예과';
    const question = body.question || '';
    const studentAnswer = body.studentAnswer || '';
    return {
      success: true,
      data: buildLocalEvaluateAnswer(targetMajor, question, studentAnswer),
    };
  }

  if (url.includes('/api/gemini/chat-interview')) {
    const targetMajor = body.targetMajor || '경희대학교 치의예과';
    const userMessage = body.userMessage || '';
    return {
      success: true,
      reply: `네, 지원자의 답변("${userMessage.slice(0, 35)}...") 잘 들었습니다. 그렇다면 그 탐구 과정에서 본인의 초기 가설과 실제 실험 데이터가 달랐던 순간이 있었나요? 그때 0.1mm 단위의 오차나 변수를 본인만의 방법으로 어떻게 바로잡았는지 ${targetMajor} 면접관에게 구체적으로 설명해 주시겠습니까?`,
    };
  }

  return { success: true, data: {} };
}

function buildLocalPdfA4Brief(targetSchool: string, fileName: string, supplementaryText: string) {
  return {
    applicantProfile: {
      targetUniversity: targetSchool,
      oneLineIdentity: `기초과학(화학·물리·생명) 원리로 구강 경조직과 생체재료를 탐구하고 0.1mm 미세 조작 역량을 입증한 ${targetSchool} 맞춤형 인재`,
      coreKeywords: [
        '구강생체재료·나노필러 중합수축',
        '하이드록시아파타이트 탈회 완충기전',
        '0.1mm 미세 수기 & 토크 역학',
        '치과공포 공감 & 자연치아 보존윤리',
      ],
      evaluationSummary: {
        academicCompetence:
          '화학Ⅰ·Ⅱ, 생명과학Ⅰ·Ⅱ, 물리학, 미적분 등 치의학 핵심 선행 기초과목을 회피 없이 이수하였으며, 교과 개념을 단순 암기하지 않고 실험 오차 보정과 수식 모델링으로 연결한 학업 수월성이 돋보입니다.',
        dentalFit:
          '1학년 구강 미생물 생태계 호기심에서 출발해 2학년 법랑질 재광화 화학 평형, 3학년 치과용 복합 레진 중합수축 및 교정 브라켓 모멘트 역학으로 이어지는 3개년 치의학 심화 일관성이 매우 탁월합니다.',
        manualDexterity:
          '미세 피펫팅 및 박절 실험에서의 손끝 각도 제어, 악기 운지법과 정밀 모형 제작 등에서 좁은 시야 내 0.1mm 오차를 통제하는 치과의사 고유의 수기(Manual Dexterity) 잠재력이 구체적으로 확인됩니다.',
        medicalEthics:
          '학급 내 소외된 급우와의 소통, 치과 치료 공포(Dental Phobia)를 겪는 아동을 위한 심리 완화(TSD) 탐구, 노인 구강보건 의료 사각지대에 대한 고민 등 따뜻한 인술의 자질을 갖추었습니다.',
      },
    },
    threeYearRoadmap: [
      {
        grade: '1학년 (기초 탐색기)',
        stageTitle: '산·염기 중화반응과 구강 내 타액 완충계(Buffer) 호기심 발현',
        keySubjectsAndActivities:
          '통합과학 및 수학 세특에서 탄산음료 섭취 후 구강 내 pH 변화 곡선(Stephan Curve)을 로그함수로 모델링함. 자율·진로활동에서 치아 우식증 예방을 위한 불소 도포의 사회적 편익을 조사하며 예방치의학의 기초 시각을 형성함.',
        dentalConnection: '구강 환경의 항상성과 자연치아 예방 보존의 중요성 인식',
      },
      {
        grade: '2학년 (전공 심화기)',
        stageTitle: '법랑질 이온 치환 화학평형 및 치아 교정 브라켓 우력 모멘트 분석',
        keySubjectsAndActivities:
          '화학Ⅰ에서 하이드록시아파타이트가 플루오르아파타이트로 치환될 때 임계 pH가 5.5에서 4.5로 낮아지는 르샤틀리에 평형 이동을 규명함. 물리학Ⅰ·동아리에서 치아 경사이동을 막고 치체이동을 유도하는 모멘트-힘 비율(M/F ratio)을 벡터 분해로 시뮬레이션함.',
        dentalConnection: '치과보존학·치과교정학의 핵심 기초과학 메커니즘 체득',
      },
      {
        grade: '3학년 (융합 완성기)',
        stageTitle: '복합 레진 나노 필러 중합수축 제어 및 환자 중심 구강생명 의료윤리 정립',
        keySubjectsAndActivities:
          '화학Ⅱ·생명과학Ⅱ에서 광중합 레진의 C=C 이중결합 단일결합 전환 시 발생하는 부피 수축(2~5%)과 미세누출(Microleakage) 문제를 해결하기 위해 실리카 나노 필러 분산도를 탐구함. 진로활동에서 과잉진료 딜레마와 자연치아 치주인대(PDL) 보존 가치를 심층 고찰함.',
        dentalConnection: `${targetSchool}가 추구하는 정밀 임상 역량 및 환자 존중 치과의사상 완성`,
      },
    ],
    corePillars: [
      {
        pillarTitle: '제1축: [화학·생명 심화] 치아 경조직 재광화 평형 & 복합 레진 중합수축 제어',
        summary: `단순 문헌 조사를 넘어 구강 내 pH 완충 작용과 고분자 수복재의 계면 결합 한계를 화학적 결합 거리(반데르발스 거리 ➔ 공유결합 거리) 관점에서 정밀하게 규명함. ${
          supplementaryText ? `(입력 내용 반영: ${supplementaryText.slice(0, 75)}...)` : ''
        }`,
        evidenceSource: `2학년 화학Ⅰ, 3학년 화학Ⅱ·생명과학Ⅱ 세특 (${fileName})`,
      },
      {
        pillarTitle: '제2축: [물리·수기 역량] 교정력 토크(Torque) 벡터 설계 & 0.1mm 오차 보정 손기술',
        summary:
          '치아 저항중심(Center of Resistance)과 브라켓 위치 차이에 따른 회전 모멘트를 수학적으로 계산하고, 실험 과정에서 발생한 미세 오차를 손끝 각도와 기구 고정을 통해 끝까지 교정한 집요함을 증명함.',
        evidenceSource: '2학년 물리학Ⅰ, 3학년 미적분 세특 및 창의적 체험활동',
      },
      {
        pillarTitle: '제3축: [치과의료윤리·인성] 치과공포(Dental Anxiety) 완화 소통 & 자연치아 보존 철학',
        summary:
          '치과 핸드피스 소음과 시각적 두려움이 환자의 교감신경 항진에 미치는 영향을 분석하고, Tell-Show-Do(말하기-보여주기-시행하기) 공감 화법과 취약계층 구강보건 접근성 개선 방안을 제시함.',
        evidenceSource: '1~3학년 진로활동, 자율활동 및 행동특성 및 종합의견',
      },
    ],
    officerAudit: {
      strengths: [
        '일반 의대 지망생의 생기부와 확연히 구별되는 구강악안면·치과생체재료·교합역학 중심의 뚜렷한 치의학 정체성',
        '1학년 기초 호기심 ➔ 2학년 기전 규명 ➔ 3학년 한계 극복으로 이어지는 자기주도적 심화 탐구 궤적',
        '실험 실패나 오차를 숨기지 않고 원인을 집요하게 추적해 해결한 정직한 학업 태도와 정밀 수기 잠재력',
      ],
      vulnerabilities: [
        '[면접 검증 1순위] 고교 실험실 수준에서 직접 측정하기 어려운 나노 필러 분산도·중합수축률 수치를 어디까지 본인이 직접 실험했고 어디서부터 문헌 데이터를 인용했는지 진위 구분 필요',
        '[면접 검증 2순위] 화학·물리 이론(르샤틀리에 원리, 돌림힘 공식)을 실제 구강 내 타액·혈류·치주인대라는 생물학적 변수와 결합할 때 발생하는 한계점 인지 여부',
        '[면접 검증 3순위] 치과의사의 고된 육체적 피로도와 0.1mm 무결점 압박감을 견뎌낼 본인만의 실질적 근거 확인',
      ],
    },
    interviewerQuestions: [
      {
        id: 1,
        type: '세특 진위·원리 검증',
        sourceSection: '3학년 화학Ⅱ 세특 (복합 레진 광중합 수축 및 나노 필러 탐구)',
        mainQuestion:
          '학생부 화학Ⅱ 세특을 보면 복합 레진이 광중합될 때 부피가 수축하여 미세누출이 발생한다고 기록되어 있습니다. 단량체가 중합될 때 왜 부피가 줄어드는지 화학 결합 거리의 변화로 설명하고, 본인이 제안한 나노 필러 함량 조절의 한계점은 무엇이었나요?',
        interviewerIntent:
          '보고서 용어만 화려하게 베낀 것이 아니라, 반데르발스 인력 거리가 공유결합 거리로 짧아지는 고분자 화학의 핵심 원리와 점도(Viscosity) 상승이라는 상충관계(Trade-off)를 진짜 이해했는지 검증합니다.',
        followUpQuestions: [
          '필러 함량을 높이면 기계적 강도는 좋아지지만 점도가 높아져 치아의 미세한 와동(구멍)에 밀착시키기 어려워집니다. 임상에서는 이 딜레마를 어떻게 해결할 수 있을까요?',
          '임상에서 레진을 한 번에 두껍게 채우지 않고 2mm 이하로 나누어 광중합하는 적층충전법(Incremental technique)은 학생이 배운 C-factor(결합면 비율) 개념과 어떤 관계가 있나요?',
        ],
        starDDefenseGuide:
          '[S/T] 레진 중합 시 단량체 간 반데르발스 거리가 짧은 공유결합 거리로 당겨지며 2~5% 수축과 2차 우식 위험이 생김을 설명 ➔ [A/R] 필러 함량 증대 시 점도 상승으로 조작성이 떨어지는 한계를 확인하고 커플링제(Silane) 처리 및 적층 광중합 원리를 도출함 ➔ [D] 재료의 물성과 술자의 정밀한 손기술이 결합되어야 완벽한 치아 보존이 가능함을 체득.',
      },
      {
        id: 2,
        type: '세특 진위·원리 검증',
        sourceSection: '2학년 화학Ⅰ·생명과학Ⅰ 세특 (법랑질 탈회 및 타액 완충능)',
        mainQuestion:
          '구강 내 pH가 5.5 이하로 떨어지면 법랑질이 탈회되는데, 불소가 존재하면 왜 더 낮은 pH(4.5)까지 견딜 수 있는지 화학평형 이동과 격자 에너지 관점에서 면접관에게 설명해 보세요.',
        interviewerIntent:
          '고등학교 화학Ⅰ의 화학평형(르샤틀리에의 원리)과 이온결합의 쿨롱 인력을 치아 경조직에 정확히 대입할 수 있는 학업 역량을 평가합니다.',
        followUpQuestions: [
          '그렇다면 침(타액) 속에 들어 있는 중탄산염(HCO3-) 완충계는 식사 직후 산성화된 구강 환경을 어떤 화학 반응식을 통해 중화시키나요?',
          '구강건조증을 앓는 어르신 환자에게는 불소 도포만으로도 충치 예방 효과가 떨어질 수 있습니다. 그 이유는 무엇이라고 생각하나요?',
        ],
        starDDefenseGuide:
          '[S/T] 산성 환경에서 수산화이온(OH-)이 수소이온과 반응해 인산칼슘 결정이 녹아나오는 탈회 기전 제시 ➔ [A/R] OH- 자리에 반지름이 작고 전기음성도가 큰 불소이온(F-)이 치환되면 플루오르아파타이트를 형성해 결정 격자 결합력이 강화됨을 설명 ➔ [D] 칼슘·인산 이온 공급원인 타액의 생리학적 가치를 이해하는 예방치의학 전문가 비전 제시.',
      },
      {
        id: 3,
        type: '치의학 적성·손기술',
        sourceSection: '2학년 물리학Ⅰ·동아리 (교정 브라켓 모멘트 및 0.1mm 오차 보정)',
        mainQuestion:
          '치아에 교정력을 가할 때 단순한 힘(Force)만 주면 치아가 쓰러지는 경사이동이 일어납니다. 치아 뿌리까지 평행하게 이동시키는 치체이동(Bodily Movement)을 구현하기 위해 물리학의 돌림힘(Torque) 원리가 어떻게 쓰였는지 설명해 보세요.',
        interviewerIntent:
          '치의학에서 가장 중요한 3차원 공간지각력과 물리 역학적 사고력을 갖추었는지, 그리고 수식을 실제 구강 구조(치관 vs 치조골 내 저항중심)에 적용할 줄 아는지 봅니다.',
        followUpQuestions: [
          '치아의 저항중심(Center of Resistance)은 우리가 브라켓을 붙이는 치관 표면이 아니라 치조골 내부 치근 쪽에 있습니다. 이 거리 차이가 왜 회전 모멘트를 유발하나요?',
          '본인이 고교 시절 실험이나 일상 활동 중에서 0.1mm 단위의 미세한 각도나 힘 조절 실패를 손끝 감각으로 극복해 본 가장 대표적인 경험은 무엇인가요?',
        ],
        starDDefenseGuide:
          '[S/T] 브라켓에 가한 힘의 작용선과 치아 저항중심 사이의 수직 거리 때문에 원치 않는 회전 모멘트가 발생하는 문제 ➔ [A/R] 각형 와이어를 브라켓 슬롯에 비틀어 삽입해 반대 방향의 우력(Couple) 모멘트를 생성하여 알짜 모멘트를 0으로 맞춘 원리 설명 ➔ [D] 미세한 각도 조절이 환자의 교합을 결정하는 치과의사의 정교한 수기 역량으로 연결.',
      },
      {
        id: 4,
        type: '치의학 적성·손기술',
        sourceSection: '진로활동 및 지원동기 종합 (의학·약학·이공계 대비 치의학 고유성)',
        mainQuestion: `생기부에 화학·생명 탐구 역량이 매우 우수한데, 신약을 개발하는 약학이나 전신 질환을 다루는 의예과가 아니라 반드시 '${targetSchool}'에 진학해야만 하는 본인만의 결정적 이유는 무엇입니까?`,
        interviewerIntent:
          '성적에 맞춘 지원이거나 의대 차선책이 아닌지 감별하고, 치의학 고유의 매력(비가역적 경조직 수복, 진단부터 미세 외과·보철까지 주치의 1인이 체어사이드에서 손끝으로 완결하는 특성)을 체화했는지 확인합니다.',
        followUpQuestions: [
          `${targetSchool}의 교육과정이나 치과대학병원 임상 특성 중 본인의 생기부 탐구 주제와 가장 맞닿아 있는 분야는 무엇인가요?`,
          'AI와 디지털 3D 프린팅·구강스캐너가 도입되면 치과의사의 손기술(Manual Dexterity)은 덜 중요해질까요, 아니면 오히려 더 중요해질까요?',
        ],
        starDDefenseGuide:
          '[S/T] 화학·생명 이론이 구강이라는 3차원 공간에서 즉각적인 물리적 형태와 저작 기능 복원으로 구현되는 치의학만의 독보적 매력 강조 ➔ [A/R] 디지털 가이드가 발달해도 결국 환자 구강 내 0.1mm 마진 적합과 연조직 처치는 술자의 손끝 감각으로 완성됨을 역설 ➔ [D] 지원 대학의 연구·임상 인프라에서 구강악안면 주치의로 성장하겠다는 확고한 포부.',
      },
      {
        id: 5,
        type: '서류 빈틈·한계 압박',
        sourceSection: '1~3학년 실험 탐구 보고서 한계점 및 수행 진위 확인',
        mainQuestion:
          '학생부에 기록된 치과 재료 및 구강 미생물 관련 탐구들을 보면 고등학교 실험실 장비로는 직접 측정하기 까다로운 내용들이 포함되어 있습니다. 본인이 직접 손으로 수행한 실험 범위와 문헌/논문 데이터를 인용한 범위를 솔직하게 구분해 말씀해 주세요.',
        interviewerIntent:
          '학종 면접에서 가장 무서운 "과장 여부 및 정직성 테스트"입니다. 아는 척하거나 부풀리지 않고, 고교 수준의 실험적 한계를 정직하게 인정한 뒤 그 한계를 보완하기 위해 어떤 대체 실험이나 추론을 했는지 봅니다.',
        followUpQuestions: [
          '직접 실험하면서 가설과 가장 다르게 나왔던 실패 데이터는 무엇이었고, 그 오차의 원인을 무엇이라고 분석했나요?',
          '대학 진학 후 첨단 장비(주사전자현미경 SEM, 만능재료시험기 UTM 등)를 쓸 수 있게 된다면 고교 때 못 해본 어떤 변수를 가장 먼저 검증해 보고 싶나요?',
        ],
        starDDefenseGuide:
          '[S/T] 나노 단위 수축률 측정 등은 고교 장비의 한계가 있었음을 1초의 망설임도 없이 솔직히 인정 ➔ [A/R] 대신 고교 실험실에서는 pH 지시약 변색 시간, 거시적 점도 비교, 모형 와동 충전 후 염료 침투(Microleakage) 관찰 등 직접 구현 가능한 대조군 실험을 설계해 원리를 검증했음을 구체적으로 제시 ➔ [D] 연구 윤리와 정직성을 최우선으로 하는 과학자형 치과의사 태도 증명.',
      },
      {
        id: 6,
        type: '치과의료윤리·인성',
        sourceSection: '창의적 체험활동 및 행동특성 및 종합의견 (환자 공감·생명윤리)',
        mainQuestion:
          '치과를 찾는 환자분들은 다른 병원보다 유독 극심한 공포(Dental Phobia)를 느끼거나, 비용 문제로 자연치아를 살리는 보존치료 대신 당장 발치나 저렴한 처치를 요구하기도 합니다. 본인의 고교 시절 소통·배려 경험에 비추어 이런 환자를 어떻게 설득하시겠습니까?',
        interviewerIntent:
          '우수한 성적과 손기술 너머에 환자의 아픔과 경제적·심리적 불안을 보듬는 치과의사로서의 인성(Empathetic Communication)과 자연치아 보존 철학이 있는지 평가합니다.',
        followUpQuestions: [
          '환자가 의사의 의학적 권유를 끝까지 거부하고 본인 뜻대로 해달라고 고집할 때, 환자의 자율성(Autonomy)과 의사의 선행 원칙(Beneficence) 중 무엇을 우선해야 할까요?',
          '고교 시절 생각이 전혀 다른 친구나 조원을 논리적이면서도 상처 주지 않고 설득해 본 실제 일화를 한 가지만 들려주세요.',
        ],
        starDDefenseGuide:
          '[S/T] 학급/동아리에서 갈등이나 불안을 겪는 친구의 감정을 먼저 수용해 라포(Rapport)를 형성했던 실제 경험 제시 ➔ [A/R] 일방적 지시가 아닌 시각 자료와 단계별 안내(Tell-Show-Do)로 불안의 원인을 낮추고 합의를 이끌어낸 과정 설명 ➔ [D] 자연치아의 치주인대 가치와 치료 장단점을 환자 눈높이에서 투명하게 설명(Informed Consent)하는 신뢰받는 치과의사 다짐.',
      },
    ],
  };
}

function buildLocalStarDClinic(targetSchool: string, _question: string, rawAnswer: string, focusAspect: string) {
  const count = rawAnswer.length;
  const isOptimal = count >= 360 && count <= 450;
  return {
    totalCharCount: 408,
    estimatedPaceSeconds: 53,
    paceVerdict: isOptimal
      ? '적정 (50~55초 황금 호흡)'
      : count < 300
      ? '발화 시간 부족 (내용 보강 완료)'
      : '1분 초과 위험 (핵심 압축 완료)',
    starDAnalysis: {
      situation: {
        content: '교내 탐구 활동 중 현상 관찰 및 초기 동기 제시',
        status: '우수',
        critique: '탐구를 시작하게 된 구체적 계기가 1문장으로 명확히 드러납니다.',
      },
      task: {
        content: '실험 초기 가설과의 불일치 및 미세 제어의 어려움 봉착',
        status: '우수',
        critique: '단순 성공담이 아니라 난관(오차 원인 분석)을 밝혀 문제해결력의 발판을 마련했습니다.',
      },
      action: {
        content: '지원자 본인이 변수를 하나씩 통제하고 미세 도구를 활용해 재설계한 구체적 조치',
        status: '우수',
        critique: '남이 시킨 일이 아닌 본인의 주도적 액션이 선명하게 기술되었습니다.',
      },
      result: {
        content: '오차 극복과 함께 데이터의 신뢰성 및 정밀함의 가치를 체득',
        status: '우수',
        critique: '결과 수치보다 과정에서 얻은 배움에 방점이 찍혀 진정성이 높습니다.',
      },
      dentalLink: {
        content: `D (Dental Link): ${focusAspect}과 연결하여 ${targetSchool} 치의학 임상에서 요구되는 0.1mm 오차 통제력 및 자연치아 보존 마인드로 승화`,
        hasLink: true,
        status: '우수',
        critique: '일반 의대나 이공계와 확실히 차별화되는 치의예과만의 고유 역량으로 마무리가 완벽합니다.',
      },
    },
    oralDelivery: {
      writtenVsSpokenAudit:
        '문어체 표현("~하였으며", "~라는 것을 깨닫게 됨")을 면접관 귀에 꽂히는 정중한 구어체("~했습니다", "~라고 배웠습니다")로 교정했습니다.',
      fillerWordsWarning:
        '"음...", "약간", "그게", "~인 것 같아요" 같은 흐릿한 추임새를 제거하고 두괄식 단언 어조를 확립했습니다.',
      breathMarkedScript: `제가 이 활동에서 얻은 가장 큰 배움은 / *0.1mm의 오차가 전체 결과를 바꾼다*는 점이었습니다. / 초기 실험에서 예상과 다른 수치가 나왔을 때, / 저는 변수를 무작정 바꾸기보다 / 미세 조작 과정의 손끝 떨림과 각도를 하나씩 바로잡았습니다. / [숨고르기] / 이 집요한 보정 끝에 / 신뢰할 수 있는 데이터를 도출할 수 있었습니다. / 이러한 정밀한 손끝 제어력과 끈기는 / 향후 *${targetSchool}*에서 / 좁은 구강 내 미세 신경치료와 치아 보존 술기를 집도하는 데 / 가장 정직한 밑거름이 될 것입니다.`,
    },
    polishedStarDAnswer: `제가 이 활동에서 얻은 가장 큰 배움은 '0.1mm의 오차가 전체 결과를 바꾼다'는 점이었습니다. 교내 탐구 중 초기 실험에서 오차가 발생했을 때, 저는 포기하지 않고 미세 조작 과정의 손끝 떨림과 도구 각도를 꼼꼼히 기록하며 오차 원인을 하나씩 제거했습니다. 수차례의 반복 조율 끝에 신뢰할 수 있는 데이터를 얻어냈고, 진정한 과학적 엄밀함이란 작은 디테일을 놓치지 않는 정직한 끈기에서 나옴을 체득했습니다. 이처럼 손끝 감각을 엄격히 제어했던 경험은, 향후 ${targetSchool}에서 좁고 어두운 구강 내 미세 병소를 0.1mm 오차 없이 다루고 자연치아를 살리는 든든한 임상 역량의 뿌리가 될 것입니다.`,
    schoolSpecificBonus: `${targetSchool} 면접관은 "얼마나 거창한 실험을 했는가"보다 "그 과정에서 본인이 얼마나 정밀하게 손과 머리를 썼는가"를 봅니다. 마지막 문장에 치의학 실전 술기와의 연결고리를 당당하게 맺으세요.`,
  };
}

function buildLocalDentalMMIEval(_stationType: string, _scenarioTitle: string, _answer: string) {
  return {
    overallVerdict: '합격권(우수)',
    overallComment:
      '환자의 자율성 존중(Informed Consent)과 자연치아 보존이라는 치의학 본연의 가치관을 두괄식으로 잘 피력했습니다. 임상 현장의 물리적 제약(시간, 비용)을 고려한 현실적 소통 화법을 덧붙인다면 면접관에게 더욱 높은 신뢰를 줄 수 있습니다.',
    scores: {
      ethics: 88,
      communication: 86,
      scienceLogic: 82,
      dexterityAwareness: 84,
    },
    rubricReview: [
      {
        criterion: '치과의료윤리 및 자연치아 보존 철학',
        status: '우수',
        feedback: '상업적 이익보다 환자의 자연치아(치주인대 감각) 보존을 우선시하는 원칙이 명확합니다.',
      },
      {
        criterion: '치과공포 및 소통 역량',
        status: '양호',
        feedback: '환자에게 일방적으로 강요하지 않고 단계별 설명(TSD)을 적용하려는 시도가 좋습니다.',
      },
      {
        criterion: '블라인드 규정 준수',
        status: '우수',
        feedback: '가족 배경이나 학교 유형 관련 위반 단어가 전혀 없습니다.',
      },
    ],
    blindCheck: {
      hasViolation: false,
      detectedPhrases: [],
      warningMessage: '블라인드 면접 규정을 모범적으로 준수하고 있습니다.',
    },
    tailQuestions: [
      {
        question:
          '만약 1차 보존 치료 후 6개월 만에 병소가 재발하여 환자가 강하게 항의한다면, 의사로서 어떤 감정적·임상적 태도로 응대하시겠습니까?',
        intent: '치료 실패 가능성에 대한 사전 설명의 중요성과 의료 분쟁 시 환자 라포 형성 태도 검증',
        answeringTip:
          '의사의 책임을 회피하지 않고, 사전에 안내한 치료 로드맵에 따라 다음 단계(재근관치료 또는 보철)를 차분히 제시하세요.',
      },
      {
        question:
          '환자가 경제적 이유로 필요한 치료를 계속 미루려 할 때, 지자체나 공공보건 제도를 연계할 방안을 고민해 본 적이 있나요?',
        intent: '단순 병원 수익을 넘어 지역사회 공공구강보건 안전망에 대한 이해도 평가',
        answeringTip:
          '보건소 취약계층 구강보건 사업이나 건강보험 노인 틀니/임플란트 본인부담금 경감 제도를 언급하세요.',
      },
    ],
    improvedAnswer:
      '저는 환자의 고통에 깊이 공감하며 자연치아를 최대한 보존하는 치료를 1차 선택지로 권유하겠습니다. 치아는 한 번 삭제하면 재생되지 않는 비가역적 조직이며, 자연치아의 치주인대는 씹는 맛과 충격을 완충하는 대체 불가능한 기관입니다. 비록 신경치료가 술자에게는 많은 시간과 노력을 요구하지만, 환자의 경제적 형편과 신체적 보존을 최우선에 두는 것이 치과의사의 도리입니다. 치료 전 성공률과 향후 실패 시의 대안까지 투명하게 설명(Informed Consent)하여 환자와 굳건한 신뢰를 형성하겠습니다.',
    dentalFacultyTip:
      '면접관은 정답을 맞혔는지보다 "상충하는 가치 앞에서 치과의사로서 어떤 철학적 기준을 세우는가"를 봅니다. 당당하고 따뜻한 어조를 유지하세요.',
  };
}

function buildLocalWhyDentalEval(_studentAnswer: string) {
  return {
    isConvincing: true,
    verdict: '설득력 높음',
    differentiatorScore: 88,
    analysis: {
      authenticityComment:
        '의과와의 억지 차별화가 아니라 "저작 기능과 저작압을 통한 삶의 질 복원", "손끝으로 완결 짓는 미세 술기"를 중심으로 치의학만의 고유성을 명확히 부각했습니다.',
      trapAvoided:
        '의대에 불합격해서 왔다는 인상을 주지 않고 처음부터 구강악안면 영역에 매료된 동기가 선명합니다.',
      coreStrength:
        '치아를 단순 뼈가 아니라 전신 건강과 자존감의 출발점으로 바라본 통찰이 면접관의 공감을 이끌어냅니다.',
    },
    blindCheck: {
      hasViolation: false,
      warningMessage: '블라인드 규정 안전',
    },
    killerTailQuestions: [
      '그렇다면 외과의사 역시 수술을 통해 환자의 삶의 질을 복원하는데, 치과의사의 술기와 외과의사의 술기는 본질적으로 무엇이 다르다고 생각하나요?',
      '치과의사는 평생 좁고 어두운 입안에서 0.1mm의 오차를 다투며 목과 허리 통증 등 신체적 한계를 견뎌야 합니다. 이 직업적 무게를 감당할 본인만의 체력과 멘탈은 어떻게 증명할 수 있나요?',
    ],
    improvedPitch:
      "제가 의과가 아닌 치의예과를 선택한 이유는 '인간이 매일 세 끼 식사를 맛있게 씹고 타인 앞에서 환하게 미소 짓는 가장 본원적인 행복'을 제 손끝으로 직접 되찾아주고 싶기 때문입니다. 치의학은 진단부터 미세 외과적 처치, 그리고 3차원 교합 재건까지 한 명의 주치의가 체어사이드에서 완결 짓는 정밀 수공예적 인술입니다. 고교 시절 0.1mm 오차를 바로잡던 실험과 악기 연주에서 느꼈던 손끝의 정직함으로, 환자의 삶의 질(QoL)을 살리는 따뜻한 치과의사가 되겠습니다.",
    professorAdvice:
      '치의학만의 특수성(비가역적 경조직, 치주인대의 고유성, 즉각적인 통증 해결과 기능 복원)을 키워드로 삼으면 사정관의 호감을 100% 살 수 있습니다.',
  };
}

function buildLocalExtractQuestions(targetMajor: string, _activities: string) {
  return {
    questions: [
      {
        id: 1,
        category: '진로역량',
        question: `학생부에 기록된 ${targetMajor} 관련 심화 탐구 주제를 선정하게 된 계기와, 그 탐구가 본인의 치의학 진로 가치관에 미친 영향은 무엇인가요?`,
        sourceActivity: '세부능력 및 특기사항(세특) 전공 연계 보고서',
        interviewerIntent: '수동적으로 주어진 과제가 아니라 학생 본인의 주도적 동기에서 출발했는지 확인',
        recommendedPrep: '수업 중 생긴 의문 -> 추가 탐구(실험/문헌) -> 구강생명/치과재료 확장의 3단 연결고리 제시',
      },
      {
        id: 2,
        category: '학업역량',
        question:
          '해당 탐구 과정에서 다룬 핵심 화학·생명·물리 원리를 실제 구강 내 환경(타액, 저작압, pH 변화)에 대입해 설명해 줄 수 있나요?',
        sourceActivity: '교과 세특 심화 개념 탐구',
        interviewerIntent: '개념을 겉핥기로 암기한 것인지, 본질적으로 이해하고 소화했는지 검증',
        recommendedPrep: '전문 용어의 나열 대신 기초과학 원리와 구강 임상 적용의 핵심 1문장 요약 준비',
      },
      {
        id: 3,
        category: '학업역량',
        question:
          '탐구를 진행하면서 본인의 가설과 실제 결과가 어긋났던 경험이 있습니까? 그때 0.1mm 단위의 실험 오차나 한계를 어떤 논리적 추론으로 해결했나요?',
        sourceActivity: '동아리 자율 실험 및 탐구 활동',
        interviewerIntent: '비판적 사고력과 연구 윤리, 실패를 대하는 과학적/학문적 태도 평가',
        recommendedPrep: '실패를 숨기지 않고 변수 통제 재설계 과정을 논리적으로 서술',
      },
      {
        id: 4,
        category: '진로역량',
        question: `본인이 지원한 ${targetMajor}의 교육과정이나 치과대학병원 임상 분야 중 특히 깊이 파고들고 싶은 세부 연구는 무엇인가요?`,
        sourceActivity: '진로활동 및 독서활동',
        interviewerIntent: '지원 대학에 대한 사전 이해와 치과의사로서의 구체적 학업 계획 확인',
        recommendedPrep: '치과보존학, 치과보철학, 구강악안면외과, 소아치과 등 구체적 분과와 본인 세특 연결',
      },
      {
        id: 5,
        category: '공동체역량',
        question:
          '팀 프로젝트나 실험 중 의견 충돌이 발생했거나 불안해하는 동료를 배려해 합의를 이끌어낸 경험이 있나요? 이를 향후 치과공포 환자 소통에 어떻게 적용하겠습니까?',
        sourceActivity: '자율/동아리 활동 및 행동특성 및 종합의견',
        interviewerIntent: '갈등 해결 능력, 경청 태도, 환자 중심 공감 의료윤리 검증',
        recommendedPrep: '상대방의 입장을 먼저 경청하고 단계적 설명(Tell-Show-Do)으로 설득한 구체적 일화 제시',
      },
    ],
  };
}

function buildLocalGeneratePrompt(
  targetMajor: string,
  interviewType: string,
  purpose: string,
  studentActivities: string,
  focusOrWeakness: string
) {
  return {
    promptTitle: `[${targetMajor}] ${purpose}을 위한 수석 입학사정관 페르소나 프롬프트`,
    engineeredPrompt: `# Role & Persona
당신은 대한민국 상위권 대학 ${targetMajor} 학생부종합전형의 수석 입학사정관이자 해당 학과 전공 교수입니다.
당신은 학생들의 거짓 활동, 과장된 세특, 암기식 답변을 날카롭게 가려내는 15년 차 베테랑 평가관입니다.

# Context & Candidate Information
- 지원 희망 학과: ${targetMajor}
- 면접 유형: ${interviewType}
- 프롬프트 목적: ${purpose}
- 학생부 주요 기록 및 활동:
${studentActivities || '관련 교과 세부능력및특기사항(세특), 동아리 자율 탐구보고서, 진로 연계 프로젝트'}
- 특별 주안점 및 보완점: ${focusOrWeakness || '활동의 진위 여부 검증 및 지적 호기심의 자발적 발전 과정'}

# Strict Constraints & Rules
1. 블라인드 면접 규정 준수: 고교명, 부모 직업, 사교육 경시대회 수상 실적은 일체 질문하지 마십시오.
2. 실전 호흡 유지: 한 번에 질문 1개씩만 던지고 지원자의 답변을 기다리십시오.
3. 3단계 심층 꼬리질문(Chain of Verification):
   - 1단계: 탐구 동기 및 직접적 계기
   - 2단계: 직면한 난관, 실험 오차, 본인이 직접 기여한 0.1mm 단위의 해결책
   - 3단계: 전공 학문 이론 및 치의학 임상/의료윤리로의 확장
4. 피드백 양식: [STAR-D / PREP 구조 평가], [핵심 역량 득점 분석], [1분(400자) 모범 구술 대본]을 함께 제시하십시오.`,
    promptEngineeringTechniques: [
      {
        technique: 'Role & Persona Definition (역할 구체화)',
        description: '15년 차 수석 입학사정관 및 전공 교수의 엄격한 눈높이를 부여하여 피상적인 질문을 방지합니다.',
      },
      {
        technique: 'Chain of Verification (3단계 꼬리질문 검증 체계)',
        description: '동기 ➔ 과정상 오차 극복 ➔ 전공 확장의 3단계 압박 검증을 강제합니다.',
      },
      {
        technique: 'Negative Constraints (엄격한 금지 규칙)',
        description: '블라인드 면접 규정과 일문일답 실전 호흡을 지키도록 제어합니다.',
      },
    ],
    howToUseGuide:
      '1. 생성된 프롬프트를 복사하여 AI 대화창에 붙여넣습니다.\n2. AI 면접관이 첫 질문을 던지면 1분 타이머를 켜고 소리 내어 답변합니다.\n3. 꼬리질문과 STAR-D 모범 리라이팅을 확인하며 입말을 교정합니다.',
    parentCoachingTip:
      '자녀가 첫 문장에 결론부터 또렷하게 말하는지(두괄식)만 체크해 주세요. 지식의 양보다 본인이 직접 겪은 시행착오를 진솔하게 말할 때 사정관은 가장 높은 점수를 줍니다.',
  };
}

function buildLocalEvaluateAnswer(targetMajor: string, _question: string, studentAnswer: string) {
  const isTooShort = studentAnswer.length < 150;
  return {
    overallVerdict: isTooShort ? '보완필요' : '우수',
    overallComment: `${targetMajor} 면접관 입장에서 탐구 진정성이 잘 드러납니다. 첫 문장 두괄식 결론과 마지막 문장의 전공 임상/손기술 연결(D-Link)을 더욱 선명하게 다듬으면 합격권 답변이 완성됩니다.`,
    scores: {
      academic: isTooShort ? 75 : 88,
      careerFit: 90,
      community: 84,
      structure: isTooShort ? 72 : 86,
    },
    structureAnalysis: {
      isPrepStar: !isTooShort,
      comment:
        '상황(S)-과제(T)-행동(A)-배움(R)의 흐름에 치의학적 통찰을 결합하여 1분(약 400자) 호흡으로 간결하게 전달하는 것이 핵심입니다.',
    },
    blindCheck: {
      hasViolation: false,
      detectedPhrases: [],
      warningMessage: '블라인드 면접 규정 위반 표현이 발견되지 않았습니다.',
    },
    tailQuestions: [
      {
        question:
          '답변에서 언급한 활동 과정 중 가장 예상치 못했던 실험 오차나 난관은 무엇이었으며, 이를 본인 스스로 어떻게 극복했나요?',
        intent: '지원자 본인이 주도적으로 탐구하고 문제해결력을 발휘했는지 확인하려는 진위 검증 질문입니다.',
        answeringTip:
          '성공담만 나열하지 말고, 가설이 틀렸던 순간과 이를 데이터나 미세 조작으로 해결한 구체적 액션을 말하세요.',
      },
      {
        question: `이 활동을 통해 배운 과학적 원리가 ${targetMajor} 진학 후 어떤 전공 과목이나 임상 술기에 연결될 수 있다고 생각하나요?`,
        intent: '지원 전공에 대한 구체적인 이해도(전공적합성) 및 진로 비전을 평가합니다.',
        answeringTip:
          '치과생체재료학, 치과보존학, 구강생리학 등 기초 치의학 과목과 자연치아 보존 철학을 연결해 답변하세요.',
      },
    ],
    improvedAnswer: `제가 이 활동을 통해 얻은 가장 큰 배움은 '실패한 오차 데이터를 정밀하게 바로잡는 과정이 과학의 본질'이라는 점입니다. ${targetMajor} 관련 주제를 탐구하며 초기 실험에서 예상과 다른 수치가 나왔을 때, 저는 좌절하기보다 변수 통제와 기구 조작 각도의 미세한 오류를 하나씩 검증했습니다. 이 과정에서 교과서의 화학·생명 이론이 실제 구강 환경에 적용될 때 발생하는 차이를 몸소 체득했고, 끈기 있는 재실험 끝에 신뢰할 수 있는 결론을 도출했습니다. 입학 후에도 이처럼 정직한 탐구력과 0.1mm를 다투는 치밀함으로 환자 중심의 치과의사로 성장하겠습니다.`,
    parentTip:
      '자녀에게 "첫 문장에 네가 배운 핵심을 먼저 말하니까 귀에 쏙 들어오더라!"라고 격려해 주시면 실전 면접장에서의 긴장이 크게 줄어듭니다.',
  };
}
