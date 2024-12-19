import "./slime-lab-breeding.css";
import SlimePlaceholderImage from "../../../assets/images/general/dq-logo.png";
import {
  getChildTraitProbabilities,
  getHighestDominantTraitRarity,
} from "../../../utils/helpers";
import { useIdleSocket } from "../../../redux/socket/idle/idle-context";
import { useSocket } from "../../../redux/socket/socket-context";
import { useEffect, useState } from "react";

function SlimeLabBreedingPage() {
  const { socket } = useSocket();
  const { slimeToBreed0, slimeToBreed1, breedingStatus } = useIdleSocket();

  // Generate trait probabilities when both slimes are selected
  const traitProbabilities =
    slimeToBreed0 && slimeToBreed1
      ? getChildTraitProbabilities(slimeToBreed0, slimeToBreed1)
      : null;

  const handleBreed = () => {
    if (socket && slimeToBreed0 && slimeToBreed1) {
      if (!breedingStatus) {
        socket.emit("breed-slimes", {
          sireId: slimeToBreed0.id,
          dameId: slimeToBreed1.id,
        });
      } else {
        socket.emit("stop-breed-slimes", {
          sireId: slimeToBreed0.id,
          dameId: slimeToBreed1.id,
        });
      }
    }
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (breedingStatus) {
      const totalDuration = breedingStatus.durationS * 1000;
      const startTime = breedingStatus.startTimestamp;
      const endTime = startTime + totalDuration;

      const updateProgress = () => {
        const currentTime = Date.now(); // Dynamically calculate the current time
        const elapsedTime = currentTime - startTime; // Time passed since the start
        const progressPercent = Math.min(
          (elapsedTime / totalDuration) * 100,
          100
        );

        if (elapsedTime < 0) {
          setProgress(0); // If crafting hasn't started yet, set progress to 0
          return;
        }

        setProgress(progressPercent);

        if (currentTime >= endTime) {
          clearInterval(interval); // Clear interval when crafting is complete
          setProgress(100); // Ensure progress is set to 100% at the end
        }
      };

      // Skip the interval if the crafting is already complete
      if (Date.now() >= endTime) {
        setProgress(100);
        return;
      }

      // Initial progress update
      updateProgress();

      // Set interval for regular progress updates
      const interval = setInterval(updateProgress, 100);

      return () => clearInterval(interval); // Cleanup interval on unmount or craftingStatus change
    } else {
      setProgress(0); // Reset progress if craftingStatus is null
    }
  }, [breedingStatus]);

  return (
    <div id="slime-lab-breeding-container">
      <div className="breeding-dropdown-row">
        <div className="breeding-dropdown-wrapper">
          <div className="slime-preview-box">
            {slimeToBreed0 ? (
              <img
                src={SlimePlaceholderImage}
                alt={`Slime ${slimeToBreed0.id}`}
                className={`slime-preview-image rarity-${getHighestDominantTraitRarity(
                  slimeToBreed0
                ).toLowerCase()}`}
              />
            ) : (
              <div className="slime-placeholder"></div>
            )}
          </div>
          <div className="slime-to-breed-id">
            {slimeToBreed0 ? `Slime ${slimeToBreed0.id}` : ""}
          </div>
          <div className="slime-generation">
            {slimeToBreed0 ? `Gen ${slimeToBreed0.generation}` : ""}
          </div>
        </div>

        <div className="breeding-dropdown-wrapper">
          <div className="slime-preview-box">
            {slimeToBreed1 ? (
              <img
                src={SlimePlaceholderImage}
                alt={`Slime ${slimeToBreed1.id}`}
                className={`slime-preview-image rarity-${getHighestDominantTraitRarity(
                  slimeToBreed1
                ).toLowerCase()}`}
              />
            ) : (
              <div className="slime-placeholder"></div>
            )}
          </div>
          <div className="slime-to-breed-id">
            {slimeToBreed1 ? `Slime ${slimeToBreed1.id}` : ""}
          </div>
          <div className="slime-generation">
            {slimeToBreed1 ? `Gen ${slimeToBreed1.generation}` : ""}
          </div>
        </div>
      </div>

      {breedingStatus && (
        <div className="breed-timer-bar">
          <div
            className="breed-timer-bar-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {traitProbabilities && (
        <div className="breed-button-wrapper">
          <button
            className={`breed-button ${
              breedingStatus ? "breed-button-red" : ""
            }`}
            onClick={handleBreed}
          >
            {breedingStatus ? "Cancel Breed" : "Breed Slimes"}
          </button>
        </div>
      )}

      <div className="child-trait-table-para">
        {traitProbabilities ? (
          <>
            The tables below show the probabilities of each parent trait being
            passed down to the child for each gene (D, H1, H2, and H3).
          </>
        ) : slimeToBreed0 || slimeToBreed1 ? (
          <>Only one slime selected. Please select another slime to proceed.</>
        ) : (
          <>
            No parent slimes selected. Please select two slimes from your
            inventory.
          </>
        )}
      </div>

      {/* Trait Probabilities Table */}
      {traitProbabilities && (
        <div className="child-trait-probabilities-section">
          {Object.entries(traitProbabilities).map(([traitType, traits]) => (
            <div key={traitType} className="child-trait-table-wrapper">
              <div className="child-trait-type-title">{traitType}</div>
              <table className="child-trait-table">
                <thead>
                  <tr>
                    <th className="child-trait-header-cell">Trait</th>
                    <th className="child-trait-header-cell">Rarity</th>
                    <th className="child-trait-header-cell">Probability (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {traits.map(({ name, rarity, probability }) => (
                    <tr key={name} className="child-trait-row">
                      <td className="child-trait-cell">{name}</td>
                      <td className="child-trait-cell rarity-cell">{rarity}</td>
                      <td className="child-trait-cell">
                        {probability.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SlimeLabBreedingPage;
