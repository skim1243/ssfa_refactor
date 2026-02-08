'use client';

export default function Apply() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Application Overview Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Apply for SSFA Scholarship</h1>
          <hr className="border-t-2 w-16 mb-8" style={{ borderColor: 'var(--color-blue)' }} />
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-6 text-gray-700">
                The Sejong Scholarship Foundation in America (SSFA) is committed to supporting academically talented students who demonstrate financial need. Our scholarship program helps students pursue their educational goals without the burden of excessive student debt.
              </p>
              <p className="text-lg mb-6 text-gray-700">
                We award scholarships to both high school and college students who show exceptional academic performance and a commitment to their community. Our goal is to provide opportunities for students to excel in their studies and contribute positively to society.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg border-l-4" style={{ borderColor: 'var(--color-blue)' }}>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Application Portal</h3>
                <p className="text-gray-700 mb-4">
                  Ready to apply? Access our secure online application portal to submit your scholarship application.
                </p>
                <a
                  href="/applicant-login"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: 'var(--color-blue)' }}
                >
                  Open Application Portal
                </a>
              </div>
            </div>
            <div className="text-center">
              <img
                src="/Content/img/scholarship-application.svg"
                alt="Scholarship Application"
                className="w-80 h-80 mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Eligibility Criteria</h2>
          <hr className="border-t-2 w-16 mb-8 mx-auto" style={{ borderColor: 'var(--color-blue)' }} />
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Academic Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Minimum GPA of 3.0 (4.0 scale) for high school students</li>
                <li>Minimum GPA of 3.2 (4.0 scale) for college students</li>
                <li>Demonstrated academic excellence and potential</li>
                <li>Enrollment in accredited educational institutions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Additional Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Demonstrated financial need</li>
                <li>Korean-American heritage preferred but not required</li>
                <li>Commitment to community service</li>
                <li>Good character and leadership potential</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Application Timeline Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Application Timeline</h2>
          <hr className="border-t-2 w-16 mb-8 mx-auto" style={{ borderColor: 'var(--color-blue)' }} />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-blue)', opacity: 0.1 }}>
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Application Opens</h3>
              <p className="text-gray-700">Early January</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-blue)', opacity: 0.1 }}>
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Deadline</h3>
              <p className="text-gray-700">Mid-March</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-blue)', opacity: 0.1 }}>
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Awards Announced</h3>
              <p className="text-gray-700">Late May</p>
            </div>
          </div>
        </div>
      </section>

      {/* Selection Process Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Selection Process</h2>
          <hr className="border-t-2 w-16 mb-8 mx-auto" style={{ borderColor: 'var(--color-blue)' }} />
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Review Process</h3>
              <p className="text-gray-700 mb-4">
                All applications are carefully reviewed by our scholarship committee. We evaluate each applicant based on academic achievement, financial need, personal statement, and letters of recommendation.
              </p>
              <p className="text-gray-700">
                Selected finalists may be invited for interviews to further discuss their goals and aspirations.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Award Amounts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
                  <span className="text-gray-700">High School Scholarships</span>
                  <span className="font-semibold text-blue-600">$1,000 - $2,500</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
                  <span className="text-gray-700">College Scholarships</span>
                  <span className="font-semibold text-blue-600">$2,500 - $5,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
                  <span className="text-gray-700">Graduate Scholarships</span>
                  <span className="font-semibold text-blue-600">$5,000 - $10,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Questions?</h2>
          <hr className="border-t-2 w-16 mb-8 mx-auto" style={{ borderColor: 'var(--color-blue)' }} />
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            If you have any questions about the application process or eligibility requirements, please don't hesitate to contact us.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Email Us</h3>
              <p className="text-gray-700 mb-4">scholarship@ssfa.org</p>
              <p className="text-sm text-gray-600">We typically respond within 2-3 business days</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Call Us</h3>
              <p className="text-gray-700 mb-4">(XXX) XXX-XXXX</p>
              <p className="text-sm text-gray-600">Monday - Friday, 9 AM - 5 PM EST</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


