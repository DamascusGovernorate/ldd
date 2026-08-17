import Hero from "./components/homepageSections/Hero";
import AboutSummery from "./components/homepageSections/AboutSummery";
import LatestProjects from "./components/homepageSections/LatestProjects";
import LatestInitiatives from "./components/homepageSections/LatestInitiatives";
import InfluenceStatistics from "./components/homepageSections/InfluenceStatistics";
import JoinUs from "./components/homepageSections/JoinUs";
import LatestNews from "./components/homepageSections/LatestNews";
import EmailSubscribe from "./components/homepageSections/EmailSubscribe";
import Partners from "./components/homepageSections/Partners";

export default function Home() {
  return (
    <div>
      <Hero />
      <AboutSummery />
      <LatestProjects />
      <LatestInitiatives />
      <InfluenceStatistics />
      <JoinUs />
      <LatestNews />
      <EmailSubscribe />
      <Partners />
    </div>
  );
}