import "./App.css";
import GithubContributionHeatmap from "./components/GitHeatMap";
import ContributionStats from "./components/ContributionStats";
function App() {

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">GitHub Contribution Stats</h1>
      <GithubContributionHeatmap />
      <ContributionStats />
      </div>
    </>
  );
}

export default App;
