import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl sm:text-2xl font-bold mt-6 mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
    {children}
  </h2>
);

const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-cyan-300 font-semibold">{children}</span>
);

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last updated: December 12, 2025</p>
          <div className="mt-3 flex gap-2">
            <Link to="/about">
              <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 text-xs px-3 py-1">About</Button>
            </Link>
            <Link to="/contactus">
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-xs px-3 py-1">Contact</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed">
          <SectionTitle>Interpretation and Definitions</SectionTitle>
          <h3 className="text-lg font-semibold text-white">Interpretation</h3>
          <p>
            The words whose initial letters are capitalized have meanings defined under the following conditions. The
            following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </p>

          <h3 className="text-lg font-semibold text-white">Definitions</h3>
          <p>For the purposes of this Privacy Policy:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><K>Account</K> means a unique account created for You to access our Service or parts of our Service.</li>
            <li>
              <K>Affiliate</K> means an entity that controls, is controlled by, or is under common control with a party,
              where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled
              to vote for election of directors or other managing authority.
            </li>
            <li><K>Company</K> refers to techminds-hub-connect.</li>
            <li>
              <K>Cookies</K> are small files that are placed on Your computer, mobile device or any other device by a
              website, containing the details of Your browsing history on that website among its many uses.
            </li>
            <li><K>Country</K> refers to Maharashtra, India.</li>
            <li><K>Device</K> means any device that can access the Service such as a computer, a cell phone or a tablet.</li>
            <li><K>Personal Data</K> is any information that relates to an identified or identifiable individual.</li>
            <li><K>Service</K> refers to the Website.</li>
            <li><K>Service Provider</K> means any natural or legal person who processes the data on behalf of the Company.</li>
            <li><K>Usage Data</K> refers to data collected automatically.</li>
            <li>
              <K>Website</K> refers to techminds-hub-connect, accessible from
              {" "}
              <a href="https://ogtechminds.me" className="text-cyan-300 underline hover:text-cyan-200" target="_blank" rel="noreferrer">https://ogtechminds.me</a>
            </li>
            <li><K>You</K> means the individual accessing or using the Service, or the company or other legal entity on whose behalf such individual is using the Service.</li>
          </ul>

          <SectionTitle>Collecting and Using Your Personal Data</SectionTitle>
          <h3 className="text-lg font-semibold text-white">Types of Data Collected</h3>
          <h4 className="font-semibold text-cyan-300">Personal Data</h4>
          <p>
            While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be
            used to contact or identify You. Personally identifiable information may include <K>Email address</K>, <K>First name and last name</K>,
            <K>Phone number</K>, and <K>Usage Data</K>.
          </p>

          <h4 className="font-semibold text-cyan-300">Usage Data</h4>
          <p>
            Usage Data is collected automatically when using the Service and may include your IP address, browser details, pages visited, and other diagnostic data.
          </p>

          <h3 className="text-lg font-semibold text-white">Tracking Technologies and Cookies</h3>
          <p>
            We use <K>Cookies</K> and similar tracking technologies to track activity on Our Service and store certain information. Cookies can be
            <K>Persistent</K> or <K>Session</K> cookies.
          </p>

          <h3 className="text-lg font-semibold text-white">Use of Your Personal Data</h3>
          <p>
            The Company may use Personal Data to <K>provide and maintain our Service</K>, <K>manage accounts</K>, <K>perform contracts</K>,
            <K>contact you</K>, <K>provide news and offers</K>, <K>manage requests</K>, and for other legitimate purposes.
          </p>

          <h3 className="text-lg font-semibold text-white">Retention, Transfer, and Deletion</h3>
          <p>
            We retain Personal Data only as long as necessary and may process data in other regions with appropriate safeguards. You may request
            deletion or updates of your data, subject to legal obligations.
          </p>

          <h3 className="text-lg font-semibold text-white">Disclosure</h3>
          <p>
            We may disclose Personal Data in business transactions, to law enforcement, or where legally required to protect rights and safety.
          </p>

          <h3 className="text-lg font-semibold text-white">Security</h3>
          <p>
            We strive to use commercially reasonable means to protect Your Personal Data but cannot guarantee absolute security.
          </p>

          <SectionTitle>Children's Privacy</SectionTitle>
          <p>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personal data from children under 13.
          </p>

          <SectionTitle>Links to Other Websites</SectionTitle>
          <p>
            Our Service may contain links to other websites. We have no control over third-party sites and recommend you review their privacy policies.
          </p>

          <SectionTitle>Changes to this Privacy Policy</SectionTitle>
          <p>
            We may update this Privacy Policy and will notify You by posting the new Privacy Policy on this page with an updated date.
          </p>

          <SectionTitle>Contact Us</SectionTitle>
          <ul className="list-disc pl-5 space-y-2">
            <li>Email: <a href="mailto:ogtechmind@gmail.com" className="text-cyan-300 underline hover:text-cyan-200">ogtechmind@gmail.com</a></li>
            <li>Website: <a href="https://ogtechminds.me" target="_blank" rel="noreferrer" className="text-cyan-300 underline hover:text-cyan-200">https://ogtechminds.me</a></li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/">
            <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 text-xs px-3 py-1">Home</Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 text-xs px-3 py-1">About</Button>
          </Link>
          <Link to="/contactus">
            <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-xs px-3 py-1">Contact</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
