
/** @jsx dom */

let indexSong = 0;
let isLocked = false;
let songsLength = null;
let selectedSong = null;
let loadingProgress = 0;
let songIsPlayed = false;
let progress_elmnt = null;
let songName_elmnt = null;
let sliderImgs_elmnt = null;
let singerName_elmnt = null;
let progressBar_elmnt = null;
let playlistSongs_elmnt = [];
let loadingProgress_elmnt = null;
let musicPlayerInfo_elmnt = null;
let progressBarIsUpdating = false;
let broadcastGuarantor_elmnt = null;
const root = querySelector("#root");

function App({ songs }) {
  function handleChangeMusic({ isPrev = false, playListIndex = null }) {
    if (isLocked || indexSong === playListIndex) return;

    if (playListIndex || playListIndex === 0) {
      indexSong = playListIndex;
    } else {
      indexSong = isPrev ? indexSong -= 1 : indexSong += 1;
    }

    if (indexSong < 0) {
      indexSong = 0;
      return;
    } else if (indexSong > songsLength) {
      indexSong = songsLength;
      return;
    }

    selectedSong.pause();
    selectedSong.currentTime = 0;
    progressBarIsUpdating = false;
    selectedSong = playlistSongs_elmnt[indexSong];
    selectedSong.paused && songIsPlayed ?
    selectedSong.play() :
    selectedSong.pause();

    setBodyBg(songs[indexSong].bg);
    setProperty(sliderImgs_elmnt, "--index", -indexSong);
    updateInfo(songName_elmnt, songs[indexSong].songName); // Actualiza el nombre de la canción
    updateInfo(singerName_elmnt, songs[indexSong].artist); // Actualiza el nombre del artista
  }

  setBodyBg(songs[0].bg);

  return (
    dom("div", { class: "music-player flex-column" },
    dom(Slider, { slides: songs, handleChangeMusic: handleChangeMusic }),
    dom(Playlist, { list: songs, handleChangeMusic: handleChangeMusic })));


}

function Slider({ slides, handleChangeMusic }) {
  function handleResizeSlider({ target }) {
    if (isLocked) {
      return;
    } else if (target.classList.contains("music-player__info")) {
      this.classList.add("resize");
      setProperty(this, "--controls-animate", "down running");
      return;
    } else if (target.classList.contains("music-player__playlist-button")) {
      this.classList.remove("resize");
      setProperty(this, "--controls-animate", "up running");
      return;
    }
  }
  function handlePlayMusic() {
    if (selectedSong.currentTime === selectedSong.duration) {
      handleChangeMusic({});
    }

    this.classList.toggle("click");
    songIsPlayed = !songIsPlayed;
    selectedSong.paused ? selectedSong.play() : selectedSong.pause();
  }

  return (
    dom("div", { class: "slider center", onClick: handleResizeSlider },
    dom("div", { class: "slider__content center" },
    dom("button", { class: "music-player__playlist-button center button" },
    dom("i", { class: "icon-playlist" })),

    dom("button", {
      onClick: handlePlayMusic,
      class: "music-player__broadcast-guarantor center button" },

    dom("i", { class: "icon-play" }),
    dom("i", { class: "icon-pause" })),

    dom("div", { class: "slider__imgs flex-row" },
    slides.map(({ songName, files: { cover } }) =>
    dom("img", { src: cover, class: "img", alt: songName })))),

    dom("div", { class: "slider__controls center" },
    dom("button", {
      class: "slider__switch-button flex-row button",
      onClick: () => handleChangeMusic({ isPrev: true }) },

    dom("i", { class: "icon-back" })),

    dom("div", { class: "music-player__info text_trsf-cap" },
    dom("div", null,
    dom("div", { class: "music-player__singer-name" },
    dom("div", null, slides[0].songName))),

    dom("div", null,
    dom("div", { class: "music-player__subtitle" },
    dom("div", null, slides[0].artist)))),

    dom("button", {
      class: "slider__switch-button flex-row button",
      onClick: () => handleChangeMusic({ isPrev: false }) },

    dom("i", { class: "icon-next" })),

    dom("div", {
      class: "progress center",
      onPointerdown: e => {
        handleScrub(e);
        progressBarIsUpdating = true;
      } },

    dom("div", { class: "progress__wrapper" },
    dom("div", { class: "progress__bar center" }))))));

}

