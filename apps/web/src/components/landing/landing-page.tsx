import { AuthenticationSection } from "./authentication-section";
import { ConnectionFlow } from "./connection-flow";
import { DeveloperSection } from "./developer-section";
import { DiscoverSection } from "./discover-section";
import { FeatureCards } from "./feature-cards";
import { HeroSection } from "./hero-section";
import { OpenSourceSection } from "./open-source-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function LandingPage() {
  return (
    <div className="landing-page" id="top">
      <div className="page-container">
        <SiteHeader />
        <main>
          <HeroSection />
          <ConnectionFlow />
          <DiscoverSection />
          <FeatureCards />
          <DeveloperSection />
          <AuthenticationSection />
          <OpenSourceSection />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
