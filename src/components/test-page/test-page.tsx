import "./test-page.css";
import { useSocket } from "../../redux/socket/socket-context";

function TestPage() {
  const { socket } = useSocket();

  const handleGetWood = () => {
    if (socket) {
      console.log("Emitting socket event for mint-item: Wood x10");
      socket.emit("mint-item", {
        itemId: 1,
        quantity: 10,
      });
    }
  };

  const handleMintGen0Slime = () => {
    if (socket) {
      console.log("Emitting socket event for mint-gen-0-slime");
      socket.emit("mint-gen-0-slime");
    }
  };

  return (
    <div className="test-page">
      <button className="action-button" onClick={handleGetWood}>
        Get Wood x10
      </button>
      <button className="action-button" onClick={handleMintGen0Slime}>
        Mint Gen 0 Slime
      </button>
    </div>
  );
}

export default TestPage;
