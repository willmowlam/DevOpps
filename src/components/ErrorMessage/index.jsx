/* ErrorMessage Component
 * Displays an error message with a dismiss button.
 * 
 * Props:
 * - error: The error message or code to display.
 * - setError: Function to clear the error when the dismiss button is clicked.
 */

const ErrorMessage = ({ error, setError }) => {
  return (
    <div className="mb-4 p-5 rounded-lg bg-red-100 text-red-700 border border-red-300 flex justify-left relative">
      <svg
        className="w-5 h-5 mr-2 text-red-700"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <p>
        <span className="font-semibold">Error!</span>{" "}
        {typeof error === "string"
          ? error // Show custom error message
          : "Something went wrong. Please try again later."}
        {typeof error === "number" && error !== -1 ? ` (Error: ${error})` : null}
      </p>

      <button
        type="button"
        className="absolute top-2 right-2 text-red-700 hover:text-red-900 text-lg font-bold focus:outline-none"
        onClick={() => { setError(null); }}
        aria-label="Dismiss error"
      >
        &times;
      </button>
    </div>
  );
}

export default ErrorMessage;