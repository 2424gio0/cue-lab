"use client";

import { useEffect, useMemo, useState } from "react";

type Condition = "통합형";
type Stage = "intro" | "reading" | "immediate" | "result" | "waiting" | "delayed" | "final";

type Session = {
  id: string;
  participant: string;
  condition: Condition;
  startedAt: string;
  immediateScore: number;
  immediateTotal: number;
  immediateSeconds: number;
  readingLimitSeconds: number;
  immediateLimitSeconds: number;
  delayedScore?: number;
  delayedTotal?: number;
  delayedSeconds?: number;
  delayedLimitSeconds: number;
  delayMinutes: number;
};

const PASSAGE = `기억은 정보를 저장하는 일만으로 완성되지 않는다. 필요할 때 지식을 꺼낼 수 있어야 학습이 실제 능력이 된다. 노트를 보며 반복해서 읽으면 내용이 익숙해져 잘 안다고 느끼기 쉽지만, 익숙함이 곧 회상 능력을 뜻하지는 않는다. 반면 책을 덮고 핵심을 떠올리거나 답을 먼저 만들어 보는 활동은 당장 더 어렵고 실수도 늘린다. 그러나 스스로 인출하려는 노력 뒤에 정확한 피드백을 받으면 기억의 경로가 강화된다. 이런 ‘바람직한 어려움’은 노력으로 극복할 수 있는 수준이어야 한다. 단서 자체가 나쁜 것은 아니다. 다양한 단서는 기억을 꺼내는 통로가 되지만, 언제나 같은 단서에만 의존하면 새로운 상황에서 배운 내용을 활용하기 어렵다. 따라서 학습자는 도움을 점차 줄이며 회상하고, 간격을 두고 다시 인출하며, 여러 맥락에서 지식을 설명해 보아야 한다.`;

const CONDITION_INFO = {
  통합형: { cue: "3가지 단서 수준", icon: "全", detail: "객관식 · 단답형 · 서술형을 한 번에 풉니다." },
};

const mcQuestions = [
  {
    prompt: "지문에서 말하는 ‘학습이 실제 능력이 되는 조건’은?",
    options: ["정보를 빠르게 읽는 것", "필요할 때 지식을 인출하는 것", "노트를 보기 좋게 정리하는 것", "실수를 완전히 피하는 것"],
    answer: 1,
  },
  {
    prompt: "반복해서 읽을 때 생기기 쉬운 착각은?",
    options: ["간격 효과", "전이 효과", "익숙함을 회상 능력으로 여기는 것", "단서가 사라지는 것"],
    answer: 2,
  },
  {
    prompt: "인출 시도 뒤에 필요한 것은?",
    options: ["즉각적이고 정확한 피드백", "더 많은 보기", "완전한 휴식", "같은 문장 재필사"],
    answer: 0,
  },
  {
    prompt: "어려움이 ‘바람직’하려면 어떤 조건이 필요한가?",
    options: ["누구도 풀 수 없어야 한다", "시간이 오래 걸리기만 하면 된다", "노력으로 극복 가능한 수준이어야 한다", "반드시 혼자 해결해야 한다"],
    answer: 2,
  },
  {
    prompt: "새로운 상황에서 활용하는 힘을 기르는 방법은?",
    options: ["같은 단서만 반복한다", "도움을 늘려 간다", "여러 맥락에서 설명하고 인출한다", "정답을 먼저 외운다"],
    answer: 2,
  },
];

const shortQuestions = [
  { prompt: "저장된 지식을 필요할 때 꺼내는 과정을 무엇이라 하는가?", groups: [["인출", "회상"]] },
  { prompt: "반복 읽기가 실제 기억보다 과도하게 높이는 느낌은?", groups: [["익숙", "친숙"]] },
  { prompt: "인출 시도 뒤 기억을 정확하게 수정해 주는 것은?", groups: [["피드백", "정답 확인", "교정"]] },
  { prompt: "노력으로 극복 가능한 학습상의 난관을 무엇이라 하는가?", groups: [["바람직한 어려움", "적절한 어려움"]] },
  { prompt: "다양한 상황에 지식을 적용하려면 단서를 어떻게 활용해야 하는가?", groups: [["다양", "여러"], ["단서", "맥락"]] },
];

