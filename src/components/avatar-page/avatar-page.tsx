import "./avatar-page.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import DefaultHat from "../../assets/images/avatar-page/default-hat.png";
import DefaultCape from "../../assets/images/avatar-page/default-cape.png";
import DefaultWeapon from "../../assets/images/avatar-page/default-sword.png";
import DefaultShield from "../../assets/images/avatar-page/default-shield.png";
import DefaultNecklace from "../../assets/images/avatar-page/default-necklace.png";
import DefaultArmour from "../../assets/images/avatar-page/default-armour.png";
import DefaultPet from "../../assets/images/avatar-page/default-pet.png";
import DefaultSpellbook from "../../assets/images/avatar-page/default-spellbook.png";

function AvatarPage() {
  const { userData } = useUserSocket();

  return (
    <div id="avatar-page-container">
      <div id="equipment-slot-wrapper">
        <div id="equipment-slot-container">
          <div className="equipment-slot-label">Equipment</div>
          {/* Row 1: Hat */}
          <div className="avatar-row">
            <div className="hat-slot">
              {userData.hat ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultHat}></img>
              )}
            </div>
          </div>

          {/* Row 2: Cape, Necklace, Pet */}
          <div className="avatar-row">
            <div className="cape-slot">
              {userData.cape ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultCape}></img>
              )}
            </div>
            <div className="necklace-slot">
              {userData.necklace ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultNecklace}></img>
              )}
            </div>
            <div className="pet-slot">
              {userData.pet ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultPet}></img>
              )}
            </div>
          </div>

          {/* Row 3: Shield, Armour, Weapon */}
          <div className="avatar-row">
            <div className="shield-slot">
              {userData.shield ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultShield}></img>
              )}
            </div>
            <div className="armour-slot">
              {userData.armour ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultArmour}></img>
              )}
            </div>
            <div className="weapon-slot">
              {userData.weapon ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultWeapon}></img>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="spellbook-slot-wrapper">
        <div id="spellbook-slot-container">
          <div className="spellbook-slot-label">Spellbooks</div>

          <div className="avatar-row">
            <div className="spellbook-slot">
              {userData.cape ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultSpellbook}></img>
              )}
            </div>
            <div className="spellbook-slot">
              {userData.necklace ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultSpellbook}></img>
              )}
            </div>
            <div className="spellbook-slot">
              {userData.pet ? (
                <img className="slot-image"></img>
              ) : (
                <img className="slot-image" src={DefaultSpellbook}></img>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarPage;
