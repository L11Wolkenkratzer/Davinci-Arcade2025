import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import PacManGame from './Game1_PACMAN/PacManGame';
import SpaceshipGame from './Game_SPACESHIPS/SpaceshipsGame.tsx';  // ⬅︎ NEU

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/arcade" element={<Home />} />
                <Route path="/pacman" element={<PacManGame />} />
                <Route path="/spaceships" element={<SpaceshipGame />} />  {/* ⬅︎ NEU */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