const essayQuestions = [
  {
    prompt: "반복 읽기보다 ‘책을 덮고 떠올리기’가 장기 기억에 유리한 이유를 설명하세요.",
    groups: [["인출", "회상", "꺼내"], ["노력", "어렵"], ["강화", "기억 경로", "오래"]],
  },
  {
    prompt: "모든 어려움이 학습에 좋은 것은 아닙니다. ‘바람직한 어려움’의 조건을 설명하세요.",
    groups: [["노력"], ["극복", "해결", "가능"], ["피드백", "교정"]],
  },
  {
    prompt: "단서의 장점과, 같은 단서에만 의존할 때의 한계를 함께 설명하세요.",
    groups: [["인출", "회상", "통로"], ["같은", "의존", "고정"], ["새로운 상황", "적용", "전이", "여러 맥락"]],
  },
];

const delayedQuestions = [
  {
    prompt: "시험 전에 노트를 덮고 백지에 핵심을 써 보는 가장 중요한 이유는?",
    options: ["필기 속도를 높이기 위해", "기억에서 꺼내는 경로를 연습하기 위해", "보기 좋은 노트를 만들기 위해", "학습 시간을 줄이기 위해"],
    answer: 1,
    trap: "재노출 선호",
  },
  {
    prompt: "연습 중 오답을 냈을 때 지문의 관점에 가장 맞는 행동은?",
    options: ["오답을 보지 않고 넘어간다", "같은 문제를 베껴 쓴다", "정확한 피드백으로 오류를 교정한다", "더 쉬운 보기만 고른다"],
    answer: 2,
    trap: "오류 회피",
  },
  {
    prompt: "‘바람직하지 않은 어려움’에 해당하는 것은?",
    options: ["간격을 두고 다시 떠올리기", "답을 보기 전 먼저 추론하기", "기초지식 없이 해결 불가능한 과제 수행하기", "여러 맥락에서 개념 설명하기"],
    answer: 2,
    trap: "과도한 난이도",
  },
  {
    prompt: "특정 암기 문구가 없으면 개념을 전혀 설명하지 못하는 학습자의 문제는?",
    options: ["단서 의존성이 너무 높다", "인출 노력이 너무 많다", "피드백이 너무 정확하다", "맥락이 너무 다양하다"],
    answer: 0,
    trap: "단서 의존",
  },
  {
    prompt: "배운 내용을 낯선 사례에도 적용할 가능성을 높이는 연습은?",
    options: ["한 문장을 연속해서 읽기", "정답 보기를 계속 유지하기", "다양한 맥락에서 회상하고 설명하기", "틀릴 문제는 건너뛰기"],
    answer: 2,
    trap: "맥락 고정",
  },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.max(0, seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function keywordScore(value: string, groups: string[][]) {
  const normalized = value.replace(/\s/g, "").toLowerCase();
  return groups.filter((group) => group.some((word) => normalized.includes(word.replace(/\s/g, "").toLowerCase()))).length;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [participant, setParticipant] = useState("");
  const [condition, setCondition] = useState<Condition>("통합형");
  const [readSeconds, setReadSeconds] = useState(90);
  const [solveSeconds, setSolveSeconds] = useState(600);
  const [delayMinutes, setDelayMinutes] = useState(60);
  const [delayedSolveSeconds, setDelayedSolveSeconds] = useState(300);
  const [timeLeft, setTimeLeft] = useState(90);
  const [startedAt, setStartedAt] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [immediate, setImmediate] = useState({ score: 0, total: 5, seconds: 0 });
  const [unlockAt, setUnlockAt] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cue-lab-sessions");
    if (saved) setSessions(JSON.parse(saved));
    const active = localStorage.getItem("cue-lab-active");
    if (active) {
      const data = JSON.parse(active);
      if (data.unlockAt > Date.now()) {
        setParticipant(data.participant);
        setCondition(data.condition);
        setImmediate(data.immediate);
        setUnlockAt(data.unlockAt);
        setDelayMinutes(data.delayMinutes);
        setDelayedSolveSeconds(data.delayedSolveSeconds || 300);
        setCurrentId(data.id);
        setStage("waiting");
      } else {
        setParticipant(data.participant);
        setCondition(data.condition);
        setImmediate(data.immediate);
        setUnlockAt(data.unlockAt);
        setDelayMinutes(data.delayMinutes);
        setDelayedSolveSeconds(data.delayedSolveSeconds || 300);
        setCurrentId(data.id);
        setStage("delayed");
        setTimeLeft(data.delayedSolveSeconds || 300);
        setStartedAt(Date.now());
      }
    }
  }, []);

  useEffect(() => {
    if (!["reading", "immediate", "delayed", "waiting"].includes(stage)) return;
    const timer = window.setInterval(() => {
      if (stage === "waiting") {
        const remaining = Math.ceil((unlockAt - Date.now()) / 1000);
        setTimeLeft(Math.max(0, remaining));
        if (remaining <= 0) {
          setAnswers({});
          setTimeLeft(delayedSolveSeconds);
          setStartedAt(Date.now());
          setStage("delayed");
        }
      } else {
        setTimeLeft((value) => Math.max(0, value - 1));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, unlockAt]);

  useEffect(() => {
    if (timeLeft > 0 || autoSubmitted) return;
    if (stage === "reading") beginImmediate();
    if (stage === "immediate") {
      setAutoSubmitted(true);
      submitImmediate();
    }
    if (stage === "delayed") {
      setAutoSubmitted(true);
      submitDelayed();
    }
  }, [timeLeft, stage, autoSubmitted]);

  const progress = stage === "reading" ? (readSeconds - timeLeft) / readSeconds : stage === "waiting" ? 1 - timeLeft / (delayMinutes * 60) : (solveSeconds - timeLeft) / solveSeconds;

  const latestSession = useMemo(() => sessions.find((s) => s.id === currentId), [sessions, currentId]);

  function persist(next: Session[]) {
    setSessions(next);
    localStorage.setItem("cue-lab-sessions", JSON.stringify(next));
  }

  function startExperiment() {
    const clean = participant.trim() || `P-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setParticipant(clean);
    setCondition("통합형");
    setAnswers({});
    setAutoSubmitted(false);
    setTimeLeft(readSeconds);
    setStartedAt(Date.now());
    setStage("reading");
  }

  function beginImmediate() {
    setAnswers({});
    setAutoSubmitted(false);
    setTimeLeft(solveSeconds);
    setStartedAt(Date.now());
    setStage("immediate");
  }

  function scoreImmediate() {
    const mcScore = mcQuestions.filter((q, i) => Number(answers[i]) === q.answer).length;
    const shortScore = shortQuestions.reduce((sum, q, i) => sum + keywordScore(answers[i + 5] || "", q.groups), 0);
    const essayScore = essayQuestions.reduce((sum, q, i) => sum + keywordScore(answers[i + 10] || "", q.groups), 0);
    const shortTotal = shortQuestions.reduce((sum, q) => sum + q.groups.length, 0);
    const essayTotal = essayQuestions.reduce((sum, q) => sum + q.groups.length, 0);
    return { score: mcScore + shortScore + essayScore, total: mcQuestions.length + shortTotal + essayTotal };
  }

  function submitImmediate() {
    const result = scoreImmediate();
    const seconds = Math.min(solveSeconds, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    const id = `${participant}-${Date.now()}`;
    const session: Session = {
      id,
      participant,
      condition,
      startedAt: new Date().toISOString(),
      immediateScore: result.score,
      immediateTotal: result.total,
      immediateSeconds: seconds,
      readingLimitSeconds: readSeconds,
      immediateLimitSeconds: solveSeconds,
      delayedLimitSeconds: delayedSolveSeconds,
      delayMinutes,
    };
    persist([session, ...sessions]);
    setCurrentId(id);
    setImmediate({ ...result, seconds });
    setStage("result");
  }

  function scheduleDelayed() {
    const target = Date.now() + delayMinutes * 60 * 1000;
    setUnlockAt(target);
    setTimeLeft(delayMinutes * 60);
    localStorage.setItem("cue-lab-active", JSON.stringify({
      id: currentId, participant, condition, immediate, delayMinutes, delayedSolveSeconds, unlockAt: target,
    }));
    setStage("waiting");
  }

  function submitDelayed() {
    const score = delayedQuestions.filter((q, i) => Number(answers[i]) === q.answer).length;
    const seconds = Math.min(delayedSolveSeconds, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    const next = sessions.map((s) => s.id === currentId ? { ...s, delayedScore: score, delayedTotal: delayedQuestions.length, delayedSeconds: seconds } : s);
    persist(next);
    localStorage.removeItem("cue-lab-active");
    setStage("final");
  }

  function reset() {
    localStorage.removeItem("cue-lab-active");
    setStage("intro");
    setParticipant("");
    setAnswers({});
    setAutoSubmitted(false);
  }

  function exportCsv() {
    const header = "참가자,조건,시작시각,읽기제한초,즉시제한초,즉시점수,즉시총점,즉시정답률,즉시시간초,지연간격분,지연제한초,지연점수,지연총점,지연정답률,지연시간초";
    const rows = sessions.map((s) => [
      s.participant, s.condition, s.startedAt, s.readingLimitSeconds ?? "", s.immediateLimitSeconds ?? "",
      s.immediateScore, s.immediateTotal,
      Math.round(s.immediateScore / s.immediateTotal * 100), s.immediateSeconds,
      s.delayMinutes, s.delayedLimitSeconds ?? "", s.delayedScore ?? "", s.delayedTotal ?? "",
      s.delayedScore === undefined ? "" : Math.round(s.delayedScore / (s.delayedTotal || 1) * 100),
      s.delayedSeconds ?? "",
    ].join(","));
    const blob = new Blob(["\ufeff" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cue-lab-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!mounted) return <main className="shell"><div className="loading">실험실을 준비하고 있어요…</div></main>;

  return (
    <main className="shell">
      <header className="topbar">
        <button className="brand" onClick={() => stage === "intro" && reset()} aria-label="첫 화면">
          <span className="brandMark">C</span>
          <span>CUE LAB <small>기억 실험실</small></span>
        </button>
        <div className="statusPill"><span /> 데이터는 이 기기에만 저장됩니다</div>
      </header>

      {stage === "intro" && (
        <div className="introGrid">
          <section className="hero">
            <div className="eyebrow">DESIRABLE DIFFICULTY STUDY · 01</div>
            <h1>단서가 적을수록<br/><em>기억은 오래갈까?</em></h1>
            <p className="lead">동일한 비문학 지문을 읽고 객관식·단답형·서술형을 모두 풀어 보세요. 즉시 성과와 시간이 지난 뒤의 기억 유지율을 비교합니다.</p>
            <div className="hypothesis">
              <span>가설</span>
              <p><b>즉시</b> 단서 많음 ↑ 정확도</p>
              <i>→</i>
              <p><b>지연</b> 단서 적음 ↑ 유지율</p>
            </div>
            <div className="steps">
              {[
                ["01", "읽기", `${readSeconds}초`],
                ["02", "통합 검사", `${Math.round(solveSeconds / 60)}분`],
                ["03", "기다림", `${delayMinutes}분`],
                ["04", "지연 검사", `${Math.round(delayedSolveSeconds / 60)}분`],
              ].map(([n, title, meta]) => <div key={n}><span>{n}</span><b>{title}</b><small>{meta}</small></div>)}
            </div>
          </section>

          <aside className="startCard">
            <div className="cardIndex">실험 시작</div>
            <h2>참가 정보를 입력하세요</h2>
            <label>참가자 코드
              <input value={participant} onChange={(e) => setParticipant(e.target.value)} placeholder="예: STUDENT-01" maxLength={24} />
            </label>
            <div className="timeSettings">
              <label>읽기 시간 <small>초</small>
                <input type="number" min="10" max="900" value={readSeconds} onChange={(e) => setReadSeconds(Math.max(10, Number(e.target.value)))} />
              </label>
              <label>즉시 검사 <small>초</small>
                <input type="number" min="60" max="3600" step="30" value={solveSeconds} onChange={(e) => setSolveSeconds(Math.max(60, Number(e.target.value)))} />
              </label>
              <label>지연 간격 <small>분</small>
                <input type="number" min="0.1" max="10080" step="0.1" value={delayMinutes} onChange={(e) => setDelayMinutes(Math.max(0.1, Number(e.target.value)))} />
              </label>
              <label>지연 검사 <small>초</small>
                <input type="number" min="30" max="3600" step="30" value={delayedSolveSeconds} onChange={(e) => setDelayedSolveSeconds(Math.max(30, Number(e.target.value)))} />
              </label>
            </div>
            <div className="assignment">
              <div className="shuffle">↝</div>
              <p><b>모든 문항 유형을 한 번에 풉니다</b><br/>객관식 5문항, 단답형 5문항, 서술형 3문항이 이어집니다.</p>
            </div>
            <button className="primary" onClick={startExperiment}>실험 시작하기 <span>→</span></button>
            <p className="fineprint">계속하면 제한 시간이 시작됩니다. 중간에 지문으로 돌아갈 수 없습니다.</p>
          </aside>

          {sessions.length > 0 && (
            <section className="history">
              <div><span>누적 기록</span><b>{sessions.length}</b><small>회</small></div>
              <div><span>완료된 지연 검사</span><b>{sessions.filter(s => s.delayedScore !== undefined).length}</b><small>회</small></div>
              <button onClick={exportCsv}>CSV 결과 내보내기 ↓</button>
            </section>
          )}
        </div>
      )}

      {stage === "reading" && (
        <section className="experiment">
          <ExperimentHeader step="01 / 04" title="지문 읽기" time={timeLeft} progress={progress} label="지문은 시간이 끝나면 자동으로 사라집니다" />
          <article className="passageCard">
            <div className="passageMeta"><span>비문학 · 인지심리학</span><span>{PASSAGE.length}자</span></div>
            <h2>기억을 단단하게 만드는 어려움</h2>
            <p>{PASSAGE}</p>
            <div className="readingRule">지금은 메모하지 말고 내용의 구조와 핵심 주장을 파악하세요.</div>
          </article>
        </section>
      )}

      {stage === "immediate" && (
        <section className="experiment">
          <ExperimentHeader step="02 / 04" title="즉시 검사" time={timeLeft} progress={progress} label={`${condition} · ${CONDITION_INFO[condition].cue}`} />
          <div className="conditionBanner">
            <span>{CONDITION_INFO[condition].icon}</span>
            <div><small>즉시 검사 구성</small><b>{condition}</b><p>{CONDITION_INFO[condition].detail}</p></div>
          </div>
          <QuestionSection number="01" title="객관식" cue="보기 제공 · 단서 많음">
            <QuestionForm condition="객관식" questions={mcQuestions} answers={answers} setAnswers={setAnswers} answerOffset={0} />
          </QuestionSection>
          <QuestionSection number="02" title="단답형" cue="보기 없음 · 짧은 회상">
            <QuestionForm condition="단답형" questions={shortQuestions} answers={answers} setAnswers={setAnswers} answerOffset={5} />
          </QuestionSection>
          <QuestionSection number="03" title="서술형" cue="보기 없음 · 자유 회상과 설명">
            <QuestionForm condition="서술형" questions={essayQuestions} answers={answers} setAnswers={setAnswers} answerOffset={10} />
          </QuestionSection>
          <button className="primary submit" onClick={submitImmediate}>답안 제출하고 채점하기 <span>→</span></button>
        </section>
      )}

      {stage === "result" && (
        <section className="resultPage">
          <div className="eyebrow">IMMEDIATE TEST COMPLETE</div>
          <h1>즉시 검사 결과</h1>
          <ScoreRing score={immediate.score} total={immediate.total} />
          <div className="metricRow">
            <Metric label="조건" value={condition} sub={CONDITION_INFO[condition].cue} />
            <Metric label="정답률" value={`${Math.round(immediate.score / immediate.total * 100)}%`} sub={`${immediate.score} / ${immediate.total}점`} />
            <Metric label="풀이 시간" value={formatTime(immediate.seconds)} sub={`제한 ${formatTime(solveSeconds)}`} />
          </div>
          <div className="feedbackBox">
            <b>이 점수는 ‘지금 꺼낼 수 있는 정도’를 보여줍니다.</b>
            <p>학습의 진짜 유지력은 시간이 지난 뒤 확인됩니다. 지연 검사에서는 같은 개념을 새로운 문항과 보기로 측정합니다.</p>
          </div>
          <button className="primary narrow" onClick={scheduleDelayed}>{delayMinutes === 60 ? "1시간 뒤" : "1분 뒤"} 지연 검사 예약 <span>→</span></button>
        </section>
      )}

      {stage === "waiting" && (
        <section className="waitPage">
          <div className="pulseOrb"><span>{formatTime(timeLeft)}</span></div>
          <div className="eyebrow">MEMORY CONSOLIDATION</div>
          <h1>기억이 자리 잡는 중입니다</h1>
          <p>이 탭을 닫아도 괜찮습니다. 같은 기기에서 다시 열면 남은 시간이 이어집니다.</p>
          <div className="waitRule"><b>중요</b> 기다리는 동안 지문이나 정답을 다시 보지 마세요.</div>
        </section>
      )}

      {stage === "delayed" && (
        <section className="experiment">
          <ExperimentHeader step="04 / 04" title="지연 검사" time={timeLeft} progress={(delayedSolveSeconds - timeLeft) / delayedSolveSeconds} label="새로운 문항 · 모든 참가자 동일" />
          <div className="delayedIntro"><b>지문은 다시 제공되지 않습니다.</b><span>기억에 남아 있는 원리를 이용해 답하세요.</span></div>
          <QuestionForm condition="객관식" questions={delayedQuestions} answers={answers} setAnswers={setAnswers} />
          <button className="primary submit" onClick={submitDelayed}>최종 결과 확인 <span>→</span></button>
        </section>
      )}

      {stage === "final" && latestSession && (
        <section className="finalPage">
          <div className="eyebrow">EXPERIMENT COMPLETE</div>
          <h1>기억 유지 결과</h1>
          <div className="comparison">
            <div><small>즉시 정답률</small><b>{Math.round(latestSession.immediateScore / latestSession.immediateTotal * 100)}%</b><span style={{width: `${latestSession.immediateScore / latestSession.immediateTotal * 100}%`}} /></div>
            <div><small>지연 정답률</small><b>{Math.round((latestSession.delayedScore || 0) / (latestSession.delayedTotal || 1) * 100)}%</b><span style={{width: `${(latestSession.delayedScore || 0) / (latestSession.delayedTotal || 1) * 100}%`}} /></div>
          </div>
          <div className="retentionCard">
            <span>기억 변화</span>
            <b>{Math.round((latestSession.delayedScore || 0) / (latestSession.delayedTotal || 1) * 100) - Math.round(latestSession.immediateScore / latestSession.immediateTotal * 100)}%p</b>
            <p>지연 정답률 − 즉시 정답률</p>
          </div>
          <div className="interpretation">
            <b>한 사람의 결과만으로 가설을 확정할 수는 없습니다.</b>
            <p>여러 참가자의 조건별 평균을 비교하세요. 즉시 성과뿐 아니라 지연 정답률, 정답률 변화, 풀이 시간을 함께 보면 단서 수준의 효과를 더 정확히 해석할 수 있습니다.</p>
          </div>
          <div className="actionRow">
            <button className="secondary" onClick={exportCsv}>CSV 내보내기 ↓</button>
            <button className="primary narrow" onClick={reset}>새 참가자 시작 <span>→</span></button>
          </div>
        </section>
      )}

      <footer><span>CUE LAB · v1.0</span><p>《어떻게 공부할 것인가》 4장의 ‘바람직한 어려움’ 개념에 기반한 교육용 프로토타입 · 지문은 자체 제작</p></footer>
    </main>
  );
}

function ExperimentHeader({ step, title, time, progress, label }: { step: string; title: string; time: number; progress: number; label: string }) {
  return <header className="experimentHeader">
    <div><span>{step}</span><h1>{title}</h1><p>{label}</p></div>
    <div className="timer"><small>남은 시간</small><b>{formatTime(time)}</b></div>
    <div className="progress"><span style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} /></div>
  </header>;
}

function QuestionSection({ number, title, cue, children }: { number: string; title: string; cue: string; children: React.ReactNode }) {
  return <section className="questionSection">
    <header><span>{number}</span><div><h2>{title}</h2><p>{cue}</p></div></header>
    {children}
  </section>;
}

function QuestionForm({ condition, questions, answers, setAnswers, answerOffset = 0 }: { condition: "객관식" | "단답형" | "서술형"; questions: any[]; answers: Record<number, string>; setAnswers: (value: Record<number, string>) => void; answerOffset?: number }) {
  return <div className="questionList">
    {questions.map((q, i) => {
      const answerKey = i + answerOffset;
      return <div className="question" key={i}>
      <div className="questionNo">{String(i + 1).padStart(2, "0")}</div>
      <div className="questionBody">
        <h3>{q.prompt}</h3>
        {condition === "객관식" ? (
          <div className="options">
            {q.options.map((option: string, j: number) => <label className={answers[answerKey] === String(j) ? "selected" : ""} key={j}>
              <input type="radio" name={`q-${answerKey}`} checked={answers[answerKey] === String(j)} onChange={() => setAnswers({ ...answers, [answerKey]: String(j) })} />
              <span>{String.fromCharCode(65 + j)}</span>{option}
            </label>)}
          </div>
        ) : condition === "단답형" ? (
          <input className="shortAnswer" value={answers[answerKey] || ""} onChange={(e) => setAnswers({ ...answers, [answerKey]: e.target.value })} placeholder="핵심어 또는 짧은 문장으로 답하세요" />
        ) : (
          <div className="essayWrap">
            <textarea value={answers[answerKey] || ""} onChange={(e) => setAnswers({ ...answers, [answerKey]: e.target.value })} placeholder="근거와 원리를 자신의 말로 설명하세요." maxLength={350} />
            <span>{(answers[answerKey] || "").length} / 350자</span>
          </div>
        )}
      </div>
    </div>})}
  </div>;
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const pct = Math.round(score / total * 100);
  return <div className="scoreRing" style={{ background: `conic-gradient(var(--coral) ${pct}%, var(--line) ${pct}% 100%)` }}>
    <div><b>{pct}</b><span>%</span><small>정답률</small></div>
  </div>;
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="metric"><small>{label}</small><b>{value}</b><span>{sub}</span></div>;
}
