import Container from "../../shared/Containter/Container";
import Background from "../../widgets/Background/Background";
import Footer from "../../widgets/Footer/Footer";
import Header from "../../widgets/Header/Header";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="w-full min-h-screen h-full">
        <Background/>
        <div className="fixed left-0 w-full z-50">
          <Header isAbsolute={true} />
        </div>

        <div className="flex flex-col h-full justify-between">
          <div className="flex gap-2 pt-32 min-h-screen w-full">
            <div className="w-full text-white text-center">
              <Container className="text-6xl w-full mb-8">
                PRIVACY POLICY
              </Container>
              <div className="flex flex-col gap-2 px-4 text-left max-w-4xl mx-auto text-gray-300 leading-relaxed text-2xl">
                <Container>
                  <p>
                    This Privacy Policy describes how <b>db.betonbrutal.com</b> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
                    collects, stores, and uses personal and public information.
                    We are committed to protecting your privacy and ensuring that your data
                    is handled transparently and securely.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">1. Information We Collect</h2>
                  <p className="pl-8">
                    We collect limited user information provided during OAuth2 authorization
                    through Discord. This typically includes
                    your email address and unique account identifier.
                  </p>
                  <p className="pl-8">
                    In addition, we display publicly available data retrieved from the Steam Workshop API
                    (e.g., item titles, descriptions, preview images, and authorship information). 
                    These are public Steam assets and do not contain personal data as defined by GDPR.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">2. Purpose of Data Use</h2>
                  <p className="pl-8">
                    The email address and account information obtained via OAuth2 are used solely
                    for user identification and authentication within the site.
                    We do not use these data for marketing, analytics, or advertising purposes.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">3. Data Storage and Retention</h2>
                  <p className="pl-8">
                    Personal data are stored securely and retained only as long as your account exists.
                    Once you delete your account, all associated data (including email, comments,
                    and favorite maps) will be permanently removed.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">4. Data Sharing</h2>
                  <p className="pl-8">
                    We do not sell, trade, or share personal data with third parties.
                    Public data displayed on the website are sourced directly from
                    the Steam API under Valve&apos;s public data terms.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">5. User Rights</h2>
                  <p className="pl-8">
                    You have the right to access, correct, and delete your personal data.
                    A user interface for account and data deletion will be available directly
                    on the website. We do not require email contact for data removal requests.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">6. Security</h2>
                  <p className="pl-8">
                    We take appropriate technical and organizational measures to protect your data
                    against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">7. External Links and Third-Party Services</h2>
                  <p className="pl-8">
                    Our website may contain links to external resources such as the official
                    Beton Brutal Discord server or Steam pages. We are not responsible for
                    the privacy practices of third-party websites or services.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">8. Changes to This Policy</h2>
                  <p className="pl-8">
                    We may update this Privacy Policy occasionally to reflect new features
                    or legal requirements. Updates will be posted on this page with a revised
                    &quot;Last updated&quot; date.
                  </p>
                </Container>

                <Container>
                  <h2 className="text-4xl text-white mt-4 mb-2">9. Contact</h2>
                  <p className="pl-8">
                    For questions, feedback, or data-related inquiries, please reach out through
                    the official Beton Brutal Discord server (to xannix_8248 or bowilla).
                  </p>
                </Container>
                
                <Container>
                  <p className="text-gray-400">Last updated: October 2025</p>
                </Container>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