function Playlist({ list, handleChangeMusic }) {
  function loadedAudio() {
    const duration = this.duration;
    const target = this.parentElement.querySelector(
    ".music-player__song-duration");


    let min = parseInt(duration / 60);
    if (min < 10) min = "0" + min;

    let sec = parseInt(duration % 60);
    if (sec < 10) sec = "0" + sec;

    target.appendChild(document.createTextNode(`${min}:${sec}`));
  }

  function updateTheProgressBar() {
    const duration = this.duration;
    const currentTime = this.currentTime;

    const progressBarWidth = currentTime / duration * 100;
    setProperty(progressBar_elmnt, "--width", `${progressBarWidth}%`);

    if (songIsPlayed && currentTime === duration) {
      handleChangeMusic({});
    }

    if (
    indexSong === songsLength &&
    this === selectedSong &&
    currentTime === duration)
    {
      songIsPlayed = false;
      broadcastGuarantor_elmnt.classList.remove("click");
    }
  }

  return (
    dom("ul", { class: "music-player__playlist list" },
    list.map(({ songName, artist, files: { cover, song } }, index) => {
      return (
        dom("li", {
          class: "music-player__song",
          onClick: () =>
          handleChangeMusic({ isPrev: false, playListIndex: index }) },


        dom("div", { class: "flex-row _align_center" },
        dom("img", { src: cover, class: "img music-player__song-img" }),
        dom("div", { class: "music-player__playlist-info  text_trsf-cap" },
        dom("b", { class: "text_overflow" }, songName),
        dom("div", { class: "flex-row _justify_space-btwn" },
        dom("span", { class: "music-player__subtitle" }, artist),
        dom("span", { class: "music-player__song-duration" })))),



        dom("audio", {
          src: song,
          onLoadeddata: loadedAudio,
          onTimeupdate: updateTheProgressBar })));



    })));


}

function Loading() {
  return (
    dom("div", { class: "loading flex-row" },
    dom("span", { class: "loading__progress" }, "0"),
    dom("span", null, "%")));


}

function dom(tag, props, ...children) {
  if (typeof tag === "function") return tag(props, ...children);

  function addChild(parent, child) {
    if (Array.isArray(child)) {
      child.forEach(nestedChild => addChild(parent, nestedChild));
    } else {
      parent.appendChild(
      child.nodeType ? child : document.createTextNode(child.toString()));

    }
  }

  const element = document.createElement(tag);

  Object.entries(props || {}).forEach(([name, value]) => {
    if (name.startsWith("on") && name.toLowerCase() in window) {
      element[name.toLowerCase()] = value;
    } else if (name === "style") {
      Object.entries(value).forEach(([styleProp, styleValue]) => {
        element.style[styleProp] = styleValue;
      });
    } else {
      element.setAttribute(name, value.toString());
    }
  });

  children.forEach(child => {
    addChild(element, child);
  });

  return element;
}

