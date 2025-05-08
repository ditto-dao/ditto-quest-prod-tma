import "./slime-lab-breeding.css";
import TimerIcon from "../../../assets/images/general/timer.svg";
import {
  formatDuration,
  getBreedingTimesByGeneration,
  getChildTraitProbabilities,
  getHighestDominantTraitRarity,
} from "../../../utils/helpers";
import { useIdleSkillSocket } from "../../../redux/socket/idle/skill-context";
import { useSocket } from "../../../redux/socket/socket-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import LoopingTimerBar from "../../looping-timer-bar/looping-timer-bar";
import { useCombatSocket } from "../../../redux/socket/idle/combat-context";
import ExitCombatMsg from "../../notifications/notification-content/exit-combat-first/exit-combat-first";
import { useNotification } from "../../notifications/notification-context";

function SlimeLabBreedingPage() {
  const { socket } = useSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const {
    slimeToBreed0,
    slimeToBreed1,
    breedingStatus,
    startBreeding,
    stopBreeding,
  } = useIdleSkillSocket();
  const { isBattling } = useCombatSocket();
  const { addNotification } = useNotification();

  // Generate trait probabilities when both slimes are selected
  const traitProbabilities =
    slimeToBreed0 && slimeToBreed1
      ? getChildTraitProbabilities(slimeToBreed0, slimeToBreed1)
      : null;

  const handleBreed = () => {
    if (socket && slimeToBreed0 && slimeToBreed1 && canEmitEvent()) {
      if (isBattling) {
        addNotification(() => <ExitCombatMsg />);
        return;
      }

      if (!breedingStatus) {
        socket.emit("breed-slimes", {
          sireId: slimeToBreed0.id,
          dameId: slimeToBreed1.id,
        });
        setLastEventEmittedTimestamp(Date.now());
        startBreeding(
          Date.now(),
          getBreedingTimesByGeneration(slimeToBreed0.generation) +
            getBreedingTimesByGeneration(slimeToBreed1.generation)
        );
      } else {
        socket.emit("stop-breed-slimes", {
          sireId: slimeToBreed0.id,
          dameId: slimeToBreed1.id,
        });
        setLastEventEmittedTimestamp(Date.now());
        stopBreeding();
      }
    }
  };

  return (
    <div id="slime-lab-breeding-container">
      <div className="breeding-dropdown-row">
        <div className="breeding-dropdown-wrapper">
          <div className="slime-preview-box">
            {slimeToBreed0 ? (
              <img
                src={slimeToBreed0.imageUri}
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
                src={slimeToBreed1.imageUri}
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

      {breedingStatus && slimeToBreed0 && slimeToBreed1 && (
        <LoopingTimerBar
          durationS={
            getBreedingTimesByGeneration(slimeToBreed0.generation) +
            getBreedingTimesByGeneration(slimeToBreed1.generation)
          } // Use standard duration for looping
          startTimestamp={breedingStatus.startTimestamp}
        />
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
          <div className="breed-duration-container">
            <img src={TimerIcon}></img>
            <div className="breed-duration-text">
              {formatDuration(
                getBreedingTimesByGeneration(slimeToBreed0!.generation) +
                  getBreedingTimesByGeneration(slimeToBreed1!.generation)
              )}
            </div>
          </div>
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
                    <th className="child-trait-header-cell">%</th>
                  </tr>
                </thead>
                <tbody>
                  {traits.map(({ name, rarity, probability }) => (
                    <tr key={name} className="child-trait-row">
                      <td className="child-trait-cell">{name}</td>
                      <td className="child-trait-cell rarity-cell">
                        <div
                          className={`trait-rarity rarity-${rarity.toLowerCase()}`}
                        >
                          {rarity}
                        </div>
                      </td>
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
