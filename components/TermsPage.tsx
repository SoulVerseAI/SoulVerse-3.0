import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, BookOpenIcon } from './icons/Icons';

// --- Legal Content ---
const termsOfServiceContent = (
    <>
        <h2 id="terms-main">Terms of Service</h2>
        <p>Last updated: October 26, 2023</p>
        <p>Welcome to SoulVerse. These terms and conditions outline the rules and regulations for the use of SoulVerse's Website and services.</p>
        <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use SoulVerse if you do not agree to all of the terms and conditions stated on this page.</p>
        <h3 id="terms-terminology">Terminology</h3>
        <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company, Grzegorz Kryniecki. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of California, United States. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.</p>
        <h3 id="terms-user-content">User-Generated Content</h3>
        <p>This Agreement shall begin on the date hereof. Our Terms and Conditions were created with the help of the Terms And Conditions Generator.</p>
        <p>Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Grzegorz Kryniecki does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of Grzegorz Kryniecki,its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, Grzegorz Kryniecki shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.</p>
        <p>Grzegorz Kryniecki reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</p>
        <p>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;</p>
        <ul className="list-disc list-inside space-y-2">
            <li>The Comments do not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party;</li>
            <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy</li>
            <li>The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.</li>
        </ul>
        <p>You hereby grant Grzegorz Kryniecki a non-exclusive license to use, reproduce, edit and authorize others to use, reproduce and edit any of your Comments in any and all forms, formats or media.</p>
        <h3 id="terms-age-subscription">Age Requirement & Subscription</h3>
        <p>You must be at least 18 years of age to use SoulVerse. By using SoulVerse, you represent and warrant that you are at least 18 years of age.</p>
        <p>SoulVerse offers a subscription service. By subscribing, you agree to pay the fees specified for your chosen plan. All payments are handled by our third-party payment processors. We do not store your credit card information.</p>
        <p>You may cancel your subscription at any time. However, we do not offer refunds for any subscription fees already paid.</p>
        <h3 id="terms-termination-modification">Termination and Modification</h3>
        <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of SoulVerse, us, or third parties, or for any other reason.</p>
        <p>We may modify these terms at any time. We will do our best to notify you of any changes, but it is your responsibility to review these terms periodically. Your continued use of SoulVerse after any modifications indicates your acceptance of the new terms.</p>
        <h3 id="terms-disclaimer-liability">Disclaimer and Limitation of Liability</h3>
        <p>SoulVerse is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.</p>
        <p>In no event shall Grzegorz Kryniecki, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the service; (ii) any conduct or content of any third party on the service; (iii) any content obtained from the service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
        <p>These Terms shall be governed and construed in accordance with the laws of California, United States, without regard to its conflict of law provisions.</p>
    </>
);

