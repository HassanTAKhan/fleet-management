function MotHistory({ tests }) {
    if (!tests?.length) return null;
    console.log(tests)
    return (
      <div>
        <h2 className="font-semibold mt-4 mb-1">Recent MOT Tests:</h2>
        <ul className="space-y-3">
          {tests.map((test, i) => (
            <li key={i} className="border border-gray-300 p-3 rounded bg-white">
              <p><strong>Date:</strong> {test.completedDate?.substring(0, 10)}</p>
              <p><strong>Result:</strong> {test.testResult.toUpperCase()}</p>
              <p><strong>Odometer:</strong> {test.odometerValue} miles</p>
              <p><strong>Location:</strong> {test.location || "N/A"}</p>
              <p><strong>MOT Test Number:</strong> {test.motTestNumber || "N/A"}</p>
  
              {test.defects?.length > 0 ? (
                <div>
                  <p className="font-semibold mt-2">Defects / Comments:</p>
                  <ul className="list-disc pl-5">
                    {test.defects.map((d, j) => (
                      <li key={j}>[{d.type}] {d.text}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No defects or advisories reported.</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  export default MotHistory;
  