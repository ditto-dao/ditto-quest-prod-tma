import "./sidebar.css";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    setPage: (page: string) => void;
}

function Sidebar({ isOpen, toggleSidebar, setPage }: SidebarProps) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={toggleSidebar}>✕</button>
            <ul>
                <li><a onClick={() => setPage("Shop")}>Shop</a></li>
                <li className="gap"></li>
                <li><a onClick={() => setPage("Avatar")}>Avatar</a></li>
                <li><a onClick={() => setPage("Inventory")}>Inventory</a></li>
                <li><a onClick={() => setPage("Skills")}>Skills</a></li>
                <li><a onClick={() => setPage("Farming")}>Farming</a></li>
                <li><a onClick={() => setPage("Crafting")}>Crafting</a></li>
                <li><a onClick={() => setPage("Slime Lab")}>Slime Lab</a></li>
                <li><a onClick={() => setPage("Combat")}>Combat</a></li>
                <li><a onClick={() => setPage("Test")}>Test</a></li>
            </ul>
        </div>
    );
}

export default Sidebar;