const musicData = {
  "songs": [
    {
      "bg": "#04131a",
      "artist": "Eladio Carrion, Bad Bunny, Adricece",
      "songName": "VUELVE CANDY B x mbappe (Sped up)",
      "files": {
        "song": "badela.mp3",
        "cover": "imagenes/badela.jpg"
      }
    },
    {
      "bg": "#dc9c18",
      "artist": "Juice WRLD, Mora, Adricece",
      "songName": "como antes x lucid dreams",
      "files": {
        "song": "MORA lucid dreams.mp3",
        "cover": "imagenes/morajuice.jpg"
      }
    },
    {
      "bg": "#b5704a",
      "artist": "Playboi Carti, Bad Bunny, Adricece",
      "songName": "YO VISTO ASI x bando",
      "files": {
        "song": "carti bad.mp3",
        "cover": "imagenes/badcarti.jpg"
      }
    },
    {
      "bg": "#3d2c10",
      "artist": "Yeat, Anuel AA, Adricece",
      "songName": "If we being rëal x Una palabra",
      "files": {
        "song": "anuyeat.mp3",
        "cover": "imagenes/anuyeat.jpg"
      }
    },
    {
      "bg": "#291f53",
      "artist": "SAIKO, Bryant Myers, Anuel AA, Adricece",
      "songName": "ESKLAVA",
      "files": {
        "song": "ESKLAVA - SAIKO, Bryant Myers, Anuel AA.mp3",
        "cover": "imagenes/saikoba.png"
      }
    },
    {
      "bg": "#0a0c19",
      "artist": "SAIKO, Adricece",
      "songName": "3 CAÍDAS - Extended & Improved",
      "files": {
        "song": "SAIKO EXTENDIDA ALMA DE TRIANA.mp3",
        "cover": "imagenes/3caidas.jpg"
      }
    },
    {
      "bg": "#eedaa8",
      "artist": "Central Cee, Anuel AA, Adricece",
      "songName": "BAND4BRRR",
      "files": {
        "song": "anuel drill.mp3",
        "cover": "imagenes/centralbrrr.jpg"
      }
    },
    {
      "bg": "#171717",
      "artist": "anuel AA, eladio carrion, SAIKO, Adricece",
      "songName": "north carolina (ft. Saiko)",
      "files": {
        "song": "saiko anu ela.mp3",
        "cover": "imagenes/north.jpg"
      }
    },
    {
      "bg": "#363233",
      "artist": "Bad bunny, anuel AA, Adricece",
      "songName": "está cabrón ser yo x ONE CALL (sped up)",
      "files": {
        "song": "badanu base solo.mp3",
        "cover": "imagenes/badanu.jpg"
      }
    },
    {
      "bg": "#474747",
      "artist": "SAIKO, DELLAFUENTE, Adricece",
      "songName": "Sanuk Saiko Saduak",
      "files": {
        "song": "saikodella definitiva.mp3",
        "cover": "imagenes/dellasaiko.png"
      }
    },
    {
      "bg": "#000000",
      "artist": "Travis Scott, YOVNGCHIMI, 21 Savage, Anuel AA, Adricece",
      "songName": "Goosebumps - remix",
      "files": {
        "song": "vdef.mp3",
        "cover": "imagenes/goosebumps.jpg"
      }
    },
    {
      "bg": "#3d3d3d",
      "artist": "Playboi Carti, Cardi b, Bad Bunny, Adricece",
      "songName": "King Vamp! - remix",
      "files": {
        "song": "carti bad cardi.mp3",
        "cover": "imagenes/carti.jpg"
      }
    },
    {
      "bg": "#0d0d0d",
      "artist": "Eladio Carrion, rauw alejandro, bryant, myers, Adricece",
      "songName": "hey lil mynor (sped up)",
      "files": {
        "song": "hey lil mynor.mp3",
        "cover": "imagenes/lilmynor.jpg"
      }
    },
    {
      "bg": "#585664",
      "artist": "Trueno, Anuel aA, Adricece",
      "songName": "REAL GANGSTA LOVE (ft. Anuel AA)",
      "files": {
        "song": "GANGSTA LOVE ANUEL.mp3",
        "cover": "imagenes/trueno.jpg"
      }
    },
    {
      "bg": "#fb9fa0",
      "artist": "Bad Bunny, JC Reyes, Adricece",
      "songName": "vete - remix",
      "files": {
        "song": "jc reyes bad bunny.mp3",
        "cover": "imagenes/badjc.jpg"
      }
    },
    {
      "bg": "#6f1a6d",
      "artist": "Clarent, Mora, Adricece",
      "songName": "IA x Happy Birthday",
      "files": {
        "song": "IA MADAGASCAR.mp3",
        "cover": "imagenes/ia.jpg"
      }
    },
    {
      "bg": "#263c34",
      "artist": "Duki, Travis Scott, Adricece",
      "songName": "imperio x SICKO MODE",
      "files": {
        "song": "op1.mp3",
        "cover": "imagenes/duki.jpg"
      }
    },
    {
      "bg": "#017ab1",
      "artist": "JC Reyes, Bad Bunny, Bryant Myers, Adricece",
      "songName": "FARDOS - remix",
      "files": {
        "song": "FARDOS - JC Reyes, Bad bunny, Bryant Myers.mp3",
        "cover": "imagenes/jcbadb.jpg"
      }
    },
    {
      "bg": "#222516",
      "artist": "Travis Scott, Hades 66, Adricece",
      "songName": "brillan x SKITZO",
      "files": {
        "song": "TRAVIS HADES 66.mp3",
        "cover": "imagenes/el66.jpg"
      }
    },
    {
      "bg": "#8fac60",
      "artist": "Bad bunny, Adricece",
      "songName": "NUEVAYoL - trap edition",
      "files": {
        "song": "NUEVAYOL TRAP.mp3",
        "cover": "imagenes/nuevayol.jpg"
      }
    },
    {
      "bg": "#262626",
      "artist": "Travis Scott, Bad bunny, Adricece",
      "songName": "CAN'T SAY x CARO",
      "files": {
        "song": "caro x travis.mp3",
        "cover": "imagenes/travisbadbu.jpg"
      }
    },
    {
      "bg": "#ecd3c0",
      "artist": "Bad Bunny, Arcangel, Adricece",
      "songName": "P FKN R x LA MuDANZA",
      "files": {
        "song": "pfknr_lamudanza.mp3",
        "cover": "imagenes/pfknr.jpg"
      }
    },
    {
      "bg": "#121212",
      "artist": "¥$, JC Reyes, Bad Bunny, Adricece",
      "songName": "DRUNK x RUGER",
      "files": {
        "song": "drunkjc.mp3",
        "cover": "imagenes/drunkjc.jpg"
      }
    },
    {
      "bg": "#1b6f3b",
      "artist": "Anuel AA, Ñengo Flow, Adricece",
      "songName": "VIBRADO EM VOCÉ X LOS INTOCABLES",
      "files": {
        "song": "anuell brasilero.mp3",
        "cover": "imagenes/anuanuano.jpg"
      }
    },
    {
      "bg": "#0c1a2a",
      "artist": "SAIKO, Bad Bunny, Adricece",
      "songName": "NOSTALGIA x BOKeTE",
      "files": {
        "song": "SAIKO BAD.mp3",
        "cover": "imagenes/sk.jpg"
      }
    }
  ]
};

