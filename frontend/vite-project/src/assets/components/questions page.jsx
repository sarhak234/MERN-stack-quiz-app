{data.questions.map((q, index) => (
  <div
    key={q.id}
    className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 transition-all hover:shadow-xl"
  >
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-start gap-2">
      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base shrink-0">
        {index + 1}
      </span>
      <span className="flex-1 pl-8">
        {q.question}
      </span>
    </h3>

    {/* Options */}
    <div className="grid gap-2 sm:gap-3">
      {q.options.map((option, idx) => (
        <button
          key={option}
          type="button"
          onClick={() =>
            setAnswers((prev) => ({ ...prev, [q.id]: option }))
          }
          className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
            answers[q.id] === option
              ? "bg-blue-500 text-white border-blue-600 shadow-md"
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
          }`}
        >
          <span className="font-medium mr-2 sm:mr-3">
            {String.fromCharCode(65 + idx)}.
          </span>
          {option}
        </button>
      ))}
    </div>
  </div>
))}
