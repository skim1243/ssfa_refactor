export default function About() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Overview Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-6 text-gray-900">Sejong Scholarship Foundation in America (SSFA)</h1>
              <hr className="border-t-2 w-16 mb-6" style={{ borderColor: 'var(--color-blue)' }} />
              <p className="text-lg mb-4 text-gray-700">
                Founded in 1997, SSFA has given scholarship funds to university students in need for the past two decades. Originally established by first generation Korean American immigrants as a way of giving back to their community and supporting young talent, the foundation has now passed on to be run by second and third generations. They carry on the work of reaching out to students in America who are dedicated to their academics and future but lack the means to fully pursue their potential. We fundraise, host events, and accept donations In order to continue fulfilling our mission.
              </p>
              <p className="text-lg font-semibold text-gray-800 mb-4">
                SSFA is a 501(c)(3) nonprofit organization. Your donation is tax deductible. <br /> (EIN: 41-2047979)
              </p>
              <a href="/Content/document/SSFA-By-Laws.pdf" target="_blank" className="text-blue-600 hover:text-blue-800 underline">Download By Laws</a>
            </div>
            <div className="text-center">
              <h3 className="text-xl mb-4 text-gray-700">Since 1997,</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-blue-600">For 25 Years</span>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-orange-600">641 Students</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-600">Over $618,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <img
                src="/Content/img/John_Hwang_P.png"
                alt="President of Sejong Scholarship Foundation of America"
                className="w-80 h-80 rounded-full mx-auto lg:mx-0 object-cover shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Welcome message</h2>
              <hr className="border-t-2 w-16 mb-6" style={{ borderColor: 'var(--color-blue)' }} />
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  Welcome to Sejong Scholarship Foundation Website. I am proud to be this year's President. Our mission's priority is to serve college and high school students who excel in academic but are in financial needs. In 2018 and going forward, we plan to expand our program and increase scholarship amount so that more students will benefit. As a growing organization, we welcome your comments and suggestions. Please send them to us so we can use them to improve and evolve as a dynamic organization.
                </p>
                <p className="font-semibold">John Hwang, President</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sejong Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Why Sejong?</h2>
              <hr className="border-t-2 w-16 mb-6" style={{ borderColor: 'var(--color-blue)' }} />
              <p className="text-gray-700 leading-relaxed">
                The name of our scholarship program comes from King Sejong the Great, a sovereign ruler of the Joseon dynasty from 1418 to 1450. We as a philanthropic organization took our inspiration from him because he is known as one of the greatest Kings in Korean history for his intelligence and lasting public works, which includes the Korean alphabet. He created the modern Korean alphabet in order to help the common folk read and write, which was incredibly rare back then due to limited access to education of traditional chinese characters. The scientific and phonetic structure of the new alphabet made it incredibly easy to learn. With this new alphabet, King Sejong set out to fix the root of all political, economic, and social disparities, which he knew stemmed from the dissemination of knowledge, hence education. If more people from diverse backgrounds could read and write, and thus share information, then opportunities for upward social mobility would grow, and society's problems of inequity would decrease. It is this mission of King Sejong that we wholeheartedly adopted and implemented in our foundation's work. Through our scholarship, we intend to support students, who are promising young intellectuals but cannot afford their education otherwise, so that their future lives are not solely determined by their circumstances.
              </p>
            </div>
            <div className="text-center">
              <img
                src="/Content/img/King-Sejong-400x400.jpeg"
                alt="King Sejong"
                className="w-80 h-80 rounded-lg shadow-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Our History</h2>
          <hr className="border-t-2 w-16 mb-8 mx-auto" style={{ borderColor: 'var(--color-blue)' }} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Year</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">History</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-4 py-2">May. 1997</td><td className="border border-gray-300 px-4 py-2">The Board of Directors of the Korean Society of Maryland (24th President: Mr. Chik S. Chang) approved the establishment of a scholarship fund for Korean American students using the proceedings of a golf tournament ($8,237.95).</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Dec. 1997</td><td className="border border-gray-300 px-4 py-2">The Korean American Scholarship Foundation of Maryland was established with Mr. Jong H. Lee and Dr. Joo D. Yoon as the inaugural Chair and the President, respectively.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">June. 1998</td><td className="border border-gray-300 px-4 py-2">The name was changed to the Sejong Scholarship Foundation of USA.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Sep. 1998</td><td className="border border-gray-300 px-4 py-2">It was registered to the State of Maryland as a nonprofit organization.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Dec. 1999</td><td className="border border-gray-300 px-4 py-2">The inaugural scholarships were awarded to 12 students, including Ms. Soowon Ha (UMCP), at an award ceremony held at Goongjun Restaurant.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Mar. 2000</td><td className="border border-gray-300 px-4 py-2">Mr. Bobby Kim and Mr. Chik S. Chang were elected the 2nd President and the Chair, respectively.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2000</td><td className="border border-gray-300 px-4 py-2">The 2nd-year scholarships were awarded to 23 students, including Mr. Young Ook Shin (Cornell University), at an award ceremony at Q's Restaurant.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Nov. 2001</td><td className="border border-gray-300 px-4 py-2">The 3rd-year scholarships were awarded to 21 students, including Mr. Jooyup Cho (UMBC), at an award ceremony held at Goongjun Restaurant.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Mar. 2002</td><td className="border border-gray-300 px-4 py-2">Mr. Chik S. Chang and Ms. Eun Kim were elected the 3rd President and the Chair, respectively.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Dec. 2012</td><td className="border border-gray-300 px-4 py-2">It was registered to the IRS as a 501(c)3 nonprofit organization.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">June. 2002</td><td className="border border-gray-300 px-4 py-2">A fundraising dinner was held at Goongjun Restaurant.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2002</td><td className="border border-gray-300 px-4 py-2">The 4th-year scholarships were awarded to 20 students, including Mr. SangkyungPyun (UM Graduate School), at an award ceremony held at Q's Restaurant.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">June. 2003</td><td className="border border-gray-300 px-4 py-2">The Board of Directors approved the 1st amendment of the bylaws.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Aug. 2003</td><td className="border border-gray-300 px-4 py-2">The 5th-year scholarships were awarded to 20 students, including Mr. Chuljoon Hwang (Johns Hopkins University).</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Mar. 2003</td><td className="border border-gray-300 px-4 py-2">Mr. Seung K. Rhee and Ms. Eun Kim were elected the 4th President and the Chair, respectively.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">May. 2004</td><td className="border border-gray-300 px-4 py-2">A golf outing for scholarship fundraising was held at the River Downs County Club at Pinks berg, raising more than $30,000.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2004</td><td className="border border-gray-300 px-4 py-2">A Korean Lyric Concert was held for fundraising at the Maryland Art Center.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Aug. 2004</td><td className="border border-gray-300 px-4 py-2">The 6th-year scholarships were awarded to 33 students, including Ms. Chanmi You (Yale University).</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2005</td><td className="border border-gray-300 px-4 py-2">The 7th-year scholarships were awarded to 44 students, including 13 high school students and 33 college students at a Concert celebrating the 60th anniversary of the Liberation Day held at the University of Maryland Arts Center.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Mar. 2006</td><td className="border border-gray-300 px-4 py-2">Mr. Peter Lee and Mr. Ok T. Kim were elected the 5th President and the Chair, respectively.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">July. 2007</td><td className="border border-gray-300 px-4 py-2">The 8th-year scholarships were awarded to 29 students, including Ms. GiaKan (Duke University).</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Mar. 2008</td><td className="border border-gray-300 px-4 py-2">Mr. Peter Leewas reelected and Mr. John Chang was elected the Chair for a 3-year term.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2008</td><td className="border border-gray-300 px-4 py-2">The 9th-year scholarships were awarded to 45 students, including Mr. Hyun-Young Yoon (Yanji University & KAIST), who was one of eight recipients of the John Chang Scholarship Fund.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Aug. 2009</td><td className="border border-gray-300 px-4 py-2">The inaugural campaign, "Scholarship of Love," was launched in partnership with the Korea Times, raising $50,000.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2009</td><td className="border border-gray-300 px-4 py-2">The 10th-year scholarships were awarded to 42 students, including Ms. Soo-Young Jung ( Virginia Tech), at an award ceremony held at the Turf Valley Resorts and Conference. Eight were recipients of John Chang Scholarship Fund and several were receiving from the JC Mission Fund.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">April. 2010</td><td className="border border-gray-300 px-4 py-2">Rev. Thorn W. Myung was elected the 7th President.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">July. 2010</td><td className="border border-gray-300 px-4 py-2">At a board of directors meeting held at the Mr. Chang's, the bylaws were amended and several directors were appointed.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Aug.2010</td><td className="border border-gray-300 px-4 py-2">The 2nd-year "Scholarship of Love" campaign started in partnership with the Korea Times, raising $60,000.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2010</td><td className="border border-gray-300 px-4 py-2">The 11th-year scholarships were awarded to 33 students, including Mr. Enoch Cha, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Jan. 2011</td><td className="border border-gray-300 px-4 py-2">At a board of directors meeting held at Kimko Restaurant, the bylaws were amended for the second time.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">July. 2011</td><td className="border border-gray-300 px-4 py-2">The 3rd-year "Scholarship of Love" campaign began in partnership with the Korea Times, raising $52,000.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Nov. 2011</td><td className="border border-gray-300 px-4 py-2">The 12th-year scholarships were awarded to 31 students, including Mr. Enoch Cha, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Feb. 2012</td><td className="border border-gray-300 px-4 py-2">Rev. Thorn W. Myung was reelected as 8th President, and Mr. Donald Chang was elected the 7th Chair.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">June. 2012</td><td className="border border-gray-300 px-4 py-2">A board of directors meeting was held at Mr. Chang's to elect the Executive Team.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2012</td><td className="border border-gray-300 px-4 py-2">A Controller and a Treasurer was appointed at a board meeting held at Kimko Restaurant.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2012</td><td className="border border-gray-300 px-4 py-2">The 4th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times, raising $49,500.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Dec. 2012</td><td className="border border-gray-300 px-4 py-2">The 13th-year scholarships were awarded to 36 students, including Ms. Hyehyun Choi, at an award ceremony held at the Philippi Church.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Feb. 2013</td><td className="border border-gray-300 px-4 py-2">Ms. HyeJa Chang was elected the 8th Chair at a board of directors meeting held at Kimko Restaurant.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Sep. 2013</td><td className="border border-gray-300 px-4 py-2">The 8th-year "Scholarship of Love sponsorship golf invitation was held</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2013</td><td className="border border-gray-300 px-4 py-2">The5th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times, raising $44,200.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2013</td><td className="border border-gray-300 px-4 py-2">The 14th-year scholarships were awarded to 27 students, including Mr. Chris Jihyun Ahn, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Jan. 2014</td><td className="border border-gray-300 px-4 py-2">John Hwang was elected the 9thPresident.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Sep. 2014</td><td className="border border-gray-300 px-4 py-2">The 9th-year "Scholarship of Love sponsorship golf invitation" was held</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2014</td><td className="border border-gray-300 px-4 py-2">The 6th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times, raising $51,150.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2014</td><td className="border border-gray-300 px-4 py-2">The 15th-year scholarships were awarded to 33 students, including Ms. Kim, Esther, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Jan. 2015</td><td className="border border-gray-300 px-4 py-2">Mr. Rev. Thorn W. Myung was elected the 9th Chair at a board of directors meeting held at Tongnamoo House Restaurant.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2015</td><td className="border border-gray-300 px-4 py-2">The 10th-year "Scholarship of Love sponsorship golf invitation was held</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2015</td><td className="border border-gray-300 px-4 py-2">The 7th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times, raising $63,300.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2015</td><td className="border border-gray-300 px-4 py-2">The 16th-year scholarships were awarded to 33 students, including Ms. Kwon, Hye Lin, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Feb. 2016</td><td className="border border-gray-300 px-4 py-2">John Hwang was elected the 10th President.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2016</td><td className="border border-gray-300 px-4 py-2">The 11th-year "Scholarship of Love sponsorship golf invitation" was held.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2016</td><td className="border border-gray-300 px-4 py-2">The 8th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times, raising $43,400.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2016</td><td className="border border-gray-300 px-4 py-2">The 17th-year scholarships were awarded to 33 students, including Ms. Lee,Joanna, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Feb. 2017</td><td className="border border-gray-300 px-4 py-2">Mr. Rev. Thorn W. Myung was elected the 10th Chair at a board of directors meeting held at Dae jang Geum Restaurant.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2017</td><td className="border border-gray-300 px-4 py-2">The 12th-year "Scholarship of Love sponsorship golf invitation" was held.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2017</td><td className="border border-gray-300 px-4 py-2">The 9th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times, raising $44,980.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2017</td><td className="border border-gray-300 px-4 py-2">The 18th-year scholarships were awarded to 32 students, including Ms. Christina Jisoo Kim, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Feb. 2018</td><td className="border border-gray-300 px-4 py-2">Albert Kim was elected the 11th President.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Aug. 2018</td><td className="border border-gray-300 px-4 py-2">The 13th-year "Scholarship of Love sponsorship golf invitation" was held.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2018</td><td className="border border-gray-300 px-4 py-2">The 10th-year "Scholarship of Love" campaign was completed.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2018</td><td className="border border-gray-300 px-4 py-2">The 19th-year scholarships were awarded to 25 college and 4 high school students from over 10 states at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Oct. 2019</td><td className="border border-gray-300 px-4 py-2">The 11th-year "Scholarship of Love" campaign was completed.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2019</td><td className="border border-gray-300 px-4 py-2">The 20th-year scholarships were awarded to 24 college and 6 high school students at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Feb. 2020</td><td className="border border-gray-300 px-4 py-2">Albert Kim was elected the 12th President. John Hwang was elected the chairman at a board of directors.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Oct. 2020</td><td className="border border-gray-300 px-4 py-2">The 12th-year "Scholarship of Love" campaign was completed.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Nov. 2020</td><td className="border border-gray-300 px-4 py-2">The 21th-year scholarships were awarded to 25 college and 2 high school students at an award ceremony held via Zoom.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Oct. 2021</td><td className="border border-gray-300 px-4 py-2">The 13th-year "Scholarship of Love" campaign was completed.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Nov. 2021</td><td className="border border-gray-300 px-4 py-2">The 22th-year scholarships were awarded to 29 college and 1 high school students at an award ceremony held via Zoom.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Feb. 2022</td><td className="border border-gray-300 px-4 py-2">John Hwang was elected the 13th President. Albert Kim was elected the chairman at a board of directors.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Jun. 2022</td><td className="border border-gray-300 px-4 py-2">2022 "Spread Your Love" Art Contest and Exhibition was held at Baltimore Bayside Cantina Restaurant's outdoor space. Trophy and prizes were awarded to 21 students in the award event.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Sep. 2022</td><td className="border border-gray-300 px-4 py-2">The 14th-year "Scholarship of Love" campaign was completed in partnership with the Korea Times.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Nov. 2022</td><td className="border border-gray-300 px-4 py-2">The 23th-year scholarships were awarded to 31 students, including Mrs. Hogan, at an award ceremony held at the Turf Valley Resorts and Conference.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Feb. 2023</td><td className="border border-gray-300 px-4 py-2">John Hwang was elected the 14th President. Albert Kim was elected the chairman at a board of directors.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">May. 2023</td><td className="border border-gray-300 px-4 py-2">2023 "I Am Proud'" Art Contest and Exhibition was held at Baltimore Bayside Cantina Restaurant's outdoor space. Trophy and prizes were awarded to 30 students in the award event.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">Nov. 2023</td><td className="border border-gray-300 px-4 py-2">The 24th-year scholarships were awarded to 29 students at an award ceremony held at Baltimore Bayside Cantina Restaurant.</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-4 py-2">Feb. 2024</td><td className="border border-gray-300 px-4 py-2">John Hwang was elected the 15th President. Yong Jung was elected the chairman at a board of directors.</td></tr>
                <tr><td className="border border-gray-300 px-4 py-2">May. 2024</td><td className="border border-gray-300 px-4 py-2">2023 "I Am Proud'" Art Contest and Exhibition was held at Baltimore Bayside Cantina Restaurant's outdoor space. Trophy and prizes were awarded to 30 students in the award event.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Our Donators Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Our Donators</h2>
          <hr className="border-t-2 w-16 mb-8 mx-auto" style={{ borderColor: 'var(--color-blue)' }} />
          <div className="mb-8">
            <p className="text-gray-700 text-center max-w-4xl mx-auto">
              SSFA would like to thank all the individuals and organizations listed below for donating to our organization for over the past 20 years. Your contributions in time and resources have made our work possible. We will continue to support and to foster talented young students, who wish to pursue academic opportunities with relieved financial distress.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-600 leading-relaxed">
              1st Mariner Bank | Albert Kim. CPA | Ben Choi | Best Car Wash | Best Home Care | Best World Inc. | Bizflow Corperation | Bob Yi | Byung W. Jun |
              C&E Financial Services | C2 Education Center (Bobby Kim) | Care Free Land USA | CBMC | Chung H. Lee | Clean Edge, Inc | Convege Tech Inc. |
              Dae H. Lee | Dae Jang Geum | David Lee | Doo S. Chang | Du Suk, Chang |
              East Central Sports Association for the Disabled | East West Accup & Herbs Clinic | Eun Kim | Eun Hee, Choi | Eul-Mo, Kang | Eung Kwon Kim M.D. |
              Flagstar bank | Food Value | Gcoop USA | Giant Realty | Go Eun&Associotes,llc |
              Grace Byun | Grace Presb. Church |
              Han, Misop | Heineken USA | Ho Choi Pro | Ho Nam Friendly Asso. | Hong J. Kim | HoonJung Choi | Hye J. Chang | Hyo S., Ahn | Hyung Kim | In H. Chang |
              Jack's tire | Jae B. Yoo | Jae C., Jung | Jae D. Yoo | Jae S. Bae Esq. | Jane Roger | Jay Kim | JC Mission | Ji H. Ryu | Jik S. Chang | Jin H. Park | Jinny Choi Realty | John Hwang |
              John Jang | John Kang D.D.S. | Jonathan Ahn, Esq. | Jong Hwa Lee | Joo D. Yun M.D. | Joseph, Jeon CPA | Joyful Adult Medical Daycare Center | Jun Park. D.D.S. P.A. | Jun Young Park D.D.S. | JungKi Baik | Jung M. Choi |
              KA Community Asso. Of Ho. Co., Inc. | Kagro of MD, Inc | Keunsu, Han | Ki S. Kim | Kim's Auto Electric Services | Kirsh Cleaners | Ko I. Song | KoAm Scholarship Foundation |
              KoAmerican Church of Philippi | KoAmpac | Korean Business Enterprise Asso. | Korean Chinese Restaurant | Korean Embassy | Korean Presb. Of Baltimore | Korean Resource Center | Korean Society of MD | KiHwa Han | Kun H. Jung | Kyong Hyon, Yon |
              Laurel's Best Dentist | Lawrence J. Butler | Lee & Associates | LK Inc(Honey Pig Restaurant) | Lotte Plaza |
              M&T Bank | MAC (Maryland Athletic Club) | Magic Stitch, Inc | Mattew Lee | MD Amateur Athletic Asso. | MD Car Wash Asso. | MD Dry Cleaning Asso. | MD Sports Association | MD Motor Cycle Riders Club | MD Women's Golf Asso. | Mega Realty & Inv. Inc | Mi H. Shin | My Life Foundation Inc. |
              Nam Myung Ja | Neulpuleun Golf Club | New York Life Insurance | Northwind Liquors |
              Parkside Liquor, Inc | Pearl Car Wash | PEH (JULIAN B. WILLS) | Peter Lee | PNC bank | Poor Boys Sports LLC | Pyung K. Park |
              Realty 1 MD | Republic National Distnbuting Co. LLc | Rev. Kang H. Lee | Ridgely Auto Services | Rotary Club of Woodlawn-Westview | Ryland home Inc. | Sang J. Kim | Sang K. Han | Seong Ok Baik Realty |
              Sam Young, Lee | Seung H. An | Seung K. Yoo | Seung Paik | Soo Shin | Southern Glazer Wine | Southern Maryland Oil Co. | Standard Restaurant | Standard Restaurant Equipment | Steve Jang Insurance | Sun Travel, Inc | Sun Trust Bank | SUNG &SUE Inc. | Sung T. Choi | Sung W. Lee | Sung&Hwang Law Office, LLP. | Susan Oh (Giant Realty) | The Korea Times | Thorn Myung | Tony Kim | Top Travel | Triple-C Wholesale | Turf Valley Resort Hotel | Village Liquors | Welcome Home Realty | Wings Sports Bar | Won Do Wholesale | Won K. Kim Insurance | Wonchul, Chang | Wonder Enterprises Inc. | WooRi Jib | WSFS Bank |
              Yang Ho, Choe | Yeong H. Oh M.D. | Yong I. Chung | Yong Ik, Jong | Yong K. Kim | Young Nam Friendly Asso. | Young R. Cho | Young Seoung, Song | Young W. Yoo | Young's Construction, Inc. | Yu K. Jun | Yu Mi Hogan
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
