import GamePage from "./PhaserGame/GamePage.js";
import MusicListPage from "./MusicListPage.js";
import HomePage from "./HomePage.js";
import AboutUsPage from "./AboutUsPage.js";
import HelpPage from "./HelpPage.js";
import {OptionsPage} from "./OptionsPage.js";
import RankingPage from "./RankingPage.js";
import AddMusicInfo from "./AddMusicInfoPage.js";
import LoginPage from "./LoginPage.js";
import RegisterPage from "./RegisterPage.js";
import LogoutComponent from "./LogoutComponent.js";
import ErrorPage from "./ErrorPage.js";
import EditPage from "./PhaserEdit/EditPage.js";
import {getUserSessionData} from "../utils/Session.js";

const routes = {
    "/": HomePage,
    "/login": LoginPage,
    "/register": RegisterPage,
    "/logout": LogoutComponent,
    "/game": GamePage,
    "/list": MusicListPage,
    "/aboutus": AboutUsPage,
    "/help": HelpPage,
    "/ranking": RankingPage,
    "/options": OptionsPage,
    "/addBeatmap": AddMusicInfo,
    "/edit": EditPage,
};

let componentToRender;
let navbar = document.querySelector("#navbar");
let game;

const Router = () => {
    window.addEventListener("load", onLoadHandler);
    navbar.addEventListener("click", onNavigateHandler);
    window.addEventListener("popstate", onHistoryHandler);
}

//onLoadHandler
const onLoadHandler = (e) => {
    let user = getUserSessionData();
    if(user){
        fetch("/api/users/testToken", {
            method: "GET",
            headers: {
                Authorization: user.token,
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            console.log(response);
            if (!response.ok) throw new Error("Error code : " + response.status + " : " + response.statusText);
            return response.json();
        })
        .then(() => {
            console.log("jwt valid");
            load(window.location.pathname);
        })
        .catch((err) => {
            console.log("jwt expired");
            RedirectUrl("/logout"); // jwt expired
        });
    }else{
        load(window.location.pathname);
    }
};

const load = (url) => {
    console.log("onLoad : ", url);
    if (url==="/game") {
        createGame();
        return;
    }
    componentToRender = routes[url];
    if(!componentToRender){
        ErrorPage(url)
        return;
    }
    componentToRender();
}

//onNavigateHandler
const onNavigateHandler = (e) => {
    if (game)
        killGame();
    let uri;
    e.preventDefault();
    uri = e.target.dataset.uri;
    if(uri) {
        console.log("onNavigate : ", uri);
        if (window.location.pathname==="/list")
            removeModals();
        if (uri==="/game") {
            window.history.pushState({}, uri, window.location.origin + uri);
            createGame();
            return;
        }
        window.history.pushState({}, uri, window.location.origin + uri);
        componentToRender = routes[uri];
        if(!componentToRender) {
            ErrorPage(uri);
            return;
        }
        componentToRender();
       
    }
};

//onHistoryHandler (arrows <- -> )
const onHistoryHandler = (e) => {
    if (game)
        killGame();
    console.log("onHistory : ", window.location.pathname);
    removeModals();
    if (window.location.pathname==="/game") {
        createGame();
        return;
    }
    componentToRender = routes[window.location.pathname];
    if(!componentToRender){
        ErrorPage(window.location.pathname);
        return;
    }
    componentToRender();
};

const RedirectUrl = (uri, data) => {
    if (game)
        killGame();
    removeModals();
    console.log(uri)
    console.log(window.location.origin + uri)
    window.history.pushState({}, uri, window.location.origin + uri);
    
    console.log(window.location.pathname);
    if (window.location.pathname==="/game") {
        if (!data)  
            createGame();
        else
            createGame(data);
        return;
    }
    componentToRender = routes[uri];
    
    if(!componentToRender){
        ErrorPage(uri);
        return;
    }
    if(!data)
        componentToRender();
    else 
        componentToRender(data);
};


const searchForPlayBtns = () => {
    let playBtnArray = document.querySelectorAll(".playBtn");
    for (let index = 0; index < playBtnArray.length; index++) {
        let playBtn = playBtnArray[index];
        let beatmapID = playBtn.id;
        playBtn.addEventListener("click", () => {
            RedirectUrl("/game", beatmapID);
        });
    }
}


const removeModals = () => {
    let modalArray = document.querySelectorAll(".modal-backdrop");
    for (let index = 0; index < modalArray.length; index++) {
        let m = modalArray[index];
        m.parentNode.removeChild(m);
    }
}

const killGame = () => {
    game.scene.scenes[0].stackTimeout.forEach(timeoutID => clearTimeout(timeoutID));
    game.scene.scenes[0].stackInterval.forEach(intervalID => clearInterval(intervalID));
    game = undefined;
    let navbar = document.querySelector("#navbar");
    navbar.className -= " d-none";
    let footer = document.querySelector("#footer");
    footer.className -= " d-none";
}

const createGame = async (data) => {
    game = await GamePage(data);
}

export { Router, RedirectUrl, searchForPlayBtns};