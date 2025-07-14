import "./Home.css"
import settingsImage from "../assets/settingsImage.png"

function Home() {
    return (
        <>
            <h1 className={"ArcadeTitle"}>DAVINCI ARCADE</h1>
            <img className="SettingsImage" src={settingsImage} alt="EinstellungenBild"/>


        </>
    )
}

export default Home;
