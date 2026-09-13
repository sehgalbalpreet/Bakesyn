import React, { useState } from "react";
import { QUIZ_QUESTIONS } from "../data";
import { CheckCircle2, XCircle, Award, ChevronRight, HelpCircle, RotateCcw } from "lucide-react";

export default function AssessmentModule() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const question = QUIZ_QUESTIONS[currentIdx];

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOpt === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  const getEvaluationLabel = () => {
    const pct = (score / QUIZ_QUESTIONS.length) * 100;
    if (pct === 100) return "👑 Master Chocolatier Grand Gold!";
    if (pct >= 80) return "🌟 Senior Confectioner Certification";
    if (pct >= 60) return "🎓 Apprentice Confectioner";
    return "🌱 Cocoa Sorter (Keep Studying!)";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" id="assessment-module-container">
      {/* Quiz Progress Header */}
      {!isFinished && (
        <div className="flex justify-between items-center text-xs font-bold text-gray-500 font-mono" id="quiz-header">
          <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
          <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-950 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span>Score: {score}</span>
        </div>
      )}

      {/* Main Question Interface */}
      {!isFinished ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6" id="question-card">
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-extrabold text-gray-950 font-sans leading-relaxed flex gap-3">
              <HelpCircle className="w-6 h-6 text-amber-800 flex-shrink-0 mt-0.5" />
              {question.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3" id="options-container">
            {question.options.map((opt, oIdx) => {
              const isSelected = selectedOpt === oIdx;
              const isCorrect = oIdx === question.correctIndex;

              let btnStyle = "border-gray-100 bg-white text-gray-800 hover:border-amber-200 hover:bg-amber-50/20";
              if (isSelected && !isAnswerSubmitted) {
                btnStyle = "border-amber-950 bg-amber-950 text-amber-50";
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = "border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "border-red-300 bg-red-50 text-red-950";
                } else {
                  btnStyle = "border-gray-50 bg-gray-50/50 text-gray-400 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={oIdx}
                  id={`choice-btn-${oIdx}`}
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedOpt(oIdx)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm transition-all duration-150 flex justify-between items-center cursor-pointer ${btnStyle}`}
                >
                  <span className="leading-relaxed">{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Solution Explanation Box */}
          {isAnswerSubmitted && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs leading-relaxed text-amber-950 space-y-1.5" id="solution-explanation">
              <span className="font-bold block text-amber-900 uppercase tracking-wider font-mono">Chocolatier Academy Explanation:</span>
              <p className="font-sans font-medium">{question.explanation}</p>
            </div>
          )}

          {/* Actions button */}
          <div className="flex justify-end pt-4 border-t border-gray-50" id="quiz-action-bar">
            {!isAnswerSubmitted ? (
              <button
                id="submit-choice-btn"
                disabled={selectedOpt === null}
                onClick={handleSubmit}
                className={`px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer ${
                  selectedOpt === null
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-amber-950 text-amber-50 hover:bg-amber-900"
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                id="next-question-btn"
                onClick={handleNext}
                className="px-6 py-3 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-sm shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "See Final Grade"} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Final score overview card */
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center space-y-6" id="final-score-card">
          <Award className="w-16 h-16 text-amber-800 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-gray-950 font-sans">Masterclass Assessment Complete!</h3>
            <span className="px-3 py-1 bg-amber-50 border border-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider rounded-full block w-max mx-auto font-mono">
              {getEvaluationLabel()}
            </span>
          </div>

          <div className="bg-gray-50 py-6 px-10 rounded-2xl max-w-sm mx-auto border border-gray-100" id="score-ring">
            <span className="text-xs text-gray-500 font-mono block uppercase">Your Final Score</span>
            <span className="text-5xl font-black text-amber-950 font-sans">
              {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
            </span>
            <span className="text-xs text-gray-400 block mt-1">({score} out of {QUIZ_QUESTIONS.length} correct answers)</span>
          </div>

          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Congratulations on completing the Bean to Bar & Coated Nuts assessment! Use this score to determine your readiness for launching actual micro-batches.
          </p>

          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Retake Masterclass Exam
          </button>
        </div>
      )}
    </div>
  );
}
