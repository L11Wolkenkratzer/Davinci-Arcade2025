import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import PacManGame from './Game1_PACMAN/PacManGame';
import SpaceshipGame from './Game_SPACESHIPS/SpaceshipsGame.tsx';  
import Snake from './Game_Snake/snake.tsx'; 
import Dino from  './Game_Dinojump/Dinojump.tsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/arcade" element={<Home />} />
                <Route path="/pacman" element={<PacManGame />} />
                <Route path="/spaceships" element={<SpaceshipGame />} />
                <Route path="/snake" element={<Snake />} />
                <Route path="/dino" element={<Dino />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
