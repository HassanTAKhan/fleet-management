import { useState } from "react";

const mockResponse = {
  driver: {
    drivingLicenceNumber: "ABCDE123456AB1AB",
    firstNames: "JOHN",
    lastName: "DOE",
    gender: "Male",
    dateOfBirth: "2019-12-31",
    address: {
      unstructuredAddress: {
        line1: "5 HIGH STREET",
        line2: "GARNET",
        line3: "AMMANFORD",
        line4: "CARMARTHENSHIRE",
        line5: "WALES",
        postcode: "SA18 1AB",
      },
    },
    disqualifiedUntil: "2019-12-31",
    disqualifiedForLife: true,
    disqualifiedPendingSentence: true,
  },
  licence: {
    type: "Provisional",
    status: "Valid",
    statusQualifier: "For re-assessment only",
  },
  entitlement: [
    {
      categoryCode: "A1",
      categoryLegalLiteral:
        "Motorbikes with engine size up to 125 cc, power output up to 11 kW and power/weight ratio up to 0.1 kW/kg",
      categoryType: "Provisional",
      fromDate: "2019-12-31",
      expiryDate: "2019-12-31",
      restrictions: [{ restrictionLiteral: "Eyesight Correction" }],
    },
  ],
  endorsements: [
    {
      offenceLegalLiteral: "Speeding",
      offenceCode: "SP30",
      offenceDate: "2020-06-15",
      penaltyPoints: 3,
    },
  ],
  testPass: [
    {
      testDate: "2021-11-20",
      status: "Passed",
      categoryLegalLiteral: "Car (Category B)",
    },
  ],
  token: {
    validFromDate: "2022-01-01",
    validToDate: "2022-12-31",
    issueNumber: "02",
  },
  cpc: {
    cpcs: [
      { lgvValidTo: "2023-05-01", pcvValidTo: "2023-07-01", national: true },
    ],
  },
  holder: {
    tachoCards: [{ cardNumber: "TCH123456", cardExpiryDate: "2024-12-31" }],
  },
  errors: [],
};

const generateLicence = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 16 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
};

export default function DriverCheck() {
  const [data] = useState(mockResponse);
  const [licenceNo] = useState(generateLicence());

  const {
    driver,
    licence,
    entitlement,
    endorsements,
    testPass,
    token,
    cpc,
    holder,
    errors,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">DVLA Driver License Check</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label htmlFor="licence" className="font-medium text-gray-700">
            Licence No:
          </label>
          <input
            id="licence"
            type="text"
            value={licenceNo}
            readOnly
            className="flex-1 border rounded px-3 py-2 bg-gray-50 text-gray-900 font-mono"
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver Info */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Driver Info</h3>
          <p className="text-gray-800">
            {driver.firstNames} {driver.lastName}
          </p>
          <p className="text-gray-600">DL No: {driver.drivingLicenceNumber}</p>
          <p className="text-gray-600">DOB: {driver.dateOfBirth}</p>
          <p className="text-gray-600">Gender: {driver.gender}</p>
          <p className="text-gray-600">
            Address:{" "}
            {[
              driver.address.unstructuredAddress.line1,
              driver.address.unstructuredAddress.line2,
              driver.address.unstructuredAddress.line3,
              driver.address.unstructuredAddress.line4,
              driver.address.unstructuredAddress.line5,
              driver.address.unstructuredAddress.postcode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>

        {/* Licence Status */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Licence Status</h3>
          <p className="text-gray-800">Type: {licence.type}</p>
          <p className="text-gray-800">
            Status: {licence.status}{" "}
            {licence.statusQualifier && (
              <span className="text-sm text-gray-500">
                ({licence.statusQualifier})
              </span>
            )}
          </p>
          <p className="text-gray-600">
            Disqualified Until: {driver.disqualifiedUntil}
          </p>
          <p className="text-gray-600">
            Life Disqualification: {driver.disqualifiedForLife ? "Yes" : "No"}
          </p>
        </section>

        {/* Entitlements */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Entitlements</h3>
          {entitlement.map((e, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-gray-800 font-medium">
                {e.categoryCode} — {e.categoryLegalLiteral}
              </p>
              <p className="text-gray-600">
                {e.fromDate} to {e.expiryDate}
              </p>
              {e.restrictions.length > 0 && (
                <p className="text-gray-600 text-sm">
                  Restrictions:{" "}
                  {e.restrictions.map((r) => r.restrictionLiteral).join(", ")}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Endorsements */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Endorsements</h3>
          {endorsements.length > 0 ? (
            endorsements.map((en, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="text-gray-800">
                  Offence: {en.offenceLegalLiteral || en.offenceCode}
                </p>
                <p className="text-gray-600">Date: {en.offenceDate}</p>
                <p className="text-gray-600">Points: {en.penaltyPoints}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">None</p>
          )}
        </section>

        {/* Test Passes */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Test Passes</h3>
          {testPass.map((tp, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-gray-800">{tp.categoryLegalLiteral}</p>
              <p className="text-gray-600">Date: {tp.testDate}</p>
              <p className="text-gray-600">Status: {tp.status}</p>
            </div>
          ))}
        </section>

        {/* Token Info */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Token</h3>
          <p className="text-gray-800">Issue No: {token.issueNumber}</p>
          <p className="text-gray-600">Valid: {token.validFromDate} – {token.validToDate}</p>
        </section>

        {/* CPC */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">CPC</h3>
          {cpc.cpcs.map((c, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-gray-800">LGV Valid To: {c.lgvValidTo}</p>
              <p className="text-gray-600">PCV Valid To: {c.pcvValidTo}</p>
              <p className="text-gray-600">National: {c.national ? "Yes" : "No"}</p>
            </div>
          ))}
        </section>

        {/* Tacho Cards */}
        <section className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tacho Cards</h3>
          {holder.tachoCards.map((t, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-gray-800">Card No: {t.cardNumber}</p>
              <p className="text-gray-600">Expiry: {t.cardExpiryDate}</p>
            </div>
          ))}
        </section>

        {/* Errors */}
        {errors.length > 0 && (
          <section className="bg-red-50 p-5 rounded-lg shadow col-span-full">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Errors</h3>
            {errors.map((err, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <p className="text-red-600">{err.status} &mdash; {err.code}</p>
                <p className="text-red-600 text-sm">{err.detail}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