const privacyPolicyContent = (
    <>
        <h2 id="privacy-main">Privacy Policy</h2>
        <p>Last updated: October 26, 2023</p>
        <p>Grzegorz Kryniecki operates the SoulVerse app, which provides the SERVICE.</p>
        <p>This page is used to inform app users regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.</p>
        <p>If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.</p>
        <p>The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which is accessible at SoulVerse app, unless otherwise defined in this Privacy Policy.</p>
        <h3 id="privacy-collection-use">Information Collection and Use</h3>
        <p>For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information, including but not to your name, and other information. The information that we request will be retained by us and used as described in this privacy policy.</p>
        <p>The app does use third party services that may collect information used to identify you.</p>
        <h3 id="privacy-log-data">Log Data</h3>
        <p>We want to inform you that whenever you use our Service, in a case of an error in the app we collect data and information (through third party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics.</p>
        <h3 id="privacy-cookies">Cookies</h3>
        <p>Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.</p>
        <p>This Service does not use these “cookies” explicitly. However, the app may use third party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.</p>
        <h3 id="privacy-service-providers">Service Providers</h3>
        <p>We may employ third-party companies and individuals due to the following reasons:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>To facilitate our Service;</li>
            <li>To provide the Service on our behalf;</li>
            <li>To perform Service-related services; or</li>
            <li>To assist us in analyzing how our Service is used.</li>
        </ul>
        <p>We want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.</p>
        <h3 id="privacy-security">Security</h3>
        <p>We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.</p>
        <h3 id="privacy-links">Links to Other Sites</h3>
        <p>This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
        <h3 id="privacy-children">Children’s Privacy</h3>
        <p>These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.</p>
        <h3 id="privacy-changes">Changes to This Privacy Policy</h3>
        <p>We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.</p>
        <h3 id="privacy-contact">Contact Us</h3>
        <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>
    </>
);

const contentPolicyContent = (
    <>
        <h2 id="content-main">Content Policy</h2>
        <p>Last updated: November 27, 2023</p>
        <p>SoulVerse is committed to providing a safe and respectful platform for all users. This Content Policy outlines the types of content and behavior that are prohibited on our platform.</p>
        <h3 id="content-age">Age Requirement</h3>
        <p>The use of SoulVerse is intended for users who are 18 years of age or older.</p>
        <h3 id="content-nsfw">NSFW Content</h3>
        <p>While we do not actively filter Not-Safe-For-Work (NSFW) content, we expect our users to engage responsibly and consensually.</p>
        <h3 id="content-prohibited">Prohibited Content</h3>
        <p>The following types of content are strictly prohibited:</p>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Hate speech:</strong> Content that promotes violence, incites hatred, promotes discrimination, or disparages on the basis of race or ethnic origin, religion, disability, age, nationality, veteran status, sexual orientation, sex, gender, gender identity, caste, or any other characteristic that is associated with systemic discrimination or marginalization.</li>
            <li><strong>Harassment and cyberbullying:</strong> Content that is abusive, threatening, or intended to harass, intimidate, or bully another individual.</li>
            <li><strong>Violence:</strong> Content that depicts or promotes graphic violence, self-harm, or suicide.</li>
            <li><strong>Illegal activities:</strong> Content that promotes or facilitates illegal activities, including but not to drug use, trafficking, and illegal sales of firearms.</li>
            <li><strong>Child exploitation:</strong> We have a zero-tolerance policy for content that depicts or promotes child sexual abuse, exploitation, or endangerment. We will report any such content to the appropriate authorities.</li>
            <li><strong>Spam and malicious content:</strong> Content that is intended to deceive, mislead, or harm other users, including but not to spam, phishing, and malware.</li>
        </ul>
        <p className="mt-4">We reserve the right to take action against any user who violates this Content Policy, including but not to content removal, account suspension, or account termination.</p>
        <p>We may update this Content Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
    </>
);

// --- Data Structure ---
const legalTopics = [
    { id: 'terms-of-service', title: 'Terms of Service', content: termsOfServiceContent },
    { id: 'privacy-policy', title: 'Privacy Policy', content: privacyPolicyContent },
    { id: 'content-policy', title: 'Content Policy', content: contentPolicyContent },
];

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  const [activeTopicId, setActiveTopicId] = useState<string>('terms-of-service');
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);
  const headingElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Effect to generate Table of Contents
  useEffect(() => {
    headingElementsRef.current.clear();
    const newHeadings: Heading[] = [];
    if (mainContentRef.current) {
        const contentContainer = mainContentRef.current.querySelector('.legal-content');
        if (contentContainer) {
            const headingNodes = contentContainer.querySelectorAll('h2, h3');
            headingNodes.forEach(node => {
                const el = node as HTMLElement;
                if (el.id && el.textContent) {
                    newHeadings.push({
                        id: el.id,
                        text: el.textContent,
                        level: parseInt(el.tagName.substring(1)),
                    });
                    headingElementsRef.current.set(el.id, el);
                }
            });
        }
    }
    setTimeout(() => {
        setHeadings(newHeadings);
        if (newHeadings.length > 0) {
            setActiveHeadingId(newHeadings[0].id);
        }
    }, 0);
  }, [activeTopicId]);

  // Effect for IntersectionObserver to highlight active ToC item
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const intersectingEntries = entries.filter(e => e.isIntersecting);
      if (intersectingEntries.length > 0) {
        intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveHeadingId(intersectingEntries[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0,
    });

    const currentObserver = observerRef.current;
    headingElementsRef.current.forEach(el => currentObserver.observe(el));

    return () => currentObserver.disconnect();
  }, [headings]);

  const activeTopic = legalTopics.find(t => t.id === activeTopicId) || legalTopics[0];

  const handleNavClick = (topicId: string) => {
    setActiveTopicId(topicId);
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 font-sans">
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/50 backdrop-blur-md shadow-lg z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-neutral-800/80 text-neutral-300 hover:text-white" aria-label="Back">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold soulverse-logo-gradient">SoulVerse Legal</h1>
            </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 p-4 border-r border-zinc-800 flex-shrink-0 flex flex-col">
            <nav className="flex-1 overflow-y-auto pr-2 -mr-2">
                <ul className="space-y-1">
                  {legalTopics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        onClick={() => handleNavClick(topic.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeTopicId === topic.id 
                            ? 'text-white font-semibold' 
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {topic.title}
                      </button>
                    </li>
                  ))}
                </ul>
            </nav>
        </aside>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 px-6 lg:px-12 py-8 overflow-y-auto" style={{scrollBehavior: 'smooth'}}>
          <div className="max-w-3xl mx-auto legal-content">
            <div className="prose-custom">
                {activeTopic.content}
            </div>
          </div>
          <style>{`
            .prose-custom h2 {
              font-size: 2.25rem;
              line-height: 2.5rem;
              font-weight: 800;
              letter-spacing: -0.025em;
              color: white;
              scroll-margin-top: 4rem;
              margin-bottom: 1rem;
            }
            .prose-custom h3 {
              font-size: 1.25rem;
              line-height: 1.75rem;
              font-weight: 700;
              color: white;
              margin-top: 3rem;
              margin-bottom: 1rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid var(--tw-prose-hr, #3f3f46);
              scroll-margin-top: 4rem;
            }
            .prose-custom p, .prose-custom ul {
              color: #d4d4d8; /* zinc-300 */
              line-height: 1.75;
              margin-top: 1.25em;
              margin-bottom: 1.25em;
            }
            .prose-custom ul {
              list-style-type: disc;
              padding-left: 1.5em;
            }
             .prose-custom li::marker {
                color: #71717a; /* zinc-500 */
            }
          `}</style>
        </main>
        
        {/* Right ToC */}
        <aside className="w-64 p-6 border-l border-zinc-800 overflow-y-auto hidden lg:block flex-shrink-0">
            {headings.length > 0 && (
                <div className="sticky top-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
                        <BookOpenIcon className="w-4 h-4" />
                        On this page
                    </h4>
                    <ul className="space-y-2 border-l border-zinc-800">
                        {headings.map(heading => (
                            <li key={heading.id}>
                                <a
                                href={`#${heading.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  document.getElementById(heading.id)?.scrollIntoView({behavior: 'smooth'});
                                  setActiveHeadingId(heading.id);
                                }}
                                className={`block text-sm transition-colors pl-4 border-l-2 ${
                                    activeHeadingId === heading.id
                                    ? 'text-white border-white'
                                    : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-500'
                                }`}
                                style={{ marginLeft: `${(heading.level - 2) * 1}rem`, transform: 'translateX(-2px)'}}
                                >
                                {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
      </div>
    </div>
  );
};