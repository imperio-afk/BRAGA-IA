import React from 'react';
import { QuizData, Question } from '../types';
import { PrintIcon } from './icons/PrintIcon';

const QuestionDisplay: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
    return (
        <div className="py-4 border-b border-gray-700 last:border-b-0">
            <p className="font-semibold text-gray-200 mb-2">
                {index + 1}. {question.questionText}
            </p>
            {question.questionType === 'multiple_choice' && question.options && (
                <ul className="list-disc list-inside space-y-1 pl-4 text-gray-300">
                    {question.options.map((option, i) => (
                        <li key={i}>{option}</li>
                    ))}
                </ul>
            )}
             {question.questionType === 'true_false' && (
                <ul className="list-disc list-inside space-y-1 pl-4 text-gray-300">
                    <li>Verdadeiro</li>
                    <li>Falso</li>
                </ul>
            )}
            <details className="mt-3 group print-hide">
                <summary className="cursor-pointer text-sm font-medium text-amber-500 hover:text-amber-400 list-none flex items-center">
                    <span className="group-open:hidden">Mostrar Resposta</span>
                    <span className="hidden group-open:inline">Ocultar Resposta</span>
                    <svg className="w-4 h-4 ml-1 transition-transform transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <p className="mt-2 p-2 bg-gray-900/50 rounded-md text-sm text-green-400">
                    {question.correctAnswer}
                </p>
            </details>
        </div>
    );
};

export const QuizViewer: React.FC<{ data: QuizData }> = ({ data }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 quiz-container chat-message-container">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-amber-400">{data.quizTitle}</h3>
                    <p className="text-sm text-gray-400">{data.questions.length} questões geradas.</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="print-hide flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
                >
                    <PrintIcon className="w-4 h-4" />
                    <span>Imprimir</span>
                </button>
            </div>
            
            <div className="space-y-2">
                {data.questions.map((q, index) => (
                    <QuestionDisplay key={index} question={q} index={index} />
                ))}
            </div>
        </div>
    );
};