const songs = musicData.songs;

function downloadTheFiles(media, input) {
  return Promise.all(
    input.map(song => {
      const promise = new Promise(resolve => {
        const url = song.files[media];
        const req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "blob";
        req.send();
        req.onreadystatechange = () => {
          if (req.readyState === 4) {
            if (req.status === 200) {
              const blob = req.response;
              const file = URL.createObjectURL(blob);
              song.files[media] = file;
              resolve(song);
            }
          }
        };
      });

      promise.then(() => {
        loadingProgress++;
        const progress = Math.round(
          loadingProgress / (songs.length * 2) * 100
        );

        loadingProgress_elmnt.innerHTML = progress;
      });

      return promise;
    })
  );
}

root.appendChild(dom(Loading, null));
loadingProgress_elmnt = querySelector(".loading__progress");

downloadTheFiles("cover", songs).then(respone => {
  downloadTheFiles("song", respone).then(data => {
    root.removeChild(querySelector(".loading"));
    root.appendChild(dom(App, { songs: data }));

    songsLength = data.length - 1;
    progress_elmnt = querySelector(".progress");
    playlistSongs_elmnt = querySelectorAll("audio");
    sliderImgs_elmnt = querySelector(".slider__imgs");
    songName_elmnt = querySelector(".music-player__singer-name"); // Asegúrate de que esto sea correcto
    musicPlayerInfo_elmnt = querySelector(".music-player__info");
    singerName_elmnt = querySelector(".music-player__subtitle"); // Asegúrate de que esto sea correcto
    selectedSong = playlistSongs_elmnt[indexSong];
    progressBar_elmnt = querySelector(".progress__bar");
    broadcastGuarantor_elmnt = querySelector(
      ".music-player__broadcast-guarantor"
    );

    controlSubtitleAnimation(musicPlayerInfo_elmnt, songName_elmnt);
    controlSubtitleAnimation(musicPlayerInfo_elmnt, singerName_elmnt);
  });
});

function controlSubtitleAnimation(parent, child) {
  if (child.classList.contains("animate")) return;

  const element = child.firstChild;

  if (child.clientWidth > parent.clientWidth) {
    child.appendChild(element.cloneNode(true));
    child.classList.add("animate");
  }

  setProperty(child.parentElement, "width", `${element.clientWidth}px`);
}
function handleResize() {
  const vH = window.innerHeight * 0.01;
  setProperty(document.documentElement, "--vH", `${vH}px`);
}
function querySelector(target) {
  return document.querySelector(target);
}
function querySelectorAll(target) {
  return document.querySelectorAll(target);
}
function setProperty(target, prop, value = "") {
  target.style.setProperty(prop, value);
}
function setBodyBg(color) {
  setProperty(document.body, "--body-bg", color);
}
function updateInfo(target, value) {
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }

  const targetChild_elmnt = document.createElement("div");
  targetChild_elmnt.appendChild(document.createTextNode(value));
  target.appendChild(targetChild_elmnt);
  target.classList.remove("animate");
  controlSubtitleAnimation(musicPlayerInfo_elmnt, target);
}
function handleScrub(e) {
  const progressOffsetLeft = progress_elmnt.getBoundingClientRect().left;
  const progressWidth = progress_elmnt.offsetWidth;
  const duration = selectedSong.duration;
  const currentTime = (e.clientX - progressOffsetLeft) / progressWidth;

  selectedSong.currentTime = currentTime * duration;
}

handleResize();

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);
window.addEventListener("transitionstart", ({ target }) => {
  if (target === sliderImgs_elmnt) {
    isLocked = true;
    setProperty(sliderImgs_elmnt, "will-change", "transform");
  }
});
window.addEventListener("transitionend", ({ target, propertyName }) => {
  if (target === sliderImgs_elmnt) {
    isLocked = false;
    setProperty(sliderImgs_elmnt, "will-change", "auto");
  }
  if (target.classList.contains("slider") && propertyName === "height") {
    controlSubtitleAnimation(musicPlayerInfo_elmnt, songName_elmnt);
    controlSubtitleAnimation(musicPlayerInfo_elmnt, singerName_elmnt);
  }
});
window.addEventListener("pointerup", () => {
  if (progressBarIsUpdating) {
    selectedSong.muted = false;
    progressBarIsUpdating = false;
  }
});
window.addEventListener("pointermove", e => {
  if (progressBarIsUpdating) {
    handleScrub(e, this);
    selectedSong.muted = true;
  }
});
